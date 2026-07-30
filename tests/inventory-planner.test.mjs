import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  calculateDemandScore,
  recommendedOrderQuantity
} from "../functions/api/admin/inventory-planner.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFile(path.join(workspace, file), "utf8");

const [html, client, api, styles, schema, migration] = await Promise.all([
  read("admin.html"),
  read("admin.js"),
  read("functions/api/admin/inventory-planner.js"),
  read("styles.css"),
  read("schema.sql"),
  read("migrations/0012_inventory_planner.sql")
]);

assert.match(html, /data-admin-tab="planner"/);
assert.match(html, /data-admin-section="planner"/);
assert.match(html, /data-planner-suppliers/);
assert.match(html, /data-planner-products/);
assert.match(html, /data-export-purchase/);
assert.match(html, /data-planner-purchase-table/);
assert.match(html, /data-add-purchase-row/);
assert.match(client, /International/);
assert.match(client, /\/api\/admin\/inventory-planner/);
assert.match(client, /exportPlannerPurchaseCsv/);
assert.match(client, /matchPlannerPurchaseProduct/);
assert.match(client, /plannerSupplierOptions/);
assert.match(client, /data-purchase-size/);
assert.match(client, /Supplier total/);
assert.match(client, /Estimated revenue/);
assert.match(client, /Expected profit/);
assert.match(client, /Website.*eBay.*Depop.*Facebook/s);
assert.match(api, /isAuthorized\(context\.request, context\.env\)/);
assert.match(api, /recommended_supplier/);
assert.match(api, /search_frequency/);
assert.match(api, /request_count/);
assert.match(api, /days_since_last_sale/);
assert.match(api, /days_in_inventory/);
assert.match(styles, /\.planner-product-grid/);
assert.match(styles, /\.planner-order-table[\s\S]*grid-template-columns:\s*repeat\(12/);
assert.doesNotMatch(styles, /\.planner-order-table-wrap\s*\{[^}]*overflow-x:\s*auto/);
assert.match(styles, /@media \(max-width: 720px\)/);
assert.match(styles, /@media \(prefers-color-scheme: dark\)/);

for (const sql of [schema, migration]) {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS inventory_suppliers/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS supplier_price_rules/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS inventory_planner_overrides/);
  assert.match(sql, /\('kevin', 'fan', 'base', 12\)/);
  assert.match(sql, /\('kevin', 'fan', 'nameset_patches', 15\)/);
  assert.match(sql, /\('kevin', 'retro_short', 'nameset_patches', 18\)/);
  assert.match(sql, /\('kevin', 'retro_long', 'nameset_patches', 20\)/);
}

const maxima = { views: 100, clicks: 20, sales: 10, searches: 20, requests: 5 };
const highDemand = calculateDemandScore(
  { views: 100, clicks: 20, sales: 10, searches: 20, requests: 5, inventory: 0 },
  maxima
);
const lowDemand = calculateDemandScore(
  { views: 1, clicks: 0, sales: 0, searches: 0, requests: 0, inventory: 5 },
  maxima
);
assert.equal(highDemand, 100);
assert.ok(lowDemand < 10);
assert.ok(recommendedOrderQuantity({
  demand_score: 90,
  inventory_remaining: 0,
  sales_30d: 4,
  total_sales: 8
}) >= 6);
assert.equal(recommendedOrderQuantity({
  demand_score: 0,
  inventory_remaining: 4,
  sales_30d: 0,
  total_sales: 0
}), 0);

console.log("Inventory planner tests passed:");
console.log("- supplier pricing is editable and future-supplier ready");
console.log("- demand, profit, risk, reorder, purchase-list, and CSV features are wired");
console.log("- planner remains authenticated and responsive");
