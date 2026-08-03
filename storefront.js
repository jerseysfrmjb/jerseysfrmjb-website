const STOREFRONT_STYLE_VERSION = "restock-card-2";

document.querySelectorAll('link[rel="stylesheet"][href*="styles.css"]').forEach(stylesheet => {
  const url = new URL(stylesheet.href, window.location.href);
  if (url.searchParams.get("v") === STOREFRONT_STYLE_VERSION) return;
  url.searchParams.set("v", STOREFRONT_STYLE_VERSION);
  stylesheet.href = url.toString();
});

const toggle = document.querySelector(".menu-toggle");
const drawer = document.querySelector(".drawer");
const backdrop = document.querySelector(".drawer-backdrop");
const closeButton = document.querySelector(".drawer-close");

function enhanceMobileDrawer() {
  if (!drawer || drawer.dataset.enhanced === "true") return;

  drawer.dataset.enhanced = "true";
  drawer.insertAdjacentHTML("afterbegin", `
    <div class="drawer-brand">
      <img src="/assets/jerseysfrmjb-logo.jpg" alt="JerseysFrmJB logo">
      <div>
        <strong>JerseysFrmJB</strong>
        <span>Football Jerseys</span>
      </div>
    </div>
  `);

  const iconMap = {
    Home: "\u2302",
    "Shop All": "\u25C6",
    "World Cup Jerseys": "\u25CE",
    "Retro Jerseys": "\u21BA",
    "Club Jerseys": "\u25A6",
    "Size Guide": "\u25A3",
    Contact: "\u2709"
  };

  drawer.querySelectorAll("a").forEach(link => {
    const label = link.textContent.trim();
    const icon = iconMap[label] || "\u2022";
    link.classList.add("drawer-link");
    link.innerHTML = `<span class="drawer-link-icon" aria-hidden="true">${icon}</span><span>${escapeHtml(label)}</span>`;
  });
}

function setDrawer(open) {
  if (!drawer || !backdrop || !toggle) return;
  enhanceMobileDrawer();
  drawer.classList.toggle("open", open);
  backdrop.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  toggle.setAttribute("aria-expanded", String(open));
}

if (toggle && closeButton && backdrop) {
  enhanceMobileDrawer();
  toggle.addEventListener("click", () => setDrawer(true));
  closeButton.addEventListener("click", () => setDrawer(false));
  backdrop.addEventListener("click", () => setDrawer(false));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

const INVENTORY_IMAGE_REVISIONS = new Map([
  ["assets/inventory/club-real-front.jpg", "20260726-2"],
  ["assets/inventory/club-real-back.jpg", "20260726-2"],
  ["assets/inventory/club-city-front.jpg", "20260726-2"],
  ["assets/inventory/club-city-back.jpg", "20260726-2"]
]);

function inventoryImageSrc(src = "") {
  const value = String(src);
  const normalized = value.split(/[?#]/, 1)[0].replace(/^\//, "");
  const revision = INVENTORY_IMAGE_REVISIONS.get(normalized);
  if (!revision) return value;
  return `${value}${value.includes("?") ? "&" : "?"}v=${revision}`;
}

function requestedCatalogProductId() {
  const queryId = new URLSearchParams(window.location.search).get("product")?.trim();
  if (queryId) return queryId;
  try {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    return hash.startsWith("product-") ? hash.slice("product-".length) : "";
  } catch {
    return "";
  }
}

function focusRequestedCatalogProduct(grid) {
  const requestedId = requestedCatalogProductId();
  if (!requestedId) return;
  const card = [...grid.querySelectorAll("article[data-id]")]
    .find(item => item.dataset.id === requestedId);
  if (!card) return;

  card.hidden = false;
  card.classList.add("catalog-product-target");
  card.setAttribute("tabindex", "-1");
  window.requestAnimationFrame(() => {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.focus({ preventScroll: true });
    window.JerseysMetaPixel?.trackProductView(card);
  });
}

function totalQuantity(item) {
  const sizes = item?.sizes || {};
  const sizeTotal = Object.values(sizes).reduce((sum, qty) => sum + Math.max(0, Math.floor(Number(qty || 0))), 0);
  return sizeTotal || Math.max(0, Math.floor(Number(item?.quantity || 0)));
}

function isAvailable(item) {
  return totalQuantity(item) > 0;
}

function isNewArrival(item) {
  if (!item?.new_arrival) return false;
  if (!item.date_added) return true;
  const date = new Date(String(item.date_added).includes("T") ? item.date_added : item.date_added + "T00:00:00");
  if (Number.isNaN(date.getTime())) return true;
  return (Date.now() - date.getTime()) / 86400000 <= 7;
}

const CLUB_TOP_ORDER = new Map([
  ["club-barcelona-raphinha-home-2526", -400],
  ["club-barcelona-yamal-home-2526", -390],
  ["club-real-madrid-mbappe-home-2526", -380],
  ["club-real-madrid-bellingham-home-2526", -370]
]);

function clubFeaturedSortOrder(item) {
  if (item?.category !== "club") return null;
  const name = String(item.name || "").toLowerCase();
  if (name.includes("raphinha") && name.includes("barcelona")) return -400;
  if (name.includes("lamine yamal") && name.includes("barcelona")) return -390;
  if (name.includes("mbappe") && name.includes("real madrid")) return -380;
  if (name.includes("bellingham") && name.includes("real madrid")) return -370;
  return null;
}

function effectiveSortOrder(item) {
  if (item?.category === "club" && CLUB_TOP_ORDER.has(item.id)) {
    return CLUB_TOP_ORDER.get(item.id);
  }
  const clubOrder = clubFeaturedSortOrder(item);
  if (clubOrder !== null) return clubOrder;
  return Number(item?.sort_order || 0);
}

function sortInventory(items) {
  return [...items].sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)) || effectiveSortOrder(a) - effectiveSortOrder(b) || a.name.localeCompare(b.name));
}

function activeSizes(item) {
  const sizes = item?.sizes || {};
  const order = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  return order.filter(size => Number(sizes[size]) > 0);
}

function sizeLabel(value = "") {
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "s" || normalized === "small") return "Small";
  if (normalized === "m" || normalized === "medium") return "Medium";
  if (normalized === "l" || normalized === "large") return "Large";
  if (/^(xl|2xl|3xl|4xl|x-large|extra large)/i.test(normalized)) return "XL+";
  return "";
}

