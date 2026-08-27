-- Persisted daily rollups backing the homepage charts and overview stats.
-- Prisma models in schema.prisma own these tables; this script converts
-- leftover materialized views and backfills empty tables from full history.
-- Run with `pnpm db:sql`. Idempotent.
--
-- CONCURRENTLY / DROP MATERIALIZED VIEW need autocommit, so this file
-- must run through psql (one statement per transaction), not Prisma.

DROP INDEX IF EXISTS channel_events_volume_ts_idx;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'channel_daily'
      AND c.relkind = 'm'
  ) THEN
    DROP MATERIALIZED VIEW channel_daily;
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'volume_daily'
      AND c.relkind = 'm'
  ) THEN
    DROP MATERIALIZED VIEW volume_daily;
  END IF;
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'payer_first_seen'
      AND c.relkind = 'm'
  ) THEN
    DROP MATERIALIZED VIEW payer_first_seen;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS channel_daily (
  day date NOT NULL,
  status "ChannelStatus" NOT NULL,
  sessions integer NOT NULL,
  PRIMARY KEY (day, status)
);

CREATE TABLE IF NOT EXISTS volume_daily (
  day date NOT NULL,
  status "ChannelStatus" NOT NULL,
  volume decimal(20, 6) NOT NULL,
  events integer NOT NULL,
  PRIMARY KEY (day, status)
);

CREATE TABLE IF NOT EXISTS payer_first_seen (
  payer text NOT NULL,
  status "ChannelStatus" NOT NULL,
  first_day date NOT NULL,
  PRIMARY KEY (payer, status)
);

INSERT INTO channel_daily (day, status, sessions)
SELECT opened_at::date, status, count(*)::int
FROM channels
WHERE NOT EXISTS (SELECT 1 FROM channel_daily)
GROUP BY 1, 2;

INSERT INTO volume_daily (day, status, volume, events)
SELECT e.ts::date, c.status, coalesce(sum(e.volume), 0), count(*)::int
FROM channel_events e
JOIN channels c USING (channel_id)
WHERE NOT EXISTS (SELECT 1 FROM volume_daily)
GROUP BY 1, 2;

INSERT INTO payer_first_seen (payer, status, first_day)
SELECT payer, status, min(opened_at)::date
FROM channels
WHERE NOT EXISTS (SELECT 1 FROM payer_first_seen)
GROUP BY 1, 2;
