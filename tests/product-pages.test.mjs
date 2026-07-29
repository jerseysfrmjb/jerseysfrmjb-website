import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildProductPageModel,
  renderProductPage
} from "../functions/products/_page.js";
import { onRequestGet as getProductPage } from "../functions/products/[slug].js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inventory = JSON.parse(await readFile(path.join(workspace, "data", "inventory.json"), "utf8"));

function productRow(item, overrides = {}) {
  return {
    id: item.id,
    category: item.category,
    name: item.name,
    size: item.size,
    sizes_json: JSON.stringify(item.sizes || {}),
    base_price: item.price,
    quantity: item.quantity,
    photos: JSON.stringify(item.photos || []),
    links: JSON.stringify(item.links || {}),
    updated_at: "2026-07-28 10:00:00",
    depop_price: 50,
    ebay_price: 55,
    facebook_price: 52,
    website_price: 51,
    ...overrides
  };
}

function structuredData(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, "server HTML includes Schema.org JSON-LD");
  return JSON.parse(match[1]);
}

function productDatabase(rows) {
  return {
    prepare(sql) {
      assert.match(sql, /FROM inventory/);
      assert.match(sql, /platform = 'Depop'/);
      assert.match(sql, /platform = 'eBay'/);
      assert.match(sql, /platform = 'Facebook'/);
      assert.match(sql, /platform = 'Website'/);
      return {
        bind(id) {
          return {
            async first() {
              return rows.find(row => row.id === id) || null;
            }
          };
        }
      };
    }
  };
}

const inStockItem = inventory.items.find(item =>
  Number(item.quantity) > 0 &&
  (item.photos || []).length >= 2 &&
  item.links?.depop &&
  item.links?.ebay
);
const soldOutItem = inventory.items.find(item =>
  Number(item.quantity) === 0 &&
  (item.photos || []).length >= 2
);
const oneLinkItem = inventory.items.find(item =>
  Number(item.quantity) > 0 &&
  (item.photos || []).length >= 2
);

assert.ok(inStockItem, "in-stock fixture exists");
assert.ok(soldOutItem, "sold-out fixture exists");
assert.ok(oneLinkItem, "one-link fixture exists");

const inStockRow = productRow(inStockItem);
const soldOutRow = productRow(soldOutItem, {
  quantity: 0,
  sizes_json: "{}"
});
const oneLinkRow = productRow(oneLinkItem, {
  id: `${oneLinkItem.id}-depop-only`,
  links: JSON.stringify({ depop: oneLinkItem.links.depop })
});

const inStockModel = buildProductPageModel(inStockRow, {
  siteOrigin: "https://jerseysfrmjb.com"
});
const soldOutModel = buildProductPageModel(soldOutRow, {
  siteOrigin: "https://jerseysfrmjb.com"
});
const oneLinkModel = buildProductPageModel(oneLinkRow, {
  siteOrigin: "https://jerseysfrmjb.com"
});

assert.ok(inStockModel.available);
assert.ok(inStockModel.quantity > 0);
assert.equal(inStockModel.canonicalUrl, `https://jerseysfrmjb.com/products/${inStockRow.id}`);
assert.equal(inStockModel.images.front.src.startsWith("https://jerseysfrmjb.com/"), true);
assert.equal(inStockModel.images.back.src.startsWith("https://jerseysfrmjb.com/"), true);
assert.equal(inStockModel.marketplaces.filter(marketplace => marketplace.link).length, 2);

assert.equal(soldOutModel.available, false);
assert.equal(soldOutModel.quantity, 0);
assert.equal(soldOutModel.availabilityUrl, "https://schema.org/OutOfStock");

assert.equal(oneLinkModel.marketplaces.filter(marketplace => marketplace.link).length, 1);
assert.equal(oneLinkModel.marketplaces.find(marketplace => marketplace.name === "eBay").link, "");

const inStockHtml = renderProductPage(inStockModel);
const soldOutHtml = renderProductPage(soldOutModel);
const oneLinkHtml = renderProductPage(oneLinkModel);