function sizeLabelsFromText(value = "") {
  const text = String(value).toLowerCase();
  const labels = [];
  if (/\b(s|small)\b/.test(text)) labels.push("Small");
  if (/\b(m|medium)\b/.test(text)) labels.push("Medium");
  if (/\b(l|large)\b/.test(text)) labels.push("Large");
  if (/\b(xl|2xl|3xl|4xl|x-large|extra large)\b/.test(text)) labels.push("XL+");
  return [...new Set(labels)];
}

function displaySize(item) {
  const active = activeSizes(item);
  const labels = active.length
    ? active.map(size => sizeLabel(size) || size)
    : sizeLabelsFromText(item?.size || "");
  return labels.length ? [...new Set(labels)].join(", ") : String(item?.size || "");
}

function searchText(item) {
  return [item.id, item.name, item.category, categoryLabel(item.category), item.size, displaySize(item), ...(item.photos || []).map(photo => photo.alt || "")].join(" ").toLowerCase();
}

const SEARCH_ALIASES = new Map([
  ["barca", "barcelona"],
  ["fcb", "barcelona"],
  ["real", "real madrid"],
  ["rma", "real madrid"],
  ["mufc", "manchester united"],
  ["man u", "manchester united"],
  ["man utd", "manchester united"],
  ["mcfc", "manchester city"],
  ["man city", "manchester city"],
  ["acm", "ac milan"],
  ["bvb", "borussia dortmund"],
  ["usmnt", "usa united states"],
  ["cr7", "cristiano ronaldo"],
  ["leo", "lionel messi"],
  ["la pulga", "lionel messi"],
  ["ney", "neymar"],
  ["bellingol", "jude bellingham"]
]);

