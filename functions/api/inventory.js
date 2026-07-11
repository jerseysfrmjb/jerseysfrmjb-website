import { ensureInventory } from "./_inventorySeed.js";

function parseItem(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    size: row.size,
    price: row.price,
    quantity: row.quantity,
    featured: Boolean(row.featured),
    featured_order: row.featured_order || 0,
    sort_order: row.sort_order,
    photos: JSON.parse(row.photos || "[]"),
    links: JSON.parse(row.links || "{}"),
    updated_at: row.updated_at
  };
}

async function getSetting(env, key, fallback = "") {
  const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = ?").bind(key).first();
  return row?.value ?? fallback;
}

export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return Response.json({ error: "D1 binding missing" }, { status: 503 });
  }

  await ensureInventory(env);

  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const featured = url.searchParams.get("featured");
  const params = [];
  const where = [];
  let order = "ORDER BY CASE WHEN quantity > 0 THEN 0 ELSE 1 END, sort_order, name";

  if (category) {
    where.push("category = ?");
    params.push(category);
  }

  if (featured === "true") {
    where.push("featured = 1");
    const hideSoldOut = (await getSetting(env, "hide_sold_out_featured", "false")) === "true";
    if (hideSoldOut) where.push("quantity > 0");
    order = "ORDER BY CASE WHEN featured_order BETWEEN 1 AND 3 THEN featured_order ELSE 999 END, sort_order, name";
  }

  const sql = `SELECT * FROM inventory ${where.length ? "WHERE " + where.join(" AND ") : ""} ${order}`;
  const result = await env.DB.prepare(sql).bind(...params).all();
  return Response.json({ items: result.results.map(parseItem) });
}
