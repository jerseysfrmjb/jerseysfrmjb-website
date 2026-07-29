import {
  buildSeoProducts,
  entityProducts,
  loadSeoRows,
  normalizeSiteOrigin,
  renderSeoCollectionPage,
  renderSeoNotFound
} from "./_seo.js";

const CACHE_CONTROL = "public, max-age=60, s-maxage=120, stale-while-revalidate=30";

function htmlResponse(body, status = 200, cacheControl = CACHE_CONTROL) {
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

export async function seoCollectionResponse(context, kind) {
  const origin = normalizeSiteOrigin(context?.env?.CATALOG_SITE_ORIGIN || context?.request?.url);
  if (!context?.env?.DB) {
    return htmlResponse(renderSeoNotFound(origin), 503, "no-store");
  }

  const slug = String(context.params?.slug || "").trim().toLowerCase();
  if (!slug || slug.length > 100 || !/^[a-z0-9-]+$/.test(slug)) {
    return htmlResponse(renderSeoNotFound(origin), 404, "no-store");
  }

  try {
    const rows = await loadSeoRows(context.env);
    const products = buildSeoProducts(rows, { siteOrigin: origin });
    const matches = entityProducts(products, kind, slug);
    if (!matches.length) return htmlResponse(renderSeoNotFound(origin), 404, "no-store");
    return htmlResponse(renderSeoCollectionPage(matches, kind, { siteOrigin: origin }));
  } catch {
    return htmlResponse(renderSeoNotFound(origin), 500, "no-store");
  }
}
