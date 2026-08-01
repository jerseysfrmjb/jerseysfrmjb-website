import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pinterestTools from "../pinterest-content.js";
import {
  containsExactStockCount,
  pinterestDedupeKey
} from "../functions/api/admin/pinterest/_queue.js";

const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = async (...parts) => readFile(path.join(workspace, ...parts), "utf8");

const club = {
  id: "club-barcelona-yamal-home-2526",
  name: "Lamine Yamal #10 | Barcelona 26/27 Home Kit",
  category: "club",
  sizes: { S: 0, M: 2, L: 1 },
  quantity: 3,
  photos: [
    { src: "/assets/inventory/yamal-front.jpg", alt: "Yamal Barcelona jersey front" },
    { src: "/assets/inventory/yamal-back.jpg", alt: "Yamal Barcelona jersey back" }
  ]
};
const retro = {
  id: "retro-united-ronaldo-away-0708",
  name: "Cristiano Ronaldo #7 | 2007/08 Manchester United Away Short Sleeve",
  category: "retro",
  sizes: { L: 1 },
  quantity: 1,
  photos: [{ src: "/assets/inventory/ronaldo-retro-front.jpg" }]
};
const international = {
  id: "world-portugal-ronaldo-away-2425",
  name: "Cristiano Ronaldo #7 | Portugal 24/25 Away Kit",
  category: "world",
  sizes: { M: 1, XL: 1 },
  quantity: 2,
  photos: [{ src: "/assets/inventory/portugal-away-front.jpg" }]
};
const worldCup = {
  id: "world-argentina-messi-home-2026",
  name: "Lionel Messi #10 | Argentina 2026 World Cup Home",
  category: "world",
  sizes: { S: 1, M: 1 },
  quantity: 2,
  photos: [{ src: "/assets/inventory/messi-world-cup-front.jpg" }]
};

for (const product of [club, retro, international, worldCup]) {
  const variants = Array.from({ length: 4 }, (_, variation) => pinterestTools.generatePinContent(product, variation));
  assert.equal(new Set(variants.map(item => item.description)).size, 4, `${product.id} has four description variations`);
  assert.ok(variants.every(item => item.link === `https://jerseysfrmjb.com/products/${product.id}`));
  assert.ok(variants.every(item => !containsExactStockCount(item.description)), "descriptions never expose exact stock counts");
  assert.ok(variants.every(item => !/checkout|buy\s+now|add\s+to\s+cart/i.test(item.description)), "descriptions do not claim site checkout");
  assert.ok(variants.every(item => /JerseysFrmJB/i.test(item.description)));
  assert.ok(variants.every(item => /available sizes|current available sizes/i.test(item.description)));
  assert.equal(new Set(variants.flatMap(item => item.description.match(/#[A-Za-z0-9]+/g) || [])).size, 0, "descriptions avoid hashtag stuffing");
}

assert.match(pinterestTools.pinTitle(club), /Lamine Yamal Barcelona 26\/27 Home \| Soccer Jersey/);
assert.match(pinterestTools.pinTitle(retro), /Cristiano Ronaldo Manchester United 2007\/08 Away Short Sleeve \| Retro Football Jersey/);
assert.match(pinterestTools.pinTitle(international), /Cristiano Ronaldo Portugal 24\/25 Away/);
assert.match(pinterestTools.pinTitle(worldCup), /Lionel Messi Argentina 2026 Home \| World Cup Soccer Jersey/);

assert.deepEqual(pinterestTools.availableSizes(club), ["Medium", "Large"]);
assert.ok(!pinterestTools.pinDescription(club).includes("Small"), "zero-stock sizes are excluded");
assert.ok(pinterestTools.suggestedBoardNames(club).includes("Barcelona Jerseys"));
assert.ok(pinterestTools.suggestedBoardNames(club).includes("La Liga Jerseys"));
assert.ok(pinterestTools.suggestedBoardNames(retro).includes("Retro Jerseys"));
assert.ok(pinterestTools.suggestedBoardNames(international).includes("International Team Jerseys"));
assert.ok(pinterestTools.suggestedBoardNames(worldCup).includes("World Cup 2026 Jerseys"));

const imageUrl = "https://jerseysfrmjb.com/assets/inventory/yamal-front.jpg";
const firstKey = await pinterestDedupeKey(club.id, imageUrl, "barcelona-board");
assert.equal(firstKey, await pinterestDedupeKey(club.id, imageUrl, "barcelona-board"));
assert.notEqual(firstKey, await pinterestDedupeKey(club.id, imageUrl, "la-liga-board"));

const queueSource = await source("functions", "api", "admin", "pinterest", "_queue.js");
const publishSource = await source("functions", "api", "admin", "pinterest", "publish.js");
const statusSource = await source("functions", "api", "admin", "pinterest", "status.js");
const boardsSource = await source("functions", "api", "admin", "pinterest", "boards.js");
const migration = await source("migrations", "0013_pinterest_pin_queue.sql");

assert.match(queueSource, /SELECT id, category, name, size, sizes_json, quantity, photos\s+FROM inventory/);
assert.match(queueSource, /url\.origin === origin/);
assert.doesNotMatch(queueSource, /customer_photos|homepage_photos/i, "queue never reads customer-photo storage");
assert.match(migration, /UNIQUE INDEX[\s\S]*dedupe_key[\s\S]*WHERE allow_duplicate = 0/i);
assert.match(publishSource, /if \(!mode\.can_publish\)/);
assert.match(publishSource, /Pinterest did not return a Pin ID/);
assert.match(statusSource, /Production publishing is locked/);
for (const board of [
  "New Arrivals",
  "Barcelona Jerseys",
  "Real Madrid Jerseys",
  "Premier League Jerseys",
  "La Liga Jerseys",
  "Retro Jerseys",
  "International Team Jerseys",
  "World Cup 2026 Jerseys"
]) {
  assert.ok(boardsSource.includes(board), `Trial board support includes ${board}`);
}

console.log("Pinterest publisher tests passed:");
console.log("- club, retro, international, and World Cup content has natural rotating copy");
console.log("- exact permanent product URLs, available-size privacy, and customer-photo exclusion hold");
console.log("- board recommendations, Trial/Standard guardrails, Pin-ID confirmation, and duplicate keys hold");
