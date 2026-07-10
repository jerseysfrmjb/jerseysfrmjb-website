import { ensureInventory } from "../_inventorySeed.js";
import { isAuthorized, unauthorized } from "./_auth.js";

function parseItem(row) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    size: row.size,
    price: row.price,
    quantity: row.quantity,
    featured: Boolean(row.featured),
    sort_order: row.sort_order,
    photos: JSON.parse(row.photos || "[]"),
    links: JSON.parse(row.links || "{}"),
    updated_at: row.updated_at
  };
}

export async function onRequestGet({ request, env }) {
  if (!(await isAuthorized(request, env))) return unauthorized();
  if (!env.DB) return Response.json({ error: "D1 binding missing" }, { status: 503 });
  await ensureInventory(env);

  const result = await env.DB.prepare("SELECT * FROM inventory ORDER BY CASE WHEN quantity > 0 THEN 0 ELSE 1 END, category, sort_order, name").all();
  return Response.json({ items: result.results.map(parseItem) });
}

export async function onRequestPatch({ request, env }) {
  if (!(await isAuthorized(request, env))) return unauthorized();
  if (!env.DB) return Response.json({ error: "D1 binding missing" }, { status: 503 });
  await ensureInventory(env);

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  if (!id) return Response.json({ error: "Missing jersey id" }, { status: 400 });

  const current = await env.DB.prepare("SELECT * FROM inventory WHERE id = ?").bind(id).first();
  if (!current) return Response.json({ error: "Jersey not found" }, { status: 404 });

  const next = {
    name: typeof body.name === "string" ? body.name.trim() : current.name,
    size: typeof body.size === "string" ? body.size.trim() : current.size,
    price: Number.isFinite(Number(body.price)) ? Number(body.price) : current.price,
    quantity: Number.isFinite(Number(body.quantity)) ? Math.max(0, Math.floor(Number(body.quantity))) : current.quantity,
    featured: typeof body.featured === "boolean" ? (body.featured ? 1 : 0) : current.featured,
    links: body.links ? JSON.stringify(body.links) : current.links
  };

  await env.DB.prepare(`
    UPDATE inventory
    SET name = ?, size = ?, price = ?, quantity = ?, featured = ?, links = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(next.name, next.size, next.price, next.quantity, next.featured, next.links, id).run();

  const updated = await env.DB.prepare("SELECT * FROM inventory WHERE id = ?").bind(id).first();
  return Response.json({ item: parseItem(updated) });
}

