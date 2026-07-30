ALTER TABLE analytics_events
  ADD COLUMN local_day TEXT NOT NULL DEFAULT '';

ALTER TABLE analytics_events
  ADD COLUMN utm_source TEXT NOT NULL DEFAULT '';

ALTER TABLE analytics_events
  ADD COLUMN utm_medium TEXT NOT NULL DEFAULT '';

ALTER TABLE analytics_events
  ADD COLUMN utm_campaign TEXT NOT NULL DEFAULT '';

ALTER TABLE analytics_events
  ADD COLUMN utm_content TEXT NOT NULL DEFAULT '';

UPDATE analytics_events
SET local_day = date(occurred_at, '-4 hours')
WHERE local_day = '';

CREATE INDEX IF NOT EXISTS idx_analytics_events_local_day
  ON analytics_events(local_day, event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign
  ON analytics_events(utm_campaign, utm_content, occurred_at DESC);

ALTER TABLE facebook_post_history
  ADD COLUMN campaign TEXT NOT NULL DEFAULT 'new_arrivals';

ALTER TABLE contact_messages
  ADD COLUMN request_type TEXT NOT NULL DEFAULT 'jersey_request';

ALTER TABLE contact_messages
  ADD COLUMN email TEXT NOT NULL DEFAULT '';

ALTER TABLE contact_messages
  ADD COLUMN contact_preference TEXT NOT NULL DEFAULT 'instagram';

ALTER TABLE contact_messages
  ADD COLUMN marketplace_preference TEXT NOT NULL DEFAULT '';

ALTER TABLE contact_messages
  ADD COLUMN product_id TEXT NOT NULL DEFAULT '';

ALTER TABLE contact_messages
  ADD COLUMN product_name TEXT NOT NULL DEFAULT '';

ALTER TABLE contact_messages
  ADD COLUMN admin_notes TEXT NOT NULL DEFAULT '';

ALTER TABLE contact_messages
  ADD COLUMN resolved_at TEXT;

CREATE TABLE IF NOT EXISTS admin_activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  area TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  status_code INTEGER NOT NULL DEFAULT 200,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created
  ON admin_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_activity_log_area_created
  ON admin_activity_log(area, created_at DESC);

CREATE TABLE IF NOT EXISTS api_error_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  fingerprint TEXT NOT NULL DEFAULT '',
  alerted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_error_log_created
  ON api_error_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_error_log_fingerprint
  ON api_error_log(fingerprint, created_at DESC);