function normalizeSearchValue(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandedSearchQuery(value = "") {
  const normalized = normalizeSearchValue(value);
  return SEARCH_ALIASES.get(normalized) || normalized;
}

function editDistance(a = "", b = "") {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let indexA = 1; indexA <= a.length; indexA += 1) {
    const current = [indexA];
    for (let indexB = 1; indexB <= b.length; indexB += 1) {
      current[indexB] = Math.min(
        current[indexB - 1] + 1,
        previous[indexB] + 1,
        previous[indexB - 1] + (a[indexA - 1] === b[indexB - 1] ? 0 : 1)
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length];
}

function fuzzyTokenMatch(queryToken, searchTokens) {
  if (queryToken.length < 4) return searchTokens.includes(queryToken);
  const allowance = queryToken.length >= 8 ? 2 : 1;
  return searchTokens.some(token =>
    Math.abs(token.length - queryToken.length) <= allowance &&
    editDistance(queryToken, token) <= allowance
  );
}

function searchScore(card, query = "") {
  const expanded = expandedSearchQuery(query);
  if (!expanded) return 1;
  const title = normalizeSearchValue(card.querySelector(".product-title-link")?.dataset.originalTitle || card.querySelector(".product-title-link")?.textContent || "");
  const haystack = normalizeSearchValue(card.dataset.search || "");
  if (title === expanded) return 1000;
  if (title.startsWith(expanded)) return 850;
  if (title.includes(expanded)) return 750;
  if (haystack.includes(expanded)) return 650;
  const queryTokens = expanded.split(" ").filter(Boolean);
  const searchTokens = haystack.split(" ").filter(Boolean);
  if (queryTokens.every(token => searchTokens.includes(token))) return 500;
  if (queryTokens.every(token => fuzzyTokenMatch(token, searchTokens))) return 300;
  return 0;
}

function highlightCardTitle(card, query = "") {
  const link = card.querySelector(".product-title-link");
  if (!link) return;
  if (!link.dataset.originalTitle) link.dataset.originalTitle = link.textContent || "";
  const title = link.dataset.originalTitle;
  const normalizedQuery = expandedSearchQuery(query);
  if (!normalizedQuery) {
    link.textContent = title;
    return;
  }
  const directPattern = normalizedQuery
    .split(" ")
    .filter(Boolean)
    .map(token => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (!directPattern) {
    link.textContent = title;
    return;
  }
  const pattern = new RegExp(`(${directPattern})`, "ig");
  const parts = title.split(pattern);
  link.replaceChildren(...parts.filter(Boolean).map(part => {
    if (!pattern.test(part)) return document.createTextNode(part);
    pattern.lastIndex = 0;
    const mark = document.createElement("mark");
    mark.textContent = part;
    return mark;
  }));
}

function categoryLabel(category = "") {
  return { world: "World Cup", club: "Club", retro: "Retro" }[category] || category;
}

const PUBLIC_MARKETPLACES = [
  { name: "Depop", linkKey: "depop", icon: "\u{1F6CD}", defaultUrl: "https://www.depop.com/jerseysfrmjb/" },
  { name: "eBay", linkKey: "ebay", icon: "\u{1F6D2}", defaultUrl: "https://www.ebay.com/usr/jerseysfrmjb" },
  { name: "Facebook", linkKey: "facebook", icon: "\u{1F465}" },
  { name: "Local", linkKey: "local", icon: "\u{1F4CD}" },
  { name: "Other", linkKey: "other", icon: "\u{1F517}" }
];
const DEFAULT_PURCHASE_URL = "https://www.depop.com/jerseysfrmjb/";

function formatPriceValue(value) {
  const raw = String(value).trim();
  if (!raw) return "";
  const number = Number(raw);
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.00$/, "") : String(value);
}

function numericPublicPrice(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function synchronizedMarketplacePrices(item = {}) {
  const savedPrices = item.platform_prices || {};
  const savedDepop = numericPublicPrice(savedPrices.Depop);
  const savedEbay = numericPublicPrice(savedPrices.eBay);
  const fallback = numericPublicPrice(item.base_price ?? item.price);
  const depop = savedDepop ?? (savedEbay === null ? fallback : Math.max(0, savedEbay - 5));
  return {
    Depop: depop,
    eBay: savedEbay ?? (depop === null ? null : depop + 5)
  };
}

function renderPlatformAvailability(item = {}, available = true) {
  const synchronizedPrices = synchronizedMarketplacePrices(item);
  if (!available) {
    const expectedPrices = ["Depop", "eBay"].flatMap(platform => {
      const price = synchronizedPrices[platform];
      return price === null || price === undefined
        ? []
        : [`<span><b>${escapeHtml(platform)}</b> $${escapeHtml(formatPriceValue(price))}</span>`];
    }).join("");
    return `
      <section class="product-request-card" aria-label="Request this sold-out jersey">
        <div class="product-request-icon" aria-hidden="true">&#8635;</div>
        <div class="product-request-copy">
          <span class="product-request-eyebrow">Restock requests open</span>
          <strong>Want this jersey?</strong>
          <p>Tell us the size you need and we will use your request to plan the next restock.</p>
        </div>
        ${expectedPrices ? `<div class="product-request-prices"><small>Expected marketplace price</small><div>${expectedPrices}</div></div>` : ""}
        <button type="button" data-open-help data-help-request-type="restock_request"><span>Request This Jersey</span><span aria-hidden="true">&rarr;</span></button>
      </section>`;
  }

  const savedPrices = item.platform_prices || {};
  const links = item.links || {};
  const offers = PUBLIC_MARKETPLACES.flatMap(platform => {
    const value = synchronizedPrices[platform.name] ?? savedPrices[platform.name];
    if (value === null || value === undefined || String(value).trim() === "") return [];
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) return [];
    return [{ ...platform, price: formatPriceValue(amount) }];
  });

  if (!offers.length) {
    return `
      <section class="platform-availability platform-availability-empty" aria-label="Purchase options">
        <h4>Purchase Options</h4>
        <p>Marketplace listing coming soon.</p>
        <button type="button" data-open-help data-help-request-type="jersey_request">Ask About This Jersey</button>
      </section>`;
  }

  return `
    <section class="platform-availability" aria-label="Available marketplaces">
      <h4>Available On</h4>
      <div class="platform-offers">
        ${offers.map(offer => {
          const action = available
            ? `<a class="platform-buy-button" href="${escapeHtml(links[offer.linkKey] || offer.defaultUrl || links.depop || DEFAULT_PURCHASE_URL)}" target="_blank" rel="noopener" data-analytics-product-id="${escapeHtml(item.id || "")}" data-analytics-product-name="${escapeHtml(item.name || "")}" data-analytics-marketplace="${escapeHtml(offer.name)}">Buy on ${escapeHtml(offer.name)}</a>`
            : `<span class="platform-buy-button disabled" aria-disabled="true">Sold Out</span>`;
          return `
            <div class="platform-offer">
              <div class="platform-offer-label"><div class="platform-name"><span aria-hidden="true">${escapeHtml(offer.icon)}</span>${escapeHtml(offer.name)}</div><b>&mdash; $${escapeHtml(offer.price)}</b></div>
              ${action}
            </div>`;
        }).join("")}
      </div>
    </section>`;
}

function metaProductPrice(item = {}) {
  const facebookPrice = item.platform_prices?.Facebook;
  const value = facebookPrice === null || facebookPrice === undefined || String(facebookPrice).trim() === ""
    ? item.price
    : facebookPrice;
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount.toFixed(2) : "";
}

function metaProductAttributes(item = {}, available = true) {
  return [
    'data-meta-product="true"',
    `data-product-id="${escapeHtml(item.id || "")}"`,
    `data-product-name="${escapeHtml(item.name || "")}"`,
    `data-product-value="${escapeHtml(metaProductPrice(item))}"`,
    `data-product-category="${escapeHtml(categoryLabel(item.category))}"`,
    `data-product-availability="${available ? "in stock" : "out of stock"}"`
  ].join(" ");
}

function productDetailsUrl(id = "") {
  return `/products/${encodeURIComponent(String(id).trim())}`;
}

function formatInventoryUpdated(value = "") {
  if (!value) return "";
  const date = new Date(String(value).includes("T") ? value : value + "Z");
  if (Number.isNaN(date.getTime())) return "";
  return "Inventory updated: " + date.toLocaleString([], { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function sizeTokens(value = "") {
  if (Array.isArray(value)) return value;
  return String(value)
    .replace(/&amp;/g, "&")
    .split(/&|,|\+|\/|\u00b7|\band\b/i)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part.replace(/Player Version/i, "").trim())
    .filter(Boolean);
}

function filterSizeTokens(item) {
  const active = activeSizes(item);
  if (active.length) {
    return [...new Set(active.map(size => ({ S: "small", M: "medium", L: "large", XL: "xl", "2XL": "2xl", "3XL": "3xl", "4XL": "4xl" }[size] || String(size).toLowerCase())))];
  }
  const labels = sizeLabelsFromText(item?.size || displaySize(item));
  const tokenMap = { Small: "small", Medium: "medium", Large: "large", "XL+": "xl" };
  return [...new Set(labels.filter(Boolean).map(label => tokenMap[label] || label.toLowerCase()))];
}

async function fetchSiteSettings() {
  try {
    const response = await fetch("/api/settings", { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) return {};
    const data = await response.json();
    return data.settings || {};
  } catch (error) {
    return {};
  }
}

function applyHomepageBanner(message = "") {
  const banner = document.querySelector(".restock-banner");
  if (!banner || !message.trim()) return;
  const lines = message.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const title = lines.shift();
  const body = lines.join(" ");
  const titleNode = banner.querySelector("strong");
  const bodyNode = banner.querySelector("p");
  if (titleNode && title) titleNode.textContent = title;
  if (bodyNode && body) bodyNode.textContent = body;
}

function applyHomepageTicker(message = "") {
  if (!message.trim()) return;
  document.querySelectorAll(".ticker-line").forEach(line => {
    line.textContent = message.trim();
  });
}

function applyHomepageStat(message = "") {
  if (!message.trim()) return;
  const statCard = document.querySelector(".brand-stats div:nth-child(4) strong");
  if (statCard) statCard.textContent = message.trim();
}

async function loadSiteSettings() {
  const settings = await fetchSiteSettings();
  applyHomepageBanner(settings.homepage_banner_message || "");
  applyHomepageTicker(settings.homepage_ticker_message || "");
  applyHomepageStat(settings.homepage_stat_message || "");
}

loadSiteSettings();

async function fetchInventory(params = {}) {
  const query = new URLSearchParams(params);
  const apiUrl = `/api/inventory${query.toString() ? `?${query}` : ""}`;
  try {
    const response = await fetch(apiUrl, { cache: "no-store", headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch (error) {
    const fallback = await fetch("data/inventory.json", { cache: "no-store", headers: { Accept: "application/json" } });
    const data = await fallback.json();
    let items = data.items || [];
    if (params.category) items = items.filter(item => item.category === params.category);
    if (params.featured === "true") {
      items = items
        .filter(item => item.featured)
        .sort((a, b) => Number(a.featured_order || 999) - Number(b.featured_order || 999));
      return { items };
    }
    return { items: sortInventory(items) };
  }
}

function productPhotoAlt(item = {}, photo = {}, index = 0) {
  const source = `${photo?.src || ""} ${photo?.alt || ""}`;
  const side = /\bback\b/i.test(source) ? "back" : (/\bfront\b/i.test(source) ? "front" : (index === 0 ? "front" : `view ${index + 1}`));
  const title = String(item.name || photo?.alt || "Football jersey")
    .replace(/\s*\|\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${title} soccer jersey ${side} view`;
}

function renderSlides(item) {
  const sold = !isAvailable(item);
  const newArrival = isNewArrival(item) ? '<p class="product-status new-arrival">New Arrival</p>' : "";
  return (item.photos || []).map((photo, index) => `
    <div class="slide${index === 0 ? " active" : ""}">
      <img decoding="async" loading="lazy" width="1280" height="1280" src="${escapeHtml(inventoryImageSrc(photo.src))}" alt="${escapeHtml(productPhotoAlt(item, photo, index))}" title="${escapeHtml(productPhotoAlt(item, photo, index))}">
      ${sold && index === 0 ? '<p class="product-status out-of-stock">Out of Stock</p>' : ""}
      ${index === 0 ? newArrival : ""}
    </div>`).join("");
}

function renderProductCard(item) {
  const available = isAvailable(item);
  const sizes = available ? displaySize(item) : "Sold out";

  return `
    <article id="product-${escapeHtml(item.id)}" ${metaProductAttributes(item, available)} data-stock="${available ? "available" : "sold-out"}" data-category="${escapeHtml(item.category || "")}" data-search="${escapeHtml(searchText(item))}" data-size="${escapeHtml(filterSizeTokens(item).join("|"))}" data-size-display="${escapeHtml(sizes)}" data-id="${escapeHtml(item.id)}">
      <div class="product-photo product-slider" data-slider>
        <div class="slides product-slides">${renderSlides(item)}</div>
        <div class="product-controls"><button data-prev type="button" aria-label="Previous photo">&lsaquo;</button><div class="slider-dots"></div><button data-next type="button" aria-label="Next photo">&rsaquo;</button></div>
      </div>
      <p class="notice category-notice">${escapeHtml(categoryLabel(item.category))}</p>
      ${available ? "" : '<p class="notice sold">Out of Stock</p>'}
      <h2><a class="product-title-link" href="${escapeHtml(productDetailsUrl(item.id))}">${escapeHtml(item.name)}</a></h2>
      <a class="product-details-button" href="${escapeHtml(productDetailsUrl(item.id))}" aria-label="View jersey details for ${escapeHtml(item.name)}">View Jersey Details <span aria-hidden="true">&rarr;</span></a>
      <p data-card-size>${escapeHtml(sizes)}</p>
      ${renderPlatformAvailability(item, available)}
    </article>`;
}

function renderFeaturedCard(item, index) {
  const available = isAvailable(item);
  const image = item.photos?.[0] || {};

  return `
    <article class="featured-card" ${metaProductAttributes(item, available)} data-stock="${available ? "available" : "sold-out"}">
      <img src="${escapeHtml(inventoryImageSrc(image.src))}" alt="${escapeHtml(productPhotoAlt(item, image, 0))}" title="${escapeHtml(productPhotoAlt(item, image, 0))}" width="1280" height="1280" loading="lazy" decoding="async">
      <div class="featured-copy">
        <span>FEATURED JERSEY ${String(index + 1).padStart(2, "0")}</span>
        <h3><a class="product-title-link" href="${escapeHtml(productDetailsUrl(item.id))}">${escapeHtml(item.name)}</a></h3>
        <a class="product-details-button" href="${escapeHtml(productDetailsUrl(item.id))}" aria-label="View jersey details for ${escapeHtml(item.name)}">View Jersey Details <span aria-hidden="true">&rarr;</span></a>
        <div class="featured-meta"><p>${escapeHtml(available ? displaySize(item) : "Sold out")}</p></div>
        ${renderPlatformAvailability(item, available)}
      </div>
    </article>`;
}

function initSliders(root = document) {
  root.querySelectorAll("[data-slider]").forEach(slider => {
    if (slider.dataset.sliderReady) return;
    slider.dataset.sliderReady = "true";
    const slides = [...slider.querySelectorAll(".slide")];
    const dots = slider.querySelector(".slider-dots");
    const prev = slider.querySelector("[data-prev]");
    const next = slider.querySelector("[data-next]");
    if (!slides.length || !dots || !prev || !next) return;
    let current = 0;

    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show slide ${index + 1}`);
      dot.addEventListener("click", () => show(index));
      dots.appendChild(dot);
    });

    const dotButtons = [...dots.children];
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === current));
      dotButtons.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === current));
    }

    prev.addEventListener("click", () => show(current - 1));
    next.addEventListener("click", () => show(current + 1));
    show(0);
  });
}

