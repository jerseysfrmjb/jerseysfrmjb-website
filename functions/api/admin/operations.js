import { ensureInventory } from "../_inventorySeed.js";
import { ensureOperationsSchema } from "../_operationsSchema.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

function csvCell(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function requireAdmin(request, env) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  await ensureInventory(env);
  await ensureOperationsSchema(env);
  return null;
}

async function inventoryCsv(env) {
  const result = await env.DB.prepare(`
    SELECT
      inventory.id,
      inventory.name,
      inventory.category,
      inventory.quantity,
      inventory.sizes_json,
      inventory.price AS base_price,
      MAX(CASE WHEN product_platform_prices.platform = 'Website' THEN product_platform_prices.price END) AS website_price,
      MAX(CASE WHEN product_platform_prices.platform = 'Facebook' THEN product_platform_prices.price END) AS facebook_price,
      MAX(CASE WHEN product_platform_prices.platform = 'eBay' THEN product_platform_prices.price END) AS ebay_price,
      MAX(CASE WHEN product_platform_prices.platform = 'Depop' THEN product_platform_prices.price END) AS depop_price,
      inventory.updated_at
    FROM inventory
    LEFT JOIN product_platform_prices ON product_platform_prices.product_id = inventory.id
    GROUP BY inventory.id
    ORDER BY inventory.category, inventory.name
  `).all();
  const headers = [
    "id", "name", "category", "quantity", "sizes_json", "base_price",
    "website_price", "facebook_price", "ebay_price", "depop_price", "updated_at"
  ];
  return [
    headers.join(","),
    ...(result.results || []).map(row => headers.map(key => csvCell(row[key])).join(","))
  ].join("\r\n");
}

export async function onRequestGet({ request, env }) {
  try {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;
    const url = new URL(request.url);
    if (url.searchParams.get("format") === "inventory.csv") {
      const csv = await inventoryCsv(env);
      await env.DB.prepare(`
        INSERT INTO admin_activity_log (action, area, summary)
        VALUES ('EXPORT', 'operations', 'Downloaded current inventory CSV')
      `).run();
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="jerseysfrmjb-inventory-${new Date().toISOString().slice(0, 10)}.csv"`,
          "Cache-Control": "no-store"
        }
      });
    }

    const [activity, errors] = await env.DB.batch([
      env.DB.prepare(`
        SELECT id, action, area, entity_id, summary, status_code, created_at
        FROM admin_activity_log
        ORDER BY created_at DESC, id DESC
        LIMIT 150
      `),
      env.DB.prepare(`
        SELECT id, request_id, method, path, status_code, message, alerted_at, created_at
        FROM api_error_log
        ORDER BY created_at DESC, id DESC
        LIMIT 100
      `)
    ]);
    return json({
      activity: activity.results || [],
      errors: errors.results || [],
      protection: {
        cloudflare_time_travel: true,
        weekly_export_workflow_installed: true,
        api_error_alerts: Boolean(env.DISCORD_WEBHOOK_URL)
      }
    });
  } catch (error) {
    return json({ error: `Operations server error: ${error?.message || "Unknown error"}` }, 500);
  }
}
