import {
  buildSeoProducts,
  entityCollections,
  loadSeoRows,
  normalizeSiteOrigin
} from "./_seo.js";

const STATIC_PAGES = [
  "/",
  "/shop-all",
  "/worldcup-jerseys",
  "/club-jerseys",
  "/retro-jerseys",
  "/size-guide",
  "/privacy"
];

function xmlEscape(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;"
    })[character]
  );
}

function lastModified(value = "") {
  if (!value) return "";
  const normalized = String(value).includes("T") ? String(value) : `${value}Z`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function sitemapEntry(url, options = {}) {
  const images = (options.images || []).filter(image => image?.src);
  return `  <url>
    <loc>${xmlEscape(url)}</loc>${options.lastmod ? `
    <lastmod>${xmlEscape(options.lastmod)}</lastmod>` : ""}${images.map(image => `
    <image:image>
      <image:loc>${xmlEscape(image.src)}</image:loc>
      <image:title>${xmlEscape(image.alt)}</image:title>
      <image:caption>${xmlEscape(image.alt)}</image:caption>
    </image:image>`).join("")}
  </url>`;
}

export async function onRequestGet(context) {
  if (!context?.env?.DB) {
    return new Response("Sitemap database is unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  try {
    const origin = normalizeSiteOrigin(context.env.CATALOG_SITE_ORIGIN || context.request.url);
    const rows = await loadSeoRows(context.env);
    const products = buildSeoProducts(rows, { siteOrigin: origin });
    const entities = entityCollections(products);
    const entries = [
      ...STATIC_PAGES.map(path => sitemapEntry(new URL(path, origin).toString())),
      ...entities.teams.map(entity => sitemapEntry(`${origin}/teams/${entity.slug}`)),
      ...entities.players.map(entity => sitemapEntry(`${origin}/players/${entity.slug}`)),
      ...entities.competitions.map(entity => sitemapEntry(`${origin}/competitions/${entity.slug}`)),
      ...products.map(product => sitemapEntry(product.canonicalUrl, {
        lastmod: lastModified(product.updatedAt),
        images: [product.images.front, product.images.back]
      }))
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries.join("\n")}
</urlset>
`;
    return new Response(xml, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=60",
        "Content-Type": "application/xml; charset=utf-8",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return new Response("Sitemap is temporarily unavailable.", {
      status: 500,
      headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}
