import {
  categoryLabel,
  extractSeason,
  inferCompetition,
  inferProductIdentity,
  productLandingUrl,
  slugifySeo
} from "./api/catalog/_products.js";

const DEFAULT_SITE_ORIGIN = "https://jerseysfrmjb.com";
const SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const SIZE_LABELS = {
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "XL",
  "2XL": "2XL",
  "3XL": "3XL",
  "4XL": "4XL"
};

function parseJson(value, fallback) {
  if (value && typeof value === "object") return value;
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

export function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]
  );
}

function jsonForHtml(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function normalizeSiteOrigin(value = "") {
  try {
    const url = new URL(value || DEFAULT_SITE_ORIGIN);
    return url.protocol === "https:" ? url.origin : DEFAULT_SITE_ORIGIN;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function numericPrice(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function absoluteImageUrl(value, siteOrigin, revision = "") {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value.trim(), `${siteOrigin}/`);
    if (url.protocol !== "https:") return "";
    if (url.origin === siteOrigin && revision) url.searchParams.set("v", revision);
    return url.toString();
  } catch {
    return "";
  }
}

function availableSizes(row = {}) {
  const sizes = parseJson(row.sizes_json, row.sizes || {});
  const active = SIZE_ORDER.filter(size => Number(sizes?.[size]) > 0);
  if (active.length) return active.map(size => ({ name: size, label: SIZE_LABELS[size] || size }));
  if (Number(row.quantity) <= 0) return [];
  const text = String(row.size || "");
  return SIZE_ORDER
    .filter(size => {
      if (size === "S") return /\b(?:s|small)\b/i.test(text);
      if (size === "M") return /\b(?:m|medium)\b/i.test(text);
      if (size === "L") return /\b(?:l|large)\b/i.test(text);
      return new RegExp(`\\b${size.replace("XL", "\\s*XL")}\\b`, "i").test(text);
    })
    .map(size => ({ name: size, label: SIZE_LABELS[size] || size }));
}

function imageAlt(product, side) {
  const details = [
    product.identity.player,
    product.identity.teamCountry,
    product.season,
    product.title.match(/\b(home|away|third|3rd|goalkeeper|training)\b/i)?.[1],
    "soccer jersey",
    `${side} view`
  ].filter(Boolean);
  return [...new Set(details.map(detail => String(detail).trim()))].join(" ");
}

function productImages(row, product, siteOrigin) {
  const revision = String(row.updated_at || "").replace(/\D/g, "") || "seo1";
  const photos = parseJson(row.photos, [])
    .map(photo => ({
      src: absoluteImageUrl(photo?.src, siteOrigin, revision),
      label: `${photo?.src || ""} ${photo?.alt || ""}`.toLowerCase()
    }))
    .filter(photo => photo.src);
  const front = photos.find(photo => /\bfront\b/.test(photo.label)) || photos[0] || null;
  const back = photos.find(photo => photo.src !== front?.src && /\bback\b/.test(photo.label))
    || photos.find(photo => photo.src !== front?.src)
    || null;
  return {
    front: front ? { src: front.src, alt: imageAlt(product, "front") } : null,
    back: back ? { src: back.src, alt: imageAlt(product, "back") } : null
  };
}

function marketplaceUrl(value, hosts) {
  if (!value) return "";
  try {
    const url = new URL(String(value));
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    return url.protocol === "https:" && hosts.some(host => hostname === host || hostname.endsWith(`.${host}`))
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function categoryDetails(category = "") {
  if (category === "world") return { label: "International Team Jerseys", href: "/worldcup-jerseys" };
  if (category === "retro") return { label: "Retro Jerseys", href: "/retro-jerseys" };
  return { label: "Club Jerseys", href: "/club-jerseys" };
}

export function buildSeoProduct(row = {}, options = {}) {
  const id = String(row.id || "").trim();
  const title = String(row.name || "").trim();
  if (!id || !title) return null;
  const siteOrigin = normalizeSiteOrigin(options.siteOrigin);
  const inferred = inferProductIdentity(title);
  const product = {
    id,
    title,
    siteOrigin,
    canonicalUrl: productLandingUrl(id, siteOrigin),
    category: categoryDetails(row.category),
    categoryKey: String(row.category || ""),
    identity: {
      player: inferred.player,
      teamCountry: inferred.team_country
    },
    competition: inferCompetition(title, row.category),
    season: extractSeason(title),
    sizes: availableSizes(row),
    available: Number(row.quantity) > 0,
    updatedAt: row.updated_at || "",
    marketplaces: [],
    images: { front: null, back: null }
  };
  const links = parseJson(row.links, {});
  const marketplaceDefinitions = [
    {
      name: "Depop",
      price: numericPrice(row.depop_price),
      link: marketplaceUrl(links.depop, ["depop.com"])
    },
    {
      name: "eBay",
      price: numericPrice(row.ebay_price),
      link: marketplaceUrl(links.ebay, ["ebay.com", "ebay.us"])
    }
  ];
  product.marketplaces = marketplaceDefinitions.filter(item => item.price !== null || item.link);
  product.primaryPrice = marketplaceDefinitions.map(item => item.price)
    .concat([numericPrice(row.website_price), numericPrice(row.base_price)])
    .find(price => price !== null) ?? null;
  product.images = productImages(row, product, siteOrigin);
  return product;
}

export async function loadSeoRows(env) {
  const result = await env.DB.prepare(`
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
      website_prices.price AS website_price
    FROM inventory
    LEFT JOIN product_platform_prices AS depop_prices
      ON depop_prices.product_id = inventory.id
      AND depop_prices.platform = 'Depop'
    LEFT JOIN product_platform_prices AS ebay_prices
      ON ebay_prices.product_id = inventory.id
      AND ebay_prices.platform = 'eBay'
    LEFT JOIN product_platform_prices AS website_prices
      ON website_prices.product_id = inventory.id
      AND website_prices.platform = 'Website'
    ORDER BY inventory.category, inventory.sort_order, inventory.name
  `).all();
  return result.results || [];
}

export function buildSeoProducts(rows = [], options = {}) {
  return rows.map(row => buildSeoProduct(row, options)).filter(product => product?.images?.front);
}

function uniqueBySlug(values = []) {
  const map = new Map();
  for (const value of values.filter(Boolean)) {
    const slug = slugifySeo(value);
    if (slug && !map.has(slug)) map.set(slug, { name: value, slug });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function entityCollections(products = []) {
  return {
    teams: uniqueBySlug(products.map(product => product.identity.teamCountry)),
    players: uniqueBySlug(products.map(product => product.identity.player)),
    competitions: uniqueBySlug(products.map(product => product.competition))
  };
}

export function entityProducts(products = [], kind, slug) {
  const key = String(slug || "").toLowerCase();
  return products.filter(product => {
    if (kind === "teams") return slugifySeo(product.identity.teamCountry) === key;
    if (kind === "players") return slugifySeo(product.identity.player) === key;
    if (kind === "competitions") return slugifySeo(product.competition) === key;
    return false;
  });
}

export function relatedProducts(current, products = [], limit = 6) {
  if (!current) return [];
  return products
    .filter(product => product.id !== current.id && product.available)
    .map(product => {
      let score = 0;
      if (current.identity.teamCountry && product.identity.teamCountry === current.identity.teamCountry) score += 100;
      if (current.identity.player && product.identity.player === current.identity.player) score += 60;
      if (current.competition && product.competition === current.competition) score += 30;
      if (product.categoryKey === current.categoryKey) score += 15;
      if (current.season && product.season === current.season) score += 5;
      return { product, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title))
    .slice(0, limit)
    .map(result => result.product);
}

function entityHref(kind, name) {
  if (!name) return "";
  return `/${kind}/${slugifySeo(name)}`;
}

function kindLabel(kind) {
  if (kind === "teams") return "Team";
  if (kind === "players") return "Player";
  return "Competition";
}

function entityName(products, kind) {
  const first = products[0];
  if (!first) return "";
  if (kind === "teams") return first.identity.teamCountry;
  if (kind === "players") return first.identity.player;
  return first.competition;
}

function joinNatural(values = [], limit = 4) {
  const list = [...new Set(values.filter(Boolean))].slice(0, limit);
  if (list.length < 2) return list[0] || "";
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list.at(-1)}`;
}

function collectionIntroduction(products, kind, name) {
  const teams = joinNatural(products.map(product => product.identity.teamCountry), 3);
  const players = joinNatural(products.map(product => product.identity.player), 4);
  const seasons = joinNatural(products.map(product => product.season), 3);
  const designs = joinNatural(products.map(product => product.title), 2);
  const variant = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 3;
  if (kind === "teams") {
    const variants = [
      `Explore the current ${name} jersey selection, led by ${designs}. ${players ? `Featured names include ${players}. ` : ""}Open each permanent product page for photos, available sizes, and secure Shopify checkout.`,
      `Find ${name} shirts from ${seasons || "recent and classic seasons"} in the live JerseysFrmJB inventory. The collection currently includes ${designs}${players ? ` and designs associated with ${players}` : ""}, with individual pages for sizing and secure website checkout.`,
      `${name} supporters can browse ${designs} in this inventory-backed collection. ${players ? `The available lineup features ${players}. ` : ""}Every jersey links to its own page with front and back photos, size availability, and current buying options.`
    ];
    return variants[variant];
  }
  if (kind === "players") {
    const variants = [
      `Browse ${name} jerseys connected with ${teams || "club and international football"}, including ${designs}. Compare front and back photos, available sizes, and secure Shopify checkout on each jersey page.`,
      `The live ${name} collection currently features ${designs}${teams ? ` across ${teams}` : ""}. Use the permanent product links to check sizing, photos, and secure website checkout.`,
      `Shop the current ${name} selection from ${seasons || "featured football seasons"}: ${designs}. Each matching jersey has a dedicated page with team details, available sizes, imagery, and current buying options.`
    ];
    return variants[variant];
  }
  const variants = [
    `Shop jerseys connected with the ${name}, including ${designs}. The live selection features ${teams || "international teams"}${players ? ` and players such as ${players}` : ""}, with direct links to each matching jersey page.`,
    `Explore the ${name} through current JerseysFrmJB inventory such as ${designs}. Browse teams including ${teams || "international sides"} and open each product page for photos, sizing, and secure Shopify checkout.`,
    `The ${name} collection brings together ${designs}${players ? `, featuring ${players}` : ""}. Inventory-backed product pages show every matching jersey, available size, and current buying options.`
  ];
  return variants[variant];
}

function collectionFaqs(kind, name) {
  const subject = kind === "players" ? `${name} jerseys` : `${name} jerseys`;
  return [
    {
      question: `How do I check sizing for ${subject}?`,
      answer: "Open a jersey page to see the sizes that are currently available, then compare them with the JerseysFrmJB size guide before purchasing."
    },
    {
      question: "Where is payment completed?",
      answer: "Available jerseys can be purchased directly through JerseysFrmJB using secure Shopify checkout. Depop and eBay remain available when their listings are linked."
    }
  ];
}

function productCard(product) {
  const prices = product.marketplaces
    .filter(marketplace => marketplace.price !== null)
    .map(marketplace => `${marketplace.name} $${marketplace.price.toFixed(2)}`)
    .join(" · ");
  const sizes = product.sizes.map(size => size.label).join(", ");
  return `
    <article
      class="seo-product-card"
      data-meta-product="true"
      data-product-id="${escapeHtml(product.id)}"
      data-product-name="${escapeHtml(product.title)}"
      data-product-value="${product.primaryPrice === null ? "" : escapeHtml(product.primaryPrice.toFixed(2))}"
      data-product-category="${escapeHtml(product.category.label)}"
      data-product-availability="${product.available ? "in stock" : "out of stock"}"
    >
      <a class="seo-product-image" href="${escapeHtml(product.canonicalUrl)}">
        <img src="${escapeHtml(product.images.front.src)}" alt="${escapeHtml(product.images.front.alt)}" title="${escapeHtml(product.images.front.alt)}" width="1280" height="1280" loading="lazy" decoding="async">
      </a>
      <div class="seo-product-card-copy">
        <span>${escapeHtml(product.category.label)}</span>
        <h2><a href="${escapeHtml(product.canonicalUrl)}">${escapeHtml(product.title)}</a></h2>
        <a class="product-details-button" href="${escapeHtml(product.canonicalUrl)}" aria-label="View jersey details for ${escapeHtml(product.title)}">View Jersey Details <span aria-hidden="true">&rarr;</span></a>
        <p>${product.available ? `Available sizes: ${escapeHtml(sizes)}` : "Sold out"}</p>
        ${prices ? `<strong>${escapeHtml(prices)}</strong>` : ""}
      </div>
    </article>`;
}

function entityLinks(products, kind) {
  const groups = [];
  if (kind !== "teams") {
    const teams = uniqueBySlug(products.map(product => product.identity.teamCountry));
    if (teams.length) groups.push({ label: "Teams and countries", kind: "teams", values: teams });
  }
  if (kind !== "players") {
    const players = uniqueBySlug(products.map(product => product.identity.player));
    if (players.length) groups.push({ label: "Players", kind: "players", values: players });
  }
  if (kind !== "competitions") {
    const competitions = uniqueBySlug(products.map(product => product.competition));
    if (competitions.length) groups.push({ label: "Competitions", kind: "competitions", values: competitions });
  }
  return groups.map(group => `
    <section>
      <h2>${escapeHtml(group.label)}</h2>
      <div class="seo-context-links">
        ${group.values.map(value => `<a href="/${group.kind}/${escapeHtml(value.slug)}">${escapeHtml(value.name)}</a>`).join("")}
      </div>
    </section>`).join("");
}

function collectionSchema(products, kind, name, canonicalUrl, description) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonicalUrl}#page`,
        url: canonicalUrl,
        name: `${name} Jerseys`,
        description,
        isPartOf: {
          "@type": "WebSite",
          name: "JerseysFrmJB",
          url: DEFAULT_SITE_ORIGIN
        },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.title,
            url: product.canonicalUrl,
            image: product.images.front.src
          }))
        }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: DEFAULT_SITE_ORIGIN
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop All",
            item: `${DEFAULT_SITE_ORIGIN}/shop-all`
          },
          {
            "@type": "ListItem",
            position: 3,
            name,
            item: canonicalUrl
          }
        ]
      }
    ]
  };
}

