import "server-only";

import { prisma } from "@/db";

import { applyEvents } from "./apply";
import { decodeLog } from "./decode";
import { fetchLogs, PAGE_SIZE } from "./fetch";

const START_BLOCK = 24_458_546;
const CURSOR_ID = 1;
const BUDGET_MS = 240_000;

export async function runSync() {
  const started = Date.now();
  const cursor = await prisma.syncCursor.upsert({
    where: { id: CURSOR_ID },
    create: { id: CURSOR_ID, fromBlock: START_BLOCK, fromLogIndex: -1 },
    update: {},
  });

  let fromBlock = cursor.fromBlock;
  let fromLogIndex = cursor.fromLogIndex;
  let pages = 0;
  let events = 0;
  let applied = 0;

  while (Date.now() - started < BUDGET_MS) {
    const rows = await fetchLogs(fromBlock, fromLogIndex);
    pages += 1;
    events += rows.length;
    console.log(`[sync] picked up ${rows.length} items`);

    if (rows.length === 0) break;

    const decoded = rows.map(decodeLog);
    applied += await applyEvents(decoded);

    const last = rows[rows.length - 1];
    if (!last) break;

    fromBlock = last.blockNum;
    fromLogIndex = last.logIdx;
    await prisma.syncCursor.update({
      where: { id: CURSOR_ID },
      data: { fromBlock, fromLogIndex },
    });

    if (rows.length < PAGE_SIZE) break;
  }

  return {
    pages,
    events,
    applied,
    fromBlock,
    fromLogIndex,
    elapsedMs: Date.now() - started,
  };
}
