import { sha256, shopifyNumericId } from "./_shared.js";

function money(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function orderId(payload) {
  return String(payload.order_id || payload.id || "").trim();
}

async function upsertOrder(env, payload, topic) {
  const id = orderId(payload);
  if (!id) return;
  const refundTotal = Number(payload.refund_amount || 0)
    + (payload.refunds || []).reduce((total, refund) => total + money(refund.amount), 0);
  const fulfillmentStatus = String(payload.fulfillment_status || (/fulfillments\//.test(topic) ? "updated" : ""));
  await env.DB.prepare(`
    INSERT INTO shopify_orders (
      shopify_order_id, order_number, payment_status, fulfillment_status,
      currency, subtotal, discounts, shipping, tax, refund_total,
      refund_status, cancelled_at, paid_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(shopify_order_id) DO UPDATE SET
      order_number = CASE WHEN excluded.order_number <> '' THEN excluded.order_number ELSE shopify_orders.order_number END,
      payment_status = CASE WHEN excluded.payment_status <> '' THEN excluded.payment_status ELSE shopify_orders.payment_status END,
      fulfillment_status = CASE WHEN excluded.fulfillment_status <> '' THEN excluded.fulfillment_status ELSE shopify_orders.fulfillment_status END,
      currency = excluded.currency,
      subtotal = CASE WHEN excluded.subtotal > 0 THEN excluded.subtotal ELSE shopify_orders.subtotal END,
      discounts = CASE WHEN excluded.discounts > 0 THEN excluded.discounts ELSE shopify_orders.discounts END,
      shipping = CASE WHEN excluded.shipping > 0 THEN excluded.shipping ELSE shopify_orders.shipping END,
      tax = CASE WHEN excluded.tax > 0 THEN excluded.tax ELSE shopify_orders.tax END,
      refund_total = MAX(shopify_orders.refund_total, excluded.refund_total),
      refund_status = CASE WHEN excluded.refund_total > 0 THEN excluded.refund_status ELSE shopify_orders.refund_status END,
      cancelled_at = COALESCE(excluded.cancelled_at, shopify_orders.cancelled_at),
      paid_at = COALESCE(excluded.paid_at, shopify_orders.paid_at),
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    id,
    String(payload.name || payload.order_number || ""),
    String(payload.financial_status || ""),
    fulfillmentStatus,
    String(payload.currency || "USD").slice(0, 3),
    money(payload.subtotal_price),
    money(payload.total_discounts),
    money(payload.total_shipping_price_set?.shop_money?.amount),
    money(payload.total_tax),
    refundTotal,
    refundTotal > 0 ? "refunded" : "",
    payload.cancelled_at || null,
    /paid|orders\/paid/i.test(`${payload.financial_status} ${topic}`) ? (payload.processed_at || new Date().toISOString()) : null
  ).run();
}

async function recordRefunds(env, payload) {
  const id = orderId(payload);
  const refunds = [
    ...(payload.refunds || []).map(refund => ({
      id: String(refund.id || ""),
      amount: money(refund.amount),
      created_at: refund.created_at || null
    })),
    ...(money(payload.refund_amount) > 0 ? [{
      id: String(payload.id || ""),
      amount: money(payload.refund_amount),
      created_at: payload.processed_at || null
    }] : [])
  ].filter(refund => refund.id && refund.amount > 0);
  for (const refund of refunds) {
    await env.DB.prepare(`
      INSERT INTO shopify_refunds (shopify_refund_id, shopify_order_id, amount, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(shopify_refund_id) DO UPDATE SET
        amount = excluded.amount,
        created_at = COALESCE(excluded.created_at, shopify_refunds.created_at)
    `).bind(refund.id, id, refund.amount, refund.created_at).run();
  }
  if (refunds.length) {
    await env.DB.prepare(`
      UPDATE shopify_orders
      SET refund_total = COALESCE((SELECT SUM(amount) FROM shopify_refunds WHERE shopify_order_id = ?), 0),
        refund_status = 'refunded', updated_at = CURRENT_TIMESTAMP
      WHERE shopify_order_id = ?
    `).bind(id, id).run();
  }
}

async function mappingForLine(env, line) {
  const numeric = shopifyNumericId(line.variant_id);
  return env.DB.prepare(`
    SELECT product_id, size, shopify_variant_id
    FROM shopify_variant_mappings
    WHERE shopify_variant_id = ? OR shopify_variant_id = ? OR shopify_variant_id LIKE ?
    LIMIT 1
  `).bind(String(line.variant_id || ""), numeric, `%/${numeric}`).first();
}

async function prepareOrderLines(env, payload) {
  const id = orderId(payload);
  for (const line of payload.line_items || []) {
    const mapping = await mappingForLine(env, line);
    await env.DB.prepare(`
      INSERT INTO shopify_order_lines (
        shopify_order_id, shopify_line_item_id, shopify_variant_id,
        product_id, size, quantity, unit_price, processing_status, error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(shopify_order_id, shopify_line_item_id) DO UPDATE SET
        shopify_variant_id = excluded.shopify_variant_id,
        product_id = CASE WHEN shopify_order_lines.product_id IS NULL OR shopify_order_lines.product_id = '' THEN excluded.product_id ELSE shopify_order_lines.product_id END,
        size = CASE WHEN shopify_order_lines.size = '' THEN excluded.size ELSE shopify_order_lines.size END,
        quantity = excluded.quantity,
        unit_price = excluded.unit_price,
        error = CASE WHEN shopify_order_lines.processing_status = 'processed' THEN shopify_order_lines.error ELSE excluded.error END,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id,
      String(line.id),
      String(line.variant_id || ""),
      mapping?.product_id || null,
      mapping?.size || String(line.variant_title || ""),
      Math.max(0, Math.floor(Number(line.quantity || 0))),
      money(line.price),
      mapping?.product_id ? "pending" : "needs_review",
      mapping?.product_id ? "" : `Missing Shopify mapping for variant ${line.variant_id || "unknown"}`
    ).run();
  }
}

async function processLine(env, order, line) {
  const path = `$.${line.size}`;
  const note = `Shopify order ${order.shopify_order_id} · line ${line.shopify_line_item_id}`;
  const statements = [
    env.DB.prepare(`
      UPDATE shopify_order_lines SET processing_status = 'ready', error = '', updated_at = CURRENT_TIMESTAMP
      WHERE shopify_order_id = ? AND shopify_line_item_id = ?
        AND processing_status IN ('pending', 'failed')
        AND EXISTS (
          SELECT 1 FROM inventory
          WHERE id = shopify_order_lines.product_id
            AND CAST(COALESCE(json_extract(COALESCE(NULLIF(sizes_json, ''), '{}'), ?), 0) AS INTEGER) >= shopify_order_lines.quantity
        )
    `).bind(order.shopify_order_id, line.shopify_line_item_id, path),
    env.DB.prepare(`
      UPDATE inventory
      SET sizes_json = json_set(COALESCE(NULLIF(sizes_json, ''), '{}'), ?,
            MAX(0, CAST(COALESCE(json_extract(COALESCE(NULLIF(sizes_json, ''), '{}'), ?), 0) AS INTEGER) - ?)),
          quantity = MAX(0, quantity - ?),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND EXISTS (
        SELECT 1 FROM shopify_order_lines
        WHERE shopify_order_id = ? AND shopify_line_item_id = ? AND processing_status = 'ready'
      )
    `).bind(path, path, line.quantity, line.quantity, line.product_id, order.shopify_order_id, line.shopify_line_item_id),
    env.DB.prepare(`
      INSERT INTO sales (product_id, product_name, player, team_country, size, quantity, sale_price, platform, notes, created_at)
      SELECT inventory.id, inventory.name, '', '', order_lines.size, order_lines.quantity,
        order_lines.unit_price, 'Website', ?, COALESCE(?, CURRENT_TIMESTAMP)
      FROM shopify_order_lines AS order_lines
      JOIN inventory ON inventory.id = order_lines.product_id
      WHERE order_lines.shopify_order_id = ? AND order_lines.shopify_line_item_id = ?
        AND order_lines.processing_status = 'ready'
    `).bind(note, order.paid_at || null, order.shopify_order_id, line.shopify_line_item_id),
    env.DB.prepare(`
      UPDATE shopify_order_lines
      SET processing_status = 'processed',
        sale_id = (SELECT id FROM sales WHERE notes = ? ORDER BY id DESC LIMIT 1),
        updated_at = CURRENT_TIMESTAMP
      WHERE shopify_order_id = ? AND shopify_line_item_id = ? AND processing_status = 'ready'
    `).bind(note, order.shopify_order_id, line.shopify_line_item_id)
  ];
  await env.DB.batch(statements);
  const result = await env.DB.prepare(`
    SELECT processing_status, error FROM shopify_order_lines
    WHERE shopify_order_id = ? AND shopify_line_item_id = ?
  `).bind(order.shopify_order_id, line.shopify_line_item_id).first();
  if (result?.processing_status !== "processed") {
    const error = result?.processing_status === "needs_review"
      ? result.error
      : "D1 inventory was lower than the paid Shopify quantity. Manual review is required.";
    await env.DB.prepare(`
      UPDATE shopify_order_lines SET processing_status = 'failed', error = ?, updated_at = CURRENT_TIMESTAMP
      WHERE shopify_order_id = ? AND shopify_line_item_id = ? AND processing_status <> 'processed'
    `).bind(error, order.shopify_order_id, line.shopify_line_item_id).run();
    throw new Error(error);
  }
}

async function recordPurchaseEvent(env, payload) {
  const id = orderId(payload);
  const value = money(payload.subtotal_price);
  await env.DB.prepare(`
    INSERT OR IGNORE INTO shopify_commerce_events (
      event_type, shopify_order_id, value, currency, dedupe_key
    ) VALUES ('Purchase', ?, ?, ?, ?)
  `).bind(id, value, String(payload.currency || "USD"), `purchase:${id}`).run();
}

export async function processSanitizedWebhook(env, topic, payload) {
  await upsertOrder(env, payload, topic);
  await recordRefunds(env, payload);
  const paid = topic === "orders/paid" || String(payload.financial_status || "").toLowerCase() === "paid";
  if (!paid) return { processed: true, inventory_changed: false };
  await prepareOrderLines(env, payload);
  const id = orderId(payload);
  const order = await env.DB.prepare("SELECT * FROM shopify_orders WHERE shopify_order_id = ?").bind(id).first();
  const lines = await env.DB.prepare(`
    SELECT * FROM shopify_order_lines
    WHERE shopify_order_id = ? AND processing_status <> 'processed'
    ORDER BY shopify_line_item_id
  `).bind(id).all();
  for (const line of lines.results || []) await processLine(env, order, line);
  await recordPurchaseEvent(env, payload);
  await env.DB.prepare(`
    INSERT INTO site_settings (key, value, updated_at)
    VALUES ('inventory_updated_at', ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).bind(new Date().toISOString()).run();
  return { processed: true, inventory_changed: Boolean((lines.results || []).length) };
}

export async function webhookEventId(rawBody, suppliedId, topic) {
  return String(suppliedId || "").trim() || `generated:${await sha256(`${topic}:`)}:${await sha256(new Uint8Array(rawBody).join(","))}`;
}
