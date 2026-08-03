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
const storefrontSource = await readFile(path.join(workspace, "storefront.js"), "utf8");
const seoSource = await readFile(path.join(workspace, "functions", "_seo.js"), "utf8");
const inventorySeedSource = await readFile(path.join(workspace, "functions", "api", "_inventorySeed.js"), "utf8");

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

function allStructuredData(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]));
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

for (const id of [
  "club-barcelona-raphinha-home-2526",
  "club-barcelona-yamal-home-2526",
  "club-real-madrid-mbappe-home-2526",
  "club-real-madrid-bellingham-home-2526"
]) {
  const product = inventory.items.find(item => item.id === id);
  assert.ok(product, `${id} fixture exists`);
  assert.match(product.name, /26\/27/);
  assert.doesNotMatch(product.name, /25\/26/);
  for (const photo of product.photos || []) {
    assert.match(photo.alt, /26\/27/);
    assert.doesNotMatch(photo.alt, /25\/26/);
  }
}
assert.match(inventorySeedSource, /correct_club_seasons_2026_07_30/);

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
  siteOrigin: "https://jerseysfrmjb.com",
  reviewSummary: { count: 2, rating: 5 }
});
const soldOutModel = buildProductPageModel(soldOutRow, {
  siteOrigin: "https://jerseysfrmjb.com"
});
const oneLinkModel = buildProductPageModel(oneLinkRow, {
  siteOrigin: "https://jerseysfrmjb.com"
});
const basePriceModel = buildProductPageModel(productRow(oneLinkItem, {
  id: `${oneLinkItem.id}-base-price`,
  base_price: 40,
  depop_price: null,
  ebay_price: null
}), {
  siteOrigin: "https://jerseysfrmjb.com"
});
const ebayOnlyPriceModel = buildProductPageModel(productRow(oneLinkItem, {
  id: `${oneLinkItem.id}-ebay-price`,
  base_price: 40,
  depop_price: null,
  ebay_price: 50
}), {
  siteOrigin: "https://jerseysfrmjb.com"
});

assert.ok(inStockModel.available);
assert.equal("quantity" in inStockModel, false);
assert.ok(inStockModel.sizes.length > 0);
assert.ok(inStockModel.sizes.every(size => !("quantity" in size)));
assert.equal(inStockModel.canonicalUrl, `https://jerseysfrmjb.com/products/${inStockRow.id}`);
assert.equal(inStockModel.images.front.src.startsWith("https://jerseysfrmjb.com/"), true);
assert.equal(inStockModel.images.back.src.startsWith("https://jerseysfrmjb.com/"), true);
assert.equal(inStockModel.marketplaces.filter(marketplace => marketplace.link).length, 2);
assert.deepEqual(
  inStockModel.marketplaces.map(marketplace => [marketplace.name, marketplace.priceDisplay]),
  [["Depop", "50.00"], ["eBay", "55.00"]]
);

assert.equal(soldOutModel.available, false);
assert.equal("quantity" in soldOutModel, false);
assert.deepEqual(soldOutModel.sizes, []);
assert.equal(soldOutModel.availabilityUrl, "https://schema.org/OutOfStock");

