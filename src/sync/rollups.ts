import "server-only";

import { prisma } from "@/db";
import { Prisma } from "@/generated/prisma/client";

import type { ApplyResult } from "./apply";

function dateList(days: string[]) {
  return Prisma.join(days.map((day) => Prisma.sql`${day}::date`));
}

export async function refreshRollups(batch: ApplyResult) {
  if (batch.applied === 0) return;

  const openedDays = [...new Set(batch.openedDays)];
  const eventDays = new Set(batch.eventDays);

  if (batch.statusChangedIds.length > 0) {
    const extra = await prisma.$queryRaw<{ day: Date }[]>`
      SELECT DISTINCT ts::date AS day
      FROM channel_events
      WHERE channel_id IN (${Prisma.join(batch.statusChangedIds)})
    `;
    for (const row of extra) {
      eventDays.add(row.day.toISOString().slice(0, 10));
    }
  }

  if (openedDays.length > 0) {
    await prisma.$executeRaw`
      DELETE FROM channel_daily WHERE day IN (${dateList(openedDays)})
    `;
    await prisma.$executeRaw`
      INSERT INTO channel_daily (day, status, sessions)
      SELECT opened_at::date, status, count(*)::int
      FROM channels
      WHERE opened_at::date IN (${dateList(openedDays)})
      GROUP BY 1, 2
    `;
  }

  const volumeDays = [...eventDays];
  if (volumeDays.length > 0) {
    await prisma.$executeRaw`
      DELETE FROM volume_daily WHERE day IN (${dateList(volumeDays)})
    `;
    await prisma.$executeRaw`
      INSERT INTO volume_daily (day, status, volume, events)
      SELECT e.ts::date, c.status, coalesce(sum(e.volume), 0), count(*)::int
      FROM channel_events e
      JOIN channels c USING (channel_id)
      WHERE e.ts::date IN (${dateList(volumeDays)})
      GROUP BY 1, 2
    `;
  }

  const payers = new Map<string, (typeof batch.payers)[number]>();
  for (const row of batch.payers) {
    const key = `${row.payer}:${row.status}`;
    const existing = payers.get(key);
    if (!existing || row.firstDay < existing.firstDay) payers.set(key, row);
  }

  if (payers.size > 0) {
    const values = [...payers.values()].map(
      (row) =>
        Prisma.sql`(${row.payer}, ${row.status}::"ChannelStatus", ${row.firstDay}::date)`,
    );
    await prisma.$executeRaw`
      INSERT INTO payer_first_seen (payer, status, first_day)
      VALUES ${Prisma.join(values)}
      ON CONFLICT (payer, status) DO UPDATE
      SET first_day = LEAST(payer_first_seen.first_day, EXCLUDED.first_day)
    `;
  }
}
