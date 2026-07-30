import { ensureOperationsSchema, operationArea } from "./api/_operationsSchema.js";

function clean(value = "", max = 300) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

async function sendErrorAlert(env, error) {
  if (!env.DISCORD_WEBHOOK_URL) return false;
  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: "JerseysFrmJB API error",
        color: 11730944,
        timestamp: new Date().toISOString(),
        fields: [
          { name: "Request", value: `${error.method} ${error.path}`, inline: true },
          { name: "Status", value: String(error.status), inline: true },
          { name: "Request ID", value: error.requestId },
          { name: "Details", value: clean(error.message, 900) || "Server returned an error response." }
        ]
      }]
    })
  });
  return response.ok;
}

async function recordApiError(env, details) {
  await ensureOperationsSchema(env);
  const fingerprint = `${details.method}:${details.path}:${details.status}`.slice(0, 300);
  const recent = await env.DB.prepare(`
    SELECT id FROM api_error_log
    WHERE fingerprint = ? AND created_at >= datetime('now', '-15 minutes')
    LIMIT 1
  `).bind(fingerprint).first();
  let alertedAt = null;
  if (!recent) {
    try {
      if (await sendErrorAlert(env, details)) alertedAt = new Date().toISOString();
    } catch (error) {
      console.warn("API error alert failed", error);
    }
  }
  await env.DB.prepare(`
    INSERT INTO api_error_log (
      request_id, method, path, status_code, message, fingerprint, alerted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    details.requestId,
    details.method,
    details.path,
    details.status,
    clean(details.message, 600),
    fingerprint,
    alertedAt
  ).run();
}

async function recordAdminActivity(env, request, response) {
  await ensureOperationsSchema(env);
  const url = new URL(request.url);
  const area = operationArea(url.pathname);
  const action = request.method.toUpperCase();
  await env.DB.prepare(`
    INSERT INTO admin_activity_log (action, area, summary, status_code)
    VALUES (?, ?, ?, ?)
  `).bind(
    action,
    area,
    `${action} ${url.pathname}`.slice(0, 300),
    response.status
  ).run();
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) return context.next();

  const requestId = crypto.randomUUID();
  let response;
  let thrownMessage = "";
  try {
    response = await context.next();
  } catch (error) {
    thrownMessage = clean(error?.message || "Unhandled API error", 600);
    response = new Response(JSON.stringify({ error: "Server error", request_id: requestId }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
    });
  }

  const background = [];
  if (env.DB && response.status >= 500) {
    background.push(recordApiError(env, {
      requestId,
      method: request.method.toUpperCase(),
      path: url.pathname,
      status: response.status,
      message: thrownMessage || response.statusText
    }));
  }
  if (
    env.DB
    && url.pathname.startsWith("/api/admin/")
    && ["POST", "PATCH", "PUT", "DELETE"].includes(request.method.toUpperCase())
    && response.status >= 200
    && response.status < 400
  ) {
    background.push(recordAdminActivity(env, request, response));
  }
  if (background.length) {
    const task = Promise.allSettled(background);
    if (typeof context.waitUntil === "function") context.waitUntil(task);
    else await task;
  }

  const headers = new Headers(response.headers);
  headers.set("X-Request-ID", requestId);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
