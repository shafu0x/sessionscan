import "server-only";

import { z } from "zod";

import { env } from "@/env";

import { channelReserveAddress, topic0List } from "./selectors";
import type { TidxLogRow } from "./types";

const TIDX_QUERY_URL = "https://api.tempo.xyz/v1/indexer/query";
const TIDX_LIMIT = 10_000;
const TIDX_TIMEOUT_MS = 30_000;
const CHAIN_ID = 4217;

const TIDX_COLUMNS = [
  "block_num",
  "block_timestamp",
  "tx_hash",
  "log_idx",
  "address",
  "topic0",
  "topic1",
  "topic2",
  "topic3",
  "data",
] as const;

const tidxLogRowSchema = z
  .tuple([
    z.coerce.number(),
    z.string(),
    z.string(),
    z.coerce.number(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
    z.string(),
  ])
  .transform(
    ([
      blockNum,
      blockTimestamp,
      txHash,
      logIdx,
      address,
      topic0,
      topic1,
      topic2,
      topic3,
      data,
    ]): TidxLogRow => ({
      blockNum,
      blockTimestamp,
      txHash,
      logIdx,
      address,
      topic0,
      topic1,
      topic2,
      topic3,
      data,
    }),
  );

const tidxResponseSchema = z
  .object({
    columns: z.array(z.string()),
    rows: z.array(tidxLogRowSchema),
    row_count: z.coerce.number(),
    engine: z.string(),
    query_time_ms: z.coerce.number().optional(),
    ok: z.literal(true),
  })
  .strict();

function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

function buildSql(sinceBlock: number, sinceLogIdx: number): string {
  const topics = topic0List.map(sqlString).join(", ");
  return [
    `SELECT ${TIDX_COLUMNS.join(", ")}`,
    "FROM logs",
    "WHERE",
    `address = ${sqlString(channelReserveAddress)}`,
    `AND topic0 IN (${topics})`,
    `AND ((block_num = ${sinceBlock} AND log_idx > ${sinceLogIdx}) OR block_num > ${sinceBlock})`,
    "ORDER BY block_num ASC, log_idx ASC",
    `LIMIT ${TIDX_LIMIT}`,
  ].join(" ");
}

export async function fetchLogs(
  sinceBlock: number,
  sinceLogIdx: number,
): Promise<TidxLogRow[]> {
  const sql = buildSql(sinceBlock, sinceLogIdx);
  const params = new URLSearchParams({
    chainId: String(CHAIN_ID),
    engine: "clickhouse",
    limit: String(TIDX_LIMIT),
    timeout_ms: String(TIDX_TIMEOUT_MS),
    sql,
  });

  const res = await fetch(`${TIDX_QUERY_URL}?${params}`, {
    headers: { Authorization: `Bearer ${env.TEMPO_API_KEY}` },
    signal: AbortSignal.timeout(TIDX_TIMEOUT_MS),
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    throw new Error(
      `tidx rate limited${retryAfter ? ` (Retry-After ${retryAfter})` : ""}`,
    );
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`tidx request failed: ${res.status} ${body}`);
  }

  const json: unknown = await res.json();
  const parsed = tidxResponseSchema.parse(json);

  if (parsed.columns.length !== TIDX_COLUMNS.length) {
    throw new Error(
      `unexpected tidx columns: expected ${TIDX_COLUMNS.join(", ")}, got ${parsed.columns.join(", ")}`,
    );
  }

  for (const [index, expected] of TIDX_COLUMNS.entries()) {
    if (parsed.columns[index] !== expected) {
      throw new Error(
        `unexpected tidx column at index ${index}: expected ${expected}, got ${parsed.columns[index]}`,
      );
    }
  }

  return parsed.rows;
}

export const PAGE_SIZE = TIDX_LIMIT;
