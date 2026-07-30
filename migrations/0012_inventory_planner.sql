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

