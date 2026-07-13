import { ensureInventory } from "../_inventorySeed.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

const FEATURED_LIMIT = 3;
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
    price: row.price,
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

async function getSettings(env) {
  const result = await env.DB.prepare("SELECT key, value FROM site_settings").all();
  return Object.fromEntries((result.results || []).map(row => [row.key, row.value]));
}

async function setSetting(env, key, value) {
  await env.DB.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).bind(key, String(value)).run();
}

async function updateSettings(env, settings = {}) {
  if (Object.prototype.hasOwnProperty.call(settings, "hide_sold_out_featured")) {
    await setSetting(env, "hide_sold_out_featured", settings.hide_sold_out_featured ? "true" : "false");
  }
  if (Object.prototype.hasOwnProperty.call(settings, "homepage_banner_message")) {
    await setSetting(env, "homepage_banner_message", String(settings.homepage_banner_message || "").trim());
  }
  if (Object.prototype.hasOwnProperty.call(settings, "inventory_updated_at")) {
    await setSetting(env, "inventory_updated_at", settings.inventory_updated_at || new Date().toISOString());
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

async function handleGet({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);

  return json({ items: await loadInventory(env), settings: await getSettings(env), featuredLimit: FEATURED_LIMIT, sizeOptions: SIZE_ORDER });
}

async function handlePatch({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);

  const body = await request.json().catch(() => ({}));

  if (body.settings) {
    return json({ settings: await updateSettings(env, body.settings), items: await loadInventory(env), featuredLimit: FEATURED_LIMIT, sizeOptions: SIZE_ORDER });
  }

  if (Array.isArray(body.featuredOrder)) {
    const ids = [...new Set(body.featuredOrder.map(id => String(id).trim()).filter(Boolean))];
    if (ids.length > FEATURED_LIMIT) {
      return json({ error: `Only ${FEATURED_LIMIT} featured jerseys can be active.` }, 400);
    }

    await env.DB.prepare("UPDATE inventory SET featured = 0, featured_order = 0 WHERE featured = 1").run();
    for (const [index, id] of ids.entries()) {
      await env.DB.prepare("UPDATE inventory SET featured = 1, featured_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(index + 1, id)
        .run();
    }

    return json({ settings: await getSettings(env), items: await loadInventory(env), featuredLimit: FEATURED_LIMIT, sizeOptions: SIZE_ORDER });
  }

  const id = String(body.id || "").trim();
  if (!id) return json({ error: "Missing jersey id" }, 400);

  const current = await env.DB.prepare("SELECT * FROM inventory WHERE id = ?").bind(id).first();
  if (!current) return json({ error: "Jersey not found" }, 404);

  const wantsFeatured = typeof body.featured === "boolean" ? body.featured : Boolean(current.featured);
  let featuredOrder = normalizeFeaturedOrder(body.featured_order ?? current.featured_order);

  if (wantsFeatured && !featuredOrder) {
    const rows = await env.DB.prepare("SELECT featured_order FROM inventory WHERE featured = 1 AND id != ? ORDER BY featured_order").bind(id).all();
    const used = new Set((rows.results || []).map(row => Number(row.featured_order)).filter(order => order >= 1 && order <= FEATURED_LIMIT));
    featuredOrder = [1, 2, 3].find(order => !used.has(order)) || 1;
  }

  if (wantsFeatured && (featuredOrder < 1 || featuredOrder > FEATURED_LIMIT)) {
    return json({ error: `Featured position must be 1-${FEATURED_LIMIT}` }, 400);
  }

  if (wantsFeatured) {
    await env.DB.prepare("UPDATE inventory SET featured = 0, featured_order = 0 WHERE featured_order = ? AND id != ?").bind(featuredOrder, id).run();
  }

  const nextSizes = body.sizes ? normalizeSizes(body.sizes) : normalizeSizes(parseJson(current.sizes_json, {}), current.size, current.quantity);
  const nextQuantity = totalQuantity(nextSizes, Number(body.quantity));
  const nextSizeLabel = sizesLabel(nextSizes, current.size);

  const next = {
    name: typeof body.name === "string" ? body.name.trim() : current.name,
    size: nextSizeLabel,
    sizes_json: JSON.stringify(nextSizes),
    price: Number.isFinite(Number(body.price)) ? Number(body.price) : current.price,
    quantity: nextQuantity,
    featured: wantsFeatured ? 1 : 0,
    featured_order: wantsFeatured ? featuredOrder : 0,
    new_arrival: typeof body.new_arrival === "boolean" ? (body.new_arrival ? 1 : 0) : Number(current.new_arrival || 0),
    date_added: typeof body.date_added === "string" ? body.date_added.trim() : (current.date_added || ""),
    links: body.links ? JSON.stringify(body.links) : current.links
  };

  await env.DB.prepare(`
    UPDATE inventory
    SET name = ?, size = ?, sizes_json = ?, price = ?, quantity = ?, featured = ?, featured_order = ?, new_arrival = ?, date_added = ?, links = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(next.name, next.size, next.sizes_json, next.price, next.quantity, next.featured, next.featured_order, next.new_arrival, next.date_added, next.links, id).run();

  await setSetting(env, "inventory_updated_at", new Date().toISOString());

  const updated = await env.DB.prepare("SELECT * FROM inventory WHERE id = ?").bind(id).first();
  return json({ item: parseItem(updated), items: await loadInventory(env), settings: await getSettings(env), featuredLimit: FEATURED_LIMIT, sizeOptions: SIZE_ORDER });
}
export async function onRequestGet(context) {
  try {
    return await handleGet(context);
  } catch (error) {
    return json({ error: `Inventory server error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPatch(context) {
  try {
    return await handlePatch(context);
  } catch (error) {
    return json({ error: `Inventory save error: ${error?.message || "Unknown error"}` }, 500);
  }
}
