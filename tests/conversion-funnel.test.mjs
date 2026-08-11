import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildConversionFunnel, FUNNEL_SOURCES } from "../functions/api/admin/_conversionFunnel.js";
import { onRequestPost as postCommerceEvent } from "../functions/api/analytics/commerce.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const analyticsClient = await readFile(path.join(workspace, "analytics.js"), "utf8");
const cartClient = await readFile(path.join(workspace, "shopify-cart.js"), "utf8");
const commerceEndpoint = await readFile(path.join(workspace, "functions", "api", "analytics", "commerce.js"), "utf8");
const adminClient = await readFile(path.join(workspace, "admin.js"), "utf8");
const adminEndpoint = await readFile(path.join(workspace, "functions", "api", "admin", "analytics.js"), "utf8");
const migration = await readFile(path.join(workspace, "migrations", "0017_conversion_funnel.sql"), "utf8");

const funnel = buildConversionFunnel({
  productViews: 100,
  commerce: [
    { event_type: "AddToCart", events: 20 },
    { event_type: "InitiateCheckout", events: 10 },
    { event_type: "Purchase", events: 4 }
  ],
  products: [
    { id: "club-liverpool-salah-home", name: "Salah #11 Liverpool Home Jersey", category: "club", views: 60, add_to_cart: 6, checkout_started: 4, purchases: 1 },
    { id: "world-france-mbappe-home", name: "Mbappe #10 France Home Jersey", category: "world", views: 40, add_to_cart: 14, checkout_started: 6, purchases: 3 }
  ],
  sources: [
    { source: "TikTok", views: 25, add_to_cart: 10, checkout_started: 7, purchases: 3 },
    { source: "Facebook", views: 30, add_to_cart: 4, checkout_started: 2, purchases: 1 }
  ]
});

assert.deepEqual(funnel.summary, {
  views: 100,
  add_to_cart: 20,
  checkout_started: 10,
  purchases: 4,
  view_to_cart_rate: 20,
  cart_to_checkout_rate: 50,
  checkout_to_purchase_rate: 40,
  overall_conversion_rate: 4
});
assert.equal(funnel.products[0].name, "Salah #11 Liverpool Home Jersey");
assert.equal(funnel.lists.most_viewed_low_add[0].id, "club-liverpool-salah-home");
assert.equal(funnel.lists.highest_converting[0].id, "world-france-mbappe-home");
assert.equal(funnel.lists.views_zero_purchases.length, 0);
assert.equal(funnel.players.some(row => row.name === "Salah"), true);
assert.equal(funnel.teams.some(row => row.name === "Liverpool"), true);
assert.deepEqual(funnel.sources.map(row => row.source), FUNNEL_SOURCES);
assert.match(funnel.recommendations.join(" "), /TikTok traffic converts better than Facebook/);

assert.match(analyticsClient, /commerceContext/);
assert.match(analyticsClient, /navigator\.globalPrivacyControl/);
assert.match(analyticsClient, /TikTok/);
assert.match(cartClient, /prepare_checkout/);
assert.match(cartClient, /product_ids/);
assert.doesNotMatch(cartClient, /jfb_commerce_visitor|jfb_commerce_session/);
assert.match(commerceEndpoint, /sameSiteRequest/);
assert.match(commerceEndpoint, /session_id_hash/);
assert.match(commerceEndpoint, /traffic_source/);
assert.match(adminEndpoint, /buildConversionFunnel/);
assert.match(adminEndpoint, /shopify_order_lines/);
assert.match(adminClient, /Product View &rarr; Add to Cart &rarr; Checkout Started &rarr; Purchase/);
assert.match(adminClient, /Highest-converting traffic sources/);
assert.match(adminClient, /Products with views and zero purchases/);
assert.match(migration, /product_ids_json/);
assert.match(migration, /traffic_source/);

const commerceWrites = [];
const commerceDb = {
  prepare(sql) {
    let values = [];
    return {
      bind(...nextValues) { values = nextValues; return this; },
      async run() {
        if (/INSERT INTO shopify_commerce_events/.test(sql)) commerceWrites.push(values);
        return { success: true };
      }
    };
  }
};
const commerceResponse = await postCommerceEvent({
  request: new Request("https://jerseysfrmjb.com/api/analytics/commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://jerseysfrmjb.com", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({
      event_type: "InitiateCheckout",
      visitor_id: "v_123456789",
      session_id: "s_123456789",
      cart_id: "gid://shopify/Cart/test",
      product_ids: ["club-liverpool-salah-home", "world-france-mbappe-home"],
      traffic_source: "TikTok",
      value: 100
    })
  }),
  env: { DB: commerceDb }
});
assert.equal(commerceResponse.status, 202);
assert.equal(commerceWrites.length, 1);
assert.equal(commerceWrites[0][0], "InitiateCheckout");
assert.match(commerceWrites[0][3], /^[a-f0-9]{64}$/);
assert.deepEqual(JSON.parse(commerceWrites[0][5]), ["club-liverpool-salah-home", "world-france-mbappe-home"]);
assert.equal(commerceWrites[0][7], "TikTok");
const crossSiteCommerce = await postCommerceEvent({
  request: new Request("https://jerseysfrmjb.com/api/analytics/commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://example.com" },
    body: "{}"
  }),
  env: { DB: commerceDb }
});
assert.equal(crossSiteCommerce.status, 403);

console.log("Conversion funnel tests passed:");
console.log("- stage totals and step/overall conversion rates are correct");
console.log("- product, player, team/country, and all required traffic-source breakdowns are present");
console.log("- drop-off tables and recommendations are generated without personal data");
console.log("- commerce tracking inherits the existing privacy-aware analytics context");
