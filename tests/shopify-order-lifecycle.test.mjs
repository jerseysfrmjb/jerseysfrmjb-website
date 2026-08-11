import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";

import { SHOPIFY_SCHEMA_STATEMENTS, ensureShopifySchema } from "../functions/api/shopify/_schema.js";
import { sanitizeWebhookPayload } from "../functions/api/shopify/_shared.js";
import { processSanitizedWebhook } from "../functions/api/shopify/_webhooks.js";

class D1Statement {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
    this.values = [];
  }
  bind(...values) {
    this.values = values;
    return this;
  }
  runSync() {
    const result = this.database.prepare(this.sql).run(...this.values);
    return { success: true, meta: { changes: Number(result.changes || 0) } };
  }
  async run() { return this.runSync(); }
  async first() { return this.database.prepare(this.sql).get(...this.values) || null; }
  async all() { return { results: this.database.prepare(this.sql).all(...this.values) }; }
}

class D1Database {
  constructor(database) { this.database = database; }
  prepare(sql) { return new D1Statement(this.database, sql); }
  async batch(statements) {
    this.database.exec("BEGIN IMMEDIATE");
    try {
      const results = statements.map(statement => statement.runSync());
      this.database.exec("COMMIT");
      return results;
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }
}

const sqlite = new DatabaseSync(":memory:");
sqlite.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE inventory (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, size TEXT NOT NULL DEFAULT '',
    sizes_json TEXT NOT NULL DEFAULT '{}', quantity INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT, product_id TEXT, product_name TEXT NOT NULL,
    player TEXT DEFAULT '', team_country TEXT DEFAULT '', size TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1, sale_price REAL, platform TEXT NOT NULL DEFAULT 'Other',
    notes TEXT DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE site_settings (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
`);
for (const statement of SHOPIFY_SCHEMA_STATEMENTS) sqlite.exec(statement);
const DB = new D1Database(sqlite);
await ensureShopifySchema({ DB });

function seedProduct(id, name, sizes, variants) {
  const quantity = Object.values(sizes).reduce((sum, value) => sum + value, 0);
  sqlite.prepare("INSERT INTO inventory (id, name, size, sizes_json, quantity) VALUES (?, ?, ?, ?, ?)")
    .run(id, name, Object.keys(sizes).join(", "), JSON.stringify(sizes), quantity);
  sqlite.prepare("INSERT INTO shopify_product_mappings (product_id, shopify_product_id, sync_status) VALUES (?, ?, 'updated')")
    .run(id, `gid://shopify/Product/${variants[0][1] - 1000}`);
  for (const [size, variantId] of variants) {
    sqlite.prepare("INSERT INTO shopify_variant_mappings (product_id, size, sku, shopify_variant_id, sync_status) VALUES (?, ?, ?, ?, 'updated')")
      .run(id, size, `JFB-${id}-${size}`, `gid://shopify/ProductVariant/${variantId}`);
  }
}

function paidOrder(id, lines, source = "Direct") {
  return sanitizeWebhookPayload({
    id,
    name: `#${id}`,
    financial_status: "paid",
    currency: "USD",
    subtotal_price: lines.reduce((sum, line) => sum + line.quantity * 50, 0),
    processed_at: "2026-08-11T12:00:00Z",
    note_attributes: [
      { name: "_jfb_session", value: "a".repeat(64) },
      { name: "_jfb_source", value: source }
    ],
    line_items: lines.map((line, index) => ({
      id: `${id}-${index + 1}`,
      variant_id: line.variant,
      variant_title: line.size,
      quantity: line.quantity,
      price: "50.00"
    }))
  });
}

function inventory(id) {
  const row = sqlite.prepare("SELECT sizes_json, quantity FROM inventory WHERE id = ?").get(id);
  return { sizes: JSON.parse(row.sizes_json), quantity: Number(row.quantity) };
}

function count(sql, ...values) {
  return Number(sqlite.prepare(sql).get(...values).count || 0);
}

seedProduct("club-alpha", "Alpha Player Home Jersey", { M: 3, L: 1, XL: 1 }, [["M", 1101], ["L", 1102], ["XL", 1103]]);
seedProduct("world-beta", "Beta Country Away Jersey", { S: 2 }, [["S", 1201]]);
seedProduct("club-race", "Race Final Unit Jersey", { M: 1 }, [["M", 1301]]);

await processSanitizedWebhook({ DB }, "orders/paid", paidOrder(100, [{ variant: 1101, size: "M", quantity: 1 }], "TikTok"));
assert.deepEqual(inventory("club-alpha"), { sizes: { M: 2, L: 1, XL: 1 }, quantity: 4 });
assert.equal(count("SELECT COUNT(*) AS count FROM sales WHERE platform = 'Website' AND product_id = 'club-alpha'"), 1);
assert.equal(count("SELECT COUNT(*) AS count FROM shopify_commerce_events WHERE event_type = 'Purchase' AND shopify_order_id = '100'"), 1);
assert.equal(sqlite.prepare("SELECT traffic_source FROM shopify_commerce_events WHERE shopify_order_id = '100'").get().traffic_source, "TikTok");

await processSanitizedWebhook({ DB }, "orders/paid", paidOrder(100, [{ variant: 1101, size: "M", quantity: 9 }]));
assert.deepEqual(inventory("club-alpha"), { sizes: { M: 2, L: 1, XL: 1 }, quantity: 4 }, "a replay cannot decrement inventory or rewrite processed quantity");
assert.equal(count("SELECT COUNT(*) AS count FROM sales WHERE platform = 'Website' AND notes LIKE 'Shopify order 100%'"), 1);
assert.equal(count("SELECT COUNT(*) AS count FROM shopify_commerce_events WHERE shopify_order_id = '100'"), 1);

await processSanitizedWebhook({ DB }, "orders/paid", paidOrder(200, [
  { variant: 1102, size: "L", quantity: 1 },
  { variant: 1201, size: "S", quantity: 2 }
]));
assert.equal(inventory("club-alpha").sizes.L, 0);
assert.deepEqual(inventory("world-beta"), { sizes: { S: 0 }, quantity: 0 });

await processSanitizedWebhook({ DB }, "orders/paid", paidOrder(201, [
  { variant: 1101, size: "M", quantity: 1 },
  { variant: 1103, size: "XL", quantity: 1 }
]));
assert.deepEqual(inventory("club-alpha"), { sizes: { M: 1, L: 0, XL: 0 }, quantity: 1 });

await processSanitizedWebhook({ DB }, "orders/paid", paidOrder(202, [{ variant: 1101, size: "M", quantity: 1 }]));
assert.deepEqual(inventory("club-alpha"), { sizes: { M: 0, L: 0, XL: 0 }, quantity: 0 }, "the last unit becomes unavailable exactly once");

for (const [topic, raw] of [
  ["orders/create", { id: 300, financial_status: "pending", line_items: [{ id: 1, variant_id: 1301, variant_title: "M", quantity: 1, price: 50 }] }],
  ["orders/cancelled", { id: 301, financial_status: "paid", cancelled_at: "2026-08-11T13:00:00Z", line_items: [{ id: 1, variant_id: 1301, variant_title: "M", quantity: 1, price: 50 }] }],
  ["fulfillments/update", { id: 500, order_id: 100, financial_status: "paid", fulfillment_status: "success", line_items: [{ id: 1, variant_id: 1301, variant_title: "M", quantity: 1, price: 50 }] }]
]) {
  await processSanitizedWebhook({ DB }, topic, sanitizeWebhookPayload(raw));
}
assert.deepEqual(inventory("club-race"), { sizes: { M: 1 }, quantity: 1 }, "pending, cancelled, and fulfillment events never decrement inventory");

await processSanitizedWebhook({ DB }, "refunds/create", sanitizeWebhookPayload({ id: 601, order_id: 100, transactions: [{ kind: "refund", amount: "10.00" }] }));
await processSanitizedWebhook({ DB }, "refunds/create", sanitizeWebhookPayload({ id: 602, order_id: 100, transactions: [{ kind: "refund", amount: "40.00" }] }));
assert.equal(count("SELECT COUNT(*) AS count FROM shopify_refunds WHERE shopify_order_id = '100'"), 2);
assert.equal(Number(sqlite.prepare("SELECT refund_total FROM shopify_orders WHERE shopify_order_id = '100'").get().refund_total), 50);
assert.equal(inventory("club-alpha").quantity, 0, "partial and full refunds do not return inventory automatically");

sqlite.prepare("UPDATE inventory SET sizes_json = '{\"M\":0}', quantity = 0 WHERE id = 'club-race'").run();
sqlite.prepare("INSERT INTO sales (product_id, product_name, size, quantity, sale_price, platform) VALUES ('club-race', 'Race Final Unit Jersey', 'M', 1, 50, 'eBay')").run();
await assert.rejects(
  () => processSanitizedWebhook({ DB }, "orders/paid", paidOrder(400, [{ variant: 1301, size: "M", quantity: 1 }])),
  /manual review/i
);
assert.equal(count("SELECT COUNT(*) AS count FROM sales WHERE product_id = 'club-race' AND platform = 'Website'"), 0);
assert.equal(inventory("club-race").quantity, 0);
assert.equal(sqlite.prepare("SELECT processing_status FROM shopify_order_lines WHERE shopify_order_id = '400'").get().processing_status, "failed");

console.log("Shopify order lifecycle tests passed:");
console.log("- single item, multiple products, multiple quantities, multiple sizes, and last-unit orders decrement once");
console.log("- duplicate paid delivery creates no duplicate Website sale or inventory decrement");
console.log("- pending, cancelled, refund, and fulfillment events never create sales or restore stock");
console.log("- a marketplace sale of the final unit blocks D1 processing and requires visible manual review");
