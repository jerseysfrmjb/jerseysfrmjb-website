import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildCatalogProducts, CSV_COLUMNS } from "../functions/api/catalog/_products.js";
import { onRequestGet as getCatalog } from "../functions/api/catalog/[format].js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inventory = JSON.parse(await readFile(path.join(workspace, "data", "inventory.json"), "utf8"));

function inventoryRow(item, overrides = {}) {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    size: item.size,
    sizes_json: JSON.stringify(item.sizes || {}),
    base_price: item.price,
    quantity: item.quantity,
    photos: JSON.stringify(item.photos || []),
    updated_at: "2026-07-27 12:00:00",
    facebook_price: null,
    website_price: null,
    ...overrides
  };
}

function testDatabase(rows) {
  return {
    prepare(sql) {
      assert.match(sql, /FROM inventory/);
      assert.match(sql, /platform = 'Facebook'/);
      assert.match(sql, /platform = 'Website'/);
      return {
        async all() {
          return { results: rows };
        }
      };
    }
  };
}

const facebookItem = inventory.items.find(item => item.id === "club-real-madrid-mbappe-home-2526");
const fallbackItem = inventory.items.find(item => item.id === "club-real-home-2526");
const soldOutItem = inventory.items.find(item =>
  Number(item.quantity) === 0 &&
  Object.values(item.sizes || {}).every(quantity => Number(quantity) === 0) &&
  (item.photos || []).length >= 2
);

assert.ok(facebookItem, "Facebook-price fixture product exists");
assert.ok(fallbackItem, "fallback-price fixture product exists");
assert.ok(soldOutItem, "sold-out fixture product exists");

const rows = [
  inventoryRow(facebookItem, {
    facebook_price: 61.25,
    website_price: 59,
    base_price: 55
  }),
  inventoryRow(fallbackItem, {
    facebook_price: null,
    website_price: 43.5,
    base_price: 40
  }),
  inventoryRow(soldOutItem, {
    facebook_price: null,
    website_price: null,
    quantity: 0,
    sizes_json: "{}"
  }),
  {
    id: "invalid-image-product",
    category: "club",
    name: "Invalid Image Product",
    size: "M",
    sizes_json: '{"M":1}',
    base_price: 25,
    quantity: 1,
    photos: '[{"src":"javascript:alert(1)","alt":"invalid front"}]',
    updated_at: "2026-07-27 12:00:00",
    facebook_price: null,
    website_price: null
  }
];

const env = { DB: testDatabase(rows) };
const request = new Request("https://jerseysfrmjb.com/api/catalog/products.json");
const jsonResponse = await getCatalog({ env, request, params: { format: "products.json" } });

assert.equal(jsonResponse.status, 200);
assert.match(jsonResponse.headers.get("content-type"), /^application\/json/);
assert.match(jsonResponse.headers.get("cache-control"), /max-age=300/);
assert.equal(jsonResponse.headers.get("access-control-allow-origin"), "*");

const payload = await jsonResponse.json();
assert.equal(payload.catalog, "JerseysFrmJB");
assert.equal(payload.currency, "USD");
assert.equal(payload.product_count, 3, "products without a valid main image are skipped");

const facebookProduct = payload.products.find(product => product.id === facebookItem.id);
const fallbackProduct = payload.products.find(product => product.id === fallbackItem.id);
const soldOutProduct = payload.products.find(product => product.id === soldOutItem.id);

assert.equal(facebookProduct.availability, "in stock");
assert.ok(facebookProduct.quantity > 0);
assert.equal(facebookProduct.price, "61.25 USD");
assert.equal(facebookProduct.facebook_price, "61.25");
assert.equal(facebookProduct.price_source, "facebook");
assert.equal(facebookProduct.player, "Kylian Mbappe");
assert.equal(facebookProduct.team_country, "Real Madrid");
assert.match(facebookProduct.image_link, /front\.jpg\?v=/);
assert.match(facebookProduct.additional_image_link, /back\.jpg\?v=/);

assert.equal(fallbackProduct.price, "43.50 USD");
assert.equal(fallbackProduct.facebook_price, "43.50");
assert.equal(fallbackProduct.price_source, "website");

assert.equal(soldOutProduct.availability, "out of stock");
assert.equal(soldOutProduct.quantity, 0);
assert.equal(soldOutProduct.price_source, "base");
assert.equal(soldOutProduct.available_sizes, "");

