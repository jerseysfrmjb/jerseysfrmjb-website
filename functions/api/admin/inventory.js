import { ensureInventory } from "../_inventorySeed.js";
import { adminConfigError, isAuthorized, unauthorized } from "./_auth.js";

const FEATURED_LIMIT = 3;

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

async function getSettings(env) {
  const result = await env.DB.prepare("SELECT key, value FROM site_settings").all();
  return Object.fromEntries((result.results || []).map(row => [row.key, row.value]));
}

async function updateSettings(env, settings = {}) {
  if (Object.prototype.hasOwnProperty.call(settings, "hide_sold_out_featured")) {
    await env.DB.prepare(`
      INSERT INTO site_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).bind("hide_sold_out_featured", settings.hide_sold_out_featured ? "true" : "false").run();
  }
  return getSettings(env);
}

function normalizeFeaturedOrder(value) {
  const order = Math.floor(Number(value));
  return Number.isFinite(order) && order >= 1 && order <= FEATURED_LIMIT ? order : 0;
}

async function loadInventory(env) {
  const result = await env.DB.prepare("SELECT * FROM inventory ORDER BY CASE WHEN quantity > 0 THEN 0 ELSE 1 END, category, sort_order, name").all();
  return result.results.map(parseItem);
}

export async function onRequestGet({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);

  return Response.json({ items: await loadInventory(env), settings: await getSettings(env), featuredLimit: FEATURED_LIMIT });
}

export async function onRequestPatch({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);

  const body = await request.json().catch(() => ({}));

  if (body.settings) {
    return Response.json({ settings: await updateSettings(env, body.settings), items: await loadInventory(env), featuredLimit: FEATURED_LIMIT });
  }

  if (Array.isArray(body.featuredOrder)) {
    const ids = [...new Set(body.featuredOrder.map(id => String(id).trim()).filter(Boolean))];
    if (ids.length > FEATURED_LIMIT) {
      return Response.json({ error: `Only ${FEATURED_LIMIT} featured jerseys can be active.` }, { status: 400 });
    }

    await env.DB.prepare("UPDATE inventory SET featured = 0, featured_order = 0 WHERE featured = 1").run();
    for (const [index, id] of ids.entries()) {
      await env.DB.prepare("UPDATE inventory SET featured = 1, featured_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(index + 1, id)
        .run();
    }

    return Response.json({ settings: await getSettings(env), items: await loadInventory(env), featuredLimit: FEATURED_LIMIT });
  }

  const id = String(body.id || "").trim();
  if (!id) return Response.json({ error: "Missing jersey id" }, { status: 400 });

  const current = await env.DB.prepare("SELECT * FROM inventory WHERE id = ?").bind(id).first();
  if (!current) return Response.json({ error: "Jersey not found" }, { status: 404 });

  const wantsFeatured = typeof body.featured === "boolean" ? body.featured : Boolean(current.featured);
  let featuredOrder = normalizeFeaturedOrder(body.featured_order ?? current.featured_order);

  if (wantsFeatured && !featuredOrder) {
    const rows = await env.DB.prepare("SELECT featured_order FROM inventory WHERE featured = 1 AND id != ? ORDER BY featured_order").bind(id).all();
    const used = new Set((rows.results || []).map(row => Number(row.featured_order)).filter(order => order >= 1 && order <= FEATURED_LIMIT));
    featuredOrder = [1, 2, 3].find(order => !used.has(order)) || 1;
  }

  if (wantsFeatured && (featuredOrder < 1 || featuredOrder > FEATURED_LIMIT)) {
    return Response.json({ error: `Featured position must be 1-${FEATURED_LIMIT}` }, { status: 400 });
  }

  if (wantsFeatured) {
    await env.DB.prepare("UPDATE inventory SET featured = 0, featured_order = 0 WHERE featured_order = ? AND id != ?").bind(featuredOrder, id).run();
  }

  const next = {
    name: typeof body.name === "string" ? body.name.trim() : current.name,
    size: typeof body.size === "string" ? body.size.trim() : current.size,
    price: Number.isFinite(Number(body.price)) ? Number(body.price) : current.price,
    quantity: Number.isFinite(Number(body.quantity)) ? Math.max(0, Math.floor(Number(body.quantity))) : current.quantity,
    featured: wantsFeatured ? 1 : 0,
    featured_order: wantsFeatured ? featuredOrder : 0,
    links: body.links ? JSON.stringify(body.links) : current.links
  };

  await env.DB.prepare(`
    UPDATE inventory
    SET name = ?, size = ?, price = ?, quantity = ?, featured = ?, featured_order = ?, links = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(next.name, next.size, next.price, next.quantity, next.featured, next.featured_order, next.links, id).run();

  const updated = await env.DB.prepare("SELECT * FROM inventory WHERE id = ?").bind(id).first();
  return Response.json({ item: parseItem(updated), items: await loadInventory(env), settings: await getSettings(env), featuredLimit: FEATURED_LIMIT });
}