function setupFilters(filterGroup, cards) {
  if (!filterGroup) return;
  const container = filterGroup.closest(".inventory-page");
  const scope = filterGroup.closest("[data-shop-all-controls]") || container || document;
  const stockButtons = [...scope.querySelectorAll("[data-stock-filter], [data-filter]")];
  const categoryButtons = [...scope.querySelectorAll("[data-category-filter]")];
  const sizeSelect = scope.querySelector("[data-size-filter]");
  const searchInput = scope.querySelector("[data-inventory-search]");
  cards.forEach((card, index) => {
    card.dataset.originalIndex = String(index);
    const titleLink = card.querySelector(".product-title-link");
    if (titleLink && !titleLink.dataset.originalTitle) titleLink.dataset.originalTitle = titleLink.textContent || "";
  });
  let emptyMessage = scope.querySelector("[data-filter-empty]") || container?.querySelector("[data-filter-empty]");
  if (!emptyMessage) {
    emptyMessage = document.createElement("p");
    emptyMessage.className = "inventory-filter-empty";
    emptyMessage.dataset.filterEmpty = "";
    emptyMessage.hidden = true;
    (scope.closest(".shop-all-controls") || filterGroup).insertAdjacentElement("afterend", emptyMessage);
  }

  let resultCount = scope.querySelector("[data-inventory-result-count]") || container?.querySelector("[data-inventory-result-count]");
  if (!resultCount) {
    resultCount = document.createElement("p");
    resultCount.className = "inventory-result-count";
    resultCount.dataset.inventoryResultCount = "";
    const updated = scope.querySelector("[data-inventory-updated]") || container?.querySelector("[data-inventory-updated]");
    if (updated) {
      updated.insertAdjacentElement("beforebegin", resultCount);
    } else {
      (scope.closest(".shop-all-controls") || filterGroup).insertAdjacentElement("afterend", resultCount);
    }
  }

  if (sizeSelect) {
    const options = [
      ["small", "Small"],
      ["medium", "Medium"],
      ["large", "Large"],
      ["xl", "XL"],
      ["2xl", "2XL"],
      ["3xl", "3XL"],
      ["4xl", "4XL"]
    ];
    sizeSelect.innerHTML = '<option value="all">All Sizes</option>' + options.map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join("");
  }

  function selectedSizeLabel(value) {
    return { small: "Small", medium: "Medium", large: "Large", xl: "XL", "2xl": "2XL", "3xl": "3XL", "4xl": "4XL", "xl+": "XL+" }[value] || "";
  }

  function setActive(buttons, selected) {
    buttons.forEach(button => button.classList.toggle("active", button === selected));
  }

  function apply() {
    const activeStock = scope.querySelector("[data-stock-filter].active, [data-filter].active")?.dataset.stockFilter || scope.querySelector("[data-stock-filter].active, [data-filter].active")?.dataset.filter || "all";
    const activeCategory = scope.querySelector("[data-category-filter].active")?.dataset.categoryFilter || "all";
    const selectedSize = sizeSelect?.value || "all";
    const query = (searchInput?.value || "").trim();
    let visibleCount = 0;
    let availableMatchCount = 0;
    let soldOutMatchCount = 0;
    let selectedSizeCount = 0;
    let selectedSizeAvailableCount = 0;

    cards.forEach(card => {
      const stockMatch = activeStock === "all" || card.dataset.stock === activeStock;
      const categoryMatch = activeCategory === "all" || card.dataset.category === activeCategory;
      const sizeTokens = (card.dataset.size || "").split("|").filter(Boolean);
      const sizeMatch = selectedSize === "all" || sizeTokens.includes(selectedSize) || (selectedSize === "xl" && sizeTokens.includes("xl+"));
      const score = searchScore(card, query);
      const searchMatch = score > 0;
      card.dataset.searchScore = String(score);
      const baseMatch = categoryMatch && sizeMatch && searchMatch;

      if (baseMatch) {
        if (card.dataset.stock === "available") availableMatchCount += 1;
        if (card.dataset.stock === "sold-out") soldOutMatchCount += 1;
      }

      if (selectedSize !== "all" && categoryMatch && searchMatch && sizeMatch) {
        selectedSizeCount += 1;
        if (card.dataset.stock === "available") selectedSizeAvailableCount += 1;
      }

      card.hidden = !stockMatch || !categoryMatch || !sizeMatch || !searchMatch;
      const sizeText = card.querySelector("[data-card-size]");
      if (sizeText) {
        sizeText.textContent = selectedSize === "all"
          ? card.dataset.sizeDisplay || ""
          : selectedSizeLabel(selectedSize);
      }
      if (!card.hidden) visibleCount += 1;
      highlightCardTitle(card, query);
    });

    const cardParents = [...new Set(cards.map(card => card.parentElement).filter(Boolean))];
    for (const parent of cardParents) {
      const ordered = cards
        .filter(card => card.parentElement === parent)
        .slice()
        .sort((a, b) => {
          if (query) {
            const scoreDifference = Number(b.dataset.searchScore || 0) - Number(a.dataset.searchScore || 0);
            if (scoreDifference) return scoreDifference;
          }
          return Number(a.dataset.originalIndex || 0) - Number(b.dataset.originalIndex || 0);
        });
      parent.append(...ordered);
    }

    const sizeLabel = selectedSizeLabel(selectedSize);
    const sizeSuffix = selectedSize !== "all" && sizeLabel ? ` in ${sizeLabel}` : "";
    if (resultCount) {
      const count = activeStock === "sold-out" ? soldOutMatchCount : availableMatchCount;
      const noun = count === 1 ? "jersey" : "jerseys";
      resultCount.textContent = activeStock === "sold-out"
        ? `${count} sold-out ${noun} shown${sizeSuffix}`
        : `${count} ${noun} available${sizeSuffix}`;
    }

    if (emptyMessage) {
      let message = "";
      if (visibleCount === 0 && selectedSize !== "all" && selectedSizeCount === 0) {
        message = "No jersey is currently available in that size.";
      } else if (selectedSize !== "all" && selectedSizeAvailableCount === 0) {
        message = `All jerseys in ${sizeLabel} are sold out.`;
      } else if (visibleCount === 0) {
        message = "No jerseys match those filters.";
      }
      emptyMessage.textContent = message;
      emptyMessage.hidden = !message;
    }
  }

  stockButtons.forEach(button => {
    button.addEventListener("click", () => {
      setActive(stockButtons, button);
      apply();
    });
  });
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      setActive(categoryButtons, button);
      apply();
    });
  });
  sizeSelect?.addEventListener("change", apply);
  searchInput?.addEventListener("input", apply);
  apply();
}

