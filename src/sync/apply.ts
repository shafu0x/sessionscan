import "server-only";

import { formatUnits } from "viem";
import { prisma } from "@/db";
import type { ChannelStatus } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";

import { nextSessionStatus } from "./session-status";
import type { IndexedEvent } from "./types";

function decimal(amount: bigint): Prisma.Decimal {
  return new Prisma.Decimal(formatUnits(amount, 6));
}

function amountsJson(event: IndexedEvent): Prisma.InputJsonValue {
  switch (event.type) {
    case "opened":
      return { deposit: formatUnits(event.deposit, 6) };
    case "settled":
      return {
        cumulative: formatUnits(event.cumulative, 6),
        deltaPaid: formatUnits(event.deltaPaid, 6),
        newSettled: formatUnits(event.newSettled, 6),
      };
    case "top_up":
      return {
        additionalDeposit: formatUnits(event.additionalDeposit, 6),
        newDeposit: formatUnits(event.newDeposit, 6),
      };
    case "close_requested":
      return { closeGraceEnd: event.closeGraceEnd.toString() };
    case "close_cancelled":
      return {};
    case "closed":
      return {
        settledToPayee: formatUnits(event.settledToPayee, 6),
        refundedToPayer: formatUnits(event.refundedToPayer, 6),
      };
    default: {
      const exhaustive: never = event;
      throw new Error(`unhandled event ${JSON.stringify(exhaustive)}`);
    }
  }
}

function volumeOf(event: IndexedEvent): Prisma.Decimal {
  switch (event.type) {
    case "settled":
      return decimal(event.deltaPaid);
    case "closed":
      return decimal(event.settledToPayee);
    case "opened":
    case "top_up":
    case "close_requested":
    case "close_cancelled":
      return new Prisma.Decimal(0);
    default: {
      const exhaustive: never = event;
      throw new Error(`unhandled event ${JSON.stringify(exhaustive)}`);
    }
  }
}

type ChannelDraft = {
  channelId: string;
  payer: string;
  payee: string;
  operator: string;
  token: string;
  salt: string;
  deposit: Prisma.Decimal;
  settled: Prisma.Decimal;
  refunded: Prisma.Decimal;
  status: ChannelStatus;
  openedAt: Date;
  lastEventAt: Date;
  closedAt: Date | null;
};

function applyToDraft(
  draft: ChannelDraft | undefined,
  event: IndexedEvent,
): ChannelDraft | undefined {
  const status = nextSessionStatus(draft?.status, event.type);
  if (status === undefined) return undefined;

  const channelId = event.channelId.toLowerCase();
  const payer = event.payer.toLowerCase();
  const payee = event.payee.toLowerCase();

  if (event.type === "opened") {
    return {
      channelId,
      payer,
      payee,
      operator: event.operator.toLowerCase(),
      token: event.token.toLowerCase(),
      salt: event.salt.toLowerCase(),
      deposit: decimal(event.deposit),
      settled: draft?.settled ?? new Prisma.Decimal(0),
      refunded: draft?.refunded ?? new Prisma.Decimal(0),
      status,
      openedAt: event.timestamp,
      lastEventAt: event.timestamp,
      closedAt: draft?.closedAt ?? null,
    };
  }

  if (!draft) return undefined;
  if (draft.status === "closed") {
    return draft;
  }

  switch (event.type) {
    case "settled":
      return {
        ...draft,
        status,
        settled: draft.settled.plus(decimal(event.deltaPaid)),
        lastEventAt: event.timestamp,
      };
    case "top_up":
      return {
        ...draft,
        status,
        deposit: decimal(event.newDeposit),
        lastEventAt: event.timestamp,
      };
    case "close_requested":
    case "close_cancelled":
      return { ...draft, status, lastEventAt: event.timestamp };
    case "closed":
      return {
        ...draft,
        status,
        settled: decimal(event.settledToPayee),
        refunded: decimal(event.refundedToPayer),
        closedAt: event.timestamp,
        lastEventAt: event.timestamp,
      };
    default: {
      const exhaustive: never = event;
      throw new Error(`unhandled event ${JSON.stringify(exhaustive)}`);
    }
  }
}

