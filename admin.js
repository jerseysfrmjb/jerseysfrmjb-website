const loginSection = document.querySelector("[data-admin-login]");
const panel = document.querySelector("[data-admin-panel]");
const list = document.querySelector("[data-admin-list]");
const statusLine = document.querySelector("[data-admin-status]");
const searchInput = document.querySelector("[data-admin-search]");
const categorySelect = document.querySelector("[data-admin-category]");
const featuredPreview = document.querySelector("[data-featured-preview]");
const hideSoldFeatured = document.querySelector("[data-hide-sold-featured]");
const saveFeaturedSettings = document.querySelector("[data-save-featured-settings]");
let inventory = [];
let settings = {};
let featuredLimit = 3;

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function isAvailable(item) {
  return Number(item.quantity) > 0;
}

function itemLinks(item) {
  return item.links || {};
}

function featuredItems() {
  return inventory
    .filter(item => item.featured)
    .sort((a, b) => (Number(a.featured_order) || 999) - (Number(b.featured_order) || 999) || a.name.localeCompare(b.name))
    .slice(0, featuredLimit);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
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
          <p>${escapeHtml(item.size)} - $${escapeHtml(item.price)}</p>
        </div>
      </article>`;
  }).join("") : '<p class="empty-featured">No featured jerseys selected yet.</p>';
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  if (hideSoldFeatured) hideSoldFeatured.checked = settings.hide_sold_out_featured === "true";

  const shown = inventory
    .filter(item => category === "all" || item.category === category)
    .filter(item => !query || item.name.toLowerCase().includes(query) || item.size.toLowerCase().includes(query))
    .sort((a, b) => Number(b.quantity > 0) - Number(a.quantity > 0) || a.sort_order - b.sort_order || a.name.localeCompare(b.name));

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
          <div class="qty-row">
            <button type="button" data-minus aria-label="Decrease quantity">-</button>
            <label>Quantity<input data-field="quantity" type="number" min="0" inputmode="numeric" value="${Number(item.quantity)}"></label>
            <button type="button" data-plus aria-label="Increase quantity">+</button>
          </div>
          <div class="featured-admin-row">
            <label class="featured-check"><input data-field="featured" type="checkbox" ${featured ? "checked" : ""}> Featured</label>
            <label>Position<input data-field="featured_order" type="number" min="1" max="${featuredLimit}" inputmode="numeric" value="${featured ? Number(item.featured_order || 1) : ""}" placeholder="1-${featuredLimit}"></label>
          </div>
          <details class="edit-box">
            <summary>Edit jersey details</summary>
            <label>Player / Jersey Name<input data-field="name" value="${escapeHtml(item.name)}"></label>
            <label>Size<input data-field="size" value="${escapeHtml(item.size)}"></label>
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

  const payload = {
    id,
    name: card.querySelector('[data-field="name"]').value.trim(),
    size: card.querySelector('[data-field="size"]').value.trim(),
    quantity: Number(card.querySelector('[data-field="quantity"]').value),
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
  const input = card.querySelector('[data-field="quantity"]');

  if (event.target.matches("[data-minus]")) input.value = Math.max(0, Number(input.value) - 1);
  if (event.target.matches("[data-plus]")) input.value = Number(input.value) + 1;
  if (event.target.matches("[data-toggle]")) input.value = Number(input.value) > 0 ? 0 : 1;
  if (event.target.matches("[data-minus], [data-plus], [data-toggle], [data-save]")) {
    try { await saveCard(card); } catch (error) { statusLine.textContent = error.message; }
  }
});

list.addEventListener("change", event => {
  const card = event.target.closest(".admin-card");
  if (!card || !event.target.matches('[data-field="featured"]')) return;
  const order = card.querySelector('[data-field="featured_order"]');
  if (event.target.checked && !order.value) {
    const used = new Set(featuredItems().map(item => Number(item.featured_order)).filter(Boolean));
    order.value = [1, 2, 3].find(position => !used.has(position)) || 1;
  }
});

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
loadInventory();
