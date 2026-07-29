import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildSeoProducts,
  entityCollections,
  entityProducts,
  relatedProducts,
  renderSeoCollectionPage
} from "../functions/_seo.js";
import { onRequestGet as getTeamPage } from "../functions/teams/[slug].js";
import { onRequestGet as getPlayerPage } from "../functions/players/[slug].js";
import { onRequestGet as getCompetitionPage } from "../functions/competitions/[slug].js";
import { onRequestGet as getSitemap } from "../functions/sitemap.xml.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inventory = JSON.parse(await readFile(path.join(workspace, "data", "inventory.json"), "utf8"));

function inventoryRow(item) {
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
    updated_at: "2026-07-28 12:00:00",
    depop_price: 50,
    ebay_price: 55,
    website_price: 52
  };
}

function database(rows) {
  return {
    prepare(sql) {
      assert.match(sql, /FROM inventory/);
      assert.match(sql, /platform = 'Depop'/);
      assert.match(sql, /platform = 'eBay'/);
      return {
        async all() {
          return { results: rows };
        }
      };
    }
  };
}

function jsonLd(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(match => JSON.parse(match[1]));
}

const rows = inventory.items.map(inventoryRow);
const products = buildSeoProducts(rows, { siteOrigin: "https://jerseysfrmjb.com" });
assert.equal(products.length, inventory.items.length);

const entities = entityCollections(products);
assert.ok(entities.teams.some(entity => entity.slug === "barcelona"));
assert.ok(entities.teams.some(entity => entity.slug === "real-madrid"));
assert.ok(entities.players.some(entity => entity.slug === "lionel-messi"));
assert.ok(entities.players.some(entity => entity.slug === "lamine-yamal"));
assert.ok(entities.competitions.some(entity => entity.slug === "world-cup"));

const entitySets = {
  teams: new Set(entities.teams.map(entity => entity.slug)),
  players: new Set(entities.players.map(entity => entity.slug)),
  competitions: new Set(entities.competitions.map(entity => entity.slug))
};
const entityPages = [];
for (const kind of ["teams", "players", "competitions"]) {
  for (const entity of entities[kind]) {
    const matches = entityProducts(products, kind, entity.slug);
    const html = renderSeoCollectionPage(matches, kind, { siteOrigin: "https://jerseysfrmjb.com" });
    const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1] || "";
    const introduction = html.match(/<meta name="description" content="([^"]+)">/)?.[1] || "";
    entityPages.push({ kind, slug: entity.slug, canonical, introduction, html });
  }
}

assert.equal(
  new Set(entityPages.map(page => page.canonical)).size,
  entityPages.length,
  "every entity page has a unique canonical URL"
);
assert.equal(
  new Set(entityPages.map(page => page.introduction)).size,
  entityPages.length,
  "every entity page has a unique introduction"
);

function trigrams(value) {
  const words = value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  return new Set(words.slice(0, -2).map((_, index) => words.slice(index, index + 3).join(" ")));
}

function similarity(left, right) {
  const a = trigrams(left);
  const b = trigrams(right);
  const shared = [...a].filter(value => b.has(value)).length;
  return shared / Math.max(1, a.size + b.size - shared);
}

for (let left = 0; left < entityPages.length; left += 1) {
  for (let right = left + 1; right < entityPages.length; right += 1) {
    if (entityPages[left].kind !== entityPages[right].kind) continue;
    assert.ok(
      similarity(entityPages[left].introduction, entityPages[right].introduction) < 0.72,
      `near-duplicate introductions: ${entityPages[left].kind}/${entityPages[left].slug} and ${entityPages[right].kind}/${entityPages[right].slug}`
    );
  }
}

