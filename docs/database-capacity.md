# Database capacity

Measured 2026-08-27. Re-measure before acting on any number here.

## Where we stand

The cap is **logical size**: `pg_database_size` vs `neon.max_cluster_size = 512MB`. Writes fail with a file-extension error when it hits. Neon WAL / instant-restore history does **not** count against this.

After reclaim: **320 MB** (~192 MB headroom).

| Table | Total | Heap | Index | Rows | Per row |
| --- | --- | --- | --- | --- | --- |
| `channel_events` | 198 MB | 106 MB | 92 MB | 434,034 | ~477 B |
| `channels` | 115 MB | 72 MB | 42 MB | 239,516 | ~501 B |
| rollups | <1 MB | | | | |

Growth is roughly **50k events and 30k sessions per week — ~39 MB/week**, so ~**five weeks** of runway.

## Indexing window

Sync started **2026-08-17 ~04:19 UTC** (cuid timestamp on the first `channel_events` row) and backfilled from block `24_458_546` (`START_BLOCK` in [src/sync/run.ts](src/sync/run.ts)). Oldest on-chain event is **2026-06-10 00:19:41 UTC**.

## What reclaim already did

At 490 MB / 22 MB headroom we dropped never-read columns and rewrote the heaps (`pnpm db:prep` then `pnpm db:reclaim`, cron paused). 490 → 320 MB, zero rows deleted.

| Dropped | Why | ~size |
| --- | --- | --- |
| `channel_events.payer`, `payee`, `token` | written by sync, never read (`SessionEventView` only uses `type` / `txHash` / `logIndex` / `ts` / `amounts`) | 53 MB |
| `channel_events.id` + its PK | unused cuid; PK is now `(tx_hash, log_index)` | 32 MB |
| `channels.salt` | only ever round-tripped back into itself | 15 MB |
| `channels_payer_status_opened_at_idx` | only served the old `payer_first_seen` matview | small |

Charts used to be materialized views over the raw tables. They are now persisted tables (`channel_daily`, `volume_daily`, `payer_first_seen`) refreshed incrementally from the batch days plus a 3-day heal window ([src/sync/rollups.ts](src/sync/rollups.ts)).

**Do not re-run reclaim.** The rewrite is done; new growth is inserts. `VACUUM FULL` needs room for a second copy of the heap — that is what nearly wedged us at 490 MB. Do not schedule it.

**Do not `db:push` a slimmed Prisma schema until `reclaim.sql` has already dropped those columns.** Prisma would drop them without the vacuum sequence and can exceed 512 MB.

## Sessions almost never close

Only **853 of 239,516** channels are `closed` (31 `closing`, 238,632 `open`). Median closed lifetime is **4m24s**, p90 6.4 days, max 59.9 days.

The `open` backlog is not a sync bug. Three channels idle >45 days, checked on-chain with `client.channel.getStates`, are genuinely open — abandoned dust sessions holding $0.001–$0.01 each.

Two consequences:

- Retention keyed on `status = 'closed'` frees 507 rows and nothing else. `channels` is unbounded regardless of what happens to events.
- **84% of the escrow stat ($572 of $684) sits in channels idle >30 days.** Deleting them without compensation guts the headline number in `loadOverviewStats`.

## Event age

Rows older than a given cutoff:

| 90d | 60d | 30d | 14d |
| --- | --- | --- | --- |
| 0 | 38,785 | 133,499 | 307,697 |

By type: `opened` 239,516, `settled` 189,360, `top_up` 3,968, `closed` 853, `close_requested` 337.

## Constraints that bite

- **`DELETE` does not shrink `pg_database_size`.** Autovacuum only marks the space reusable, which is enough — deleting at the insert rate keeps the heap flat.
- **`channel_events.channel_id` is `ON DELETE RESTRICT`.** Events must be deleted before their channel.
- **Deleting a channel silently drops its future events.** `applyToDraft` returns `undefined` for a non-`opened` event with no existing draft ([src/sync/apply.ts](src/sync/apply.ts)). Max observed channel lifetime is 59.9 days; 912 channels have events spanning >30 days — any channel retention window must clear that.
- **`channels` has no index on `last_event_at`.** Retention by idle age seq-scans 239k rows. `channel_events_ts_idx` exists, so event retention by `ts` is indexed.

## What retention would change

Rollups never re-read full history, so deleting old rows leaves charts, the buyers count, and the overview totals intact.

Live reads that *would* change:

- escrow in `loadOverviewStats` — `sum(deposit - settled)` over open/closing `channels`
- the session list and its `totalItems` in `loadSessionsPage`
- the event timeline in `loadSessionData`

## Options considered

Event retention alone caps `channel_events` at ~100 MB (30d) but leaves `channels` growing 15 MB/week, stretching runway from ~5 weeks to ~3 months. A weekly cleanup cron is the wrong shape — piggyback a windowed `DELETE` on the existing 10-minute sync cron instead. A steady state still needs one of:

- delete channels idle beyond ~90 days, optionally banking their escrow into a persisted counter to keep the stat exact
- store hex columns as `bytea` instead of text — one-time ~50 MB cut, halves per-row growth
- raise the Neon ceiling

Not yet decided.