assert.equal(oneLinkModel.marketplaces.filter(marketplace => marketplace.link).length, 1);
assert.equal(oneLinkModel.marketplaces.find(marketplace => marketplace.name === "eBay").link, "");
assert.deepEqual(
  basePriceModel.marketplaces.map(marketplace => [marketplace.name, marketplace.priceDisplay]),
  [["Depop", "40.00"], ["eBay", "45.00"]]
);
assert.deepEqual(
  ebayOnlyPriceModel.marketplaces.map(marketplace => [marketplace.name, marketplace.priceDisplay]),
  [["Depop", "45.00"], ["eBay", "50.00"]]
);

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
assert.doesNotMatch(inStockHtml, /Jersey Price|Marketplace prices may vary|Website price/i);
assert.match(storefrontSource, /class="product-details-button"/);
assert.match(storefrontSource, /View Jersey Details/);
assert.match(seoSource, /class="product-details-button"/);
assert.match(inStockHtml, />Front<\/figcaption>/);
assert.match(inStockHtml, />Back<\/figcaption>/);
assert.match(inStockHtml, />Player<\/dt>/);
assert.match(inStockHtml, />Team \/ country<\/dt>/);
assert.match(inStockHtml, />Category<\/dt>/);
assert.match(inStockHtml, /\/players\/lionel-messi/);
assert.match(inStockHtml, /\/teams\/argentina/);
assert.match(inStockHtml, /\/competitions\/world-cup/);
assert.match(inStockHtml, />Available sizes:<\/h2>/);
assert.match(inStockHtml, />Medium<\/strong>/);
assert.match(inStockHtml, /width="1280" height="1280" loading="eager"/);
assert.match(inStockHtml, /Questions about this jersey/);
assert.doesNotMatch(inStockHtml, /What is the condition of this jersey|>Condition<\/dt>|See marketplace listing/);
assert.doesNotMatch(inStockHtml, /href="[^"]*\.html/);
assert.match(inStockHtml, /5\.0 · 2 approved reviews/);
assert.doesNotMatch(inStockHtml, /Total stock|Stock quantity|\d+\s+(?:available|remaining)|quantity/i);
assert.match(inStockHtml, /does not process checkout on this page/);
assert.doesNotMatch(inStockHtml, /Add to Cart|Checkout Now|Buy from JerseysFrmJB/);

const inStockSchema = structuredData(inStockHtml);
assert.equal(inStockSchema["@context"], "https://schema.org");
assert.equal(inStockSchema["@type"], "Product");
assert.equal(inStockSchema.sku, inStockModel.id);
assert.equal(inStockSchema.url, inStockModel.canonicalUrl);
assert.equal(inStockSchema.image.length, 2);
assert.equal(inStockSchema.image[0]["@type"], "ImageObject");
assert.match(inStockSchema.image[0].name, /Lionel Messi Argentina 2026 Home soccer jersey front view/);
assert.equal(inStockSchema.offers.length, 2);
assert.deepEqual(inStockSchema.size, ["M"]);
assert.equal("brand" in inStockSchema, false);
assert.equal("audience" in inStockSchema, false);
assert.equal("itemCondition" in inStockSchema, false);
assert.ok(inStockSchema.offers.every(offer => !("itemCondition" in offer)));
assert.equal(inStockSchema.aggregateRating.ratingValue, "5.0");
assert.equal(inStockSchema.aggregateRating.reviewCount, 2);
assert.equal(
  inStockSchema.additionalProperty.some(property => /quantity/i.test(property.name)),
  false
);
assert.deepEqual(
  inStockSchema.offers.map(offer => offer.name).sort(),
  ["Buy on Depop", "Buy on eBay"].sort()
);
assert.deepEqual(
  inStockSchema.offers.map(offer => Number(offer.price)).sort((a, b) => a - b),
  [50, 55]
);
for (const offer of inStockSchema.offers) {
  assert.equal(offer.priceCurrency, "USD");
  assert.equal(offer.availability, "https://schema.org/InStock");
  assert.equal(new URL(offer.url).protocol, "https:");
}
const inStockSchemas = allStructuredData(inStockHtml);
assert.ok(inStockSchemas.some(item => item["@type"] === "BreadcrumbList"));
assert.ok(inStockSchemas.some(item => item["@type"] === "FAQPage"));

const soldOutSchema = structuredData(soldOutHtml);
assert.match(soldOutHtml, /Sold out/);
assert.doesNotMatch(soldOutHtml, />Available sizes:<\/h2>/);
assert.doesNotMatch(soldOutHtml, /<h2 id="marketplace-heading">Available on<\/h2>/);
assert.match(soldOutHtml, /Restock requests open/);
assert.match(soldOutHtml, /Expected marketplace price/);
assert.match(soldOutHtml, /<b>Depop<\/b> \$50/);
assert.match(soldOutHtml, /<b>eBay<\/b> \$55/);
assert.match(soldOutHtml, /data-help-request-type="restock_request"><span>Request This Jersey<\/span>/);
assert.doesNotMatch(soldOutHtml, /Total stock|Stock quantity|\d+\s+(?:available|remaining)|quantity/i);
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
