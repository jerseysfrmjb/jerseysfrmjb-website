ALTER TABLE shopify_commerce_events
  ADD COLUMN session_id_hash TEXT NOT NULL DEFAULT '';

ALTER TABLE shopify_commerce_events
  ADD COLUMN product_ids_json TEXT NOT NULL DEFAULT '[]';

ALTER TABLE shopify_commerce_events
  ADD COLUMN traffic_source TEXT NOT NULL DEFAULT 'Other';

CREATE INDEX IF NOT EXISTS idx_shopify_commerce_events_source_time
  ON shopify_commerce_events(traffic_source, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_shopify_commerce_events_product_time
  ON shopify_commerce_events(product_id, occurred_at DESC);
