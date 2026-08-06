-- Restock the England and Norway home jerseys and add the requested Cape Verde goalkeeper jersey.

INSERT OR IGNORE INTO inventory (
  id, category, name, size, sizes_json, price, quantity, featured,
  featured_order, new_arrival, date_added, sort_order, photos, links
) VALUES (
  'world-cape-verde-vozinha-goalkeeper',
  'world',
  'Vozinha #1 | Cape Verde 2026 World Cup Goalkeeper',
  'M',
  '{}',
  55,
  0,
  0,
  0,
  0,
  '2026-08-05',
  95,
  '[{"src":"assets/inventory/world-cape-verde-vozinha-goalkeeper-front.jpg","alt":"Vozinha Cape Verde 2026 World Cup goalkeeper jersey front"},{"src":"assets/inventory/world-cape-verde-vozinha-goalkeeper-back.jpg","alt":"Vozinha number 1 Cape Verde 2026 World Cup goalkeeper jersey back"}]',
  '{"depop":"https://www.depop.com/jerseysfrmjb/","ebay":"https://www.ebay.com/usr/jerseysfrmjb"}'
);

UPDATE inventory
SET size = 'M', sizes_json = '{"M":4}', quantity = 4,
    new_arrival = 1, date_added = '2026-08-05', updated_at = CURRENT_TIMESTAMP
WHERE id = 'world-england-bellingham-home';

UPDATE inventory
SET size = 'M', sizes_json = '{"M":4}', quantity = 4,
    new_arrival = 1, date_added = '2026-08-05', updated_at = CURRENT_TIMESTAMP
WHERE id = 'world-norway-haaland-home';

UPDATE inventory
SET size = 'M', sizes_json = '{}', quantity = 0,
    new_arrival = 0, date_added = '2026-08-05', updated_at = CURRENT_TIMESTAMP
WHERE id = 'world-cape-verde-vozinha-goalkeeper';

INSERT INTO site_settings (key, value, updated_at)
VALUES ('inventory_updated_at', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;
