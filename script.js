const toggle = document.querySelector(".menu-toggle");
const drawer = document.querySelector(".drawer");
const backdrop = document.querySelector(".drawer-backdrop");
const closeButton = document.querySelector(".drawer-close");

function enhanceMobileDrawer() {
  if (!drawer || drawer.dataset.enhanced === "true") return;

  drawer.dataset.enhanced = "true";
  drawer.insertAdjacentHTML("afterbegin", `
    <div class="drawer-brand">
      <img src="assets/jerseysfrmjb-logo.jpg" alt="JerseysFrmJB logo">
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
  ["club-barcelona-raphinha-home-2526", 200],
  ["club-barcelona-yamal-home-2526", 210],
  ["club-real-madrid-mbappe-home-2526", 220],
  ["club-real-madrid-bellingham-home-2526", 230]
]);

function effectiveSortOrder(item) {
  if (item?.category === "club" && CLUB_TOP_ORDER.has(item.id)) {
    return CLUB_TOP_ORDER.get(item.id);
  }
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
  return [item.name, item.category, categoryLabel(item.category), item.size, displaySize(item), ...(item.photos || []).map(photo => photo.alt || "")].join(" ").toLowerCase();
}

function categoryLabel(category = "") {
  return { world: "World Cup", club: "Club", retro: "Retro" }[category] || category;
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
    const response = await fetch(apiUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("API unavailable");
    return await response.json();
  } catch (error) {
    const fallback = await fetch("data/inventory.json", { headers: { Accept: "application/json" } });
    const data = await fallback.json();
    let items = data.items || [];
    if (params.category) items = items.filter(item => item.category === params.category);
    if (params.featured === "true") items = items.filter(item => item.featured);
    return { items: sortInventory(items) };
  }
}

function renderSlides(item) {
  const sold = !isAvailable(item);
  const newArrival = isNewArrival(item) ? '<p class="product-status new-arrival">New Arrival</p>' : "";
  return (item.photos || []).map((photo, index) => `
    <div class="slide${index === 0 ? " active" : ""}">
      <img decoding="async" loading="lazy" src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || item.name)}">
      ${sold && index === 0 ? '<p class="product-status out-of-stock">Out of Stock</p>' : ""}
      ${index === 0 ? newArrival : ""}
    </div>`).join("");
}

function renderProductCard(item) {
  const available = isAvailable(item);
  const links = item.links || {};
  const sizes = displaySize(item);
  const buy = available
    ? `<a class="buy-link" href="${escapeHtml(links.depop || "https://www.depop.com/jerseysfrmjb/")}" target="_blank" rel="noopener">Buy on Depop</a>`
    : '<span class="buy-link disabled" aria-disabled="true">Sold Out</span>';

  return `
    <article data-stock="${available ? "available" : "sold-out"}" data-category="${escapeHtml(item.category || "")}" data-search="${escapeHtml(searchText(item))}" data-size="${escapeHtml(filterSizeTokens(item).join("|"))}" data-size-display="${escapeHtml(sizes)}" data-id="${escapeHtml(item.id)}">
      <div class="product-photo product-slider" data-slider>
        <div class="slides product-slides">${renderSlides(item)}</div>
        <div class="product-controls"><button data-prev type="button" aria-label="Previous photo">&lsaquo;</button><div class="slider-dots"></div><button data-next type="button" aria-label="Next photo">&rsaquo;</button></div>
      </div>
      <p class="notice category-notice">${escapeHtml(categoryLabel(item.category))}</p>
      ${available ? "" : '<p class="notice sold">Out of Stock</p>'}
      <h2>${escapeHtml(item.name)}</h2>
      <p data-card-size>${escapeHtml(sizes)}</p>
      <strong>$${escapeHtml(item.price)}</strong>
      ${buy}
    </article>`;
}

