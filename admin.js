const loginSection = document.querySelector("[data-admin-login]");
const panel = document.querySelector("[data-admin-panel]");
const list = document.querySelector("[data-admin-list]");
const statusLine = document.querySelector("[data-admin-status]");
const searchInput = document.querySelector("[data-admin-search]");
const categorySelect = document.querySelector("[data-admin-category]");
const featuredPreview = document.querySelector("[data-featured-preview]");
const hideSoldFeatured = document.querySelector("[data-hide-sold-featured]");
const saveFeaturedSettings = document.querySelector("[data-save-featured-settings]");
const bannerMessage = document.querySelector("[data-banner-message]");
const saveBanner = document.querySelector("[data-save-banner]");
let inventory = [];
let settings = {};
let featuredLimit = 3;
let sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];

const bannerPresets = {
  live: "World Cup Restock LIVE\nNew World Cup jerseys are in stock now. Message @jerseysfrmjb for questions or requests.",
  almost: "Almost Sold Out\nThanks for all the support! Only a few jerseys remain. Next restock coming soon.",
  soon: "Next Drop Coming Soon\nMore jerseys are coming soon. Fill out the contact form to request a jersey."
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function isAvailable(item) {
  return Number(item.quantity) > 0;
}

function itemLinks(item) {
  return item.links || {};
}

function itemSizes(item) {
  return item.sizes || {};
}

function activeSizeText(item) {
  const active = sizeOptions.filter(size => Number(itemSizes(item)[size]) > 0);
  return active.length ? active.join(", ") : item.size;
}

function featuredItems() {
  return inventory
    .filter(item => item.featured)
    .sort((a, b) => (Number(a.featured_order) || 999) - (Number(b.featured_order) || 999) || a.name.localeCompare(b.name))
    .slice(0, featuredLimit);
}

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
  } catch (error) {
    throw new Error("Could not reach the server. Refresh and try again.");
  }
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch (error) { data = {}; }
  if (!response.ok) throw new Error(data.error || text || `Request failed (${response.status})`);
  return data;
}

function showPanel() {
  loginSection.hidden = true;
  panel.hidden = false;
}

function renderFeaturedPreview() {
  if (!featuredPreview) return;
  const items = featuredItems();
  featuredPreview.innerHTML = items.length ? items.map((item, index) => {
    const photo = item.photos?.[0] || {};
    return `
      <article class="admin-featured-card" data-id="${escapeHtml(item.id)}" draggable="true">
        <img src="${escapeHtml(photo.src || "assets/jerseysfrmjb-logo.jpg")}" alt="${escapeHtml(photo.alt || item.name)}">
        <div>
          <span>Position ${Number(item.featured_order) || index + 1} ${isAvailable(item) ? "" : "- Sold Out"}</span>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(activeSizeText(item))} - $${escapeHtml(item.price)}</p>
        </div>
      </article>`;
  }).join("") : '<p class="empty-featured">No featured jerseys selected yet.</p>';
}

function renderSizeControls(item) {
  const sizes = itemSizes(item);
  return `
    <div class="size-admin-grid" data-size-grid>
      ${sizeOptions.map(size => {
        const qty = Number(sizes[size] || 0);
        return `
          <label class="size-admin-box">
            <span><input data-size-check="${escapeHtml(size)}" type="checkbox" ${qty > 0 ? "checked" : ""}> ${escapeHtml(size)}</span>
            <input data-size-qty="${escapeHtml(size)}" type="number" min="0" inputmode="numeric" value="${qty}" aria-label="${escapeHtml(size)} quantity">
          </label>`;
      }).join("")}
    </div>`;
}

