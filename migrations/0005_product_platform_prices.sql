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
