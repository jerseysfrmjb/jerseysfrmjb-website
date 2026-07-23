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
const tickerMessage = document.querySelector("[data-ticker-message]");
const statMessage = document.querySelector("[data-stat-message]");
const saveBanner = document.querySelector("[data-save-banner]");
const messagesList = document.querySelector("[data-admin-messages]");
const messageCount = document.querySelector("[data-message-count]");
const refreshMessages = document.querySelector("[data-refresh-messages]");
const adminSummary = document.querySelector("[data-admin-summary]");
const adminQuick = document.querySelector("[data-admin-quick]");
const adminFilterButtons = [...document.querySelectorAll("[data-admin-filter]")];
const bulkLines = document.querySelector("[data-bulk-lines]");
const bulkMode = document.querySelector("[data-bulk-mode]");
const bulkCsv = document.querySelector("[data-bulk-csv]");
const bulkPreviewBox = document.querySelector("[data-bulk-preview]");
const bulkStatus = document.querySelector("[data-bulk-status]");
const previewRestock = document.querySelector("[data-preview-restock]");
const applyRestock = document.querySelector("[data-apply-restock]");
const undoRestock = document.querySelector("[data-undo-restock]");
const presetSelect = document.querySelector("[data-restock-preset-select]");
const presetName = document.querySelector("[data-restock-preset-name]");
const saveRestockPreset = document.querySelector("[data-save-restock-preset]");
const loadRestockPreset = document.querySelector("[data-load-restock-preset]");
const deleteRestockPreset = document.querySelector("[data-delete-restock-preset]");
const adminTabs = [...document.querySelectorAll("[data-admin-tab]")];
const adminSections = [...document.querySelectorAll("[data-admin-section]")];
const salesTable = document.querySelector("[data-sales-table]");
const salesSearch = document.querySelector("[data-sales-search]");
const salesPlatform = document.querySelector("[data-sales-platform]");
const salesDate = document.querySelector("[data-sales-date]");
const salesExport = document.querySelector("[data-sales-export]");
const salesStatus = document.querySelector("[data-sales-status]");
const refreshSales = document.querySelector("[data-refresh-sales]");
let inventory = [];
let settings = {};
let featuredLimit = 3;
let sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
let messages = [];
let unreadMessages = 0;
let adminFilter = "all";
let restockPresets = [];
let lastBulkRestock = null;
let currentBulkPreview = null;
let sales = [];
let salesLoaded = false;
let currentAdminTab = "dashboard";

