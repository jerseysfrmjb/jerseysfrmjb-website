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
  if (Object.prototype.hasOwnProperty.call(settings, "homepage_ticker_message")) {
    await setSetting(env, "homepage_ticker_message", String(settings.homepage_ticker_message || "").trim());
  }
  if (Object.prototype.hasOwnProperty.call(settings, "homepage_stat_message")) {
    await setSetting(env, "homepage_stat_message", String(settings.homepage_stat_message || "").trim());
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

function requestId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
}

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[#|/()&.+,'"-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSizeInput(value = "") {
  const raw = String(value || "").trim();
  const compact = raw.toUpperCase().replace(/\s+/g, "");
  if (SIZE_ORDER.includes(compact)) return compact;
  const match = SIZE_WORDS.find(([, pattern]) => pattern.test(raw));
  return match ? match[0] : "";
}

function parseRestockQuantity(value = "") {
  const match = String(value || "").trim().match(/^([+-]?)(\d+)$/);
  if (!match) return null;
  const amount = Math.floor(Number(match[2]));
  return match[1] === "-" ? -amount : amount;
}

function parseShipmentLine(input = "") {
  const match = String(input || "").trim().match(/^(.*?)\s*(?:--|-|\u2013|\u2014)\s*(.*?)\s*(?:x|\u00d7)\s*(\d+)\s*\(([^)]+)\)\s*$/i);
  if (!match) return null;
  const teamAndStyle = match[1].trim();
  const player = match[2].trim();
  return {
    product: [teamAndStyle, player].filter(Boolean).join(" "),
    size: normalizeSizeInput(match[4]),
    quantity: parseRestockQuantity("+" + match[3])
  };
}

function parseRestockLines(rawLines = "") {
  return String(rawLines || "")
    .split(/\r?\n/)
    .map((line, index) => ({ input: line.trim(), lineNumber: index + 1 }))
    .filter(line => line.input)
    .map(line => {
      const shipmentLine = parseShipmentLine(line.input);
      const parts = shipmentLine ? [] : line.input.split("|").map(part => part.trim());
      const product = shipmentLine ? shipmentLine.product : (parts[0] || "");
      const size = shipmentLine ? shipmentLine.size : normalizeSizeInput(parts[1] || "");
      const quantity = shipmentLine ? shipmentLine.quantity : parseRestockQuantity(parts[2] || "");
      return {
        ...line,
        product,
        size,
        quantity,
        error: !shipmentLine && parts.length < 3 ? "Use Product | Size | Quantity, or Team Home - Player #Number x2 (M)" : (!size ? "Size was not recognized" : (quantity === null || quantity < 0 ? "Quantity must be a number like +2 or 2" : ""))
      };
    });
}

function matchScore(query, item) {
  const ignored = new Set(["jersey", "kit", "world", "cup", "2026", "fc"]);
  const normalizedQuery = normalizeText(query);
  const normalizedName = normalizeText([item.name, item.category].join(" "));
  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 1000;
  if (normalizedName.includes(normalizedQuery)) return 900;

  const queryTokens = normalizedQuery.split(" ").filter(token => token && !ignored.has(token));
  if (!queryTokens.length) return 0;
  const nameTokens = new Set(normalizedName.split(" "));
  let score = 0;
  for (const token of queryTokens) {
    if (nameTokens.has(token)) score += 20;
    else if (normalizedName.includes(token)) score += 8;
  }
  return score + Math.min(queryTokens.length, 6);
}

