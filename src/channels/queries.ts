import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { cache } from "react";
import { formatUnits, isHex } from "viem";

import { prisma } from "@/db";
import { client } from "@/viem";

import type {
  DayPoint,
  SessionDetail,
  SessionEventView,
  SessionRow,
  SessionSort,
  SortDir,
} from "./types";

const PAGE_SIZE = 10;

type DayCountRow = { day: string; value: bigint | number };
type DayVolumeRow = { day: string; value: string | number };
type DayBuyersRow = { day: string; value: bigint | number };

function toDayPoints(rows: DayCountRow[]): DayPoint[] {
  return rows.map((row) => ({
    day: row.day,
    value: Number(row.value),
  }));
}

function cumulative(points: DayPoint[]): DayPoint[] {
  let total = 0;
  return points.map((point) => {
    total += point.value;
    return { day: point.day, value: total };
  });
}

export async function loadChartSeries() {
  "use cache";
  cacheLife({ stale: 600, revalidate: 600, expire: 1800 });
  cacheTag("channels");

  const [sessionRows, volumeRows, buyerRows] = await Promise.all([
    prisma.$queryRaw<DayCountRow[]>`
      SELECT to_char(date_trunc('day', opened_at), 'YYYY-MM-DD') AS day,
             count(*)::int AS value
      FROM channels
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<DayVolumeRow[]>`
      SELECT to_char(date_trunc('day', ts), 'YYYY-MM-DD') AS day,
             coalesce(sum(volume), 0)::text AS value
      FROM channel_events
      WHERE volume > 0
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<DayBuyersRow[]>`
      SELECT to_char(date_trunc('day', first_seen), 'YYYY-MM-DD') AS day,
             count(*)::int AS value
      FROM (
        SELECT payer, min(opened_at) AS first_seen
        FROM channels
        GROUP BY payer
      ) first_buyers
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  return {
    sessions: toDayPoints(sessionRows),
    volume: volumeRows.map((row) => ({
      day: row.day,
      value: Number(row.value),
    })),
    buyers: cumulative(toDayPoints(buyerRows)),
  };
}

export async function loadSessionsPage(
  page: number,
  sort: SessionSort,
  dir: SortDir,
) {
  "use cache";
  cacheLife({ stale: 600, revalidate: 600, expire: 1800 });
  cacheTag("channels");

  const totalItems = await prisma.channel.count();
  const pageCount = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const rows = await prisma.channel.findMany({
    orderBy:
      sort === "deposit"
        ? { deposit: dir }
        : sort === "settled"
          ? { settled: dir }
          : { openedAt: dir },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const items: SessionRow[] = rows.map((row) => ({
    channelId: row.channelId,
    payer: row.payer,
    payee: row.payee,
    deposit: row.deposit.toString(),
    settled: row.settled.toString(),
    status: row.status,
    openedAt: row.openedAt.toISOString(),
  }));

  return {
    items,
    currentPage: safePage,
    pageCount,
    totalItems,
    pageSize: PAGE_SIZE,
  };
}

async function loadSessionUncached(id: string): Promise<SessionDetail | null> {
  "use cache";
  cacheLife({ stale: 600, revalidate: 600, expire: 1800 });
  cacheTag("channels", `session-${id}`);

  const channel = await prisma.channel.findUnique({
    where: { channelId: id.toLowerCase() },
    include: {
      events: { orderBy: [{ blockNum: "asc" }, { logIndex: "asc" }] },
    },
  });

  if (!channel) return null;

  let deposit = channel.deposit.toString();
  let settled = channel.settled.toString();

  if (
    (channel.status === "open" || channel.status === "closing") &&
    isHex(channel.channelId)
  ) {
    try {
      const state = await client.channel.getStates({
        channel: channel.channelId,
      });
      deposit = formatUnits(state.deposit, 6);
      settled = formatUnits(state.settled, 6);
    } catch {
      // Closed slots are deleted on-chain; events remain source of truth.
    }
  }

  const remaining = (
    Number.parseFloat(deposit) - Number.parseFloat(settled)
  ).toFixed(6);

  const events: SessionEventView[] = channel.events.map((event) => ({
    type: event.type,
    txHash: event.txHash,
    logIndex: event.logIndex,
    ts: event.ts.toISOString(),
    amounts:
      event.amounts &&
      typeof event.amounts === "object" &&
      !Array.isArray(event.amounts)
        ? Object.fromEntries(
            Object.entries(event.amounts).map(([key, value]) => [
              key,
              String(value),
            ]),
          )
        : {},
  }));

  return {
    channelId: channel.channelId,
    payer: channel.payer,
    payee: channel.payee,
    operator: channel.operator,
    token: channel.token,
    deposit,
    settled,
    refunded: channel.refunded.toString(),
    remaining,
    status: channel.status,
    openedAt: channel.openedAt.toISOString(),
    closedAt: channel.closedAt?.toISOString() ?? null,
    events,
  };
}

export const loadSessionData = cache(loadSessionUncached);