function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

function headerMarkup() {
  return `
    <header class="site-header">
      <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">&#9776;</button>
      <a class="site-name" href="/">Jerseysfrmjb</a>
      <nav class="desktop-nav">
        <a href="/">Home</a><a href="/shop-all">Shop All</a>
        <a href="/worldcup-jerseys">World Cup Jerseys</a><a href="/retro-jerseys">Retro Jerseys</a>
        <a href="/club-jerseys">Club Jerseys</a><a href="/size-guide">Size Guide</a>
      </nav>
    </header>
    <aside class="drawer" aria-hidden="true">
      <button class="drawer-close" type="button" aria-label="Close menu">&times;</button>
      <a href="/">Home</a><a href="/shop-all">Shop All</a>
      <a href="/worldcup-jerseys">World Cup Jerseys</a><a href="/retro-jerseys">Retro Jerseys</a>
      <a href="/club-jerseys">Club Jerseys</a><a href="/size-guide">Size Guide</a>
    </aside><div class="drawer-backdrop"></div>`;
}

function footerMarkup() {
  return `
    <footer class="site-footer"><div class="footer-shell">
      <div class="footer-brand"><img src="/assets/jerseysfrmjb-logo.jpg" alt="JerseysFrmJB logo" width="120" height="120" loading="lazy"><a class="footer-main" href="/">JerseysFrmJB</a><p>200+ Jerseys Sold</p><p>Based in Maryland</p></div>
      <nav class="footer-links" aria-label="Footer navigation">
        <section><h3>Shop</h3><a href="/shop-all">Shop All</a><a href="/worldcup-jerseys">World Cup Jerseys</a><a href="/club-jerseys">Club Jerseys</a><a href="/retro-jerseys">Retro Jerseys</a></section>
        <section><h3>Help</h3><a href="/size-guide">Size Guide</a><a href="/privacy">Privacy</a><a href="https://www.instagram.com/jerseysfrmjb/" target="_blank" rel="noopener">Message on Instagram</a></section>
        <section><h3>Marketplaces</h3><a href="https://www.ebay.com/usr/jerseysfrmjb" target="_blank" rel="noopener">eBay</a><a href="https://www.depop.com/jerseysfrmjb/" target="_blank" rel="noopener">Depop</a></section>
      </nav>
    </div></footer>`;
}

