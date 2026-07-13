ALTER TABLE inventory ADD COLUMN new_arrival INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inventory ADD COLUMN date_added TEXT DEFAULT '';
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('inventory_updated_at', CURRENT_TIMESTAMP);