async function renderInventoryGrids() {
  const grids = [...document.querySelectorAll("[data-inventory-grid]")];
  await Promise.all(grids.map(async grid => {
    const params = grid.dataset.category ? { category: grid.dataset.category } : {};
    const data = await fetchInventory(params);
    const items = sortInventory(data.items || []);
    grid.innerHTML = items.map(renderProductCard).join("");
    window.JerseysMetaPixel?.observeProducts(grid);
    window.JerseysAnalytics?.observeProducts(grid);
    window.JerseysAnalytics?.setupSearchTracking(grid.closest(".inventory-page") || document);
    const updated = grid.closest(".inventory-page")?.querySelector("[data-inventory-updated]");
    if (updated) updated.textContent = formatInventoryUpdated(data.settings?.inventory_updated_at || data.updated_at || "");
    initSliders(grid);
    setupFilters(grid.closest(".inventory-page")?.querySelector(".inventory-filter, .shop-all-controls"), [...grid.querySelectorAll("article")]);
    focusRequestedCatalogProduct(grid);
  }));
}

async function renderFeaturedGrid() {
  const grid = document.querySelector("[data-featured-grid]");
  if (!grid) return;
  const data = await fetchInventory({ featured: "true" });
  const items = [...(data.items || [])]
    .filter(item => item.featured)
    .sort((a, b) => Number(a.featured_order || 999) - Number(b.featured_order || 999))
    .slice(0, 3);
  grid.innerHTML = items.map(renderFeaturedCard).join("");
  window.JerseysMetaPixel?.observeProducts(grid);
  window.JerseysAnalytics?.observeProducts(grid);
}