export async function applyEvents(events: IndexedEvent[]): Promise<number> {
  if (events.length === 0) return 0;

  const txHashes = [
    ...new Set(events.map((event) => event.txHash.toLowerCase())),
  ];
  const existing = await prisma.channelEvent.findMany({
    where: { txHash: { in: txHashes } },
    select: { txHash: true, logIndex: true },
  });
  const seen = new Set(existing.map((row) => `${row.txHash}:${row.logIndex}`));

  const fresh = events.filter(
    (event) => !seen.has(`${event.txHash.toLowerCase()}:${event.logIndex}`),
  );
  if (fresh.length === 0) return 0;

  const channelIds = [
    ...new Set(fresh.map((event) => event.channelId.toLowerCase())),
  ];
  const current = await prisma.channel.findMany({
    where: { channelId: { in: channelIds } },
  });
  const drafts = new Map<string, ChannelDraft>(
    current.map((row) => [
      row.channelId,
      {
        channelId: row.channelId,
        payer: row.payer,
        payee: row.payee,
        operator: row.operator,
        token: row.token,
        salt: row.salt,
        deposit: row.deposit,
        settled: row.settled,
        refunded: row.refunded,
        status: row.status,
        openedAt: row.openedAt,
        lastEventAt: row.lastEventAt,
        closedAt: row.closedAt,
      },
    ]),
  );

  const eventRows: Prisma.ChannelEventCreateManyInput[] = [];

  for (const event of fresh) {
    const channelId = event.channelId.toLowerCase();
    const next = applyToDraft(drafts.get(channelId), event);
    if (!next) continue;
    drafts.set(channelId, next);
    eventRows.push({
      channelId,
      type: event.type,
      payer: event.payer.toLowerCase(),
      payee: event.payee.toLowerCase(),
      token: next.token,
      txHash: event.txHash.toLowerCase(),
      logIndex: event.logIndex,
      blockNum: event.blockNum,
      ts: event.timestamp,
      amounts: amountsJson(event),
      volume: volumeOf(event),
    });
  }

  const draftsList = [...drafts.values()];
  const chunkSize = 100;
  for (let start = 0; start < draftsList.length; start += chunkSize) {
    const chunk = draftsList.slice(start, start + chunkSize);
    const values = chunk.map(
      (draft) =>
        Prisma.sql`(
          ${draft.channelId},
          ${draft.payer},
          ${draft.payee},
          ${draft.operator},
          ${draft.token},
          ${draft.salt},
          ${draft.deposit},
          ${draft.settled},
          ${draft.refunded},
          ${draft.status}::"ChannelStatus",
          ${draft.openedAt},
          ${draft.lastEventAt},
          ${draft.closedAt}
        )`,
    );

    await prisma.$executeRaw`
      INSERT INTO channels (
        channel_id, payer, payee, operator, token, salt,
        deposit, settled, refunded, status, opened_at, last_event_at, closed_at
      )
      VALUES ${Prisma.join(values)}
      ON CONFLICT (channel_id) DO UPDATE SET
        payer = EXCLUDED.payer,
        payee = EXCLUDED.payee,
        operator = EXCLUDED.operator,
        token = EXCLUDED.token,
        salt = EXCLUDED.salt,
        deposit = EXCLUDED.deposit,
        settled = EXCLUDED.settled,
        refunded = EXCLUDED.refunded,
        status = EXCLUDED.status,
        opened_at = EXCLUDED.opened_at,
        last_event_at = EXCLUDED.last_event_at,
        closed_at = EXCLUDED.closed_at
    `;
  }

  await prisma.channelEvent.createMany({
    data: eventRows,
    skipDuplicates: true,
  });

  return eventRows.length;
}
