ALTER TABLE contact_messages ADD COLUMN contacted_at TEXT;

CREATE TABLE IF NOT EXISTS contact_message_products (
  message_id INTEGER NOT NULL,
  product_id TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  requested_size TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, product_id, product_name),
  FOREIGN KEY (message_id) REFERENCES contact_messages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contact_message_products_product
  ON contact_message_products(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_message_products_message
  ON contact_message_products(message_id);

INSERT OR IGNORE INTO contact_message_products (message_id, product_id, product_name, requested_size, created_at)
SELECT id, product_id, product_name, size, created_at
FROM contact_messages
WHERE COALESCE(product_id, '') <> '' OR COALESCE(product_name, '') <> '';