async function renderHomepageStats() {
  const stats = document.querySelector(".brand-stats");
  if (!stats) return;
  const data = await fetchInventory();
  const availableProducts = (data.items || []).filter(isAvailable).length;
  const inventoryTotal = (data.items || []).reduce((sum, item) => sum + totalQuantity(item), 0);
  const statCards = [...stats.querySelectorAll("div")];
  if (statCards[2] && availableProducts) statCards[2].querySelector("small")?.remove();
}

function formatFeedbackDate(value = "") {
  if (!value) return "";
  const date = new Date(String(value).endsWith("Z") ? value : value + "Z");
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function marketplaceFeedbackSlide(item, marketplace, index) {
  const isDepop = marketplace === "depop";
  const marketplaceLabel = isDepop ? "Depop" : "eBay";
  const iconClass = isDepop ? "depop-icon" : "ebay-icon";
  const stars = Math.min(5, Math.max(1, Number(item.star_rating || 5)));
  const title = item.listing_title && item.listing_title !== "Depop purchase"
    ? item.listing_title
    : `${marketplaceLabel} buyer review`;
  const dateLabel = isDepop ? "" : formatFeedbackDate(item.feedback_date);

  return `
    <div class="slide${index === 0 ? " active" : ""}">
      <article class="review-proof-card marketplace-review-card ${escapeHtml(marketplace)}-review-card">
        <div class="review-card-top">
          <i class="brand-icon ${iconClass}" aria-hidden="true">${isDepop ? "d" : "e"}</i>
          <span class="review-stars" aria-label="${stars} out of 5 stars">${"&#9733;".repeat(stars)}</span>
        </div>
        <p class="review-market">Verified ${marketplaceLabel} Feedback</p>
        <h4>${escapeHtml(title)}</h4>
        <blockquote>&ldquo;${escapeHtml(item.comment || "")}&rdquo;</blockquote>
        <div class="marketplace-review-footer">
          <span>Verified ${marketplaceLabel} Buyer</span>
          ${dateLabel ? `<time datetime="${escapeHtml(item.feedback_date || "")}">${escapeHtml(dateLabel)}</time>` : ""}
        </div>
      </article>
    </div>`;
}

async function loadMarketplaceFeedback(marketplace) {
  const slides = document.querySelector(`[data-marketplace-feedback="${marketplace}"]`);
  if (!slides) return;
  if (marketplace === "ebay") {
    slides.innerHTML = '<div class="slide active"><p class="marketplace-feedback-loading">Loading approved eBay feedback...</p></div>';
  }

  try {
    const response = await fetch(`/api/${marketplace}-feedback`, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!response.ok) throw new Error("Feedback unavailable");
    const data = await response.json();
    const feedback = Array.isArray(data.feedback) ? data.feedback : [];
    if (!feedback.length) {
      if (marketplace === "ebay") {
        slides.innerHTML = '<div class="slide active"><p class="marketplace-feedback-loading">Approved eBay feedback will appear here.</p></div>';
      }
      return;
    }

    slides.innerHTML = feedback.map((item, index) => marketplaceFeedbackSlide(item, marketplace, index)).join("");
  } catch (error) {
    if (marketplace === "ebay") {
      slides.innerHTML = '<div class="slide active"><p class="marketplace-feedback-loading">eBay feedback is temporarily unavailable.</p></div>';
    }
  }
}

async function renderMarketplaceFeedback() {
  await Promise.all([
    loadMarketplaceFeedback("ebay"),
    loadMarketplaceFeedback("depop")
  ]);
}

renderInventoryGrids();
renderFeaturedGrid();
renderHomepageStats();
renderMarketplaceFeedback().finally(() => {
  initSliders();
  initReviewLightbox();
});
function initReviewLightbox() {
  const triggers = document.querySelectorAll("[data-review-lightbox]");
  if (!triggers.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "review-lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <div class="review-lightbox-card" role="dialog" aria-modal="true" aria-label="Review proof preview">
      <div class="review-lightbox-head">
        <div>
          <span data-review-market></span>
          <h3 data-review-product></h3>
        </div>
        <button class="review-lightbox-close" type="button" aria-label="Close review preview">&times;</button>
      </div>
      <div class="review-lightbox-proof">
        <img class="review-lightbox-image" data-review-proof-image alt="" hidden>
        <span class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
        <blockquote data-review-copy></blockquote>
      </div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const market = lightbox.querySelector("[data-review-market]");
  const product = lightbox.querySelector("[data-review-product]");
  const copy = lightbox.querySelector("[data-review-copy]");
  const proofImage = lightbox.querySelector("[data-review-proof-image]");
  const close = lightbox.querySelector(".review-lightbox-close");

  function setOpen(open) {
    lightbox.hidden = !open;
    document.body.classList.toggle("help-modal-open", open);
  }

  triggers.forEach(button => {
    button.addEventListener("click", () => {
      market.textContent = `Verified ${button.dataset.marketplace || "Marketplace"} Review`;
      product.textContent = button.dataset.product || "Buyer Review";
      copy.textContent = button.dataset.review || "";
      if (proofImage) {
        const imageSrc = button.dataset.proofImage || "";
        proofImage.hidden = !imageSrc;
        if (imageSrc) {
          proofImage.src = imageSrc;
          proofImage.alt = `${button.dataset.marketplace || "Marketplace"} review proof screenshot`;
        }
      }
      setOpen(true);
      close.focus();
    });
  });

  close.addEventListener("click", () => setOpen(false));
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) setOpen(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !lightbox.hidden) setOpen(false);
  });
}