function findProductMatch(items, productName) {
  const candidates = items
    .map(item => ({ item, score: matchScore(productName, item) }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  const best = candidates[0];
  const second = candidates[1];
  const ambiguous = best && second && best.score < 900 && second.score >= best.score - 8;
  return {
    item: best && best.score >= 28 && !ambiguous ? best.item : null,
    suggestions: candidates.slice(0, 5).map(candidate => ({ id: candidate.item.id, name: candidate.item.name, category: candidate.item.category, score: candidate.score })),
    ambiguous
  };
}

function buildBulkPreview(items, rawLines = "", mode = "add", corrections = {}) {
  const parsedLines = parseRestockLines(rawLines);
  const byId = new Map(items.map(item => [item.id, item]));
  const matchedItems = [];
  const unmatchedItems = [];

  for (const line of parsedLines) {
    const correction = corrections?.[line.lineNumber] || {};
    const correctedItem = correction.itemId ? byId.get(String(correction.itemId)) : null;
    const correctedSize = normalizeSizeInput(correction.size || line.size);
    const correctedQuantity = Object.prototype.hasOwnProperty.call(correction, "quantity") && correction.quantity !== "" ? Math.max(0, Math.floor(Number(correction.quantity))) : line.quantity;

    if (line.error && !correctedItem) {
      unmatchedItems.push({ ...line, reason: line.error, suggestions: [] });
      continue;
    }

    if (mode === "add" && correctedQuantity <= 0) {
      unmatchedItems.push({ ...line, quantity: correctedQuantity, reason: "Add mode needs a positive quantity like +2.", suggestions: [] });
      continue;
    }

    const match = correctedItem ? { item: correctedItem, suggestions: [], ambiguous: false } : findProductMatch(items, line.product);
    if (!match.item || !correctedSize) {
      unmatchedItems.push({
        ...line,
        size: correctedSize || line.size,
        quantity: correctedQuantity,
        reason: match.ambiguous ? "Multiple jerseys look similar. Choose the correct one." : (line.error || "No matching jersey found"),
        suggestions: match.suggestions
      });
      continue;
    }

    const currentQuantity = Math.max(0, Math.floor(Number(match.item.sizes?.[correctedSize] || 0)));
    matchedItems.push({
      lineNumber: line.lineNumber,
      input: line.input,
      itemId: match.item.id,
      itemName: match.item.name,
      category: match.item.category,
      size: correctedSize,
      changeQuantity: correctedQuantity,
      currentQuantity,
      newQuantity: mode === "set" ? Math.max(0, correctedQuantity) : Math.max(0, currentQuantity + correctedQuantity)
    });
  }

  const groups = new Map();
  for (const item of matchedItems) {
    const key = `${item.itemId}::${item.size}`;
    const group = groups.get(key) || { itemId: item.itemId, itemName: item.itemName, size: item.size, lineNumbers: [], currentQuantity: item.currentQuantity, totalChange: 0 };
    group.lineNumbers.push(item.lineNumber);
    group.totalChange += item.changeQuantity;
    groups.set(key, group);
  }

  const duplicateItems = [...groups.values()].filter(group => group.lineNumbers.length > 1).map(group => ({
    ...group,
    newQuantity: mode === "set" ? group.totalChange : Math.max(0, group.currentQuantity + group.totalChange),
    conflicting: mode === "set"
  }));

  for (const item of matchedItems) {
    const group = groups.get(`${item.itemId}::${item.size}`);
    if (group) item.newQuantity = mode === "set" ? item.changeQuantity : Math.max(0, group.currentQuantity + group.totalChange);
  }

  return {
    mode,
    lineCount: parsedLines.length,
    totalQuantity: matchedItems.reduce((sum, item) => sum + Math.max(0, Number(item.changeQuantity || 0)), 0),
    matchedItems,
    unmatchedItems,
    duplicateItems,
    canApply: matchedItems.length > 0 && unmatchedItems.length === 0 && !duplicateItems.some(item => item.conflicting)
  };
}

async function loadRestockPresets(env) {
  const result = await env.DB.prepare("SELECT id, name, lines, created_at, updated_at FROM restock_presets ORDER BY updated_at DESC, name").all();
  return result.results || [];
}

async function loadLastBulkRestock(env) {
  const row = await env.DB.prepare("SELECT id, created_at, undone_at FROM bulk_restock_runs ORDER BY created_at DESC LIMIT 1").first();
  return row || null;
}

async function loadInventory(env) {
  const result = await env.DB.prepare("SELECT * FROM inventory ORDER BY CASE WHEN quantity > 0 THEN 0 ELSE 1 END, category, sort_order, name").all();
  return result.results.map(parseItem);
}

async function fullAdminPayload(env, extra = {}) {
  return {
    items: await loadInventory(env),
    settings: await getSettings(env),
    featuredLimit: FEATURED_LIMIT,
    sizeOptions: SIZE_ORDER,
    restockPresets: await loadRestockPresets(env),
    lastBulkRestock: await loadLastBulkRestock(env),
    ...extra
  };
}

async function handleGet({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);

  return json(await fullAdminPayload(env));
}

async function saveRestockPreset(env, preset = {}) {
  const name = String(preset.name || "").trim();
  const lines = String(preset.lines || "").trim();
  if (!name) return json({ error: "Preset name is required." }, 400);
  if (!lines) return json({ error: "Preset lines are required." }, 400);
  const id = String(preset.id || requestId()).trim();
  await env.DB.prepare(`
    INSERT INTO restock_presets (id, name, lines, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name, lines = excluded.lines, updated_at = CURRENT_TIMESTAMP
  `).bind(id, name, lines).run();
  return json(await fullAdminPayload(env, { restockPresetSaved: id }));
}

async function deleteRestockPreset(env, id = "") {
  if (!id) return json({ error: "Choose a preset to delete." }, 400);
  await env.DB.prepare("DELETE FROM restock_presets WHERE id = ?").bind(String(id)).run();
  return json(await fullAdminPayload(env));
}

async function applyBulkRestock(env, body = {}) {
  const mode = body.mode === "set" ? "set" : "add";
  const items = await loadInventory(env);
  const preview = buildBulkPreview(items, body.lines || "", mode, body.corrections || {});
  if (!preview.matchedItems.length) return json({ error: "No matched jerseys to update.", preview }, 400);
  if (preview.unmatchedItems.length) return json({ error: "Fix unmatched lines before applying the restock.", preview }, 400);
  if (preview.duplicateItems.some(item => item.conflicting)) {
    return json({ error: "Set quantity mode has duplicate lines for the same jersey and size. Remove the duplicate or use Add mode.", preview }, 400);
  }

  const grouped = new Map();
  for (const item of preview.matchedItems) {
    const key = item.itemId;
    const group = grouped.get(key) || { itemId: item.itemId, changes: [] };
    group.changes.push(item);
    grouped.set(key, group);
  }

  const undoChanges = [];
  for (const group of grouped.values()) {
    const current = items.find(item => item.id === group.itemId);
    if (!current) continue;
    const nextSizes = { ...(current.sizes || {}) };
    const before = { id: current.id, name: current.name, size: current.size, sizes: current.sizes || {}, quantity: current.quantity };

    const sizeChanges = new Map();
    for (const change of group.changes) {
      const previous = sizeChanges.get(change.size) || 0;
      sizeChanges.set(change.size, previous + change.changeQuantity);
    }

    for (const [size, quantity] of sizeChanges.entries()) {
      const currentQty = Math.max(0, Math.floor(Number(nextSizes[size] || 0)));
      const nextQty = mode === "set" ? Math.max(0, quantity) : Math.max(0, currentQty + quantity);
      if (nextQty > 0) nextSizes[size] = nextQty;
      else delete nextSizes[size];
    }

    const normalized = normalizeSizes(nextSizes);
    const nextQuantity = totalQuantity(normalized, 0);
    const nextSizeLabel = sizesLabel(normalized, current.size);
    await env.DB.prepare("UPDATE inventory SET size = ?, sizes_json = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(nextSizeLabel, JSON.stringify(normalized), nextQuantity, current.id)
      .run();
    undoChanges.push({ before, after: { id: current.id, size: nextSizeLabel, sizes: normalized, quantity: nextQuantity } });
  }

  await env.DB.prepare("INSERT INTO bulk_restock_runs (id, changes_json) VALUES (?, ?)")
    .bind(requestId(), JSON.stringify({ mode, changes: undoChanges }))
    .run();
  await setSetting(env, "inventory_updated_at", new Date().toISOString());
  return json(await fullAdminPayload(env, { bulkPreview: preview, bulkApplied: true }));
}

async function undoBulkRestock(env) {
  const run = await env.DB.prepare("SELECT * FROM bulk_restock_runs WHERE undone_at IS NULL ORDER BY created_at DESC LIMIT 1").first();
  if (!run) return json({ error: "No recent bulk restock to undo." }, 400);
  const payload = parseJson(run.changes_json, { changes: [] });
  for (const change of payload.changes || []) {
    const before = change.before || {};
    const normalized = normalizeSizes(before.sizes || {}, before.size, before.quantity);
    const quantity = totalQuantity(normalized, before.quantity);
    const size = sizesLabel(normalized, before.size);
    await env.DB.prepare("UPDATE inventory SET size = ?, sizes_json = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(size, JSON.stringify(normalized), quantity, before.id)
      .run();
  }
  await env.DB.prepare("UPDATE bulk_restock_runs SET undone_at = CURRENT_TIMESTAMP WHERE id = ?").bind(run.id).run();
  await setSetting(env, "inventory_updated_at", new Date().toISOString());
  return json(await fullAdminPayload(env, { bulkUndone: true }));
}

async function handlePatch({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);

  const body = await request.json().catch(() => ({}));

  if (body.settings) {
    await updateSettings(env, body.settings);
    return json(await fullAdminPayload(env));
  }

  if (body.bulkRestockPreview) {
    const items = await loadInventory(env);
    return json(await fullAdminPayload(env, {
      bulkPreview: buildBulkPreview(items, body.lines || "", body.mode === "set" ? "set" : "add", body.corrections || {})
    }));
  }

  if (body.bulkRestockApply) {
    return applyBulkRestock(env, body);
  }

  if (body.bulkRestockUndo) {
    return undoBulkRestock(env);
  }

  if (body.restockPreset) {
    const action = body.restockPreset.action;
    if (action === "save") return saveRestockPreset(env, body.restockPreset);
    if (action === "delete") return deleteRestockPreset(env, body.restockPreset.id);
    return json({ error: "Unknown preset action." }, 400);
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

    return json(await fullAdminPayload(env));
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
  return json(await fullAdminPayload(env, { item: parseItem(updated) }));
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