export function renderSeoCollectionPage(products, kind, options = {}) {
  const name = entityName(products, kind);
  if (!name) return "";
  const siteOrigin = normalizeSiteOrigin(options.siteOrigin);
  const slug = slugifySeo(name);
  const canonicalUrl = `${siteOrigin}/${kind}/${slug}`;
  const description = collectionIntroduction(products, kind, name);
  const faqs = collectionFaqs(kind, name);
  const schema = collectionSchema(products, kind, name, canonicalUrl, description);
  const heroImage = products[0]?.images?.front?.src || `${siteOrigin}/assets/jerseysfrmjb-logo.jpg`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(name)} Jerseys | JerseysFrmJB</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}">
  <meta property="og:type" content="website"><meta property="og:site_name" content="JerseysFrmJB">
  <meta property="og:title" content="${escapeHtml(name)} Jerseys | JerseysFrmJB">
  <meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(heroImage)}"><meta property="og:image:alt" content="${escapeHtml(`${name} jersey collection at JerseysFrmJB`)}">
  <meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(name)} Jerseys | JerseysFrmJB">
  <meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${escapeHtml(heroImage)}">
  <script type="application/ld+json">${jsonForHtml(schema)}</script>
  <script type="application/ld+json">${jsonForHtml(faqSchema(faqs))}</script>
  <link rel="stylesheet" href="/styles.css?v=checkout-promo-1"><link rel="stylesheet" href="/design-preview.css?v=mobile-grid-2">
  <script src="/meta-pixel.js?v=1" defer></script><script src="/analytics.js?v=conversion-funnel-1" defer></script><script src="/storefront.js?v=checkout-promo-1" defer></script>
