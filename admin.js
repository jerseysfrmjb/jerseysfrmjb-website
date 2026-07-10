const loginSection = document.querySelector("[data-admin-login]");
const panel = document.querySelector("[data-admin-panel]");
const list = document.querySelector("[data-admin-list]");
const statusLine = document.querySelector("[data-admin-status]");
const searchInput = document.querySelector("[data-admin-search]");
const categorySelect = document.querySelector("[data-admin-category]");
let inventory = [];

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function isAvailable(item) {
  return Number(item.quantity) > 0;
}

function itemLinks(item) {
  return item.links || {};
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

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categorySelect.value;
  const shown = inventory
    .filter(item => category === "all" || item.category === category)
    .filter(item => !query || item.name.toLowerCase().includes(query) || item.size.toLowerCase().includes(query))
    .sort((a, b) => Number(b.quantity > 0) - Number(a.quantity > 0) || a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  list.innerHTML = shown.map(item => {
    const links = itemLinks(item);
    const available = isAvailable(item);
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
}

async function loadInventory() {
  try {
    const data = await api("/api/admin/inventory");
    inventory = data.items;
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

  const payload = {
    id,
    name: card.querySelector('[data-field="name"]').value.trim(),
    size: card.querySelector('[data-field="size"]').value.trim(),
    quantity: Number(card.querySelector('[data-field="quantity"]').value),
    links
  };

  statusLine.textContent = "Saving...";
  const data = await api("/api/admin/inventory", { method: "PATCH", body: JSON.stringify(payload) });
  inventory = inventory.map(item => item.id === id ? data.item : item);
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
    status.textContent = "Wrong password or admin setup missing.";
  }
});

document.querySelector("[data-logout]").addEventListener("click", async () => {
  await api("/api/admin/logout", { method: "POST" }).catch(() => {});
  location.reload();
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

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
loadInventory();