function renderFeaturedCard(item, index) {
  const available = isAvailable(item);
  const image = item.photos?.[0] || {};
  const links = item.links || {};
  const buy = available
    ? `<a class="buy-link featured-buy" href="${escapeHtml(links.depop || "https://www.depop.com/jerseysfrmjb/")}" target="_blank" rel="noopener">Buy on Depop</a>`
    : '<span class="buy-link featured-buy disabled" aria-disabled="true">Sold Out</span>';

  return `
    <article class="featured-card" data-stock="${available ? "available" : "sold-out"}">
      <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || item.name)}">
      <div class="featured-copy">
        <span>FEATURED JERSEY ${String(index + 1).padStart(2, "0")}</span>
        <h3>${escapeHtml(item.name)}</h3>
        <div class="featured-meta"><p>${escapeHtml(displaySize(item))}</p><strong>$${escapeHtml(item.price)}</strong></div>
        ${buy}
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
    const query = (searchInput?.value || "").trim().toLowerCase();
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
      const searchMatch = !query || (card.dataset.search || "").includes(query);
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
    });

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
    const updated = grid.closest(".inventory-page")?.querySelector("[data-inventory-updated]");
    if (updated) updated.textContent = formatInventoryUpdated(data.settings?.inventory_updated_at || data.updated_at || "");
    initSliders(grid);
    setupFilters(grid.closest(".inventory-page")?.querySelector(".inventory-filter, .shop-all-controls"), [...grid.querySelectorAll("article")]);
  }));
}

async function renderFeaturedGrid() {
  const grid = document.querySelector("[data-featured-grid]");
  if (!grid) return;
  const data = await fetchInventory({ featured: "true" });
  const items = (data.items || []).slice(0, 3);
  grid.innerHTML = items.map(renderFeaturedCard).join("");
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

renderInventoryGrids();
renderFeaturedGrid();
renderHomepageStats();
initSliders();
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
initReviewLightbox();

function createHelpWidget() {
  const instagramUrl = "https://www.instagram.com/jerseysfrmjb/";
  const widget = document.createElement("div");
  widget.className = "help-widget";
  widget.innerHTML = `
    <button class="help-widget-button" type="button" aria-expanded="false">
      <span>Need Help?</span>
    </button>
    <div class="help-widget-overlay" data-help-overlay hidden></div>
    <section class="help-widget-panel" aria-label="Message JerseysFrmJB" hidden>
      <div class="help-widget-head">
        <div>
          <span>Quick Message</span>
          <h2>Need Help?</h2>
        </div>
        <button class="help-widget-close" type="button" aria-label="Close message form">&times;</button>
      </div>
      <p class="help-widget-copy">Instagram DMs are currently not working for some people. Leave your Instagram username and message below. Please follow @jerseysfrmjb so I can message you back and continue the conversation.</p>
      <a class="help-instagram-link" href="${instagramUrl}" target="_blank" rel="noopener">Follow @jerseysfrmjb</a>
      <form class="help-widget-form" data-help-form>
        <input type="text" name="website" autocomplete="off" tabindex="-1" aria-hidden="true">
        <label>Instagram username
          <input name="instagram_username" type="text" placeholder="@username" autocomplete="username" required>
        </label>
        <label>Jersey or request
          <input name="jersey_request" type="text" placeholder="Example: Messi Argentina Home" required>
        </label>
        <label>Size
          <input name="size" type="text" placeholder="Example: M" required>
        </label>
        <label>Message
          <textarea name="message" rows="4" placeholder="What do you need help with?" required></textarea>
        </label>
        <button class="help-submit" type="submit">Send Message</button>
        <p class="help-widget-status" data-help-status role="status"></p>
      </form>
      <div class="help-widget-success" data-help-success hidden>
        <p>Thanks! Your message has been received. You can leave the website now. Please make sure you follow @jerseysfrmjb so I can message you back.</p>
        <a class="help-instagram-link" href="${instagramUrl}" target="_blank" rel="noopener">Open Instagram</a>
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
  const defaultSubmitText = submit.textContent;
  let sent = false;
  let submitting = false;
  let touchStartY = 0;

  function setOpen(open) {
    panel.hidden = !open;
    overlay.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    widget.classList.toggle("open", open);
    document.body.classList.toggle("help-modal-open", open);
    if (open) {
      window.setTimeout(() => form.querySelector("input[name='instagram_username']")?.focus(), 80);
    }
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  document.querySelectorAll("[data-open-help]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      setOpen(true);
    });
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
