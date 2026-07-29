import {
  buildProductPageModel,
  renderProductNotFound,
  renderProductPage
} from "./_page.js";
import {
  buildSeoProducts,
  loadSeoRows,
  relatedProducts
} from "../_seo.js";

const DEFAULT_SITE_ORIGIN = "https://jerseysfrmjb.com";
const PRODUCT_PAGE_CACHE = "public, max-age=60, s-maxage=120, stale-while-revalidate=30";

function siteOrigin(context) {
  try {
    const configured = new URL(context.env.CATALOG_SITE_ORIGIN || context.request.url);
    return configured.protocol === "https:" ? configured.origin : DEFAULT_SITE_ORIGIN;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function htmlResponse(body, status = 200, cacheControl = PRODUCT_PAGE_CACHE) {
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": cacheControl,
      "Content-Type": "text/html; charset=utf-8",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

async function loadProduct(env, id) {
  return env.DB.prepare(`
    SELECT
      inventory.id,
      inventory.category,
      inventory.name,
      inventory.size,
      inventory.sizes_json,
      inventory.price AS base_price,
      inventory.quantity,
      inventory.photos,
      inventory.links,
      inventory.updated_at,
      depop_prices.price AS depop_price,
      ebay_prices.price AS ebay_price,
      facebook_prices.price AS facebook_price,
      website_prices.price AS website_price
    FROM inventory
    LEFT JOIN product_platform_prices AS depop_prices
      ON depop_prices.product_id = inventory.id
      AND depop_prices.platform = 'Depop'
    LEFT JOIN product_platform_prices AS ebay_prices
      ON ebay_prices.product_id = inventory.id
      AND ebay_prices.platform = 'eBay'
    LEFT JOIN product_platform_prices AS facebook_prices
      ON facebook_prices.product_id = inventory.id
      AND facebook_prices.platform = 'Facebook'
    LEFT JOIN product_platform_prices AS website_prices
      ON website_prices.product_id = inventory.id
      AND website_prices.platform = 'Website'
    WHERE inventory.id = ?
    LIMIT 1
  `).bind(id).first();
}

async function loadReviewSummary(env, row) {
  try {
    const links = JSON.parse(row.links || "{}");
    const ebayItemId = String(links?.ebay || "").match(/\b(\d{9,})\b/)?.[1] || "";
    if (!ebayItemId) return null;
    const summary = await env.DB.prepare(`
      SELECT COUNT(*) AS count, AVG(star_rating) AS rating
      FROM ebay_feedback
      WHERE marketplace = 'ebay'
        AND moderation_status = 'approved'
        AND visibility_status = 'active'
        AND rating_type = 'POSITIVE'
        AND item_id = ?
    `).bind(ebayItemId).first();
    const count = Number(summary?.count || 0);
    const rating = Number(summary?.rating || 0);
    return count > 0 && rating > 0 ? { count, rating } : null;
  } catch {
    return null;
  }
}

export async function onRequestGet(context) {
  const origin = siteOrigin(context);
  if (!context?.env?.DB) {
    return htmlResponse(
      renderProductNotFound(origin),
      503,
      "no-store"
    );
  }

  const id = String(context.params?.slug || "").trim();
  if (!id || id.length > 180 || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return htmlResponse(renderProductNotFound(origin), 404, "no-store");
  }

  try {
    const row = await loadProduct(context.env, id);
    if (!row) return htmlResponse(renderProductNotFound(origin), 404, "no-store");

    let recommendations = [];
    try {
      const seoRows = await loadSeoRows(context.env);
      const seoProducts = buildSeoProducts(seoRows, { siteOrigin: origin });
      const current = seoProducts.find(product => product.id === id);
      recommendations = relatedProducts(current, seoProducts, 6);
    } catch {
      recommendations = [];
    }

    const reviewSummary = await loadReviewSummary(context.env, row);
    const model = buildProductPageModel(row, {
      siteOrigin: origin,
      relatedProducts: recommendations,
      reviewSummary
    });
    if (!model?.images?.front) {
      return htmlResponse(renderProductNotFound(origin), 404, "no-store");
    }
    return htmlResponse(renderProductPage(model));
  } catch {
    return htmlResponse(renderProductNotFound(origin), 500, "no-store");
  }
}
