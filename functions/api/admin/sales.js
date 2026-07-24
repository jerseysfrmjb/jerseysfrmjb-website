import { ensureInventory } from "../_inventorySeed.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

const SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const PLATFORMS = new Set(["Depop", "eBay", "Facebook", "Website", "Local", "Other"]);
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
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

async function parseBody(request) {
  if (!request.headers.get("Content-Type")?.includes("application/json")) return {};
  return request.json().catch(() => ({}));
}

function normalizeSize(value = "") {
  const raw = String(value || "").trim();
  const compact = raw.toUpperCase().replace(/\s+/g, "");
  if (SIZE_ORDER.includes(compact)) return compact;
  const match = SIZE_WORDS.find(([, pattern]) => pattern.test(raw));
  return match ? match[0] : "";
}

function normalizeSizes(raw = {}, fallbackSize = "", fallbackQuantity = 0) {
  const sizes = {};
  for (const size of SIZE_ORDER) {
    const qty = Math.max(0, Math.floor(Number(raw?.[size] || 0)));
    if (qty > 0) sizes[size] = qty;
  }
  if (!Object.keys(sizes).length && Number(fallbackQuantity) > 0) {
    const fallback = normalizeSize(fallbackSize);
    if (fallback) sizes[fallback] = Math.max(0, Math.floor(Number(fallbackQuantity)));
  }
  return sizes;
}

function sizesLabel(sizes, fallbackSize = "") {
  const active = SIZE_ORDER.filter(size => Number(sizes[size]) > 0);
  return active.length ? active.join(", ") : fallbackSize;
}

function totalQuantity(sizes) {
  return SIZE_ORDER.reduce((sum, size) => sum + Math.max(0, Math.floor(Number(sizes[size] || 0))), 0);
}

function normalizePlatform(value = "Other") {
  const platform = String(value || "Other").trim();
  return PLATFORMS.has(platform) ? platform : "Other";
}

function positiveInt(value, fallback = 1) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function optionalPrice(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

async function requireAdmin(request, env) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);
  return null;
}

async function setInventoryUpdated(env) {
  await env.DB.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('inventory_updated_at', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).bind(new Date().toISOString()).run();
}

async function loadProduct(env, productId) {
  if (!productId) return null;
  return env.DB.prepare("SELECT * FROM inventory WHERE id = ?").bind(String(productId)).first();
}

