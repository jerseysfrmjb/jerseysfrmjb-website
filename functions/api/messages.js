import { ensureInventory } from "./_inventorySeed.js";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function clean(value = "", max = 500) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanUsername(value = "") {
  return clean(value, 80).replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "");
}

function instagramProfileUrl(username) {
  return `https://www.instagram.com/${encodeURIComponent(username)}/`;
}

function discordValue(value, fallback = "Not provided", max = 1000) {
  const text = clean(value, max);
  return text || fallback;
}

function cleanRequestedProducts(value, fallback = null) {
  const rows = Array.isArray(value) ? value : [];
  const seen = new Set();
  const products = [];
  for (const row of rows.slice(0, 20)) {
    const product_id = clean(row?.product_id || row?.id, 120);
    const product_name = clean(row?.product_name || row?.name, 200);
    const requested_size = clean(row?.requested_size || row?.size, 40);
    if (!product_id && !product_name) continue;
    const key = `${product_id}\u0000${product_name}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    products.push({ product_id, product_name, requested_size });
  }
  if (!products.length && fallback && (fallback.product_id || fallback.product_name)) products.push(fallback);
  return products;
}

async function sendDiscordNotification(env, data) {
  if (!env.DISCORD_WEBHOOK_URL) return;

  const profileUrl = data.instagram_username ? instagramProfileUrl(data.instagram_username) : "";
  const contact = `@${data.instagram_username}`;
  const payload = {
    content: `@everyone New JerseysFrmJB ${data.request_type.replace(/_/g, " ")} request from ${contact}`,
    allowed_mentions: {
      parse: ["everyone"]
    },
    embeds: [
      {
        title: "New Customer Request",
        color: 8130609,
        ...(profileUrl ? { url: profileUrl } : {}),
        timestamp: data.submitted_at,
        fields: [
          {
            name: "Reply on Instagram",
            value: `[@${data.instagram_username}](${profileUrl})`,
            inline: true
          },
          {
            name: "Request type",
            value: data.request_type.replace(/_/g, " "),
            inline: true
          },
          {
            name: "Jersey/request",
            value: discordValue(data.jersey_request, "Not provided", 240),
            inline: true
          },
          {
            name: "Size",
            value: discordValue(data.size, "Not provided", 80),
            inline: true
          },
          {
            name: "Marketplace",
            value: discordValue(data.marketplace_preference, "No preference", 80),
            inline: true
          },
          {
            name: data.products?.length > 1 ? "Saved jerseys" : "Product context",
            value: data.products?.length
              ? discordValue(data.products.map(product => `• ${product.product_name || product.product_id}${product.requested_size ? ` — ${product.requested_size}` : ""}`).join("\n"), "No product selected", 1000)
              : discordValue(data.product_name, "No product selected", 240)
          },
          {
            name: "Message",
            value: discordValue(data.message, "Not provided", 1000)
          },
          {
            name: "Submission date and time",
            value: data.submitted_at
          }
        ].filter(field => field.value)
      }
    ]
  };

  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Discord webhook returned ${response.status}`);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({ error: "Message database is not connected yet." }, 503);
    await ensureInventory(env);

    const body = await request.json().catch(() => ({}));
    if (body.website) return json({ ok: true });

    const requestTypes = new Set(["jersey_request", "size_question", "order_help", "restock_request", "other"]);
    const marketplacePreferences = new Set(["", "eBay", "Depop", "Other"]);
    const request_type = requestTypes.has(body.request_type) ? body.request_type : "jersey_request";
    const contact_preference = "instagram";
    const marketplace_preference = marketplacePreferences.has(body.marketplace_preference) ? body.marketplace_preference : "";
    const instagram_username = cleanUsername(body.instagram_username);
    const email = "";
    const jersey_request = clean(body.jersey_request, 160);
    const size = clean(body.size, 40);
    const message = clean(body.message, 1200);
    const product_id = clean(body.product_id, 120);
    const product_name = clean(body.product_name, 200);
    const products = cleanRequestedProducts(body.products, { product_id, product_name, requested_size: size });

    if (!jersey_request || !message) {
      return json({ error: "Please describe what you need and include a message." }, 400);
    }
    if (!instagram_username) {
      return json({ error: "Add your Instagram username so I can reply." }, 400);
    }

    const recentRequests = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM contact_messages
      WHERE lower(COALESCE(instagram_username, '')) = lower(?)
        AND created_at >= datetime('now', '-10 minutes')
    `).bind(instagram_username).first();
    if (Number(recentRequests?.count || 0) >= 5) {
      return json({ error: "Too many requests were sent recently. Please wait a few minutes and try again." }, 429);
    }

    const duplicate = await env.DB.prepare(`
      SELECT id FROM contact_messages
      WHERE lower(COALESCE(instagram_username, '')) = lower(?)
        AND lower(COALESCE(email, '')) = lower(?)
        AND lower(jersey_request) = lower(?)
        AND lower(size) = lower(?)
        AND lower(message) = lower(?)
        AND created_at >= datetime('now', '-2 minutes')
      LIMIT 1
    `).bind(instagram_username, email, jersey_request, size, message).first();

    if (duplicate) {
      return json({ ok: true, duplicate: true });
    }

    const submitted_at = new Date().toISOString();

    const insertResult = await env.DB.prepare(`
      INSERT INTO contact_messages (
        instagram_username, email, contact_preference, request_type,
        jersey_request, size, marketplace_preference, product_id, product_name,
        message, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')
    `).bind(
      instagram_username,
      email,
      contact_preference,
      request_type,
      jersey_request,
      size,
      marketplace_preference,
      product_id,
      product_name,
      message
    ).run();
    const requestId = Number(insertResult.meta?.last_row_id || 0) || undefined;

    if (requestId && products.length) {
      await env.DB.batch(products.map(product => env.DB.prepare(`
        INSERT OR IGNORE INTO contact_message_products (
          message_id, product_id, product_name, requested_size
        ) VALUES (?, ?, ?, ?)
      `).bind(requestId, product.product_id, product.product_name, product.requested_size)));
    }

    try {
      await sendDiscordNotification(env, {
        instagram_username,
        email,
        contact_preference,
        request_type,
        jersey_request,
        size,
        marketplace_preference,
        product_name,
        products,
        message,
        submitted_at
      });
    } catch (notificationError) {
      console.warn("Discord notification failed", notificationError);
    }

    return json({ ok: true, request_id: requestId });
  } catch (error) {
    return json({ error: `Message server error: ${error?.message || "Unknown error"}` }, 500);
  }
}
