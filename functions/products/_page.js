import {
  extractSeason,
  inferCompetition,
  inferProductIdentity,
  productLandingUrl,
  slugifySeo
} from "../api/catalog/_products.js";

const DEFAULT_SITE_ORIGIN = "https://jerseysfrmjb.com";
const SIZE_ORDER = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
const SIZE_LABELS = {
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "Extra Large",
  "2XL": "2XL",
  "3XL": "3XL",
  "4XL": "4XL"
};
const SIZE_WORDS = [
  ["4XL", /4\s*x\s*l/i],
  ["3XL", /3\s*x\s*l/i],
  ["2XL", /2\s*x\s*l|xxl/i],
  ["XL", /\bxl\b|extra\s+large/i],
  ["L", /\bl\b|\blarge\b/i],
  ["M", /\bm\b|\bmedium\b/i],
  ["S", /\bs\b|\bsmall\b/i]
];
const MARKETPLACES = [
  {
    name: "Depop",
    key: "depop",
    icon: "\u{1F6CD}",
    hosts: ["depop.com"]
  },
  {
    name: "eBay",
    key: "ebay",
    icon: "\u{1F6D2}",
    hosts: ["ebay.com"]
  }
];

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

function escapeHtml(value = "") {
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

function normalizeSiteOrigin(value = "") {
  try {
    const url = new URL(value || DEFAULT_SITE_ORIGIN);
    return url.protocol === "https:" ? url.origin : DEFAULT_SITE_ORIGIN;
  } catch {
    return DEFAULT_SITE_ORIGIN;
  }
}

function numericPrice(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function formatPrice(value) {
  return numericPrice(value)?.toFixed(2) || "";
}

function normalizeSizes(raw = {}, fallbackSize = "", fallbackQuantity = 0) {
  const sizes = {};
  for (const size of SIZE_ORDER) {
    const quantity = Math.max(0, Math.floor(Number(raw?.[size] || 0)));
    if (quantity > 0) sizes[size] = quantity;
  }

  if (!Object.keys(sizes).length && Number(fallbackQuantity) > 0) {
    const matches = SIZE_WORDS
      .filter(([, pattern]) => pattern.test(String(fallbackSize)))
      .map(([size]) => size);
    if (matches.length) {
      const quantity = Math.max(1, Math.floor(Number(fallbackQuantity) / matches.length));
      for (const size of matches) sizes[size] = quantity;
    }
  }

  return sizes;
}

function totalQuantity(sizes = {}, fallbackQuantity = 0) {
  const sizeTotal = SIZE_ORDER.reduce(
    (total, size) => total + Math.max(0, Math.floor(Number(sizes[size] || 0))),
    0
  );
  return sizeTotal || Math.max(0, Math.floor(Number(fallbackQuantity || 0)));
}

function categoryDetails(category = "") {
  if (category === "world") {
    return {
      label: "International Team Jersey",
      href: "/worldcup-jerseys"
    };
  }
  if (category === "retro") {
    return {
      label: "Retro Jersey",
      href: "/retro-jerseys"
    };
  }
  return {
    label: "Club Jersey",
    href: "/club-jerseys"
  };
}

function imageRevision(value = "") {
  return String(value || "").replace(/\D/g, "") || "product1";
}

function absoluteImageUrl(value, siteOrigin, revision) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value.trim(), `${siteOrigin}/`);
    if (url.protocol !== "https:") return "";
    if (url.origin === siteOrigin) url.searchParams.set("v", revision);
    return url.toString();
  } catch {
    return "";
  }
}

function descriptiveImageAlt(row, identity, season, side) {
  const details = [
    identity.player,
    identity.team_country,
    season,
    String(row.name || "").match(/\b(home|away|third|3rd|goalkeeper|training)\b/i)?.[1],
    "soccer jersey",
    `${side} view`
  ].filter(Boolean);
  return [...new Set(details.map(detail => String(detail).trim()))].join(" ");
}