assert.match(inStockHtml, new RegExp(`<title>${inStockModel.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\| JerseysFrmJB</title>`));
assert.match(inStockHtml, new RegExp(`<link rel="canonical" href="${inStockModel.canonicalUrl}">`));
assert.match(inStockHtml, new RegExp(`<meta property="og:url" content="${inStockModel.canonicalUrl}">`));
assert.match(inStockHtml, /<meta property="og:type" content="product">/);
assert.match(inStockHtml, /<meta name="twitter:card" content="summary_large_image">/);
assert.match(inStockHtml, /<meta name="twitter:image" content="https:\/\/jerseysfrmjb\.com\//);
assert.match(inStockHtml, /data-meta-product="true"/);
assert.match(inStockHtml, new RegExp(`data-product-id="${inStockModel.id}"`));
assert.match(inStockHtml, /\/meta-pixel\.js\?v=1/);
assert.match(inStockHtml, /Buy on Depop/);
assert.match(inStockHtml, /Buy on eBay/);
assert.match(inStockHtml, />Front<\/figcaption>/);
assert.match(inStockHtml, />Back<\/figcaption>/);
assert.match(inStockHtml, />Player<\/dt>/);
assert.match(inStockHtml, />Team \/ country<\/dt>/);
assert.match(inStockHtml, />Condition<\/dt>/);
assert.match(inStockHtml, />Total stock<\/dt>/);
assert.match(inStockHtml, /does not process checkout on this page/);
assert.doesNotMatch(inStockHtml, /Add to Cart|Checkout Now|Buy from JerseysFrmJB/);

const inStockSchema = structuredData(inStockHtml);
assert.equal(inStockSchema["@context"], "https://schema.org");
assert.equal(inStockSchema["@type"], "Product");
assert.equal(inStockSchema.sku, inStockModel.id);
assert.equal(inStockSchema.url, inStockModel.canonicalUrl);
assert.equal(inStockSchema.image.length, 2);
assert.equal(inStockSchema.offers.length, 2);
assert.deepEqual(
  inStockSchema.offers.map(offer => offer.name).sort(),
  ["Buy on Depop", "Buy on eBay"].sort()
);
for (const offer of inStockSchema.offers) {
  assert.equal(offer.priceCurrency, "USD");
  assert.equal(offer.availability, "https://schema.org/InStock");
  assert.equal(new URL(offer.url).protocol, "https:");
}

const soldOutSchema = structuredData(soldOutHtml);
assert.match(soldOutHtml, /Sold out/);
assert.match(soldOutHtml, /No sizes currently available/);
assert.doesNotMatch(soldOutHtml, /class="platform-buy-button product-marketplace-button"/);
assert.ok(soldOutSchema.offers.every(offer => offer.availability === "https://schema.org/OutOfStock"));

assert.equal(
  (oneLinkHtml.match(/class="platform-buy-button product-marketplace-button"/g) || []).length,
  1,
  "only one active marketplace button renders when only one listing link exists"
);
assert.match(oneLinkHtml, /Buy on Depop/);
assert.doesNotMatch(oneLinkHtml, /Buy on eBay/);
assert.match(oneLinkHtml, /Listing link unavailable/);
assert.equal(structuredData(oneLinkHtml).offers.length, 1);

for (const image of [inStockModel.images.front, inStockModel.images.back]) {
  const imageUrl = new URL(image.src);
  await access(path.join(workspace, decodeURIComponent(imageUrl.pathname.replace(/^\/+/, ""))));
}

const routeEnv = {
  CATALOG_SITE_ORIGIN: "https://jerseysfrmjb.com",
  DB: productDatabase([inStockRow, soldOutRow, oneLinkRow])
};
const routeResponse = await getProductPage({
  env: routeEnv,
  request: new Request(`https://jerseysfrmjb.com/products/${inStockRow.id}`),
  params: { slug: inStockRow.id }
});
assert.equal(routeResponse.status, 200);
assert.match(routeResponse.headers.get("content-type"), /^text\/html/);
assert.match(routeResponse.headers.get("cache-control"), /s-maxage=120/);
assert.match(await routeResponse.text(), new RegExp(`data-product-id="${inStockRow.id}"`));

const missingResponse = await getProductPage({
  env: routeEnv,
  request: new Request("https://jerseysfrmjb.com/products/not-a-product"),
  params: { slug: "not-a-product" }
});
assert.equal(missingResponse.status, 404);
assert.equal(missingResponse.headers.get("cache-control"), "no-store");
assert.match(await missingResponse.text(), /noindex,follow/);

const invalidSlugResponse = await getProductPage({
  env: routeEnv,
  request: new Request("https://jerseysfrmjb.com/products/invalid"),
  params: { slug: "../invalid" }
});
assert.equal(invalidSlugResponse.status, 404);

console.log("Product landing page tests passed:");
console.log(`- in stock with two marketplace links: ${inStockRow.id}`);
console.log(`- sold out: ${soldOutRow.id}`);
console.log(`- one marketplace link: ${oneLinkRow.id}`);
console.log("- canonical, Open Graph, Twitter, and server-rendered content validated");
console.log("- Schema.org Product and marketplace Offer data parsed successfully");
console.log("- Meta Pixel product attributes and marketplace buttons validated");
