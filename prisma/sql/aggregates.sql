-- Aggregates and indexes that prisma/schema.prisma cannot express.
-- Run with `pnpm db:sql`. Idempotent. Verified: `prisma db push` leaves the
-- partial index and materialized views alone, so this only needs re-running
-- when this file changes or against a fresh database.
-- CONCURRENTLY requires autocommit, so this file must run through psql
-- (one statement per transaction), not `prisma db execute`.

-- Partial covering index for the daily volume rollup: only ~40% of events
-- carry volume, and INCLUDE makes the refresh an index-only scan.
CREATE INDEX CONCURRENTLY IF NOT EXISTS channel_events_volume_ts_idx
  ON channel_events (ts) INCLUDE (volume)
  WHERE volume > 0;

-- Daily rollups backing the homepage charts, keyed by (day, status) so the
-- status filter keeps its exact semantics. Refreshed by the sync cron.
-- All source columns are `timestamp without time zone`, so ::date is
-- timezone-independent. Unique indexes are required for REFRESH CONCURRENTLY.

DROP MATERIALIZED VIEW IF EXISTS channel_daily;
CREATE MATERIALIZED VIEW channel_daily AS
SELECT date_trunc('day', opened_at)::date AS day,
       status,
       count(*)::int AS sessions
FROM channels
GROUP BY 1, 2;
CREATE UNIQUE INDEX channel_daily_key ON channel_daily (day, status);

DROP MATERIALIZED VIEW IF EXISTS volume_daily;
CREATE MATERIALIZED VIEW volume_daily AS
SELECT date_trunc('day', e.ts)::date AS day,
       c.status,
       sum(e.volume) AS volume
FROM channel_events e
JOIN channels c USING (channel_id)
WHERE e.volume > 0
GROUP BY 1, 2;
CREATE UNIQUE INDEX volume_daily_key ON volume_daily (day, status);

-- First-seen date per (payer, status): min over the status subset is what
-- makes the buyers chart's status filter correct, and min across statuses
-- reproduces the unfiltered chart. ~1,700 rows, so the day rollup and
-- cumulative sum stay in the query.
DROP MATERIALIZED VIEW IF EXISTS payer_first_seen;
CREATE MATERIALIZED VIEW payer_first_seen AS
SELECT payer,
       status,
       min(opened_at)::date AS first_day
FROM channels
GROUP BY 1, 2;
CREATE UNIQUE INDEX payer_first_seen_key ON payer_first_seen (payer, status);
