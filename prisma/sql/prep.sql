-- Instant metadata-only prep so old and new Prisma clients can coexist
-- during the reclaim rollout: run this, deploy, then run reclaim.sql.
-- Historical record of an applied migration — it errors once reclaim.sql
-- has dropped these columns.

ALTER TABLE channel_events
  ALTER COLUMN payer DROP NOT NULL,
  ALTER COLUMN payee DROP NOT NULL,
  ALTER COLUMN token DROP NOT NULL;

ALTER TABLE channels
  ALTER COLUMN salt DROP NOT NULL;

ALTER TABLE channel_events
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
