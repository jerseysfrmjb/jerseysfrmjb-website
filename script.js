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

function activeSizes(item) {
  const sizes = item?.sizes || {};
  const order = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  return order.filter(size => Number(sizes[size]) > 0);
}

function displaySize(item) {
  const active = activeSizes(item);
  return active.length ? active.join(", ") : String(item?.size || "");
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

async function fetchSiteSettings() {
  try {
    const response = await fetch("/api/settings", { headers: { Accept: "application/json" } });
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

async function loadSiteSettings() {
  const settings = await fetchSiteSettings();
  applyHomepageBanner(settings.homepage_banner_message || "");
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
    <article data-stock="${available ? "available" : "sold-out"}" data-size="${escapeHtml(sizeTokens(displaySize(item)).join("|").toLowerCase())}" data-id="${escapeHtml(item.id)}">
      <div class="product-photo product-slider" data-slider>
        <div class="slides product-slides">${renderSlides(item)}</div>
        <div class="product-controls"><button data-prev type="button" aria-label="Previous photo">&lsaquo;</button><div class="slider-dots"></div><button data-next type="button" aria-label="Next photo">&rsaquo;</button></div>
      </div>
      ${available ? "" : '<p class="notice sold">Out of Stock</p>'}
      <h2>${escapeHtml(item.name)}</h2>
      <p>${escapeHtml(displaySize(item))}</p>
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
  const items = (data.items || []).slice(0, 3);
  grid.innerHTML = items.map(renderFeaturedCard).join("");
}

renderInventoryGrids();
renderFeaturedGrid();
initSliders();

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

