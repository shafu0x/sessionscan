-- One-off reclaim: drop unused columns and rewrite heaps so Neon
-- returns the space. Cron must be paused. Do not wrap in a transaction
-- (VACUUM FULL and CREATE INDEX CONCURRENTLY need autocommit).
--
-- Peak-space trap: VACUUM FULL copies the heap, and 22 MB of headroom
-- cannot fit a second copy. Drop every secondary index first — including
-- the unique (tx_hash, log_index) key, rebuilt after the rewrite.

DROP INDEX IF EXISTS channels_payer_status_opened_at_idx;
DROP INDEX IF EXISTS channels_opened_at_idx;
DROP INDEX IF EXISTS channels_status_idx;
DROP INDEX IF EXISTS channels_payer_idx;
DROP INDEX IF EXISTS channels_payee_idx;
DROP INDEX IF EXISTS channels_deposit_idx;
DROP INDEX IF EXISTS channels_settled_idx;

DROP INDEX IF EXISTS channel_events_channel_id_block_num_log_index_idx;
DROP INDEX IF EXISTS channel_events_ts_idx;
DROP INDEX IF EXISTS channel_events_volume_ts_idx;

ALTER TABLE channel_events DROP CONSTRAINT IF EXISTS channel_events_pkey;
DROP INDEX IF EXISTS channel_events_tx_hash_log_index_key;

ALTER TABLE channel_events
  DROP COLUMN IF EXISTS id,
  DROP COLUMN IF EXISTS payer,
  DROP COLUMN IF EXISTS payee,
  DROP COLUMN IF EXISTS token;

ALTER TABLE channels
  DROP COLUMN IF EXISTS salt;

VACUUM FULL channel_events;
VACUUM FULL channels;

ALTER TABLE channel_events
  ADD CONSTRAINT channel_events_pkey PRIMARY KEY (tx_hash, log_index);

CREATE INDEX CONCURRENTLY IF NOT EXISTS channel_events_channel_id_block_num_log_index_idx
  ON channel_events (channel_id, block_num, log_index);
CREATE INDEX CONCURRENTLY IF NOT EXISTS channel_events_ts_idx
  ON channel_events (ts);

CREATE INDEX CONCURRENTLY IF NOT EXISTS channels_opened_at_idx ON channels (opened_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS channels_status_idx ON channels (status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS channels_payer_idx ON channels (payer);
CREATE INDEX CONCURRENTLY IF NOT EXISTS channels_payee_idx ON channels (payee);
CREATE INDEX CONCURRENTLY IF NOT EXISTS channels_deposit_idx ON channels (deposit);
CREATE INDEX CONCURRENTLY IF NOT EXISTS channels_settled_idx ON channels (settled);