function productImages(row, siteOrigin, identity, season) {
  const revision = imageRevision(row.updated_at);
  const photos = (Array.isArray(row.photos) ? row.photos : parseJson(row.photos, []))
    .map(photo => ({
      src: absoluteImageUrl(photo?.src, siteOrigin, revision),
      alt: String(photo?.alt || row.name || "Jersey").trim(),
      label: `${photo?.src || ""} ${photo?.alt || ""}`.toLowerCase()
    }))
    .filter(photo => photo.src);

  const front = photos.find(photo => /\bfront\b/.test(photo.label)) || photos[0] || null;
  const back = photos.find(photo => photo.src !== front?.src && /\bback\b/.test(photo.label))
    || photos.find(photo => photo.src !== front?.src)
    || null;

  return {
    front: front ? { ...front, alt: descriptiveImageAlt(row, identity, season, "front") } : null,
    back: back ? { ...back, alt: descriptiveImageAlt(row, identity, season, "back") } : null
  };
}

function marketplaceUrl(value, allowedHosts) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const allowed = allowedHosts.some(host => hostname === host || hostname.endsWith(`.${host}`));
    return url.protocol === "https:" && allowed ? url.toString() : "";
  } catch {
    return "";
  }
}

function selectedMetaPrice(row) {
  return [
    row.facebook_price,
    row.website_price,
    row.base_price
  ].map(numericPrice).find(value => value !== null) ?? null;
}

function synchronizedMarketplacePrices(row) {
  const savedDepop = numericPrice(row.depop_price);
  const savedEbay = numericPrice(row.ebay_price);
  const fallback = numericPrice(row.base_price);
  const depop = savedDepop ?? (savedEbay === null ? fallback : Math.max(0, savedEbay - 5));
  return {
    Depop: depop,
    eBay: depop === null ? savedEbay : depop + 5
  };
}

function productDescription(row, identity, category, availableSizes, available) {
  const details = [
    row.name,
    category.label,
    identity.team_country,
    identity.player ? `Player: ${identity.player}` : "",
    available
      ? `Available sizes: ${availableSizes.map(size => size.label).join(", ")}`
      : "Currently sold out"
  ].filter(Boolean);
  return `${details.join(". ")}. Browse current marketplace availability from JerseysFrmJB.`;
}

export function buildProductPageModel(row = {}, options = {}) {
  const id = String(row.id || "").trim();
  const title = String(row.name || "").trim();
  const siteOrigin = normalizeSiteOrigin(options.siteOrigin);
  if (!id || !title) return null;

  const rawSizes = Array.isArray(row.sizes)
    ? row.sizes
    : parseJson(row.sizes_json, row.sizes || {});
  const sizes = normalizeSizes(rawSizes, row.size, row.quantity);
  const quantity = totalQuantity(sizes, row.quantity);
  const availableSizes = SIZE_ORDER
    .filter(size => Number(sizes[size]) > 0)
    .map(size => ({ name: size, label: SIZE_LABELS[size] || size }));
  const available = quantity > 0;
  const identity = inferProductIdentity(title);
  const season = extractSeason(title);
  const competition = inferCompetition(title, row.category);
  const category = categoryDetails(row.category);
  const images = productImages(row, siteOrigin, identity, season);
  const links = parseJson(row.links, row.links || {});
  const synchronizedPrices = synchronizedMarketplacePrices(row);
  const marketplaces = MARKETPLACES.flatMap(marketplace => {
    const price = synchronizedPrices[marketplace.name];
    const link = marketplaceUrl(links?.[marketplace.key], marketplace.hosts);
    if (price === null && !link) return [];
    return [{
      name: marketplace.name,
      icon: marketplace.icon,
      price,
      priceDisplay: price === null ? "" : price.toFixed(2),
      link
    }];
  });
  const canonicalUrl = productLandingUrl(id, siteOrigin);
  const description = productDescription(row, identity, category, availableSizes, available);
  const metaPrice = selectedMetaPrice(row);

  return {
    id,
    title,
    siteOrigin,
    canonicalUrl,
    description,
    category,
    identity: {
      player: identity.player || "Not specified",
      teamCountry: identity.team_country || "Not specified"
    },
    entityLinks: {
      player: identity.player ? `/players/${slugifySeo(identity.player)}` : "",
      team: identity.team_country ? `/teams/${slugifySeo(identity.team_country)}` : "",
      competition: competition ? `/competitions/${slugifySeo(competition)}` : ""
    },
    season,
    competition,
    available,
    availabilityUrl: available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    sizes: availableSizes,
    images,
    marketplaces,
    metaPrice,
    metaPriceDisplay: metaPrice === null ? "" : metaPrice.toFixed(2),
    relatedProducts: Array.isArray(options.relatedProducts) ? options.relatedProducts : [],
    reviewSummary: options.reviewSummary || null
  };
}