const bannerPresets = {
  live: {
    banner: "World Cup Jerseys Available Now!\nA few World Cup jerseys are now available in Small & Large. DM @jerseysfrmjb for questions or requests.",
    ticker: "ðŸ”¥ WORLD CUP JERSEYS AVAILABLE NOW â€¢ SMALL & LARGE SIZES IN STOCK â€¢ DM @JERSEYSFRMJB FOR REQUESTS â¤ï¸",
    stat: "Small & Large Available"
  },
  almost: {
    banner: "Small Drop Almost Sold Out\nThanks for all the support! Only a few jerseys remain from the small drop. Fill out the contact form to request a jersey.",
    ticker: "ðŸš¨ SMALL DROP ALMOST SOLD OUT â€¢ BIG DROP COMING SOON â€¢ TAP NEED HELP TO REQUEST â¤ï¸",
    stat: "Small Drop Almost Sold Out"
  },
  soon: {
    banner: "Next Drop Coming Soon\nMore jerseys are coming soon. Fill out the contact form to request a jersey.",
    ticker: "ðŸ”¥ NEXT DROP COMING SOON â€¢ TAP NEED HELP TO REQUEST A JERSEY â¤ï¸",
    stat: "More Jerseys Coming Soon"
  }
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function setAdminTab(tab = "dashboard") {
  currentAdminTab = tab;
  adminTabs.forEach(button => button.classList.toggle("active", button.dataset.adminTab === tab));
  adminSections.forEach(section => {
    section.hidden = section.dataset.adminSection !== tab;
  });
  if (tab === "sales" && !salesLoaded) loadSales();
}

function saleDateValue(sale) {
  return sale.created_at || sale.timestamp || sale.date || "";
}

function formatSaleDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function saleDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function saleJerseyName(sale) {
  return sale.product_name || sale.jersey || sale.name || "Unknown jersey";
}

function formatSalePrice(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return escapeHtml(value);
  return `$${number.toFixed(2).replace(/\.00$/, "")}`;
}

function filteredSales() {
  const query = (salesSearch?.value || "").trim().toLowerCase();
  const platform = salesPlatform?.value || "all";
  const dateFilter = salesDate?.value || "";
  return sales.filter(sale => {
    const saleText = [saleJerseyName(sale), sale.player, sale.team_country, sale.size, sale.platform].join(" ").toLowerCase();
    const platformMatch = platform === "all" || String(sale.platform || "").toLowerCase() === platform.toLowerCase();
    const dateMatch = !dateFilter || saleDateInputValue(saleDateValue(sale)) === dateFilter;
    return (!query || saleText.includes(query)) && platformMatch && dateMatch;
  });
}

function renderSales() {
  if (!salesTable) return;
  const rows = filteredSales();
  if (!rows.length) {
    salesTable.innerHTML = `<tr><td colspan="6" class="sales-empty">${salesLoaded ? "No sales match those filters." : "Log in to view sales."}</td></tr>`;
    return;
  }
  salesTable.innerHTML = rows.map(sale => `
    <tr>
      <td>${escapeHtml(formatSaleDate(saleDateValue(sale)))}</td>
      <td>${escapeHtml(saleJerseyName(sale))}</td>
      <td>${escapeHtml(sale.size || "-")}</td>
      <td>${escapeHtml(sale.quantity ?? 0)}</td>
      <td>${escapeHtml(sale.platform || "-")}</td>
      <td>${formatSalePrice(sale.sale_price)}</td>
    </tr>
  `).join("");
}

async function loadSales() {
  if (!salesTable) return;
  if (salesStatus) salesStatus.textContent = "Loading sales...";
  try {
    const data = await api("/api/admin/sales");
    sales = Array.isArray(data) ? data : Array.isArray(data.sales) ? data.sales : [];
    salesLoaded = true;
    renderSales();
    if (salesStatus) salesStatus.textContent = sales.length ? `${sales.length} sale${sales.length === 1 ? "" : "s"} loaded.` : "No sales recorded yet.";
  } catch (error) {
    if (salesStatus) salesStatus.textContent = error.message;
    salesTable.innerHTML = `<tr><td colspan="6" class="sales-empty">Sales could not be loaded.</td></tr>`;
  }
}

function csvValue(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function exportSalesCsv() {
  const rows = filteredSales();
  const csvRows = [
    ["Date", "Jersey", "Size", "Quantity", "Platform", "Sale Price"],
    ...rows.map(sale => [
      formatSaleDate(saleDateValue(sale)),
      saleJerseyName(sale),
      sale.size || "",
      sale.quantity ?? 0,
      sale.platform || "",
      sale.sale_price ?? ""
    ])
  ];
  const blob = new Blob([csvRows.map(row => row.map(csvValue).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "jerseysfrmjb-sales.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function totalQuantity(item) {
  const sizes = item?.sizes || {};
  const sizeTotal = Object.values(sizes).reduce((sum, qty) => sum + Math.max(0, Math.floor(Number(qty || 0))), 0);
  return sizeTotal || Math.max(0, Math.floor(Number(item?.quantity || 0)));
}

function isAvailable(item) {
  return totalQuantity(item) > 0;
}

function isLowStock(item) {
  const qty = totalQuantity(item);
  return qty > 0 && qty <= 2;
}

function isRecentlyAdded(item) {
  if (item.new_arrival) return true;
  if (!item.date_added) return false;
  const date = new Date(String(item.date_added).includes("T") ? item.date_added : item.date_added + "T00:00:00");
  return !Number.isNaN(date.getTime()) && (Date.now() - date.getTime()) / 86400000 <= 7;
}

function categoryLabel(category = "") {
  return { world: "World Cup", club: "Club", retro: "Retro" }[category] || category;
}

function itemSearchText(item) {
  return [item.name, item.category, categoryLabel(item.category), item.size, activeSizeText(item), ...(item.photos || []).map(photo => photo.alt || "")].join(" ").toLowerCase();
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

function renderPresetOptions() {
  if (!presetSelect) return;
  const selected = presetSelect.value;
  presetSelect.innerHTML = '<option value="">Load saved preset</option>' + restockPresets
    .map(preset => `<option value="${escapeHtml(preset.id)}">${escapeHtml(preset.name)}</option>`)
    .join("");
  if (selected && restockPresets.some(preset => preset.id === selected)) presetSelect.value = selected;
}

function productOptions(selectedId = "") {
  return '<option value="">Choose matching jersey</option>' + inventory
    .map(item => `<option value="${escapeHtml(item.id)}" ${item.id === selectedId ? "selected" : ""}>${escapeHtml(item.name)} (${escapeHtml(categoryLabel(item.category))})</option>`)
    .join("");
}

function sizeSelectOptions(selectedSize = "") {
  return sizeOptions
    .map(size => `<option value="${escapeHtml(size)}" ${size === selectedSize ? "selected" : ""}>${escapeHtml(size)}</option>`)
    .join("");
}

function readBulkCorrections() {
  const corrections = {};
  bulkPreviewBox?.querySelectorAll("[data-correction-line]").forEach(row => {
    const line = row.dataset.correctionLine;
    const itemId = row.querySelector("[data-correction-product]")?.value || "";
    const size = row.querySelector("[data-correction-size]")?.value || "";
    const quantity = row.querySelector("[data-correction-quantity]")?.value || "";
    if (itemId || size || quantity) corrections[line] = { itemId, size, quantity };
  });
  return corrections;
}

function parseCsvRows(text = "") {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function csvToRestockLines(text = "") {
  const rows = parseCsvRows(text);
  if (!rows.length) return "";
  const header = rows[0].map(cell => cell.toLowerCase());
  const productIndex = header.indexOf("product");
  const sizeIndex = header.indexOf("size");
  const quantityIndex = header.indexOf("quantity");
  const dataRows = productIndex >= 0 && sizeIndex >= 0 && quantityIndex >= 0 ? rows.slice(1) : rows;
  return dataRows
    .map(row => {
      const product = productIndex >= 0 ? row[productIndex] : row[0];
      const size = sizeIndex >= 0 ? row[sizeIndex] : row[1];
      const quantity = quantityIndex >= 0 ? row[quantityIndex] : row[2];
      return [product, size, quantity].filter(value => value !== undefined).join(" | ");
    })
    .filter(line => line.replace(/[|\s]/g, ""))
    .join("\n");
}

function renderBulkPreview(preview) {
  currentBulkPreview = preview || null;
  if (!bulkPreviewBox) return;
  if (!preview) {
    bulkPreviewBox.innerHTML = "";
    if (applyRestock) applyRestock.disabled = true;
    return;
  }
  if (applyRestock) applyRestock.disabled = !preview.canApply;

  const matched = preview.matchedItems?.length ? `
    <section class="bulk-preview-card">
      <h3>Matched Items</h3>
      <div class="bulk-table">
        <div class="bulk-table-head"><span>Line</span><span>Jersey</span><span>Size</span><span>Current</span><span>New</span></div>
        ${preview.matchedItems.map(item => `
          <div class="bulk-table-row">
            <span>${escapeHtml(item.lineNumber)}</span>
            <span>${escapeHtml(item.itemName)}</span>
            <span>${escapeHtml(item.size)}</span>
            <span>${escapeHtml(item.currentQuantity)}</span>
            <span>${escapeHtml(item.newQuantity)}</span>
          </div>`).join("")}
      </div>
    </section>` : "";

  const duplicates = preview.duplicateItems?.length ? `
    <section class="bulk-preview-card warning">
      <h3>Duplicate / Conflicting Lines</h3>
      ${preview.duplicateItems.map(item => `
        <p><b>${escapeHtml(item.itemName)} (${escapeHtml(item.size)})</b> appears on lines ${escapeHtml(item.lineNumbers.join(", "))}. ${item.conflicting ? "Set quantity mode cannot apply duplicates." : "Add mode will combine these quantities."}</p>
      `).join("")}
    </section>` : "";

  const unmatched = preview.unmatchedItems?.length ? `
    <section class="bulk-preview-card error">
      <h3>Unmatched Items</h3>
      ${preview.unmatchedItems.map(item => `
        <article class="bulk-correction" data-correction-line="${escapeHtml(item.lineNumber)}">
          <div>
            <strong>Line ${escapeHtml(item.lineNumber)}: ${escapeHtml(item.input)}</strong>
            <small>${escapeHtml(item.reason || "Choose the matching jersey.")}</small>
          </div>
          <label>Correct Jersey
            <select data-correction-product>${productOptions("")}</select>
          </label>
          <label>Size
            <select data-correction-size>${sizeSelectOptions(item.size || "")}</select>
          </label>
          <label>Quantity
            <input type="number" min="1" inputmode="numeric" data-correction-quantity value="${escapeHtml(Math.max(1, Number(item.quantity || 1)))}">
          </label>
        </article>`).join("")}
    </section>` : "";

  bulkPreviewBox.innerHTML = `
    <div class="bulk-preview-summary">
      <span>${escapeHtml(preview.lineCount || 0)} lines checked</span>
      <span>${escapeHtml(preview.matchedItems?.length || 0)} matched</span>
      <span>${escapeHtml(preview.unmatchedItems?.length || 0)} unmatched</span>
      <span>${escapeHtml(preview.totalQuantity || 0)} jerseys total added</span>
    </div>
    ${matched}
    ${duplicates}
    ${unmatched}
  `;
}

function formatAdminDate(value = "") {
  if (!value) return "";
  const date = new Date(String(value).includes("T") ? value : value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
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
  if (!response.ok) {
    const plainText = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const message = data.error || (text.trim().startsWith("<") ? `Server error (${response.status}). The site returned an error page instead of JSON.` : plainText) || `Request failed (${response.status})`;
    const error = new Error(message);
    Object.assign(error, data);
    throw error;
  }
  return data;
}

function showPanel() {
  loginSection.hidden = true;
  panel.hidden = false;
  setAdminTab(currentAdminTab || "dashboard");
}

function formatMessageDate(value = "") {
  if (!value) return "";
  const date = new Date(value.endsWith("Z") ? value : value + "Z");
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function instagramProfile(username = "") {
  const clean = String(username || "").replace(/^@+/, "").trim();
  return clean ? "https://www.instagram.com/" + encodeURIComponent(clean) + "/" : "https://www.instagram.com/jerseysfrmjb/";
}

function renderMessages() {
  if (!messagesList) return;
  if (messageCount) messageCount.textContent = unreadMessages + " unread";
  messagesList.innerHTML = messages.length ? messages.map(message => {
    const read = message.status === "read";
    const username = String(message.instagram_username || "").replace(/^@+/, "");
    return `
      <article class="admin-message-card ${read ? "read" : "unread"}" data-id="${escapeHtml(message.id)}" data-status="${escapeHtml(message.status || "unread")}">
        <div class="admin-message-main">
          <div class="admin-message-title">
            <span>${read ? "Read" : "Unread"}</span>
            <h3>@${escapeHtml(username)}</h3>
          </div>
          <p><b>Jersey/request:</b> ${escapeHtml(message.jersey_request)}</p>
          <p><b>Size:</b> ${escapeHtml(message.size)}</p>
          <p class="admin-message-body">${escapeHtml(message.message)}</p>
          <small>${escapeHtml(formatMessageDate(message.created_at))}</small>
        </div>
        <div class="admin-message-actions">
          <button type="button" data-copy-username="${escapeHtml(username)}">Copy Username</button>
          <a href="${escapeHtml(instagramProfile(username))}" target="_blank" rel="noopener">Open Instagram</a>
          <button type="button" data-toggle-read>${read ? "Mark Unread" : "Mark Read"}</button>
          <button type="button" data-delete-message>Delete</button>
        </div>
      </article>`;
  }).join("") : '<p class="empty-featured">No messages yet.</p>';
}

function applyMessageData(data) {
  if (Array.isArray(data.messages)) messages = data.messages;
  unreadMessages = Number(data.unread || 0);
  renderMessages();
}

async function loadMessages() {
  if (!messagesList) return;
  messagesList.innerHTML = '<p class="empty-featured">Loading messages...</p>';
  try {
    applyMessageData(await api("/api/admin/messages"));
  } catch (error) {
    messagesList.innerHTML = `<p class="form-status error">${escapeHtml(error.message)}</p>`;
  }
}

async function updateMessage(id, status) {
  statusLine.textContent = "Updating message...";
  applyMessageData(await api("/api/admin/messages", { method: "PATCH", body: JSON.stringify({ id, status }) }));
  statusLine.textContent = "Message updated.";
}

async function deleteMessage(id) {
  statusLine.textContent = "Deleting message...";
  applyMessageData(await api("/api/admin/messages?id=" + encodeURIComponent(id), { method: "DELETE" }));
  statusLine.textContent = "Message deleted.";
}

async function copyUsername(username) {
  const value = username.startsWith("@") ? username : "@" + username;
  try {
    await navigator.clipboard.writeText(value);
    statusLine.textContent = value + " copied.";
  } catch (error) {
    statusLine.textContent = value;
  }
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

function renderAdminSummary() {
  if (!adminSummary) return;
  const availableItems = inventory.filter(isAvailable);
  const byCategory = category => inventory.filter(item => item.category === category).reduce((sum, item) => sum + totalQuantity(item), 0);
  const stats = [
    ["Total jerseys available", availableItems.reduce((sum, item) => sum + totalQuantity(item), 0)],
    ["Total products", inventory.length],
    ["World Cup inventory", byCategory("world")],
    ["Club inventory", byCategory("club")],
    ["Retro inventory", byCategory("retro")],
    ["Low-stock products", inventory.filter(isLowStock).length],
    ["Sold-out products", inventory.filter(item => !isAvailable(item)).length]
  ];
  adminSummary.innerHTML = stats.map(([label, value]) => `<article><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></article>`).join("");
}

function renderQuickSections() {
  if (!adminQuick) return;
  const groups = [
    ["Low Stock", inventory.filter(isLowStock)],
    ["Sold Out", inventory.filter(item => !isAvailable(item))],
    ["Recently Added", inventory.filter(isRecentlyAdded)]
  ];
  adminQuick.innerHTML = groups.map(([title, items]) => `
    <article class="admin-quick-card">
      <h3>${escapeHtml(title)}</h3>
      ${items.length ? items.slice(0, 8).map(item => `<button type="button" data-jump-product="${escapeHtml(item.id)}"><span>${escapeHtml(item.name)}</span><small>${escapeHtml(activeSizeText(item) || "No size")} - ${escapeHtml(categoryLabel(item.category))}</small></button>`).join("") : '<p class="empty-featured">Nothing here right now.</p>'}
    </article>`).join("");
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
  if (bannerMessage) bannerMessage.value = settings.homepage_banner_message || bannerPresets.soon.banner;
  if (tickerMessage) tickerMessage.value = settings.homepage_ticker_message || bannerPresets.soon.ticker;
  if (statMessage) statMessage.value = settings.homepage_stat_message || bannerPresets.soon.stat;

  const shown = inventory
    .filter(item => category === "all" || item.category === category)
    .filter(item => adminFilter === "all" || (adminFilter === "available" && isAvailable(item)) || (adminFilter === "sold-out" && !isAvailable(item)) || (adminFilter === "low-stock" && isLowStock(item)) || item.category === adminFilter)
    .filter(item => !query || itemSearchText(item).includes(query))
    .sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a)) || Number(a.sort_order || 0) - Number(b.sort_order || 0) || a.name.localeCompare(b.name));

  renderAdminSummary();
  renderQuickSections();

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
              <span>${escapeHtml(categoryLabel(item.category))} ${isLowStock(item) ? "Low Stock" : ""} ${isRecentlyAdded(item) ? "New Arrival" : ""}</span>
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
            <label class="featured-check"><input data-field="new_arrival" type="checkbox" ${item.new_arrival ? "checked" : ""}> New Arrival</label>
            <label>Date Added<input data-field="date_added" type="date" value="${escapeHtml((item.date_added || "").slice(0, 10))}"></label>
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
  if (Array.isArray(data.restockPresets)) restockPresets = data.restockPresets;
  if (Object.prototype.hasOwnProperty.call(data, "lastBulkRestock")) lastBulkRestock = data.lastBulkRestock;
  if (Object.prototype.hasOwnProperty.call(data, "bulkPreview")) renderBulkPreview(data.bulkPreview);
  renderPresetOptions();
}

async function loadInventory() {
  try {
    const data = await api("/api/admin/inventory");
    applyAdminData(data);
    showPanel();
    render();
    loadMessages();
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
    new_arrival: card.querySelector('[data-field="new_arrival"]')?.checked || false,
    date_added: card.querySelector('[data-field="date_added"]')?.value || "",
    links
  };

  statusLine.textContent = "Saving...";
  const data = await api("/api/admin/inventory", { method: "PATCH", body: JSON.stringify(payload) });
  applyAdminData(data);
  statusLine.textContent = "Saved.";
  render();
}

async function previewBulkRestock() {
  if (!bulkLines) return;
  bulkStatus.textContent = "Checking restock lines...";
  try {
    const data = await api("/api/admin/inventory", {
      method: "PATCH",
      body: JSON.stringify({
        bulkRestockPreview: true,
        mode: bulkMode?.value || "add",
        lines: bulkLines.value,
        corrections: readBulkCorrections()
      })
    });
    applyAdminData(data);
    bulkStatus.textContent = data.bulkPreview?.canApply ? "Preview ready. Review it, then apply when everything looks right." : "Preview ready. Fix unmatched or conflicting lines before applying.";
    render();
  } catch (error) {
    bulkStatus.textContent = error.message;
  }
}

async function applyBulkRestock() {
  if (!bulkLines || !currentBulkPreview) return;
  if (!currentBulkPreview.canApply && !confirm("Some lines need attention. Try previewing again after corrections?")) return;
  bulkStatus.textContent = "Applying restock...";
  if (applyRestock) applyRestock.disabled = true;
  try {
    const data = await api("/api/admin/inventory", {
      method: "PATCH",
      body: JSON.stringify({
        bulkRestockApply: true,
        mode: bulkMode?.value || "add",
        lines: bulkLines.value,
        corrections: readBulkCorrections()
      })
    });
    applyAdminData(data);
    bulkStatus.textContent = "Bulk restock applied. You can undo the most recent restock if needed.";
    renderBulkPreview(data.bulkPreview);
    render();
  } catch (error) {
    bulkStatus.textContent = error.message;
    if (error.preview) renderBulkPreview(error.preview);
  }
}

async function undoLastRestock() {
  if (!confirm("Undo the most recent bulk restock?")) return;
  bulkStatus.textContent = "Undoing last restock...";
  try {
    const data = await api("/api/admin/inventory", {
      method: "PATCH",
      body: JSON.stringify({ bulkRestockUndo: true })
    });
    applyAdminData(data);
    bulkStatus.textContent = "Most recent bulk restock was undone.";
    renderBulkPreview(null);
    render();
  } catch (error) {
    bulkStatus.textContent = error.message;
  }
}

async function savePreset() {
  const name = presetName?.value.trim() || "";
  const lines = bulkLines?.value.trim() || "";
  bulkStatus.textContent = "Saving preset...";
  try {
    const data = await api("/api/admin/inventory", {
      method: "PATCH",
      body: JSON.stringify({ restockPreset: { action: "save", name, lines, id: presetSelect?.value || "" } })
    });
    applyAdminData(data);
    if (data.restockPresetSaved && presetSelect) presetSelect.value = data.restockPresetSaved;
    bulkStatus.textContent = "Restock preset saved.";
  } catch (error) {
    bulkStatus.textContent = error.message;
  }
}

function loadPreset() {
  const preset = restockPresets.find(item => item.id === presetSelect?.value);
  if (!preset) {
    bulkStatus.textContent = "Choose a saved preset first.";
    return;
  }
  if (bulkLines) bulkLines.value = preset.lines || "";
  if (presetName) presetName.value = preset.name || "";
  renderBulkPreview(null);
  bulkStatus.textContent = "Preset loaded. Preview before applying.";
}

async function deletePreset() {
  const id = presetSelect?.value || "";
  if (!id) {
    bulkStatus.textContent = "Choose a saved preset first.";
    return;
  }
  if (!confirm("Delete this restock preset?")) return;
  bulkStatus.textContent = "Deleting preset...";
  try {
    const data = await api("/api/admin/inventory", {
      method: "PATCH",
      body: JSON.stringify({ restockPreset: { action: "delete", id } })
    });
    applyAdminData(data);
    if (presetName) presetName.value = "";
    bulkStatus.textContent = "Restock preset deleted.";
  } catch (error) {
    bulkStatus.textContent = error.message;
  }
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
      body: JSON.stringify({
        settings: {
          homepage_banner_message: bannerMessage.value,
          homepage_ticker_message: tickerMessage?.value || "",
          homepage_stat_message: statMessage?.value || ""
        }
      })
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
    const preset = bannerPresets[button.dataset.bannerPreset];
    if (!preset) return;
    if (bannerMessage) bannerMessage.value = preset.banner;
    if (tickerMessage) tickerMessage.value = preset.ticker;
    if (statMessage) statMessage.value = preset.stat;
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

refreshMessages?.addEventListener("click", loadMessages);

previewRestock?.addEventListener("click", previewBulkRestock);
applyRestock?.addEventListener("click", applyBulkRestock);
undoRestock?.addEventListener("click", undoLastRestock);
saveRestockPreset?.addEventListener("click", savePreset);
loadRestockPreset?.addEventListener("click", loadPreset);
deleteRestockPreset?.addEventListener("click", deletePreset);
presetSelect?.addEventListener("change", () => {
  const preset = restockPresets.find(item => item.id === presetSelect.value);
  if (presetName && preset) presetName.value = preset.name || "";
});
bulkLines?.addEventListener("input", () => {
  renderBulkPreview(null);
  if (bulkStatus) bulkStatus.textContent = "";
});
bulkMode?.addEventListener("change", () => {
  renderBulkPreview(null);
  if (bulkStatus) bulkStatus.textContent = "Preview again after changing the update mode.";
});
bulkCsv?.addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  const text = await file.text();
  const converted = csvToRestockLines(text);
  if (!converted) {
    bulkStatus.textContent = "CSV did not include restock rows.";
    return;
  }
  bulkLines.value = converted;
  renderBulkPreview(null);
  bulkStatus.textContent = "CSV loaded. Preview before applying.";
});

messagesList?.addEventListener("click", async event => {
  const card = event.target.closest(".admin-message-card");
  if (!card) return;

  if (event.target.matches("[data-copy-username]")) {
    copyUsername(event.target.dataset.copyUsername || "");
    return;
  }

  if (event.target.matches("[data-toggle-read]")) {
    const nextStatus = card.dataset.status === "read" ? "unread" : "read";
    try {
      await updateMessage(card.dataset.id, nextStatus);
    } catch (error) {
      statusLine.textContent = error.message;
    }
    return;
  }

  if (event.target.matches("[data-delete-message]")) {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage(card.dataset.id);
    } catch (error) {
      statusLine.textContent = error.message;
    }
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

adminFilterButtons.forEach(button => {
  button.addEventListener("click", () => {
    adminFilter = button.dataset.adminFilter || "all";
    adminFilterButtons.forEach(item => item.classList.toggle("active", item === button));
    render();
  });
});

adminQuick?.addEventListener("click", event => {
  const button = event.target.closest("[data-jump-product]");
  if (!button) return;
  adminFilter = "all";
  adminFilterButtons.forEach(item => item.classList.toggle("active", item.dataset.adminFilter === "all"));
  categorySelect.value = "all";
  searchInput.value = "";
  render();
  const card = list.querySelector(`[data-id="${CSS.escape(button.dataset.jumpProduct)}"]`);
  card?.scrollIntoView({ behavior: "smooth", block: "center" });
  card?.classList.add("admin-card-highlight");
  window.setTimeout(() => card?.classList.remove("admin-card-highlight"), 1400);
});

adminTabs.forEach(button => {
  button.addEventListener("click", () => setAdminTab(button.dataset.adminTab || "dashboard"));
});
refreshSales?.addEventListener("click", loadSales);
salesSearch?.addEventListener("input", renderSales);
salesPlatform?.addEventListener("change", renderSales);
salesDate?.addEventListener("change", renderSales);
salesExport?.addEventListener("click", exportSalesCsv);

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
loadInventory();
