-- Instant metadata-only prep so old and new Prisma clients can coexist
-- during the reclaim rollout. Safe to re-run.

ALTER TABLE channel_events
  ALTER COLUMN payer DROP NOT NULL,
  ALTER COLUMN payee DROP NOT NULL,
  ALTER COLUMN token DROP NOT NULL;

ALTER TABLE channels
  ALTER COLUMN salt DROP NOT NULL;

ALTER TABLE channel_events
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