for (const product of payload.products) {
  for (const field of ["link", "image_link"]) {
    const url = new URL(product[field]);
    assert.equal(url.protocol, "https:", `${field} is absolute HTTPS for ${product.id}`);
  }
  if (product.additional_image_link) {
    assert.equal(new URL(product.additional_image_link).protocol, "https:");
  }

  const landingUrl = new URL(product.link);
  assert.equal(landingUrl.pathname, `/products/${product.id}`);
  assert.equal(landingUrl.search, "");
  assert.equal(landingUrl.hash, "");

  for (const imageField of ["image_link", "additional_image_link"]) {
    if (!product[imageField]) continue;
    const imageUrl = new URL(product[imageField]);
    if (imageUrl.origin !== "https://jerseysfrmjb.com") continue;
    await access(path.join(workspace, decodeURIComponent(imageUrl.pathname.replace(/^\/+/, ""))));
  }
}

const csvResponse = await getCatalog({
  env,
  request: new Request("https://jerseysfrmjb.com/api/catalog/products.csv"),
  params: { format: "products.csv" }
});
assert.equal(csvResponse.status, 200);
assert.match(csvResponse.headers.get("content-type"), /^text\/csv/);
assert.match(csvResponse.headers.get("content-disposition"), /jerseysfrmjb-products\.csv/);

const csvBytes = new Uint8Array(await csvResponse.arrayBuffer());
assert.deepEqual([...csvBytes.slice(0, 3)], [0xEF, 0xBB, 0xBF], "CSV includes a UTF-8 BOM");
const csv = new TextDecoder().decode(csvBytes);
assert.equal(csv.split("\r\n")[0], CSV_COLUMNS.map(column => `"${column}"`).join(","));
assert.match(csv, new RegExp(`"${facebookItem.id}"`));
assert.match(csv, /"61\.25 USD"/);
assert.match(csv, /"in stock"/);
assert.match(csv, /"out of stock"/);
assert.doesNotMatch(csv, /Depop|eBay|Local|Other/);

const missingDbResponse = await getCatalog({
  env: {},
  request: new Request("https://jerseysfrmjb.com/api/catalog/products.json"),
  params: { format: "products.json" }
});
assert.equal(missingDbResponse.status, 503);
assert.equal(missingDbResponse.headers.get("cache-control"), "no-store");

const unknownFormatResponse = await getCatalog({
  env,
  request: new Request("https://jerseysfrmjb.com/api/catalog/unknown.xml"),
  params: { format: "unknown.xml" }
});
assert.equal(unknownFormatResponse.status, 404);
assert.equal(unknownFormatResponse.headers.get("cache-control"), "no-store");

const storefrontSource = await readFile(path.join(workspace, "storefront.js"), "utf8");
assert.match(storefrontSource, /id="product-\$\{escapeHtml\(item\.id\)\}"/);
assert.match(storefrontSource, /focusRequestedCatalogProduct\(grid\)/);
assert.match(storefrontSource, /productDetailsUrl\(item\.id\)/);

const pinterestPublisherSource = await readFile(
  path.join(workspace, "functions", "api", "admin", "pinterest", "publish.js"),
  "utf8"
);
assert.match(pinterestPublisherSource, /productLandingUrl\(productId, siteOrigin\(env\)\)/);

const fullCatalog = buildCatalogProducts(inventory.items.map(item => inventoryRow(item)), {
  siteOrigin: "https://jerseysfrmjb.com"
});
assert.equal(fullCatalog.length, inventory.items.length, "every inventory product has a valid catalog image");
for (const product of fullCatalog) {
  assert.equal(new URL(product.link).protocol, "https:");
  assert.equal(new URL(product.image_link).protocol, "https:");
  assert.equal(new URL(product.link).pathname, `/products/${product.id}`);
  assert.ok(product.team_country, `team/country is populated for ${product.id}`);
  for (const imageField of ["image_link", "additional_image_link"]) {
    if (!product[imageField]) continue;
    const imageUrl = new URL(product[imageField]);
    await access(path.join(workspace, decodeURIComponent(imageUrl.pathname.replace(/^\/+/, ""))));
  }
}

console.log("Catalog feed tests passed:");
console.log(`- in stock with Facebook price: ${facebookItem.id}`);
console.log(`- fallback Website price: ${fallbackItem.id}`);
console.log(`- sold out with base price: ${soldOutItem.id}`);
console.log("- front/back images and exact HTTPS landing links validated");
console.log(`- all ${fullCatalog.length} inventory products have valid absolute links and local images`);
console.log("- CSV and JSON endpoint responses validated");