function structuredProduct(model) {
  const offers = model.marketplaces.flatMap(marketplace => {
    if (marketplace.price === null || !marketplace.link) return [];
    return [{
      "@type": "Offer",
      name: `Buy on ${marketplace.name}`,
      url: marketplace.link,
      price: marketplace.priceDisplay,
      priceCurrency: "USD",
      availability: model.availabilityUrl,
      seller: {
        "@type": "Organization",
        name: "JerseysFrmJB",
        url: model.siteOrigin
      }
    }];
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${model.canonicalUrl}#product`,
    url: model.canonicalUrl,
    sku: model.id,
    name: model.title,
    description: model.description,
    image: [
      model.images.front && {
        "@type": "ImageObject",
        contentUrl: model.images.front.src,
        name: model.images.front.alt,
        caption: model.images.front.alt,
        representativeOfPage: true
      },
      model.images.back && {
        "@type": "ImageObject",
        contentUrl: model.images.back.src,
        name: model.images.back.alt,
        caption: model.images.back.alt
      }
    ].filter(Boolean),
    category: model.category.label,
    size: model.sizes.map(size => size.name),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Player",
        value: model.identity.player
      },
      {
        "@type": "PropertyValue",
        name: "Team or country",
        value: model.identity.teamCountry
      },
      {
        "@type": "PropertyValue",
        name: "Available sizes",
        value: model.sizes.length
          ? model.sizes.map(size => size.label).join(", ")
          : "Sold out"
      }
    ]
  };
  if (offers.length) schema.offers = offers;
  if (model.reviewSummary?.count > 0 && Number(model.reviewSummary.rating) > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(model.reviewSummary.rating).toFixed(1),
      reviewCount: Number(model.reviewSummary.count)
    };
  }
  return schema;
}

function imageMarkup(image, label, loading = "lazy") {
  if (!image) return "";
  return `
    <figure class="product-detail-photo">
      <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" title="${escapeHtml(image.alt)}" width="1280" height="1280" loading="${escapeHtml(loading)}" decoding="async"${loading === "eager" ? ' fetchpriority="high"' : ""}>
      <figcaption>${escapeHtml(label)}</figcaption>
    </figure>`;
}

function breadcrumbSchema(model) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: model.siteOrigin
      },
      {
        "@type": "ListItem",
        position: 2,
        name: model.category.label,
        item: `${model.siteOrigin}${model.category.href}`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: model.title,
        item: model.canonicalUrl
      }
    ]
  };
}

