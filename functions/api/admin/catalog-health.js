import { ensureInventory } from "../_inventorySeed.js";
import { adminConfigError, isAuthorized, json, unauthorized } from "./_auth.js";

const CANONICAL_ORIGIN = "https://jerseysfrmjb.com";
const MARKETPLACE_HOSTS = {
  eBay: ["ebay.com"],
  Depop: ["depop.com"]
};

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

function hostnameMatches(hostname, allowed) {
  const normalized = String(hostname || "").toLowerCase();
  return allowed.some(domain => normalized === domain || normalized.endsWith(`.${domain}`));
}

function normalizedUrl(value, origin = CANONICAL_ORIGIN) {
  try {
    const url = new URL(String(value || ""), origin);
    return url.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, method = "HEAD") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        Accept: method === "HEAD" ? "*/*" : "image/*,*/*;q=0.2",
        "User-Agent": "JerseysFrmJB-Catalog-Health/1.0",
        ...(method === "GET" ? { Range: "bytes=0-0" } : {})
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

async function inspectUrl(target) {
  const url = normalizedUrl(target.url);
  if (!url) return { ...target, status: "broken", detail: "Invalid or non-HTTPS URL" };

  if (target.kind === "image") {
    const allowedHosts = ["jerseysfrmjb.com", "pages.dev"];
    if (!hostnameMatches(url.hostname, allowedHosts)) {
      return { ...target, url: url.href, status: "warning", detail: "Image uses an unapproved external host" };
    }
  } else if (!hostnameMatches(url.hostname, MARKETPLACE_HOSTS[target.marketplace] || [])) {
    return { ...target, url: url.href, status: "broken", detail: `URL is not on ${target.marketplace}` };
  }

  try {
    let response = await fetchWithTimeout(url.href, "HEAD");
    if (response.status === 405 || response.status === 501) {
      response = await fetchWithTimeout(url.href, "GET");
    }
    const contentType = response.headers.get("content-type") || "";
    if (target.kind === "image" && response.ok && contentType && !contentType.toLowerCase().startsWith("image/")) {
      return { ...target, url: url.href, status: "warning", http_status: response.status, detail: "URL did not return an image" };
    }
    if (response.ok || (response.status >= 300 && response.status < 400)) {
      return { ...target, url: url.href, status: "healthy", http_status: response.status, detail: "Reachable" };
    }
    if (target.kind === "marketplace" && [401, 403, 429].includes(response.status)) {
      return {
        ...target,
        url: url.href,
        status: "protected",
        http_status: response.status,
        detail: "Marketplace blocked the automated check; verify manually"
      };
    }
    return {
      ...target,
      url: url.href,
      status: [404, 410].includes(response.status) ? "broken" : "warning",
      http_status: response.status,
      detail: `Returned HTTP ${response.status}`
    };
  } catch (error) {
    return {
      ...target,
      url: url.href,
      status: "warning",
      detail: error?.name === "AbortError" ? "Timed out" : "Could not be reached"
    };
  }
}

async function inspectInBatches(targets, batchSize = 6) {
  const uniqueTargets = [];
  const targetGroups = new Map();
  for (const target of targets) {
    const key = `${target.kind}|${target.marketplace || ""}|${target.url}`;
    if (!targetGroups.has(key)) {
      targetGroups.set(key, []);
      uniqueTargets.push({ ...target, check_key: key });
    }
    targetGroups.get(key).push(target);
  }
  const uniqueResults = [];
  for (let index = 0; index < uniqueTargets.length; index += batchSize) {
    uniqueResults.push(...await Promise.all(uniqueTargets.slice(index, index + batchSize).map(inspectUrl)));
  }
  return uniqueResults.flatMap(result => (targetGroups.get(result.check_key) || []).map(target => ({
    ...target,
    url: result.url,
    status: result.status,
    http_status: result.http_status,
    detail: result.detail
  })));
}

export async function onRequestGet({ request, env }) {
  try {
    const configError = adminConfigError(env, { requireDb: true });
    if (configError) return configError;
    if (!(await isAuthorized(request, env))) return unauthorized();
    await ensureInventory(env);

    const result = await env.DB.prepare(`
      SELECT id, name, photos, links
      FROM inventory
      ORDER BY name
    `).all();
    const products = result.results || [];
    const targets = [];
    const missing = [];

    for (const product of products) {
      const photos = parseJson(product.photos, []);
      const links = parseJson(product.links, {});
      const imageUrls = [...new Set(photos.map(photo => String(photo?.src || "").trim()).filter(Boolean))];
      if (!imageUrls.length) {
        missing.push({
          product_id: product.id,
          product_name: product.name,
          kind: "image",
          label: "Product image",
          status: "missing",
          detail: "No product image is saved"
        });
      }
      imageUrls.forEach((url, index) => targets.push({
        product_id: product.id,
        product_name: product.name,
        kind: "image",
        label: index === 0 ? "Front image" : index === 1 ? "Back image" : `Image ${index + 1}`,
        url
      }));

      for (const [marketplace, key] of [["eBay", "ebay"], ["Depop", "depop"]]) {
        const url = String(links?.[key] || "").trim();
        if (!url) {
          missing.push({
            product_id: product.id,
            product_name: product.name,
            kind: "marketplace",
            marketplace,
            label: `${marketplace} link`,
            status: "missing",
            detail: `No ${marketplace} link is saved`
          });
        } else {
          targets.push({
            product_id: product.id,
            product_name: product.name,
            kind: "marketplace",
            marketplace,
            label: `${marketplace} link`,
            url
          });
        }
      }
    }

    const checked = await inspectInBatches(targets);
    const items = [...checked, ...missing];
    const summary = items.reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, { healthy: 0, broken: 0, warning: 0, protected: 0, missing: 0 });

    return json({
      checked_at: new Date().toISOString(),
      products: products.length,
      summary,
      items
    }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    return json({ error: `Catalog health check failed: ${error?.message || "Unknown error"}` }, 500);
  }
}
