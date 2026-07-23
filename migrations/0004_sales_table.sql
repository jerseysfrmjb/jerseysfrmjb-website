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
