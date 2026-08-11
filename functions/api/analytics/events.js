import { ensureAnalyticsSchema } from "../_analyticsSchema.js";

const EVENT_TYPES = new Set(["page_view", "product_view", "marketplace_click", "search", "engagement"]);
const MARKETPLACES = new Set(["eBay", "Depop", "Facebook", "Instagram", "Pinterest", "Other"]);
const TRAFFIC_SOURCES = new Set(["Google", "Bing", "TikTok", "Pinterest", "Facebook", "Instagram", "Direct", "Other"]);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function clean(value, maxLength = 120) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function validId(value) {
  const id = clean(value, 80);
  return /^[a-zA-Z0-9_-]{8,80}$/.test(id) ? id : "";
}

function safePath(value) {
  const path = clean(value, 300);
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return path.split("?")[0].split("#")[0].slice(0, 240) || "/";
}

function isBot(userAgent = "") {
  return /bot|crawler|spider|preview|facebookexternalhit|pinterest|bingpreview|headless|lighthouse/i.test(userAgent);
}

function deviceType(userAgent = "") {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "Tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function browserName(userAgent = "") {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\/|opera/i.test(userAgent)) return "Opera";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  if (/crios\//i.test(userAgent)) return "Chrome";
  if (/chrome\//i.test(userAgent)) return "Chrome";
  if (/safari\//i.test(userAgent) && !/chrome|chromium/i.test(userAgent)) return "Safari";
  return "Other";
}

function sameSiteRequest(request) {
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      return new URL(origin).hostname === new URL(request.url).hostname;
    } catch {
      return false;
    }
  }
  return ["same-origin", "same-site"].includes(request.headers.get("Sec-Fetch-Site") || "");
}

function safeSearchQuery(value) {
  const query = clean(value, 80);
  if (!query || query.includes("@") || /\d{7,}/.test(query)) return "";
  return query;
}

function easternDay(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return json({ error: "Analytics storage unavailable" }, 503);
    if (!sameSiteRequest(request)) return json({ error: "Cross-site analytics requests are not allowed" }, 403);
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return json({ error: "Expected JSON" }, 415);
    }

    const userAgent = request.headers.get("User-Agent") || "";
    if (isBot(userAgent)) return new Response(null, { status: 204 });

    const text = await request.text();
    if (text.length > 5000) return json({ error: "Event payload is too large" }, 413);
    let body;
    try {
      body = JSON.parse(text || "{}");
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const eventType = clean(body.event_type, 40);
    const visitorId = validId(body.visitor_id);
    const sessionId = validId(body.session_id);
    if (!EVENT_TYPES.has(eventType) || !visitorId || !sessionId) {
      return json({ error: "Invalid analytics event" }, 400);
    }

    const marketplace = MARKETPLACES.has(body.marketplace) ? body.marketplace : "";
    const trafficSource = TRAFFIC_SOURCES.has(body.traffic_source) ? body.traffic_source : "Other";
    const searchResults = eventType === "search" && Number.isFinite(Number(body.search_results))
      ? Math.max(0, Math.min(10000, Math.floor(Number(body.search_results))))
      : null;
    const durationSeconds = eventType === "engagement"
      ? Math.max(0, Math.min(1800, Math.floor(Number(body.duration_seconds) || 0)))
      : 0;
    const country = clean(request.cf?.country || "", 2).toUpperCase();
    const region = country === "US" ? clean(request.cf?.region || "", 80) : "";
    const utmSource = clean(body.utm_source, 80).toLowerCase();
    const utmMedium = clean(body.utm_medium, 80).toLowerCase();
    const utmCampaign = clean(body.utm_campaign, 120).toLowerCase();
    const utmContent = clean(body.utm_content, 160).toLowerCase();

    await ensureAnalyticsSchema(env);
    await env.DB.prepare(`
      INSERT INTO analytics_events (
        event_type, visitor_id, session_id, page_path, page_title, product_id,
        marketplace, search_query, search_results, traffic_source, country,
        region, device_type, browser, duration_seconds, local_day, utm_source,
        utm_medium, utm_campaign, utm_content
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      eventType,
      visitorId,
      sessionId,
      safePath(body.page_path),
      clean(body.page_title, 160),
      clean(body.product_id, 120),
      marketplace,
      eventType === "search" ? safeSearchQuery(body.search_query) : "",
      searchResults,
      trafficSource,
      country,
      region,
      deviceType(userAgent),
      browserName(userAgent),
      durationSeconds,
      easternDay(),
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent
    ).run();

    return new Response(null, { status: 204 });
  } catch (error) {
    return json({ error: `Analytics event error: ${error?.message || "Unknown error"}` }, 500);
  }
}