async function adjustInventory(env, product, size, change) {
  if (!product) throw new Error("Product not found");
  const normalizedSize = normalizeSize(size);
  if (!normalizedSize) throw new Error("Size is required");

  const sizes = normalizeSizes(parseJson(product.sizes_json, {}), product.size, product.quantity);
  const current = Math.max(0, Math.floor(Number(sizes[normalizedSize] || 0)));
  const next = Math.max(0, current + change);
  if (next > 0) sizes[normalizedSize] = next;
  else delete sizes[normalizedSize];

  await env.DB.prepare(`
    UPDATE inventory
    SET size = ?, sizes_json = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(sizesLabel(sizes, product.size), JSON.stringify(sizes), totalQuantity(sizes), product.id).run();

  await setInventoryUpdated(env);
}

async function listSales(request, env) {
  const url = new URL(request.url);
  const limit = Math.min(200, Math.max(1, Math.floor(Number(url.searchParams.get("limit") || 100))));
  const offset = Math.max(0, Math.floor(Number(url.searchParams.get("offset") || 0)));
  const search = String(url.searchParams.get("search") || "").trim();
  const platform = String(url.searchParams.get("platform") || "").trim();
  const size = normalizeSize(url.searchParams.get("size") || "");
  const productId = String(url.searchParams.get("product_id") || "").trim();
  const dateFrom = String(url.searchParams.get("date_from") || "").trim();
  const dateTo = String(url.searchParams.get("date_to") || "").trim();
  const includeUndone = url.searchParams.get("include_undone") === "true";

  const where = [];
  const bindings = [];

  if (!includeUndone) where.push("undone_at IS NULL");
  if (search) {
    where.push("(product_name LIKE ? OR player LIKE ? OR team_country LIKE ? OR notes LIKE ?)");
    const like = `%${search}%`;
    bindings.push(like, like, like, like);
  }
  if (platform) {
    where.push("platform = ?");
    bindings.push(normalizePlatform(platform));
  }
  if (size) {
    where.push("size = ?");
    bindings.push(size);
  }
  if (productId) {
    where.push("product_id = ?");
    bindings.push(productId);
  }
  if (dateFrom) {
    where.push("created_at >= ?");
    bindings.push(dateFrom);
  }
  if (dateTo) {
    where.push("created_at <= ?");
    bindings.push(dateTo);
  }

  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const rows = await env.DB.prepare(`
    SELECT *
    FROM sales
    ${clause}
    ORDER BY created_at DESC, id DESC
    LIMIT ? OFFSET ?
  `).bind(...bindings, limit, offset).all();

  const count = await env.DB.prepare(`SELECT COUNT(*) AS total FROM sales ${clause}`).bind(...bindings).first();
  return json({ sales: rows.results || [], total: count?.total || 0, limit, offset });
}

async function createSale(request, env) {
  const body = await parseBody(request);
  const productId = String(body.product_id || body.productId || "").trim();
  const product = await loadProduct(env, productId);
  const productName = String(body.product_name || body.productName || product?.name || "").trim();
  const size = normalizeSize(body.size);
  const quantity = positiveInt(body.quantity, 1);

  if (!productName) return json({ error: "Product name is required." }, 400);
  if (!size) return json({ error: "Size is required." }, 400);

  if (body.adjust_inventory || body.adjustInventory) {
    if (!product) return json({ error: "Product ID is required to adjust inventory." }, 400);
    await adjustInventory(env, product, size, -quantity);
  }

  await env.DB.prepare(`
    INSERT INTO sales (
      product_id,
      product_name,
      player,
      team_country,
      size,
      quantity,
      sale_price,
      platform,
      notes,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
  `).bind(
    productId || null,
    productName,
    String(body.player || "").trim(),
    String(body.team_country || body.teamCountry || "").trim(),
    size,
    quantity,
    optionalPrice(body.sale_price ?? body.salePrice),
    normalizePlatform(body.platform),
    String(body.notes || "").trim(),
    body.timestamp || body.created_at || body.createdAt || null
  ).run();

  const sale = await env.DB.prepare("SELECT * FROM sales ORDER BY id DESC LIMIT 1").first();
  return json({ sale }, 201);
}

async function updateSale(request, env) {
  const url = new URL(request.url);
  const body = await parseBody(request);
  const id = Number(url.searchParams.get("id") || body.id);

  if (!Number.isFinite(id) || id <= 0) return json({ error: "Sale ID is required." }, 400);

  const sale = await env.DB.prepare("SELECT * FROM sales WHERE id = ?").bind(id).first();
  if (!sale) return json({ error: "Sale not found." }, 404);

  const quantity = positiveInt(body.quantity ?? sale.quantity, positiveInt(sale.quantity, 1));
  const platform = normalizePlatform(body.platform ?? sale.platform);
  const salePrice = optionalPrice(body.sale_price ?? body.salePrice ?? sale.sale_price);
  const notes = String(body.notes ?? sale.notes ?? "").trim();
  const createdAt = String(body.created_at || body.createdAt || body.timestamp || sale.created_at || "").trim();

  await env.DB.prepare(`
    UPDATE sales
    SET quantity = ?,
        platform = ?,
        sale_price = ?,
        notes = ?,
        created_at = ?
    WHERE id = ?
  `).bind(quantity, platform, salePrice, notes, createdAt || sale.created_at, id).run();

  const updated = await env.DB.prepare("SELECT * FROM sales WHERE id = ?").bind(id).first();
  return json({ sale: updated });
}

async function deleteSale(request, env) {
  const url = new URL(request.url);
  const body = await parseBody(request);
  const id = Number(url.searchParams.get("id") || body.id);
  const restoreInventory = url.searchParams.get("restore_inventory") === "true" || body.restore_inventory || body.restoreInventory;
  const undoOnly = url.searchParams.get("undo") === "true" || body.undo;

  if (!Number.isFinite(id) || id <= 0) return json({ error: "Sale ID is required." }, 400);

  const sale = await env.DB.prepare("SELECT * FROM sales WHERE id = ?").bind(id).first();
  if (!sale) return json({ error: "Sale not found." }, 404);

  if (restoreInventory && sale.product_id) {
    const product = await loadProduct(env, sale.product_id);
    await adjustInventory(env, product, sale.size, positiveInt(sale.quantity, 1));
  }

  if (restoreInventory || undoOnly) {
    await env.DB.prepare(`
      UPDATE sales
      SET undone_at = COALESCE(undone_at, CURRENT_TIMESTAMP), inventory_restored = ?
      WHERE id = ?
    `).bind(restoreInventory ? 1 : Number(sale.inventory_restored || 0), id).run();
  } else {
    await env.DB.prepare("DELETE FROM sales WHERE id = ?").bind(id).run();
  }

  return json({ success: true, sale_id: id, inventory_restored: Boolean(restoreInventory), undone: Boolean(restoreInventory || undoOnly) });
}

export async function onRequestGet({ request, env }) {
  try {
    const auth = await requireAdmin(request, env);
    if (auth) return auth;
    return listSales(request, env);
  } catch (error) {
    return json({ error: `Sales server error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const auth = await requireAdmin(request, env);
    if (auth) return auth;
    return createSale(request, env);
  } catch (error) {
    return json({ error: `Sales save error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPut({ request, env }) {
  try {
    const auth = await requireAdmin(request, env);
    if (auth) return auth;
    return updateSale(request, env);
  } catch (error) {
    return json({ error: `Sales update error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPatch({ request, env }) {
  try {
    const auth = await requireAdmin(request, env);
    if (auth) return auth;
    return updateSale(request, env);
  } catch (error) {
    return json({ error: `Sales update error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestDelete({ request, env }) {
  try {
    const auth = await requireAdmin(request, env);
    if (auth) return auth;
    return deleteSale(request, env);
  } catch (error) {
    return json({ error: `Sales delete error: ${error?.message || "Unknown error"}` }, 500);
  }
}