function readSizeControls(card) {
  const sizes = {};
  sizeOptions.forEach(size => {
    const checked = card.querySelector(`[data-size-check="${size}"]`)?.checked;
    const qty = Math.max(0, Math.floor(Number(card.querySelector(`[data-size-qty="${size}"]`)?.value || 0)));
    if (checked && qty > 0) sizes[size] = qty;
  });
  return sizes;
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  if (hideSoldFeatured) hideSoldFeatured.checked = settings.hide_sold_out_featured === "true";
  if (bannerMessage) bannerMessage.value = settings.homepage_banner_message || bannerPresets.soon;

  const shown = inventory
    .filter(item => category === "all" || item.category === category)
    .filter(item => !query || item.name.toLowerCase().includes(query) || activeSizeText(item).toLowerCase().includes(query))
    .sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)) || a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  list.innerHTML = shown.map(item => {
    const links = itemLinks(item);
    const available = isAvailable(item);
    const featured = Boolean(item.featured);
    return `
      <article class="admin-card" data-id="${escapeHtml(item.id)}">
        <div class="admin-card-photo"><img src="${escapeHtml(item.photos?.[0]?.src || "assets/jerseysfrmjb-logo.jpg")}" alt="${escapeHtml(item.photos?.[0]?.alt || item.name)}"></div>
        <div class="admin-card-main">
          <div class="admin-card-head">
            <div>
              <span>${escapeHtml(item.category)}</span>
              <h2>${escapeHtml(item.name)}</h2>
            </div>
            <button class="stock-toggle ${available ? "on" : "off"}" type="button" data-toggle>${available ? "In Stock" : "Sold Out"}</button>
          </div>
          ${renderSizeControls(item)}
          <div class="featured-admin-row">
            <label class="featured-check"><input data-field="featured" type="checkbox" ${featured ? "checked" : ""}> Featured</label>
            <label>Position<input data-field="featured_order" type="number" min="1" max="${featuredLimit}" inputmode="numeric" value="${featured ? Number(item.featured_order || 1) : ""}" placeholder="1-${featuredLimit}"></label>
          </div>
          <details class="edit-box">
            <summary>Edit jersey details</summary>
            <label>Player / Jersey Name<input data-field="name" value="${escapeHtml(item.name)}"></label>
            <label>Depop Link<input data-field="depop" value="${escapeHtml(links.depop || "")}"></label>
            <label>eBay Link<input data-field="ebay" value="${escapeHtml(links.ebay || "")}"></label>
          </details>
          <button class="shop-button save-admin" type="button" data-save>Save Changes</button>
        </div>
      </article>`;
  }).join("");
  renderFeaturedPreview();
}

function applyAdminData(data) {
  if (Array.isArray(data.items)) inventory = data.items;
  if (data.item) inventory = inventory.map(item => item.id === data.item.id ? data.item : item);
  if (data.settings) settings = data.settings;
  if (data.featuredLimit) featuredLimit = Number(data.featuredLimit) || 3;
  if (Array.isArray(data.sizeOptions)) sizeOptions = data.sizeOptions;
}

async function loadInventory() {
  try {
    const data = await api("/api/admin/inventory");
    applyAdminData(data);
    showPanel();
    render();
  } catch (error) {
    document.querySelector("[data-login-status]").textContent = error.message === "Not authorized" ? "Enter the admin password." : error.message;
  }
}

async function saveCard(card) {
  const id = card.dataset.id;
  const original = inventory.find(item => item.id === id);
  const links = { ...(original.links || {}) };
  links.depop = card.querySelector('[data-field="depop"]').value.trim();
  links.ebay = card.querySelector('[data-field="ebay"]').value.trim();

  const featured = card.querySelector('[data-field="featured"]').checked;
  const featuredOrder = Number(card.querySelector('[data-field="featured_order"]').value);
  const sizes = readSizeControls(card);
  const quantity = Object.values(sizes).reduce((sum, qty) => sum + Number(qty), 0);

  const payload = {
    id,
    name: card.querySelector('[data-field="name"]').value.trim(),
    quantity,
    sizes,
    featured,
    featured_order: featured ? featuredOrder : 0,
    links
  };

  statusLine.textContent = "Saving...";
  const data = await api("/api/admin/inventory", { method: "PATCH", body: JSON.stringify(payload) });
  applyAdminData(data);
  statusLine.textContent = "Saved.";
  render();
}

document.querySelector("[data-login-form]").addEventListener("submit", async event => {
  event.preventDefault();
  const status = document.querySelector("[data-login-status]");
  status.textContent = "Checking...";
  try {
    await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password: event.target.password.value }) });
    await loadInventory();
  } catch (error) {
    status.textContent = error.message;
  }
});

document.querySelector("[data-logout]").addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST" }).catch(() => {});
  location.reload();
});

