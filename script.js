const toggle = document.querySelector(".menu-toggle");
const drawer = document.querySelector(".drawer");
const backdrop = document.querySelector(".drawer-backdrop");
const closeButton = document.querySelector(".drawer-close");

function setDrawer(open) {
  if (!drawer || !backdrop || !toggle) return;
  drawer.classList.toggle("open", open);
  backdrop.classList.toggle("open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  toggle.setAttribute("aria-expanded", String(open));
}

if (toggle && closeButton && backdrop) {
  toggle.addEventListener("click", () => setDrawer(true));
  closeButton.addEventListener("click", () => setDrawer(false));
  backdrop.addEventListener("click", () => setDrawer(false));
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function isAvailable(item) {
  return Number(item.quantity) > 0;
}

function sortInventory(items) {
  return [...items].sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)) || a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

function sizeTokens(size = "") {
  return String(size)
    .replace(/&amp;/g, "&")
    .split(/&|,|\+|\/|\u00b7|\band\b/i)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part.replace(/Player Version/i, "").trim())
    .filter(Boolean);
}

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
  return (item.photos || []).map((photo, index) => `
    <div class="slide${index === 0 ? " active" : ""}">
      <img decoding="async" loading="lazy" src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || item.name)}">
      ${sold && index === 0 ? '<p class="product-status out-of-stock">Out of Stock</p>' : ""}
    </div>`).join("");
}

function renderProductCard(item) {
  const available = isAvailable(item);
  const links = item.links || {};
  const buy = available
    ? `<a class="buy-link" href="${escapeHtml(links.depop || "https://www.depop.com/jerseysfrmjb/")}" target="_blank" rel="noopener">Buy on Depop</a>`
    : '<span class="buy-link disabled" aria-disabled="true">Sold Out</span>';

  return `
    <article data-stock="${available ? "available" : "sold-out"}" data-size="${escapeHtml(sizeTokens(item.size).join("|").toLowerCase())}" data-id="${escapeHtml(item.id)}">
      <div class="product-photo product-slider" data-slider>
        <div class="slides product-slides">${renderSlides(item)}</div>
        <div class="product-controls"><button data-prev type="button" aria-label="Previous photo">&lsaquo;</button><div class="slider-dots"></div><button data-next type="button" aria-label="Next photo">&rsaquo;</button></div>
      </div>
      ${available ? "" : '<p class="notice sold">Out of Stock</p>'}
      <h2>${escapeHtml(item.name)}</h2>
      <p>${escapeHtml(item.size)}</p>
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
        <div class="featured-meta"><p>${escapeHtml(item.size)}</p><strong>$${escapeHtml(item.price)}</strong></div>
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
  const buttons = [...filterGroup.querySelectorAll("[data-filter]")];
  const sizeSelect = filterGroup.querySelector("[data-size-filter]");
  const sizes = [...new Set(cards.flatMap(card => (card.dataset.size || "").split("|").filter(Boolean)))].sort();

  if (sizeSelect) {
    sizeSelect.innerHTML = '<option value="all">Size</option>' + sizes.map(size => `<option value="${escapeHtml(size)}">${escapeHtml(size.replace(/\b\w/g, char => char.toUpperCase()))}</option>`).join("");
  }

  function apply() {
    const active = filterGroup.querySelector("[data-filter].active")?.dataset.filter || "all";
    const selectedSize = sizeSelect?.value || "all";
    cards.forEach(card => {
      const stockMatch = active === "all" || card.dataset.stock === active;
      const sizeMatch = selectedSize === "all" || (card.dataset.size || "").split("|").includes(selectedSize);
      card.hidden = !stockMatch || !sizeMatch;
    });
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(item => item.classList.toggle("active", item === button));
      apply();
    });
  });
  sizeSelect?.addEventListener("change", apply);
  apply();
}

async function renderInventoryGrids() {
  const grids = [...document.querySelectorAll("[data-inventory-grid]")];
  await Promise.all(grids.map(async grid => {
    const data = await fetchInventory({ category: grid.dataset.category });
    const items = sortInventory(data.items || []);
    grid.innerHTML = items.map(renderProductCard).join("");
    initSliders(grid);
    setupFilters(grid.closest(".inventory-page")?.querySelector(".inventory-filter"), [...grid.querySelectorAll("article")]);
  }));
}

async function renderFeaturedGrid() {
  const grid = document.querySelector("[data-featured-grid]");
  if (!grid) return;
  const data = await fetchInventory({ featured: "true" });
  const items = sortInventory(data.items || []).slice(0, 3);
  grid.innerHTML = items.map(renderFeaturedCard).join("");
}

renderInventoryGrids();
renderFeaturedGrid();
initSliders();

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