function createHelpWidget() {
  const instagramUrl = "https://www.instagram.com/jerseysfrmjb/";
  if (!document.querySelector('link[data-help-widget-style]')) {
    const widgetStyle = document.createElement("link");
    widgetStyle.rel = "stylesheet";
    widgetStyle.href = "/help-widget.css?v=instagram-contact-1";
    widgetStyle.dataset.helpWidgetStyle = "";
    document.head.appendChild(widgetStyle);
  }
  const widget = document.createElement("div");
  widget.className = "help-widget";
  widget.innerHTML = `
    <button class="help-widget-button" type="button" aria-expanded="false">
      <span class="help-widget-button-icon" aria-hidden="true">+</span>
      <span>Message or Request</span>
    </button>
    <div class="help-widget-overlay" data-help-overlay hidden></div>
    <section class="help-widget-panel" aria-label="JerseysFrmJB requests and help" hidden>
      <div class="help-widget-head">
        <div>
          <span>Instagram &amp; Requests</span>
          <h2>Message us or send a request.</h2>
        </div>
        <button class="help-widget-close" type="button" aria-label="Close message form">&times;</button>
      </div>
      <p class="help-widget-copy">For quick questions, sizing, or order help, message @jerseysfrmjb directly. For a specific jersey or restock request, use the form below and we&rsquo;ll reply on Instagram.</p>
      <div class="help-instagram-note">
        <span aria-hidden="true">IG</span>
        <div><strong>DM @jerseysfrmjb directly</strong><small>The fastest way to ask a quick question.</small></div>
        <a class="help-instagram-link" href="${instagramUrl}" target="_blank" rel="noopener">Open Instagram</a>
      </div>
      <div class="help-request-divider"><span>Or send a structured request</span></div>
      <form class="help-widget-form" data-help-form>
        <input type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true">
        <input type="hidden" name="product_id">
        <input type="hidden" name="product_name">
        <input type="hidden" name="request_type" value="">
        <input type="hidden" name="contact_preference" value="instagram">
        <aside class="help-product-context" data-help-product-context hidden>
          <img src="" alt="" data-help-product-image>
          <div><small>Selected jersey</small><strong data-help-product-name></strong></div>
          <button type="button" data-help-clear-product aria-label="Remove selected jersey">&times;</button>
        </aside>
        <fieldset class="help-request-chooser">
          <legend>What do you need?</legend>
          <div class="help-request-choices">
            <button type="button" data-help-request-type="jersey_request" aria-pressed="false"><span aria-hidden="true">+</span><strong>Request a Jersey</strong><small>Ask for a player, team, or season</small></button>
            <button type="button" data-help-request-type="restock_request" aria-pressed="false"><span aria-hidden="true">&#8635;</span><strong>Restock Request</strong><small>Tell us what should come back</small></button>
            <button type="button" data-help-request-type="size_question" aria-pressed="false"><span aria-hidden="true">&#8596;</span><strong>Sizing Help</strong><small>Get help choosing your size</small></button>
            <button type="button" data-help-request-type="order_help" aria-pressed="false"><span aria-hidden="true">#</span><strong>Order Help</strong><small>Ask about an existing purchase</small></button>
          </div>
        </fieldset>
        <div class="help-request-details" data-help-details hidden>
          <label>Instagram username <small>(where the reply will be sent)</small>
            <input name="instagram_username" type="text" placeholder="@username" autocomplete="username" required>
          </label>
          <label data-help-jersey-field><span data-help-jersey-label>Jersey or request</span>
            <input name="jersey_request" type="text" placeholder="Example: Messi Argentina Home" required>
          </label>
          <label data-help-size-field>Size <small>(optional)</small>
            <input name="size" type="text" placeholder="Example: M">
          </label>
          <label data-help-marketplace-field>Preferred marketplace <small>(optional)</small>
            <select name="marketplace_preference">
              <option value="">No preference</option>
              <option value="eBay">eBay</option>
              <option value="Depop">Depop</option>
              <option value="Other">Other</option>
            </select>
          </label>
          <label>Message
            <textarea name="message" rows="4" placeholder="Tell us what you are looking for." required></textarea>
          </label>
          <button class="help-submit" type="submit">Send Request</button>
          <p class="help-widget-status" data-help-status role="status"></p>
        </div>
      </form>
      <div class="help-widget-success" data-help-success hidden>
        <span class="help-success-icon" aria-hidden="true">&#10003;</span>
        <h3>Request received</h3>
        <p data-help-success-message>Thanks! Your request has been received.</p>
        <dl class="help-success-summary">
          <div><dt>Request</dt><dd data-help-success-id></dd></div>
          <div><dt>Type</dt><dd data-help-success-type></dd></div>
          <div><dt>Jersey / order</dt><dd data-help-success-jersey></dd></div>
          <div><dt>Instagram</dt><dd data-help-success-instagram></dd></div>
        </dl>
        <div class="help-success-actions">
          <a class="help-instagram-link" href="${instagramUrl}" target="_blank" rel="noopener">Open Instagram</a>
          <button type="button" data-help-send-another>Send Another Request</button>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(widget);

  const toggle = widget.querySelector(".help-widget-button");
  const panel = widget.querySelector(".help-widget-panel");
  const overlay = widget.querySelector("[data-help-overlay]");
  const close = widget.querySelector(".help-widget-close");
  const form = widget.querySelector("[data-help-form]");
  const status = widget.querySelector("[data-help-status]");
  const success = widget.querySelector("[data-help-success]");
  const submit = widget.querySelector(".help-submit");
  const successMessage = widget.querySelector("[data-help-success-message]");
  const successId = widget.querySelector("[data-help-success-id]");
  const successType = widget.querySelector("[data-help-success-type]");
  const successJersey = widget.querySelector("[data-help-success-jersey]");
  const successInstagram = widget.querySelector("[data-help-success-instagram]");
  const sendAnother = widget.querySelector("[data-help-send-another]");
  const requestTypeInput = form.elements.request_type;
  const requestTypeButtons = [...widget.querySelectorAll("[data-help-request-type]")];
  const requestDetails = widget.querySelector("[data-help-details]");
  const jerseyLabel = widget.querySelector("[data-help-jersey-label]");
  const sizeField = widget.querySelector("[data-help-size-field]");
  const marketplaceField = widget.querySelector("[data-help-marketplace-field]");
  const productContext = widget.querySelector("[data-help-product-context]");
  const productImage = widget.querySelector("[data-help-product-image]");
  const productName = widget.querySelector("[data-help-product-name]");
  const clearProduct = widget.querySelector("[data-help-clear-product]");
  const defaultSubmitText = submit.textContent;
  let sent = false;
  let submitting = false;
  let touchStartY = 0;
  const pageProducts = [...document.querySelectorAll("[data-meta-product]")];
  const pageProduct = pageProducts.length === 1 ? pageProducts[0] : null;
  const requestTypes = {
    jersey_request: {
      label: "Jersey you’re looking for",
      placeholder: "Example: Messi Argentina Home",
      message: "Tell us the player, team, season, or version you want.",
      size: true,
      marketplace: true
    },
    restock_request: {
      label: "Jersey to restock",
      placeholder: "Choose the selected jersey or enter another",
      message: "Tell us which size you need and any other details.",
      size: true,
      marketplace: true
    },
    size_question: {
      label: "Jersey you need sizing help with",
      placeholder: "Choose the selected jersey or enter its name",
      message: "Share your usual size or the fit you prefer.",
      size: true,
      marketplace: false
    },
    order_help: {
      label: "Order or jersey",
      placeholder: "Example: eBay order or jersey name",
      message: "Tell us where you ordered and what you need help with. Do not include payment details.",
      size: false,
      marketplace: false
    }
  };

  function pageProductImage(product) {
    if (!product) return null;
    return product.querySelector("img")
      || product.closest(".product-landing-card")?.querySelector(".product-detail-gallery img")
      || product.closest("article")?.querySelector("img");
  }

  function applyProductContext(product = pageProduct) {
    const id = product?.dataset.productId || "";
    const name = product?.dataset.productName || "";
    const image = pageProductImage(product);
    form.elements.product_id.value = id;
    form.elements.product_name.value = name;
    if (name) form.elements.jersey_request.value = name;
    productContext.hidden = !name;
    productName.textContent = name;
    if (image?.src) {
      productImage.src = image.currentSrc || image.src;
      productImage.alt = name ? `${name} product photo` : "Selected jersey";
      productImage.hidden = false;
    } else {
      productImage.removeAttribute("src");
      productImage.alt = "";
      productImage.hidden = true;
    }
  }

  function clearProductContext() {
    form.elements.product_id.value = "";
    form.elements.product_name.value = "";
    form.elements.jersey_request.value = "";
    productContext.hidden = true;
    productImage.removeAttribute("src");
    productImage.alt = "";
  }

  function chooseRequestType(type, focusDetails = true) {
    const config = requestTypes[type];
    if (!config) return;
    requestTypeInput.value = type;
    requestTypeButtons.forEach(button => {
      const selected = button.dataset.helpRequestType === type;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    jerseyLabel.textContent = config.label;
    form.elements.jersey_request.placeholder = config.placeholder;
    form.elements.message.placeholder = config.message;
    sizeField.hidden = !config.size;
    marketplaceField.hidden = !config.marketplace;
    if (!config.size) form.elements.size.value = "";
    if (!config.marketplace) form.elements.marketplace_preference.value = "";
    requestDetails.hidden = false;
    if (focusDetails) {
      window.setTimeout(() => form.elements.instagram_username.focus(), 80);
    }
  }

  function resetRequestFlow() {
    sent = false;
    form.reset();
    form.hidden = false;
    success.hidden = true;
    requestDetails.hidden = true;
    requestTypeButtons.forEach(button => {
      button.classList.remove("active");
      button.setAttribute("aria-pressed", "false");
    });
    status.textContent = "";
    status.className = "help-widget-status";
    applyProductContext();
  }

  applyProductContext();

  function setOpen(open) {
    panel.hidden = !open;
    overlay.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    widget.classList.toggle("open", open);
    document.body.classList.toggle("help-modal-open", open);
    if (open) {
      window.setTimeout(() => {
        if (sent) sendAnother?.focus();
        else if (requestDetails.hidden) requestTypeButtons[0]?.focus();
        else form.elements.instagram_username?.focus();
      }, 80);
    }
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  document.addEventListener("click", event => {
    const button = event.target.closest?.("[data-open-help]");
    if (!button) return;
    event.preventDefault();
    const selectedProduct = button.closest("[data-meta-product]") || pageProduct;
    if (selectedProduct) applyProductContext(selectedProduct);
    setOpen(true);
    const label = String(button.textContent || "").toLowerCase();
    const requestedType = button.dataset.helpRequestType
      || (label.includes("jersey") || label.includes("request") ? "jersey_request" : "");
    if (requestedType) chooseRequestType(requestedType, true);
  });
  requestTypeButtons.forEach(button => {
    button.addEventListener("click", () => chooseRequestType(button.dataset.helpRequestType));
  });
  clearProduct?.addEventListener("click", clearProductContext);
  sendAnother?.addEventListener("click", () => {
    resetRequestFlow();
    requestTypeButtons[0]?.focus();
  });
  close.addEventListener("click", () => setOpen(false));
  overlay.addEventListener("click", () => setOpen(false));

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) setOpen(false);
  });

  panel.addEventListener("touchstart", event => {
    touchStartY = event.touches?.[0]?.clientY || 0;
  }, { passive: true });

  panel.addEventListener("touchend", event => {
    const endY = event.changedTouches?.[0]?.clientY || 0;
    if (touchStartY && endY - touchStartY > 90 && panel.scrollTop < 8) {
      setOpen(false);
    }
    touchStartY = 0;
  }, { passive: true });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (sent || submitting) return;
    if (!requestTypes[requestTypeInput.value]) {
      status.textContent = "Choose what you need help with first.";
      status.className = "help-widget-status error";
      requestTypeButtons[0]?.focus();
      return;
    }

    status.textContent = "Sending...";
    status.className = "help-widget-status";
    submit.disabled = true;
    submit.textContent = "Sending...";
    submitting = true;

    try {
      const body = Object.fromEntries(new FormData(form).entries());
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.error) throw new Error(data.error || "Message failed");
      sent = true;
      status.textContent = "";
      status.className = "help-widget-status";
      form.reset();
      form.hidden = true;
      success.hidden = false;
      successMessage.textContent = data.request_id
        ? `Thanks! Request #${data.request_id} has been received. I’ll reply to your Instagram account.`
        : "Thanks! Your request has been received. I’ll reply to your Instagram account.";
      successId.textContent = data.request_id ? `#${data.request_id}` : "Submitted";
      successType.textContent = requestTypeButtons.find(button => button.dataset.helpRequestType === body.request_type)?.querySelector("strong")?.textContent || "Customer request";
      successJersey.textContent = body.jersey_request || "Not specified";
      successInstagram.textContent = `@${String(body.instagram_username || "").replace(/^@+/, "")}`;
    } catch (error) {
      status.textContent = error.message || "Message could not send right now. Please try again.";
      status.classList.add("error");
      submit.disabled = false;
    } finally {
      submitting = false;
      submit.textContent = defaultSubmitText;
      if (!sent) submit.disabled = false;
    }
  });
}

createHelpWidget();

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  const status = contactForm.querySelector("[data-form-status]");
  const button = contactForm.querySelector("button[type='submit']");
  const endpoint = "https://formsubmit.co/ajax/ea2a0d2ec2d90eeae272b9a983fa788c";

  contactForm.addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "Sending...";
    status.className = "form-status";
    button.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(contactForm)
      });

      if (!response.ok) throw new Error("Message failed");
      contactForm.reset();
      status.textContent = "Thanks! Your message has been sent. I'll get back to you as soon as possible.";
      status.classList.add("success");
    } catch (error) {
      status.textContent = "Message could not send right now. Please try again or DM @jerseysfrmjb on Instagram.";
      status.classList.add("error");
    } finally {
      button.disabled = false;
    }
  });
}