function productFaqs(model) {
  return [
    {
      question: `What sizes are available for the ${model.title}?`,
      answer: model.available
        ? `The currently available sizes are ${model.sizes.map(size => size.label).join(", ")}.`
        : "This jersey is currently sold out."
    },
    {
      question: "How should I choose a jersey size?",
      answer: "Use the JerseysFrmJB size guide and compare its measurements before opening the marketplace listing."
    },
    {
      question: "Where is checkout completed?",
      answer: "Checkout is completed on the linked Depop or eBay listing. JerseysFrmJB does not process payment on this product page."
    }
  ];
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

function linkedFact(label, value, href) {
  const content = href
    ? `<a href="${escapeHtml(href)}">${escapeHtml(value)}</a>`
    : escapeHtml(value);
  return `<div><dt>${escapeHtml(label)}</dt><dd>${content}</dd></div>`;
}

function relatedProductsMarkup(products = []) {
  if (!products.length) return "";
  return `
    <section class="product-related" aria-labelledby="related-heading">
      <div class="product-section-heading"><span>Keep browsing</span><h2 id="related-heading">Related jerseys</h2></div>
      <div class="product-related-grid">
        ${products.map(product => {
          const prices = product.marketplaces
            .filter(marketplace => marketplace.price !== null)
            .map(marketplace => `${marketplace.name} $${marketplace.price.toFixed(2)}`)
            .join(" · ");
          return `
            <article>
              <a class="product-related-image" href="${escapeHtml(product.canonicalUrl)}"><img src="${escapeHtml(product.images.front.src)}" alt="${escapeHtml(product.images.front.alt)}" title="${escapeHtml(product.images.front.alt)}" width="1280" height="1280" loading="lazy" decoding="async"></a>
              <div><span>${escapeHtml(product.category.label)}</span><h3><a href="${escapeHtml(product.canonicalUrl)}">${escapeHtml(product.title)}</a></h3><a class="product-details-button" href="${escapeHtml(product.canonicalUrl)}" aria-label="View jersey details for ${escapeHtml(product.title)}">View Jersey Details <span aria-hidden="true">&rarr;</span></a>${prices ? `<p>${escapeHtml(prices)}</p>` : ""}</div>
            </article>`;
        }).join("")}
      </div>
    </section>`;
}

function marketplaceMarkup(model) {
  if (!model.available) {
    return `
      <section class="product-marketplaces product-request-card product-page-request" aria-labelledby="marketplace-heading">
        <div class="product-section-heading">
          <span>Restock request</span>
          <h2 id="marketplace-heading">Want this jersey?</h2>
        </div>
        <p>Request a restock and tell us which size you need.</p>
        <button type="button" data-open-help data-help-request-type="restock_request">Request This Jersey</button>
      </section>`;
  }

  if (!model.marketplaces.length) {
    return `
      <section class="product-marketplaces" aria-labelledby="marketplace-heading">
        <div class="product-section-heading">
          <span>Marketplace checkout</span>
          <h2 id="marketplace-heading">Listings coming soon</h2>
        </div>
        <p class="product-marketplace-empty">No active Depop or eBay listing is linked yet.</p>
        <button class="product-marketplace-help" type="button" data-open-help data-help-request-type="jersey_request">Ask About This Jersey</button>
      </section>`;
  }

  return `
    <section class="product-marketplaces" aria-labelledby="marketplace-heading">
      <div class="product-section-heading">
        <span>Marketplace checkout</span>
        <h2 id="marketplace-heading">Available on</h2>
      </div>
      <div class="product-marketplace-list">
        ${model.marketplaces.map(marketplace => {
          let action = "";
          if (!model.available) {
            action = '<span class="platform-buy-button disabled" aria-disabled="true">Sold Out</span>';
          } else if (marketplace.link) {
            action = `<a class="platform-buy-button product-marketplace-button" href="${escapeHtml(marketplace.link)}" target="_blank" rel="noopener" data-analytics-product-id="${escapeHtml(model.id)}" data-analytics-product-name="${escapeHtml(model.title)}" data-analytics-marketplace="${escapeHtml(marketplace.name)}">Buy on ${escapeHtml(marketplace.name)}</a>`;
          }
          return `
            <article class="product-marketplace-option">
              <div>
                <span class="product-marketplace-name"><b aria-hidden="true">${escapeHtml(marketplace.icon)}</b>${escapeHtml(marketplace.name)}</span>
                ${marketplace.priceDisplay
                  ? `<strong>$${escapeHtml(marketplace.priceDisplay)}</strong>`
                  : '<small>See marketplace for price</small>'}
              </div>
              ${action || '<span class="product-listing-unavailable">Listing link unavailable</span>'}
            </article>`;
        }).join("")}
      </div>
    </section>`;
}

function headerMarkup() {
  return `
  <header class="site-header">
    <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false">&#9776;</button>
    <a class="site-name" href="/">Jerseysfrmjb</a>
    <nav class="desktop-nav">
      <a href="/">Home</a>
      <a class="active" href="/shop-all">Shop All</a>
      <a href="/worldcup-jerseys">World Cup Jerseys</a>
      <a href="/retro-jerseys">Retro Jerseys</a>
      <a href="/club-jerseys">Club Jerseys</a>
      <a href="/size-guide">Size Guide</a>
      <a href="/#contact-form">Contact</a>
    </nav>
  </header>
  <aside class="drawer" aria-hidden="true">
    <button class="drawer-close" type="button" aria-label="Close menu">&times;</button>
    <a href="/">Home</a>
    <a class="active" href="/shop-all">Shop All</a>
    <a href="/worldcup-jerseys">World Cup Jerseys</a>
    <a href="/retro-jerseys">Retro Jerseys</a>
    <a href="/club-jerseys">Club Jerseys</a>
    <a href="/size-guide">Size Guide</a>
    <a href="/#contact-form">Contact</a>
  </aside>
  <div class="drawer-backdrop"></div>`;
}

function footerMarkup() {
  return `
  <footer class="site-footer">
    <div class="footer-shell">
      <div class="footer-brand">
        <img src="/assets/jerseysfrmjb-logo.jpg" alt="JerseysFrmJB logo">
        <a class="footer-main" href="/">JerseysFrmJB</a>
        <p>200+ Jerseys Sold</p>
        <p>Based in Maryland</p>
      </div>
      <nav class="footer-links" aria-label="Footer navigation">
        <section>
          <h3>Shop</h3>
          <a href="/shop-all">Shop All</a>
          <a href="/worldcup-jerseys">World Cup Jerseys</a>
          <a href="/club-jerseys">Club Jerseys</a>
          <a href="/retro-jerseys">Retro Jerseys</a>
        </section>
        <section>
          <h3>Help</h3>
          <a href="/size-guide">Size Guide</a>
          <a href="/privacy">Privacy</a>
          <a href="https://www.instagram.com/jerseysfrmjb/" target="_blank" rel="noopener">Message on Instagram</a>
          <button class="footer-help-link" type="button" data-open-help>Jersey Requests</button>
        </section>
        <section>
          <h3>Marketplaces</h3>
          <a href="https://www.ebay.com/usr/jerseysfrmjb" target="_blank" rel="noopener"><i class="brand-icon ebay-icon">e</i>eBay</a>
          <a href="https://www.depop.com/jerseysfrmjb/" target="_blank" rel="noopener"><i class="brand-icon depop-icon">d</i>Depop</a>
          <a href="https://www.instagram.com/jerseysfrmjb/" target="_blank" rel="noopener"><i class="brand-icon instagram-icon">&#9678;</i>Instagram</a>
        </section>
      </nav>
    </div>
  </footer>`;
}

export function renderProductPage(model) {
  if (!model) return "";
  const schema = structuredProduct(model);
  const breadcrumbs = breadcrumbSchema(model);
  const faqs = productFaqs(model);
  const ogPrice = model.marketplaces.find(marketplace => marketplace.price !== null)?.priceDisplay || "";
  const stockMarkup = model.sizes.map(size => `
      <li>
        <strong>${escapeHtml(size.label)}</strong>
      </li>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(model.title)} | JerseysFrmJB</title>
  <meta name="description" content="${escapeHtml(model.description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(model.canonicalUrl)}">
  <link rel="icon" href="/assets/jerseysfrmjb-logo.jpg" type="image/jpeg">
  <link rel="apple-touch-icon" href="/assets/jerseysfrmjb-logo.jpg">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="JerseysFrmJB">
  <meta property="og:title" content="${escapeHtml(model.title)}">
  <meta property="og:description" content="${escapeHtml(model.description)}">
  <meta property="og:url" content="${escapeHtml(model.canonicalUrl)}">
  <meta property="og:image" content="${escapeHtml(model.images.front?.src || `${model.siteOrigin}/assets/jerseysfrmjb-logo.jpg`)}">
  <meta property="og:image:alt" content="${escapeHtml(model.images.front?.alt || model.title)}">
  ${model.images.back ? `<meta property="og:image" content="${escapeHtml(model.images.back.src)}">` : ""}
  <meta property="product:availability" content="${model.available ? "in stock" : "out of stock"}">
  ${ogPrice ? `<meta property="product:price:amount" content="${escapeHtml(ogPrice)}"><meta property="product:price:currency" content="USD">` : ""}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(model.title)}">
  <meta name="twitter:description" content="${escapeHtml(model.description)}">
  <meta name="twitter:image" content="${escapeHtml(model.images.front?.src || `${model.siteOrigin}/assets/jerseysfrmjb-logo.jpg`)}">
  <meta name="twitter:image:alt" content="${escapeHtml(model.images.front?.alt || model.title)}">
  <script type="application/ld+json">${jsonForHtml(schema)}</script>
  <script type="application/ld+json">${jsonForHtml(breadcrumbs)}</script>
  <script type="application/ld+json">${jsonForHtml(faqSchema(faqs))}</script>
  <link rel="stylesheet" href="/styles.css?v=operations-1">
  <link rel="stylesheet" href="/design-preview.css?v=mobile-grid-2">
  <script src="/meta-pixel.js?v=1" defer></script>
  <script src="/analytics.js?v=operations-1" defer></script>
  <script src="/storefront.js?v=instagram-contact-1" defer></script>
</head>
<body class="product-page-body">
  ${headerMarkup()}
  <main class="product-page-main">
    <nav class="product-breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span aria-hidden="true">/</span>
      <a href="${escapeHtml(model.category.href)}">${escapeHtml(model.category.label)}</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${escapeHtml(model.title)}</span>
    </nav>
    <article class="product-landing-card">
      <section class="product-detail-gallery" aria-label="${escapeHtml(model.title)} photos">
        ${imageMarkup(model.images.front, "Front", "eager")}
        ${imageMarkup(model.images.back, "Back")}
      </section>
      <section
        class="product-detail-copy"
        data-meta-product="true"
        data-product-id="${escapeHtml(model.id)}"
        data-product-name="${escapeHtml(model.title)}"
        data-product-value="${escapeHtml(model.metaPriceDisplay)}"
        data-product-category="${escapeHtml(model.category.label)}"
        data-product-availability="${model.available ? "in stock" : "out of stock"}"
      >
        <div class="product-detail-labels">
          <span>${escapeHtml(model.category.label)}</span>
        </div>
        <h1>${escapeHtml(model.title)}</h1>
        <p class="product-detail-description">${escapeHtml(model.description)}</p>
        ${model.reviewSummary?.count > 0 ? `<p class="product-rating-summary" aria-label="${escapeHtml(`${Number(model.reviewSummary.rating).toFixed(1)} out of 5 from ${model.reviewSummary.count} approved reviews`)}"><span aria-hidden="true">★★★★★</span> ${escapeHtml(Number(model.reviewSummary.rating).toFixed(1))} · ${escapeHtml(model.reviewSummary.count)} approved ${model.reviewSummary.count === 1 ? "review" : "reviews"}</p>` : ""}
        <dl class="product-facts">
          ${linkedFact("Player", model.identity.player, model.entityLinks.player)}
          ${linkedFact("Team / country", model.identity.teamCountry, model.entityLinks.team)}
          ${model.competition ? linkedFact("Competition", model.competition, model.entityLinks.competition) : ""}
          ${linkedFact("Category", model.category.label, model.category.href)}
        </dl>
        <section class="product-stock" aria-labelledby="stock-heading">
          <div class="product-section-heading">
            <span>Availability</span>
            <h2 id="stock-heading">${model.available ? "Available sizes:" : "Sold out"}</h2>
          </div>
          ${model.available ? `<ul>${stockMarkup}</ul>` : ""}
        </section>
        ${marketplaceMarkup(model)}
        ${model.available && model.marketplaces.length ? '<p class="product-checkout-note">Purchases are completed securely on the selected marketplace. JerseysFrmJB does not process checkout on this page.</p>' : ""}
      </section>
    </article>
    <section class="product-page-support">
      <div>
        <span>Questions or requests?</span>
        <h2>Get sizing help or request this jersey.</h2>
      </div>
      <div class="product-page-support-actions">
        <a href="/size-guide">Open Size Guide</a>
        <button type="button" data-open-help data-help-request-type="${model.available ? "jersey_request" : "restock_request"}">${model.available ? "Request This Jersey" : "Request a Restock"}</button>
      </div>
    </section>
    ${relatedProductsMarkup(model.relatedProducts)}
    <section class="seo-faq product-faq" aria-labelledby="product-faq-heading">
      <span>Jersey guide</span>
      <h2 id="product-faq-heading">Questions about this jersey</h2>
      ${faqs.map(faq => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")}
    </section>
  </main>
  ${footerMarkup()}
</body>
</html>`;
}

export function renderProductNotFound(siteOrigin = DEFAULT_SITE_ORIGIN) {
  const origin = normalizeSiteOrigin(siteOrigin);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Jersey Not Found | JerseysFrmJB</title>
  <meta name="description" content="This jersey could not be found in the current JerseysFrmJB inventory.">
  <meta name="robots" content="noindex,follow">
  <link rel="canonical" href="${escapeHtml(`${origin}/shop-all`)}">
  <link rel="stylesheet" href="/styles.css?v=operations-1">
  <link rel="stylesheet" href="/design-preview.css?v=mobile-grid-2">
  <script src="/meta-pixel.js?v=1" defer></script>
  <script src="/analytics.js?v=operations-1" defer></script>
  <script src="/storefront.js?v=instagram-contact-1" defer></script>
</head>
<body class="product-page-body">
  ${headerMarkup()}
  <main class="product-page-main">
    <section class="product-not-found">
      <span>Inventory update</span>
      <h1>That jersey is not available here.</h1>
      <p>It may have been removed or its link may have changed.</p>
      <a href="/shop-all">Browse Current Jerseys</a>
    </section>
  </main>
  ${footerMarkup()}
</body>
</html>`;
}
