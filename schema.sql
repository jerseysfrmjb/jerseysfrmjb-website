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

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('hide_sold_out_featured', 'false');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('inventory_updated_at', CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_banner_message', 'Small Drop, Big Drop Coming Soon
A small World Cup drop is available now. A bigger drop is coming soon. Fill out the contact form to request a jersey or DM @jerseysfrmjb with questions.');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_ticker_message', '🔥 SMALL DROP AVAILABLE NOW • BIG DROP COMING SOON • TAP NEED HELP TO REQUEST ❤️');

INSERT OR IGNORE INTO site_settings (key, value) VALUES ('homepage_stat_message', 'Small Drop Almost Sold Out');


CREATE TABLE IF NOT EXISTS contact_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instagram_username TEXT NOT NULL,
  jersey_request TEXT NOT NULL,
  size TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
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