for (const page of entityPages) {
  const hrefs = [...page.html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
  for (const href of hrefs.filter(value => /^\/(?:teams|players|competitions)\//.test(value))) {
    const [, kind, slug] = href.split("/");
    assert.ok(entitySets[kind].has(slug), `entity link resolves: ${href}`);
  }
  for (const href of hrefs.filter(value => /^https:\/\/jerseysfrmjb\.com\/products\//.test(value))) {
    const id = new URL(href).pathname.split("/").at(-1);
    assert.ok(products.some(product => product.id === id), `product link resolves: ${href}`);
  }
}

const expectedAssociations = new Map([
  ["retro-modric-real-away-1617", ["Luka Modric", "Real Madrid"]],
  ["retro-messi-2006-away", ["Lionel Messi", "Argentina"]],
  ["retro-ronaldo-united-long-0708", ["Cristiano Ronaldo", "Manchester United"]],
  ["club-real-home-2526", ["", "Real Madrid"]],
  ["club-city-home-2526", ["", "Manchester City"]],
  ["world-usa-pulisic-home", ["Christian Pulisic", "USA"]],
  ["world-morocco-hakimi-away", ["Achraf Hakimi", "Morocco"]]
]);
for (const [id, [player, team]] of expectedAssociations) {
  const product = products.find(item => item.id === id);
  assert.ok(product, `association fixture exists: ${id}`);
  assert.equal(product.identity.player, player, `${id} player association`);
  assert.equal(product.identity.teamCountry, team, `${id} team association`);
}

const barcelonaProducts = entityProducts(products, "teams", "barcelona");
assert.ok(barcelonaProducts.length >= 2);
const barcelonaHtml = renderSeoCollectionPage(barcelonaProducts, "teams", {
  siteOrigin: "https://jerseysfrmjb.com"
});
assert.match(barcelonaHtml, /<title>Barcelona Jerseys \| JerseysFrmJB<\/title>/);
assert.match(barcelonaHtml, /<link rel="canonical" href="https:\/\/jerseysfrmjb\.com\/teams\/barcelona">/);
assert.match(barcelonaHtml, /<meta property="og:url" content="https:\/\/jerseysfrmjb\.com\/teams\/barcelona">/);
assert.match(barcelonaHtml, /\/players\/raphinha/);
assert.match(barcelonaHtml, /\/players\/lamine-yamal/);
assert.match(barcelonaHtml, /\/products\/club-barcelona-raphinha-home-2526/);
assert.match(barcelonaHtml, /width="1280" height="1280" loading="lazy"/);
assert.doesNotMatch(barcelonaHtml, /Are these Barcelona jerseys new|list the condition/);
const barcelonaSchemas = jsonLd(barcelonaHtml);
assert.equal(barcelonaSchemas[0]["@graph"][0]["@type"], "CollectionPage");
assert.equal(barcelonaSchemas[0]["@graph"][1]["@type"], "BreadcrumbList");
assert.equal(barcelonaSchemas[1]["@type"], "FAQPage");

const recommendations = relatedProducts(
  products.find(product => product.id === "club-barcelona-yamal-home-2526"),
  products,
  6
);
assert.ok(recommendations.length >= 1);
assert.ok(recommendations.length <= 6);
assert.ok(recommendations.every(product => product.available));
assert.equal(new Set(recommendations.map(product => product.id)).size, recommendations.length);
assert.equal(recommendations[0].identity.teamCountry, "Barcelona");

const env = {
  CATALOG_SITE_ORIGIN: "https://jerseysfrmjb.com",
  DB: database(rows)
};
for (const [handler, kind, slug, title] of [
  [getTeamPage, "teams", "real-madrid", "Real Madrid Jerseys"],
  [getPlayerPage, "players", "lamine-yamal", "Lamine Yamal Jerseys"],
  [getCompetitionPage, "competitions", "world-cup", "World Cup Jerseys"]
]) {
  const response = await handler({
    env,
    request: new Request(`https://jerseysfrmjb.com/${kind}/${slug}`),
    params: { slug }
  });
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^text\/html/);
  assert.match(await response.text(), new RegExp(title));
}

const missingTeam = await getTeamPage({
  env,
  request: new Request("https://jerseysfrmjb.com/teams/not-a-team"),
  params: { slug: "not-a-team" }
});
assert.equal(missingTeam.status, 404);
assert.match(await missingTeam.text(), /noindex,follow/);

const sitemapResponse = await getSitemap({
  env,
  request: new Request("https://jerseysfrmjb.com/sitemap.xml")
});
assert.equal(sitemapResponse.status, 200);
assert.match(sitemapResponse.headers.get("content-type"), /^application\/xml/);
assert.match(sitemapResponse.headers.get("cache-control"), /s-maxage=300/);
const sitemap = await sitemapResponse.text();
assert.match(sitemap, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/);
assert.match(sitemap, /<loc>https:\/\/jerseysfrmjb\.com\/teams\/barcelona<\/loc>/);
assert.match(sitemap, /<loc>https:\/\/jerseysfrmjb\.com\/players\/lionel-messi<\/loc>/);
assert.match(sitemap, /<loc>https:\/\/jerseysfrmjb\.com\/competitions\/world-cup<\/loc>/);
assert.match(sitemap, /<loc>https:\/\/jerseysfrmjb\.com\/products\/world-argentina-messi-home<\/loc>/);
assert.match(sitemap, /<loc>https:\/\/jerseysfrmjb\.com\/shop-all<\/loc>/);
assert.match(sitemap, /<loc>https:\/\/jerseysfrmjb\.com\/size-guide<\/loc>/);
assert.match(sitemap, /<image:image>/);
assert.match(sitemap, /<image:title>Lionel Messi Argentina 2026 Home soccer jersey front view<\/image:title>/);
assert.doesNotMatch(sitemap, /\.html<\/loc>/);
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(new Set(sitemapLocations).size, sitemapLocations.length, "sitemap has no duplicate URLs");

const robots = await readFile(path.join(workspace, "robots.txt"), "utf8");
assert.match(robots, /Sitemap: https:\/\/jerseysfrmjb\.com\/sitemap\.xml/);

for (const file of [
  "index.html",
  "shop-all.html",
  "worldcup-jerseys.html",
  "club-jerseys.html",
  "retro-jerseys.html",
  "size-guide.html",
  "privacy.html"
]) {
  const html = await readFile(path.join(workspace, file), "utf8");
  assert.doesNotMatch(html, /https:\/\/jerseysfrmjb\.com\/[^"]+\.html/);
  assert.doesNotMatch(html, /href="[^"]*\.html/);
}
const clubPage = await readFile(path.join(workspace, "club-jerseys.html"), "utf8");
assert.doesNotMatch(clubPage, /condition|Condition/);

const storefront = await readFile(path.join(workspace, "storefront.js"), "utf8");
assert.match(storefront, /SEARCH_ALIASES/);
assert.match(storefront, /editDistance/);
assert.match(storefront, /fuzzyTokenMatch/);
assert.match(storefront, /highlightCardTitle/);
assert.match(storefront, /searchScore/);
assert.match(storefront, /link\.replaceChildren/);
const highlightFunction = storefront.match(/function highlightCardTitle[\s\S]*?\n}/)?.[0] || "";
assert.doesNotMatch(highlightFunction, /\.innerHTML\s*=/);

console.log("SEO page and discovery tests passed:");
console.log(`- ${entities.teams.length} team/country pages, ${entities.players.length} player pages, ${entities.competitions.length} competition pages`);
console.log("- server-rendered canonical, social, collection, breadcrumb, FAQ, and image data validated");
console.log("- dynamic sitemap includes public pages, entity pages, products, and product images");
console.log("- related-product ranking excludes sold-out products and duplicates");
console.log("- enhanced alias, fuzzy, ranking, and highlighting search hooks are present");
