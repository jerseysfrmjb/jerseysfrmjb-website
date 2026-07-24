import { ensureInventory } from "./_inventorySeed.js";


function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });
}
const SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const SIZE_WORDS = [
  ["4XL", /4\s*x\s*l/i],
  ["3XL", /3\s*x\s*l/i],
  ["2XL", /2\s*x\s*l|xxl/i],
  ["XL", /\bxl\b|extra\s+large/i],
  ["L", /\bl\b|\blarge\b/i],
  ["M", /\bm\b|\bmedium\b/i],
  ["S", /\bs\b|\bsmall\b/i]
];

function parseJson(value, fallback) {
  try { return JSON.parse(value || ""); } catch (error) { return fallback; }
}

function normalizeSizes(raw = {}, fallbackSize = "", fallbackQuantity = 0) {
  const sizes = {};
  for (const size of SIZE_ORDER) {
    const qty = Math.max(0, Math.floor(Number(raw?.[size] || 0)));
    if (qty > 0) sizes[size] = qty;
  }
  if (!Object.keys(sizes).length && Number(fallbackQuantity) > 0) {
    const matches = SIZE_WORDS.filter(([, pattern]) => pattern.test(String(fallbackSize))).map(([size]) => size);
    if (matches.length) {
      const base = Math.max(1, Math.floor(Number(fallbackQuantity) / matches.length));
      for (const size of matches) sizes[size] = base;
    }
  }
  return sizes;
}

function sizesLabel(sizes, fallbackSize = "") {
  const active = SIZE_ORDER.filter(size => Number(sizes[size]) > 0);
  return active.length ? active.join(", ") : fallbackSize;
}

function totalQuantity(sizes, fallbackQuantity = 0) {
  const total = SIZE_ORDER.reduce((sum, size) => sum + Math.max(0, Math.floor(Number(sizes[size] || 0))), 0);
  return total || Math.max(0, Math.floor(Number(fallbackQuantity || 0)));
}

function parseItem(row) {
  const sizes = normalizeSizes(parseJson(row.sizes_json, {}), row.size, row.quantity);
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    size: sizesLabel(sizes, row.size),
    sizes,
    price: row.website_price ?? row.price,
    quantity: totalQuantity(sizes, row.quantity),
    featured: Boolean(row.featured),
    featured_order: row.featured_order || 0,
    sort_order: row.sort_order,
    photos: parseJson(row.photos, []),
    links: parseJson(row.links, {}),
    new_arrival: Boolean(row.new_arrival),
    date_added: row.date_added || "",
    updated_at: row.updated_at
  };
}

async function getSetting(env, key, fallback = "") {
  const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = ?").bind(key).first();
  return row?.value ?? fallback;
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return json({ error: "D1 binding missing" }, 503);
  }

  await ensureInventory(env);

  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const featured = url.searchParams.get("featured");
  const params = [];
  const where = [];
  let order = "ORDER BY CASE WHEN inventory.quantity > 0 THEN 0 ELSE 1 END, inventory.sort_order, inventory.name";

  if (category) {
    where.push("inventory.category = ?");
    params.push(category);
  }

  if (featured === "true") {
    where.push("inventory.featured = 1");
    const hideSoldOut = (await getSetting(env, "hide_sold_out_featured", "false")) === "true";
    if (hideSoldOut) where.push("inventory.quantity > 0");
    order = "ORDER BY CASE WHEN inventory.featured_order BETWEEN 1 AND 3 THEN inventory.featured_order ELSE 999 END, inventory.sort_order, inventory.name";
  }

  const sql = `
    SELECT inventory.*, website_prices.price AS website_price
    FROM inventory
    LEFT JOIN product_platform_prices AS website_prices
      ON website_prices.product_id = inventory.id
      AND website_prices.platform = 'Website'
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ${order}
  `;
  const result = await env.DB.prepare(sql).bind(...params).all();
  const settingsResult = await env.DB.prepare("SELECT key, value FROM site_settings").all();
  const settings = Object.fromEntries((settingsResult.results || []).map(row => [row.key, row.value]));
  return json({ items: result.results.map(parseItem), settings, updated_at: settings.inventory_updated_at || "" });
}