saveFeaturedSettings?.addEventListener("click", async () => {
  statusLine.textContent = "Saving featured setting...";
  try {
    const data = await api("/api/admin/inventory", {
      method: "PATCH",
      body: JSON.stringify({ settings: { hide_sold_out_featured: hideSoldFeatured.checked } })
    });
    applyAdminData(data);
    statusLine.textContent = "Featured setting saved.";
    render();
  } catch (error) {
    statusLine.textContent = error.message;
  }
});

saveBanner?.addEventListener("click", async () => {
  statusLine.textContent = "Saving banner...";
  try {
    const data = await api("/api/admin/inventory", {
      method: "PATCH",
      body: JSON.stringify({ settings: { homepage_banner_message: bannerMessage.value } })
    });
    applyAdminData(data);
    statusLine.textContent = "Banner saved.";
    render();
  } catch (error) {
    statusLine.textContent = error.message;
  }
});

document.querySelectorAll("[data-banner-preset]").forEach(button => {
  button.addEventListener("click", () => {
    bannerMessage.value = bannerPresets[button.dataset.bannerPreset] || bannerMessage.value;
  });
});

let draggedFeaturedId = "";

featuredPreview?.addEventListener("dragstart", event => {
  const card = event.target.closest(".admin-featured-card");
  if (!card) return;
  draggedFeaturedId = card.dataset.id;
  event.dataTransfer.effectAllowed = "move";
});

featuredPreview?.addEventListener("dragover", event => {
  if (event.target.closest(".admin-featured-card")) event.preventDefault();
});

featuredPreview?.addEventListener("drop", async event => {
  const target = event.target.closest(".admin-featured-card");
  if (!target || !draggedFeaturedId || target.dataset.id === draggedFeaturedId) return;
  event.preventDefault();

  const orderedIds = featuredItems().map(item => item.id);
  const from = orderedIds.indexOf(draggedFeaturedId);
  const to = orderedIds.indexOf(target.dataset.id);
  if (from < 0 || to < 0) return;

  orderedIds.splice(from, 1);
  orderedIds.splice(to, 0, draggedFeaturedId);

  statusLine.textContent = "Saving featured order...";
  try {
    const data = await api("/api/admin/inventory", {
      method: "PATCH",
      body: JSON.stringify({ featuredOrder: orderedIds })
    });
    applyAdminData(data);
    statusLine.textContent = "Featured order saved.";
    render();
  } catch (error) {
    statusLine.textContent = error.message;
  }
});

list.addEventListener("click", async event => {
  const card = event.target.closest(".admin-card");
  if (!card) return;

  if (event.target.matches("[data-toggle]")) {
    const sizes = readSizeControls(card);
    const hasStock = Object.values(sizes).some(qty => Number(qty) > 0);
    card.querySelectorAll("[data-size-check]").forEach(input => input.checked = false);
    card.querySelectorAll("[data-size-qty]").forEach(input => input.value = 0);
    if (!hasStock) {
      const medium = card.querySelector('[data-size-check="M"]') || card.querySelector("[data-size-check]");
      const size = medium?.dataset.sizeCheck;
      if (medium && size) {
        medium.checked = true;
        card.querySelector(`[data-size-qty="${size}"]`).value = 1;
      }
    }
  }

  if (event.target.matches("[data-toggle], [data-save]")) {
    try { await saveCard(card); } catch (error) { statusLine.textContent = error.message; }
  }
});

list.addEventListener("change", event => {
  const card = event.target.closest(".admin-card");
  if (!card) return;

  if (event.target.matches('[data-field="featured"]')) {
    const order = card.querySelector('[data-field="featured_order"]');
    if (event.target.checked && !order.value) {
      const used = new Set(featuredItems().map(item => Number(item.featured_order)).filter(Boolean));
      order.value = [1, 2, 3].find(position => !used.has(position)) || 1;
    }
  }

  if (event.target.matches("[data-size-check]")) {
    const size = event.target.dataset.sizeCheck;
    const qty = card.querySelector(`[data-size-qty="${size}"]`);
    if (event.target.checked && Number(qty.value) <= 0) qty.value = 1;
    if (!event.target.checked) qty.value = 0;
  }

  if (event.target.matches("[data-size-qty]")) {
    const size = event.target.dataset.sizeQty;
    const checked = card.querySelector(`[data-size-check="${size}"]`);
    checked.checked = Number(event.target.value) > 0;
  }
});

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
loadInventory();
