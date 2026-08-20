import type { Prisma } from "@/generated/prisma/client";

export type Channel = Prisma.ChannelGetPayload<object>;
type ChannelEvent = Prisma.ChannelEventGetPayload<object>;

export type DayPoint = {
  day: string;
  value: number;
};

export type OverviewStats = {
  sessions: number;
  closed: number;
  events: number;
  payers: number;
  settled: string;
  escrow: string;
};

export type SessionSort = "opened" | "deposit" | "settled";
export type SortDir = "asc" | "desc";
export type TimeRange = "1d" | "7d" | "30d" | "all";

export type SessionRow = {
  channelId: string;
  payer: string;
  payee: string;
  deposit: string;
  settled: string;
  status: Channel["status"];
  openedAt: string;
};

export type SearchHit = {
  channelId: string;
  payer: string;
  payee: string;
  status: Channel["status"];
  settled: string;
};

export type SessionEventView = {
  type: ChannelEvent["type"];
  txHash: string;
  logIndex: number;
  ts: string;
  amounts: Record<string, string>;
};

export type SessionDetail = {
  channelId: string;
  payer: string;
  payee: string;
  operator: string;
  token: string;
  deposit: string;
  settled: string;
  refunded: string;
  remaining: string;
  status: Channel["status"];
  openedAt: string;
  closedAt: string | null;
  events: SessionEventView[];
};
