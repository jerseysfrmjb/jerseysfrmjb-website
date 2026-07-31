CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  sizes_json TEXT NOT NULL DEFAULT '{}',
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  featured_order INTEGER NOT NULL DEFAULT 0,
  new_arrival INTEGER NOT NULL DEFAULT 0,
  date_added TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  photos TEXT NOT NULL DEFAULT '[]',
  links TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_category_stock ON inventory(category, quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_featured ON inventory(featured, quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_featured_order ON inventory(featured, featured_order);

CREATE TABLE IF NOT EXISTS product_platform_prices (
  product_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Depop', 'eBay', 'Facebook', 'Website', 'Local', 'Other')),
  price REAL CHECK (price IS NULL OR price >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id, platform),
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_platform_prices_product
  ON product_platform_prices(product_id);

CREATE TABLE IF NOT EXISTS ebay_feedback (
  feedback_id TEXT PRIMARY KEY,
  marketplace TEXT NOT NULL DEFAULT 'ebay',
  comment TEXT NOT NULL,
  rating_type TEXT NOT NULL CHECK (rating_type IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE')),
  star_rating INTEGER NOT NULL DEFAULT 5,
  listing_title TEXT NOT NULL DEFAULT '',
  item_id TEXT NOT NULL DEFAULT '',
  feedback_date TEXT NOT NULL,
  buyer_display_name TEXT,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  visibility_status TEXT NOT NULL DEFAULT 'active'
    CHECK (visibility_status IN ('active', 'hidden')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ebay_feedback_public
  ON ebay_feedback(moderation_status, visibility_status, rating_type, feedback_date DESC);

CREATE INDEX IF NOT EXISTS idx_ebay_feedback_moderation
  ON ebay_feedback(moderation_status, feedback_date DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_feedback_public
  ON ebay_feedback(marketplace, moderation_status, visibility_status, feedback_date DESC);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('hide_sold_out_featured', 'false');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('inventory_updated_at', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_banner_message', 'Small Drop, Big Drop Coming Soon
A small World Cup drop is available now. A bigger drop is coming soon. DM @jerseysfrmjb for quick questions, or use Message or Request for a detailed jersey request.');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_ticker_message', '🔥 SMALL DROP AVAILABLE NOW • BIG DROP COMING SOON • DM @JERSEYSFRMJB OR TAP MESSAGE OR REQUEST ❤️');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_stat_message', 'Small Drop Almost Sold Out');


CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instagram_username TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  contact_preference TEXT NOT NULL DEFAULT 'instagram',
  request_type TEXT NOT NULL DEFAULT 'jersey_request',
  jersey_request TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  marketplace_preference TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT NOT NULL DEFAULT '',
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status, created_at DESC);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT,
  product_name TEXT NOT NULL,
  player TEXT DEFAULT '',
  team_country TEXT DEFAULT '',
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  sale_price REAL,
  platform TEXT NOT NULL DEFAULT 'Other',
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  undone_at TEXT,
  inventory_restored INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES inventory(id)
);

CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_platform ON sales(platform, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_size ON sales(size, created_at DESC);

CREATE TABLE IF NOT EXISTS restock_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lines TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bulk_restock_runs (
  id TEXT PRIMARY KEY,
  changes_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  undone_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_bulk_restock_runs_created ON bulk_restock_runs(created_at DESC);

CREATE TABLE IF NOT EXISTS pinterest_connections (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL DEFAULT '',
  token_type TEXT NOT NULL DEFAULT 'bearer',
  scope TEXT NOT NULL DEFAULT '',
  access_expires_at INTEGER NOT NULL,
  refresh_expires_at INTEGER,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  connected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'marketplace_click', 'search', 'engagement')),
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  page_path TEXT NOT NULL DEFAULT '/',
  page_title TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL DEFAULT '',
  marketplace TEXT NOT NULL DEFAULT '',
  search_query TEXT NOT NULL DEFAULT '',
  search_results INTEGER,
  traffic_source TEXT NOT NULL DEFAULT 'Direct',
  country TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT 'Unknown',
  browser TEXT NOT NULL DEFAULT 'Other',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  local_day TEXT NOT NULL DEFAULT '',
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  utm_content TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_time ON analytics_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_time ON analytics_events(event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_product_time ON analytics_events(product_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_source_time ON analytics_events(traffic_source, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_local_day ON analytics_events(local_day, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_campaign ON analytics_events(utm_campaign, utm_content, occurred_at DESC);

CREATE TABLE IF NOT EXISTS facebook_post_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_ids TEXT NOT NULL,
  product_names TEXT NOT NULL,
  caption TEXT NOT NULL,
  photo_urls TEXT NOT NULL DEFAULT '[]',
  content_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'posted')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  posted_at TEXT,
  facebook_post_id TEXT NOT NULL DEFAULT '',
  facebook_post_url TEXT NOT NULL DEFAULT '',
  publish_method TEXT NOT NULL DEFAULT '',
  publish_error TEXT NOT NULL DEFAULT '',
  campaign TEXT NOT NULL DEFAULT 'new_arrivals'
);

CREATE INDEX IF NOT EXISTS idx_facebook_post_history_status_created
  ON facebook_post_history(status, created_at DESC);

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

CREATE TABLE IF NOT EXISTS inventory_suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_price_rules (
  supplier_id TEXT NOT NULL,
  jersey_type TEXT NOT NULL
    CHECK (jersey_type IN ('fan', 'retro_short', 'retro_long')),
  customization TEXT NOT NULL
    CHECK (customization IN ('base', 'nameset_patches')),
  cost REAL
    CHECK (cost IS NULL OR cost >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (supplier_id, jersey_type, customization),
  FOREIGN KEY (supplier_id) REFERENCES inventory_suppliers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_planner_overrides (
  product_id TEXT PRIMARY KEY,
  jersey_type TEXT NOT NULL
    CHECK (jersey_type IN ('fan', 'retro_short', 'retro_long')),
  customization TEXT NOT NULL
    CHECK (customization IN ('base', 'nameset_patches')),
  preferred_supplier_id TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO inventory_suppliers (id, name, enabled, sort_order)
VALUES
  ('kevin', 'Kevin', 1, 10),
  ('supplier-2', 'Supplier 2', 0, 20),
  ('supplier-3', 'Supplier 3', 0, 30);

INSERT OR IGNORE INTO supplier_price_rules (supplier_id, jersey_type, customization, cost)
VALUES
  ('kevin', 'fan', 'base', 12),
  ('kevin', 'fan', 'nameset_patches', 15),
  ('kevin', 'retro_short', 'base', 15),
  ('kevin', 'retro_short', 'nameset_patches', 18),
  ('kevin', 'retro_long', 'base', 17),
  ('kevin', 'retro_long', 'nameset_patches', 20);
