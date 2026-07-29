CREATE TABLE IF NOT EXISTS facebook_connections (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  user_access_token_encrypted TEXT NOT NULL,
  page_access_token_encrypted TEXT NOT NULL DEFAULT '',
  page_id TEXT NOT NULL DEFAULT '',
  page_name TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '',
  user_expires_at INTEGER,
  connected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE facebook_post_history
  ADD COLUMN facebook_post_id TEXT NOT NULL DEFAULT '';

ALTER TABLE facebook_post_history
  ADD COLUMN facebook_post_url TEXT NOT NULL DEFAULT '';

ALTER TABLE facebook_post_history
  ADD COLUMN publish_method TEXT NOT NULL DEFAULT '';

ALTER TABLE facebook_post_history
  ADD COLUMN publish_error TEXT NOT NULL DEFAULT '';
