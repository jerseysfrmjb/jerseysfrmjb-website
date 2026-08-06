import { ensureInventory } from "../_inventorySeed.js";
import { ensureAnalyticsSchema } from "../_analyticsSchema.js";
import { inferProductIdentity } from "../catalog/_products.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

const JERSEY_TYPES = ["fan", "retro_short", "retro_long"];
const CUSTOMIZATIONS = ["base", "nameset_patches"];
const PRICE_PLATFORMS = ["Website", "eBay", "Depop", "Facebook"];
const SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

const PLANNER_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS inventory_suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS supplier_price_rules (
    supplier_id TEXT NOT NULL,
    jersey_type TEXT NOT NULL CHECK (jersey_type IN ('fan', 'retro_short', 'retro_long')),
    customization TEXT NOT NULL CHECK (customization IN ('base', 'nameset_patches')),
    cost REAL CHECK (cost IS NULL OR cost >= 0),
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (supplier_id, jersey_type, customization),
    FOREIGN KEY (supplier_id) REFERENCES inventory_suppliers(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS inventory_planner_overrides (
    product_id TEXT PRIMARY KEY,
    jersey_type TEXT NOT NULL CHECK (jersey_type IN ('fan', 'retro_short', 'retro_long')),
    customization TEXT NOT NULL CHECK (customization IN ('base', 'nameset_patches')),
    preferred_supplier_id TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES inventory(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT,
    product_name TEXT NOT NULL,
    player TEXT DEFAULT '',
    team_country TEXT DEFAULT '',
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    sale_price REAL,
    platform TEXT NOT NULL DEFAULT 'Other',
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    undone_at TEXT,
    inventory_restored INTEGER NOT NULL DEFAULT 0
  )`
];

const DEFAULT_SUPPLIERS = [
  { id: "kevin", name: "Kevin", enabled: 1, sort_order: 10 },
  { id: "supplier-2", name: "Supplier 2", enabled: 0, sort_order: 20 },
  { id: "supplier-3", name: "Supplier 3", enabled: 0, sort_order: 30 }
];

const KEVIN_COSTS = {
  "fan:base": 12,
  "fan:nameset_patches": 15,
  "retro_short:base": 15,
  "retro_short:nameset_patches": 18,
  "retro_long:base": 17,
  "retro_long:nameset_patches": 20
};

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function round(value, places = 1) {
  const factor = 10 ** places;
  return Math.round(number(value) * factor) / factor;
}

function safeJson(value, fallback) {
  try {
    const parsed = JSON.parse(value || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function daysSince(value, now = Date.now()) {
  if (!value) return null;
  let normalized = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) normalized = `${normalized}T00:00:00`;
  else normalized = normalized.replace(" ", "T");
  if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(normalized)) normalized += "Z";
  const timestamp = new Date(normalized).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((now - timestamp) / 86400000));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function availableSizes(row) {
  const stock = safeJson(row.sizes_json, {});
  const sizes = SIZE_ORDER.filter(size => number(stock[size]) > 0);
  if (sizes.length) return sizes;
  if (number(row.quantity) <= 0) return [];
  return String(row.size || "")
    .split(/[,/&]+/)
    .map(value => value.trim())
    .filter(Boolean);
}

function inferredClassification(row) {
  const name = normalizeText(row.name);
  if (row.category === "retro") {
    return {
      jersey_type: /\blong\s*sleeve\b|\blongsleeve\b/.test(name) ? "retro_long" : "retro_short",
      customization: "nameset_patches"
    };
  }
  return {
    jersey_type: "fan",
    customization: /\bblank\b|\bno nameset\b/.test(name) ? "base" : "nameset_patches"
  };
}

function normalizedSignal(value, maximum) {
  if (number(maximum) <= 0 || number(value) <= 0) return 0;
  return Math.log1p(number(value)) / Math.log1p(number(maximum));
}

export function calculateDemandScore(metrics = {}, maxima = {}) {
  const scarcity = number(metrics.inventory) <= 0 ? 1 : number(metrics.inventory) === 1 ? 0.8 : number(metrics.inventory) <= 2 ? 0.45 : 0;
  const score =
    normalizedSignal(metrics.views, maxima.views) * 25 +
    normalizedSignal(metrics.clicks, maxima.clicks) * 20 +
    normalizedSignal(metrics.sales, maxima.sales) * 30 +
    normalizedSignal(metrics.searches, maxima.searches) * 10 +
    normalizedSignal(metrics.requests, maxima.requests) * 10 +
    scarcity * 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function recommendedOrderQuantity(product = {}) {
  const score = number(product.demand_score);
  const stock = number(product.inventory_remaining);
  let target = score >= 85 ? 6 : score >= 70 ? 5 : score >= 55 ? 4 : score >= 40 ? 3 : score >= 25 ? 2 : 0;
  if (number(product.sales_30d) >= 4) target += 2;
  else if (number(product.sales_30d) >= 2) target += 1;
  if (stock === 0 && (score >= 20 || number(product.total_sales) > 0)) target = Math.max(target, 2);
  return Math.max(0, Math.min(10, target - stock));
}

async function ensurePlannerSchema(env) {
  await ensureInventory(env);
  await ensureAnalyticsSchema(env);
  for (const statement of PLANNER_SCHEMA) await env.DB.prepare(statement).run();
  await env.DB.batch(DEFAULT_SUPPLIERS.map(supplier => env.DB.prepare(`
    INSERT OR IGNORE INTO inventory_suppliers (id, name, enabled, sort_order)
    VALUES (?, ?, ?, ?)
  `).bind(supplier.id, supplier.name, supplier.enabled, supplier.sort_order)));
  await env.DB.batch(Object.entries(KEVIN_COSTS).map(([key, cost]) => {
    const [jerseyType, customization] = key.split(":");
    return env.DB.prepare(`
      INSERT OR IGNORE INTO supplier_price_rules (supplier_id, jersey_type, customization, cost)
      VALUES ('kevin', ?, ?, ?)
    `).bind(jerseyType, customization, cost);
  }));
}

async function requireAdmin(context) {
  const error = adminConfigError(context.env, { requireDb: true });
  if (error) return error;
  if (!(await isAuthorized(context.request, context.env))) return unauthorized();
  await ensurePlannerSchema(context.env);
  return null;
}

function buildSuppliers(supplierRows, ruleRows) {
  const ruleMap = new Map();
  for (const rule of ruleRows) {
    if (!ruleMap.has(rule.supplier_id)) ruleMap.set(rule.supplier_id, {});
    ruleMap.get(rule.supplier_id)[`${rule.jersey_type}:${rule.customization}`] =
      rule.cost === null ? null : number(rule.cost);
  }
  return supplierRows.map(row => ({
    id: row.id,
    name: row.name,
    enabled: Boolean(row.enabled),
    sort_order: number(row.sort_order),
    costs: ruleMap.get(row.id) || {}
  }));
}

function matchingTextSignal(product, rows, valueKey, countKey) {
  const productText = normalizeText(`${product.name} ${product.player} ${product.team_country}`);
  const player = normalizeText(product.player);
  const team = normalizeText(product.team_country);
  return rows.reduce((total, row) => {
    const value = normalizeText(row[valueKey]);
    if (!value || value.length < 2) return total;
    return productText.includes(value) || (player && value.includes(player)) || (team && value.includes(team))
      ? total + number(row[countKey])
      : total;
  }, 0);
}

function demandLabel(score) {
  if (score >= 85) return "Very High";
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "Very Low";
}

function riskFlags(product) {
  const flags = [];
  if (product.inventory_remaining === 0) flags.push("sold_out");
  if (product.inventory_remaining === 1) flags.push("one_unit");
  if (product.inventory_remaining > 0 && product.available_sizes.length === 1) flags.push("one_size");
  if (product.sales_30d >= 2 && product.inventory_remaining <= 2) flags.push("selling_quickly");
  if (product.days_in_inventory >= 30 && product.total_sales === 0 && product.demand_score < 30) flags.push("not_selling");
  return flags;
}

function profitGroups(products) {
  const groups = new Map();
  for (const product of products) {
    const labels = [
      product.category === "retro" ? "Retro" : "Fan Version",
      product.category === "world" ? product.team_country : product.team_country
    ].filter(Boolean);
    for (const label of new Set(labels)) {
      const current = groups.get(label) || { name: label, total: 0, count: 0 };
      current.total += number(product.gross_profit);
      current.count += 1;
      groups.set(label, current);
    }
  }
  return [...groups.values()]
    .map(group => ({ name: group.name, average_profit: round(group.total / Math.max(1, group.count), 2), products: group.count }))
    .sort((a, b) => b.average_profit - a.average_profit || a.name.localeCompare(b.name));
}

async function loadPlanner(context) {
  const auth = await requireAdmin(context);
  if (auth) return auth;

  const [
    inventoryResult,
    supplierResult,
    ruleResult,
    overrideResult,
    analyticsResult,
    salesResult,
    searchesResult,
    requestsResult
  ] = await Promise.all([
    context.env.DB.prepare(`SELECT id, category, name, size, sizes_json, price, quantity, date_added, photos, updated_at
      FROM inventory ORDER BY sort_order, name`).all(),
    context.env.DB.prepare("SELECT * FROM inventory_suppliers ORDER BY sort_order, name").all(),
    context.env.DB.prepare("SELECT * FROM supplier_price_rules").all(),
    context.env.DB.prepare("SELECT * FROM inventory_planner_overrides").all(),
    context.env.DB.prepare(`SELECT product_id,
        SUM(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN event_type = 'marketplace_click' THEN 1 ELSE 0 END) AS clicks
      FROM analytics_events WHERE product_id <> '' GROUP BY product_id`).all(),
    context.env.DB.prepare(`SELECT product_id,
        SUM(quantity) AS sales,
        SUM(CASE WHEN created_at >= datetime('now', '-30 days') THEN quantity ELSE 0 END) AS sales_30d,
        MAX(created_at) AS last_sale,
        AVG(CASE WHEN sale_price IS NOT NULL THEN sale_price END) AS average_sale_price
      FROM sales WHERE product_id IS NOT NULL AND product_id <> '' AND undone_at IS NULL GROUP BY product_id`).all(),
    context.env.DB.prepare(`SELECT search_query, COUNT(*) AS searches
      FROM analytics_events WHERE event_type = 'search' AND search_query <> ''
      GROUP BY search_query ORDER BY searches DESC LIMIT 500`).all(),
    context.env.DB.prepare(`
      SELECT p.product_id, p.product_name, m.jersey_request, p.requested_size,
        m.instagram_username, m.contacted_at, COUNT(*) AS requests
      FROM contact_message_products p
      JOIN contact_messages m ON m.id = p.message_id
      WHERE m.request_type IN ('jersey_request', 'restock_request')
      GROUP BY p.product_id, p.product_name, m.jersey_request, p.requested_size,
        m.instagram_username, m.contacted_at
      UNION ALL
      SELECT m.product_id, m.product_name, m.jersey_request, m.size AS requested_size,
        m.instagram_username, m.contacted_at, COUNT(*) AS requests
      FROM contact_messages m
      WHERE m.request_type IN ('jersey_request', 'restock_request')
        AND NOT EXISTS (SELECT 1 FROM contact_message_products p WHERE p.message_id = m.id)
      GROUP BY m.product_id, m.product_name, m.jersey_request, m.size,
        m.instagram_username, m.contacted_at
    `).all()
  ]);

  const platformResult = await context.env.DB.prepare(`SELECT product_id,
      MAX(CASE WHEN platform = 'Website' THEN price END) AS website,
      MAX(CASE WHEN platform = 'eBay' THEN price END) AS ebay,
      MAX(CASE WHEN platform = 'Depop' THEN price END) AS depop,
      MAX(CASE WHEN platform = 'Facebook' THEN price END) AS facebook
    FROM product_platform_prices GROUP BY product_id`).all();

  const suppliers = buildSuppliers(supplierResult.results || [], ruleResult.results || []);
  const overrides = new Map((overrideResult.results || []).map(row => [row.product_id, row]));
  const analytics = new Map((analyticsResult.results || []).map(row => [row.product_id, row]));
  const sales = new Map((salesResult.results || []).map(row => [row.product_id, row]));
  const platforms = new Map((platformResult.results || []).map(row => [row.product_id, row]));
  const directRequests = new Map();
  const requestDetails = new Map();
  for (const row of requestsResult.results || []) {
    if (row.product_id) {
      directRequests.set(row.product_id, number(directRequests.get(row.product_id)) + number(row.requests));
      const detail = requestDetails.get(row.product_id) || { sizes: {}, usernames: new Set(), contacted: 0, pending: 0 };
      const requestedSize = row.requested_size || "Any size";
      detail.sizes[requestedSize] = number(detail.sizes[requestedSize]) + number(row.requests);
      if (row.instagram_username) detail.usernames.add(row.instagram_username);
      if (row.contacted_at) detail.contacted += number(row.requests);
      else detail.pending += number(row.requests);
      requestDetails.set(row.product_id, detail);
    }
  }

  const products = (inventoryResult.results || []).map(row => {
    const identity = inferProductIdentity(row.name);
    const classification = overrides.get(row.id) || inferredClassification(row);
    const platform = platforms.get(row.id) || {};
    const sale = sales.get(row.id) || {};
    const event = analytics.get(row.id) || {};
    const base = {
      id: row.id,
      name: row.name,
      category: row.category,
      player: identity.player || "",
      team_country: identity.team_country || "",
      photo: safeJson(row.photos, [])[0]?.src || "",
      jersey_type: classification.jersey_type,
      customization: classification.customization,
      preferred_supplier_id: classification.preferred_supplier_id || "",
      inventory_remaining: number(row.quantity),
      available_sizes: availableSizes(row),
      total_views: number(event.views),
      marketplace_clicks: number(event.clicks),
      total_sales: number(sale.sales),
      sales_30d: number(sale.sales_30d),
      last_sale: sale.last_sale || "",
      days_since_last_sale: daysSince(sale.last_sale),
      days_in_inventory: daysSince(row.date_added || row.updated_at) ?? 0,
      search_frequency: 0,
      request_count: number(directRequests.get(row.id)),
      request_details: (() => {
        const detail = requestDetails.get(row.id);
        return detail ? { ...detail, usernames: [...detail.usernames] } : { sizes: {}, usernames: [], contacted: 0, pending: 0 };
      })(),
      prices: {
        Website: platform.website === null || platform.website === undefined ? number(row.price) : number(platform.website),
        eBay: platform.ebay === null || platform.ebay === undefined ? null : number(platform.ebay),
        Depop: platform.depop === null || platform.depop === undefined ? null : number(platform.depop),
        Facebook: platform.facebook === null || platform.facebook === undefined ? null : number(platform.facebook)
      },
      base_price: number(row.price),
      average_sale_price: sale.average_sale_price === null || sale.average_sale_price === undefined ? null : round(sale.average_sale_price, 2)
    };
    base.search_frequency = matchingTextSignal(base, searchesResult.results || [], "search_query", "searches");
    base.request_count += matchingTextSignal(base, (requestsResult.results || []).filter(item => !item.product_id), "jersey_request", "requests");
    return base;
  });

  const maxima = {
    views: Math.max(0, ...products.map(item => item.total_views)),
    clicks: Math.max(0, ...products.map(item => item.marketplace_clicks)),
    sales: Math.max(0, ...products.map(item => item.total_sales)),
    searches: Math.max(0, ...products.map(item => item.search_frequency)),
    requests: Math.max(0, ...products.map(item => item.request_count))
  };

  for (const product of products) {
    const supplierOptions = suppliers
      .filter(supplier => supplier.enabled)
      .map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        cost: supplier.costs[`${product.jersey_type}:${product.customization}`]
      }))
      .filter(option => option.cost !== null && option.cost !== undefined && Number.isFinite(Number(option.cost)))
      .sort((a, b) => number(a.cost) - number(b.cost) || a.name.localeCompare(b.name));
    product.supplier_options = supplierOptions;
    product.recommended_supplier = supplierOptions[0] || null;
    product.supplier_cost = product.recommended_supplier ? number(product.recommended_supplier.cost) : null;
    product.planning_price = product.average_sale_price
      ?? product.prices.Website
      ?? Math.max(...PRICE_PLATFORMS.map(name => number(product.prices[name])));
    product.gross_profit = product.supplier_cost === null ? null : round(product.planning_price - product.supplier_cost, 2);
    product.gross_profit_percent = product.gross_profit === null || product.planning_price <= 0
      ? null
      : round((product.gross_profit / product.planning_price) * 100, 1);
    product.conversion_rate = product.total_views > 0 ? round((product.total_sales / product.total_views) * 100, 1) : 0;
    product.demand_score = calculateDemandScore({
      views: product.total_views,
      clicks: product.marketplace_clicks,
      sales: product.total_sales,
      searches: product.search_frequency,
      requests: product.request_count,
      inventory: product.inventory_remaining
    }, maxima);
    product.demand_label = demandLabel(product.demand_score);
    product.recommended_quantity = recommendedOrderQuantity(product);
    product.expected_profit = product.gross_profit === null ? null : round(product.recommended_quantity * product.gross_profit, 2);
    product.risks = riskFlags(product);
  }

  const profitReady = products.filter(item => item.gross_profit !== null);
  const byProfit = [...profitReady].sort((a, b) => b.gross_profit - a.gross_profit);
  const reorderSuggestions = products
    .filter(item => item.recommended_quantity > 0)
    .sort((a, b) => b.demand_score - a.demand_score || b.expected_profit - a.expected_profit);

  return json({
    ok: true,
    generated_at: new Date().toISOString(),
    suppliers,
    products,
    summary: {
      products: products.length,
      sold_out: products.filter(item => item.risks.includes("sold_out")).length,
      one_unit: products.filter(item => item.risks.includes("one_unit")).length,
      selling_quickly: products.filter(item => item.risks.includes("selling_quickly")).length,
      not_selling: products.filter(item => item.risks.includes("not_selling")).length,
      suggested_units: reorderSuggestions.reduce((sum, item) => sum + item.recommended_quantity, 0),
      suggested_supplier_total: round(reorderSuggestions.reduce((sum, item) => sum + item.recommended_quantity * number(item.supplier_cost), 0), 2),
      suggested_expected_profit: round(reorderSuggestions.reduce((sum, item) => sum + number(item.expected_profit), 0), 2)
    },
    reorder_suggestions: reorderSuggestions.slice(0, 12),
    profit_analysis: {
      highest: byProfit.slice(0, 6),
      lowest: byProfit.slice(-6).reverse(),
      averages: profitGroups(profitReady)
    }
  });
}

function cleanCost(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const raw = String(value).trim();
  const cost = Number(raw);
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw) || !Number.isFinite(cost) || cost < 0) {
    throw new Error("Supplier costs must be blank or non-negative dollar amounts with up to two decimals.");
  }
  return cost;
}

function cleanId(value, fallback) {
  const id = String(value || fallback || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return id || fallback;
}

async function saveSuppliers(context, body) {
  const suppliers = Array.isArray(body.suppliers) ? body.suppliers : [];
  if (!suppliers.length || suppliers.length > 12) throw new Error("Provide between 1 and 12 suppliers.");
  const statements = [];
  for (const [index, supplier] of suppliers.entries()) {
    const id = cleanId(supplier.id, `supplier-${index + 1}`);
    const name = String(supplier.name || "").trim().slice(0, 80);
    if (!name) throw new Error("Every supplier needs a name.");
    statements.push(context.env.DB.prepare(`
      INSERT INTO inventory_suppliers (id, name, enabled, sort_order, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET name = excluded.name, enabled = excluded.enabled,
        sort_order = excluded.sort_order, updated_at = CURRENT_TIMESTAMP
    `).bind(id, name, supplier.enabled ? 1 : 0, (index + 1) * 10));
    for (const jerseyType of JERSEY_TYPES) {
      for (const customization of CUSTOMIZATIONS) {
        const cost = cleanCost(supplier.costs?.[`${jerseyType}:${customization}`]);
        statements.push(context.env.DB.prepare(`
          INSERT INTO supplier_price_rules (supplier_id, jersey_type, customization, cost, updated_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(supplier_id, jersey_type, customization) DO UPDATE SET
            cost = excluded.cost, updated_at = CURRENT_TIMESTAMP
        `).bind(id, jerseyType, customization, cost));
      }
    }
  }
  await context.env.DB.batch(statements);
  return json({ ok: true, saved: suppliers.length });
}

async function saveOverride(context, body) {
  const productId = String(body.product_id || "").trim();
  const jerseyType = String(body.jersey_type || "");
  const customization = String(body.customization || "");
  const preferredSupplierId = String(body.preferred_supplier_id || "").trim();
  if (!productId) throw new Error("Choose a product.");
  if (!JERSEY_TYPES.includes(jerseyType)) throw new Error("Choose a valid jersey type.");
  if (!CUSTOMIZATIONS.includes(customization)) throw new Error("Choose a valid customization.");
  const exists = await context.env.DB.prepare("SELECT 1 FROM inventory WHERE id = ?").bind(productId).first();
  if (!exists) return json({ ok: false, error: "Product not found." }, 404);
  await context.env.DB.prepare(`
    INSERT INTO inventory_planner_overrides
      (product_id, jersey_type, customization, preferred_supplier_id, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(product_id) DO UPDATE SET
      jersey_type = excluded.jersey_type,
      customization = excluded.customization,
      preferred_supplier_id = excluded.preferred_supplier_id,
      updated_at = CURRENT_TIMESTAMP
  `).bind(productId, jerseyType, customization, preferredSupplierId).run();
  return json({ ok: true, product_id: productId });
}

async function recordActivity(env, action, summary) {
  try {
    await env.DB.prepare(`INSERT INTO admin_activity_log
      (action, area, summary, status_code) VALUES (?, 'inventory_planner', ?, 200)`)
      .bind(action, summary).run();
  } catch {
    // Activity logging is best-effort on deployments that have not run its migration yet.
  }
}

async function updatePlanner(context) {
  const auth = await requireAdmin(context);
  if (auth) return auth;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "Request body must be valid JSON." }, 400);
  }
  try {
    if (body.action === "save_suppliers") {
      const response = await saveSuppliers(context, body);
      await recordActivity(context.env, "update_supplier_pricing", `Updated ${body.suppliers?.length || 0} supplier price sheets`);
      return response;
    }
    if (body.action === "save_override") {
      const response = await saveOverride(context, body);
      await recordActivity(context.env, "update_product_planning", `Updated planning classification for ${body.product_id}`);
      return response;
    }
    return json({ ok: false, error: "Unsupported planner action." }, 400);
  } catch (error) {
    return json({ ok: false, error: error.message || "Could not save planner settings." }, 400);
  }
}

export async function onRequestGet(context) {
  try {
    return await loadPlanner(context);
  } catch (error) {
    return json({ ok: false, error: `Inventory planner error: ${error?.message || "Unknown error"}` }, 500);
  }
}

export async function onRequestPost(context) {
  return updatePlanner(context);
}

export const onRequestPatch = onRequestPost;