</head>
<body class="seo-collection-body">
  ${headerMarkup()}
  <main class="seo-collection-main">
    <nav class="product-breadcrumbs" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><span>${escapeHtml(kindLabel(kind))}</span><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(name)}</span></nav>
    <header class="seo-collection-hero"><span>${escapeHtml(kindLabel(kind))} collection</span><h1>${escapeHtml(name)} Jerseys</h1><p>${escapeHtml(description)}</p></header>
    <section class="seo-context-panel" aria-label="Explore related jersey collections">${entityLinks(products, kind)}</section>
    <section class="seo-product-grid" aria-label="${escapeHtml(name)} jerseys">${products.map(productCard).join("")}</section>
    <section class="seo-faq" aria-labelledby="seo-faq-heading"><span>Buying guide</span><h2 id="seo-faq-heading">${escapeHtml(name)} jersey questions</h2>${faqs.map(faq => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")}</section>
  </main>
  ${footerMarkup()}
</body>
</html>`;
}

export function renderSeoNotFound(siteOrigin = DEFAULT_SITE_ORIGIN) {
  const origin = normalizeSiteOrigin(siteOrigin);
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jersey Collection Not Found | JerseysFrmJB</title><meta name="robots" content="noindex,follow"><link rel="canonical" href="${escapeHtml(`${origin}/shop-all`)}"><link rel="stylesheet" href="/styles.css?v=checkout-promo-1"><script src="/meta-pixel.js?v=1" defer></script><script src="/analytics.js?v=conversion-funnel-1" defer></script><script src="/storefront.js?v=checkout-promo-1" defer></script></head><body class="product-page-body">${headerMarkup()}<main class="product-page-main"><section class="product-not-found"><span>Collection update</span><h1>That jersey collection is not available.</h1><p>Browse the current inventory to find another team, player, or competition.</p><a href="/shop-all">Browse Current Jerseys</a></section></main>${footerMarkup()}</body></html>`;
}

export function entityLink(kind, name) {
  return entityHref(kind, name);
}
