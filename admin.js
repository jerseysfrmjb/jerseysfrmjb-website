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
const requestSummary = document.querySelector("[data-request-summary]");
const messageCount = document.querySelector("[data-message-count]");
const refreshMessages = document.querySelector("[data-refresh-messages]");
const feedbackList = document.querySelector("[data-admin-feedback]");
const feedbackCount = document.querySelector("[data-feedback-count]");
const feedbackStatus = document.querySelector("[data-feedback-status]");
const refreshFeedback = document.querySelector("[data-refresh-feedback]");
const feedbackFilter = document.querySelector("[data-feedback-filter]");
const addSampleFeedback = document.querySelector("[data-add-sample-feedback]");
const feedbackImportText = document.querySelector("[data-feedback-import-text]");
const importFeedbackButton = document.querySelector("[data-import-feedback]");
const depopFeedbackImportText = document.querySelector("[data-depop-feedback-import-text]");
const importDepopFeedbackButton = document.querySelector("[data-import-depop-feedback]");
const pinterestBadge = document.querySelector("[data-pinterest-badge]");
const pinterestStatusLine = document.querySelector("[data-pinterest-status]");
const pinterestConnect = document.querySelector("[data-pinterest-connect]");
const createPinterestBoardsButton = document.querySelector("[data-create-pinterest-boards]");
const refreshPinterest = document.querySelector("[data-refresh-pinterest]");
const disconnectPinterestButton = document.querySelector("[data-disconnect-pinterest]");
const pinterestPublisher = document.querySelector("[data-pinterest-publisher]");
const pinterestForm = document.querySelector("[data-pinterest-form]");
const pinterestProduct = document.querySelector("[data-pinterest-product]");
const pinterestBoard = document.querySelector("[data-pinterest-board]");
const pinterestImages = document.querySelector("[data-pinterest-images]");
const pinterestTitle = document.querySelector("[data-pinterest-title]");
const pinterestDescription = document.querySelector("[data-pinterest-description]");
const pinterestLink = document.querySelector("[data-pinterest-link]");
const pinterestTitleCount = document.querySelector("[data-pinterest-title-count]");
const pinterestDescriptionCount = document.querySelector("[data-pinterest-description-count]");
const pinterestPreview = document.querySelector("[data-pinterest-preview]");
const pinterestPublish = document.querySelector("[data-pinterest-publish]");
const pinterestModeLabel = document.querySelector("[data-pinterest-mode-label]");
const pinterestModeCopy = document.querySelector("[data-pinterest-mode-copy]");
const pinterestRotate = document.querySelector("[data-pinterest-rotate]");
const pinterestVariationLabel = document.querySelector("[data-pinterest-variation-label]");
const pinterestAllowDuplicate = document.querySelector("[data-pinterest-allow-duplicate]");
const pinterestQueueAdd = document.querySelector("[data-pinterest-queue-add]");
const pinterestQueueList = document.querySelector("[data-pinterest-queue-list]");
const pinterestQueueCount = document.querySelector("[data-pinterest-queue-count]");
const refreshPinterestQueue = document.querySelector("[data-refresh-pinterest-queue]");
const facebookBadge = document.querySelector("[data-facebook-badge]");
const facebookConnectionName = document.querySelector("[data-facebook-connection-name]");
const facebookConnectionDetail = document.querySelector("[data-facebook-connection-detail]");
const facebookConnect = document.querySelector("[data-facebook-connect]");
const refreshFacebookConnectionButton = document.querySelector("[data-refresh-facebook-connection]");
const disconnectFacebookButton = document.querySelector("[data-disconnect-facebook]");
const facebookPagePicker = document.querySelector("[data-facebook-page-picker]");
const facebookPageSelect = document.querySelector("[data-facebook-page-select]");
const selectFacebookPageButton = document.querySelector("[data-select-facebook-page]");
const facebookStatusLine = document.querySelector("[data-facebook-status]");
const facebookProducts = document.querySelector("[data-facebook-products]");
const facebookProductSearch = document.querySelector("[data-facebook-product-search]");
const facebookSelectionCount = document.querySelector("[data-facebook-selection-count]");
const generateFacebookPostButton = document.querySelector("[data-generate-facebook-post]");
const facebookEditor = document.querySelector("[data-facebook-editor]");
const facebookCaption = document.querySelector("[data-facebook-caption]");
const facebookCampaign = document.querySelector("[data-facebook-campaign]");
const facebookCaptionCount = document.querySelector("[data-facebook-caption-count]");
const facebookPhotos = document.querySelector("[data-facebook-photos]");
const saveFacebookDraftButton = document.querySelector("[data-save-facebook-draft]");
const publishFacebookPostButton = document.querySelector("[data-publish-facebook-post]");
const copyFacebookPostButton = document.querySelector("[data-copy-facebook-post]");
const markFacebookPostedButton = document.querySelector("[data-mark-facebook-posted]");
const refreshFacebookHistoryButton = document.querySelector("[data-refresh-facebook-history]");
const facebookHistoryList = document.querySelector("[data-facebook-history]");
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
const adminMobileTab = document.querySelector("[data-admin-mobile-tab]");
const salesTable = document.querySelector("[data-sales-table]");
const salesSearch = document.querySelector("[data-sales-search]");
const salesPlatform = document.querySelector("[data-sales-platform]");
const salesDate = document.querySelector("[data-sales-date]");
const salesExport = document.querySelector("[data-sales-export]");
const salesStatus = document.querySelector("[data-sales-status]");
const refreshSales = document.querySelector("[data-refresh-sales]");
const quickSaleForm = document.querySelector("[data-quick-sale-form]");
const quickSaleSearch = document.querySelector("[data-quick-sale-search]");
const quickSaleMatch = document.querySelector("[data-quick-sale-match]");
const quickSaleQuantity = document.querySelector("[data-quick-sale-quantity]");
const quickSalePlatform = document.querySelector("[data-quick-sale-platform]");
const quickSalePrice = document.querySelector("[data-quick-sale-price]");
const quickSaleNotes = document.querySelector("[data-quick-sale-notes]");
const quickSaleSubmit = document.querySelector("[data-quick-sale-submit]");
const quickSaleStatus = document.querySelector("[data-quick-sale-status]");
const analyticsDashboard = document.querySelector("[data-analytics-dashboard]");
const analyticsStatus = document.querySelector("[data-analytics-status]");
const analyticsRange = document.querySelector("[data-analytics-range]");
const refreshAnalytics = document.querySelector("[data-refresh-analytics]");
const exportAnalytics = document.querySelector("[data-export-analytics]");
const plannerDashboard = document.querySelector("[data-inventory-planner]");
const plannerStatus = document.querySelector("[data-planner-status]");
const refreshPlanner = document.querySelector("[data-refresh-planner]");
const exportPurchase = document.querySelector("[data-export-purchase]");
const plannerSuppliers = document.querySelector("[data-planner-suppliers]");
const addPlannerSupplier = document.querySelector("[data-add-planner-supplier]");
const savePlannerSuppliers = document.querySelector("[data-save-planner-suppliers]");
const plannerSummary = document.querySelector("[data-planner-summary]");
const plannerPurchaseSummary = document.querySelector("[data-planner-purchase-summary]");
const plannerPurchaseTable = document.querySelector("[data-planner-purchase-table]");
const plannerProductOptions = document.querySelector("[data-planner-product-options]");
const addPurchaseRow = document.querySelector("[data-add-purchase-row]");
const plannerReorders = document.querySelector("[data-planner-reorders]");
const plannerRisks = document.querySelector("[data-planner-risks]");
const plannerProfit = document.querySelector("[data-planner-profit]");
const plannerProducts = document.querySelector("[data-planner-products]");
const plannerSearch = document.querySelector("[data-planner-search]");
const plannerRiskFilter = document.querySelector("[data-planner-risk-filter]");
const plannerSort = document.querySelector("[data-planner-sort]");
const operationsStatus = document.querySelector("[data-operations-status]");
const operationsProtection = document.querySelector("[data-operations-protection]");
const operationsActivity = document.querySelector("[data-operations-activity]");
const operationsErrors = document.querySelector("[data-operations-errors]");
const refreshOperations = document.querySelector("[data-refresh-operations]");
const runCatalogHealthButton = document.querySelector("[data-run-catalog-health]");
const catalogHealthStatus = document.querySelector("[data-catalog-health-status]");
const catalogHealthResults = document.querySelector("[data-catalog-health-results]");
const shopifyAdminStatus = document.querySelector("[data-shopify-admin-status]");
const shopifyConfig = document.querySelector("[data-shopify-config]");
const shopifyCounts = document.querySelector("[data-shopify-counts]");
const shopifyProducts = document.querySelector("[data-shopify-products]");
const shopifySearch = document.querySelector("[data-shopify-search]");
const shopifyPreviewResults = document.querySelector("[data-shopify-preview-results]");
const shopifyOrders = document.querySelector("[data-shopify-orders]");
const shopifyWebhooks = document.querySelector("[data-shopify-webhooks]");
const refreshShopify = document.querySelector("[data-refresh-shopify]");
const suggestShopifyPilot = document.querySelector("[data-shopify-suggest-pilot]");
const previewShopify = document.querySelector("[data-shopify-preview]");
const runShopify = document.querySelector("[data-shopify-run]");
const previewShopifyAll = document.querySelector("[data-shopify-preview-all]");
const syncShopifyAll = document.querySelector("[data-shopify-sync-all]");
const retryShopifySync = document.querySelector("[data-shopify-retry-sync]");
const checkShopifyConnection = document.querySelector("[data-shopify-check-connection]");
const registerShopifyWebhooksButton = document.querySelector("[data-shopify-register-webhooks]");
const shopifySetupAudit = document.querySelector("[data-shopify-setup-audit]");
let inventory = [];
let settings = {};
let featuredLimit = 3;
let sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
let messages = [];
let unreadMessages = 0;
let requestSummaryRows = [];
let ebayFeedback = [];
let feedbackLoaded = false;
const savingFeedbackIds = new Set();
let pinterestConnection = null;
let pinterestBoards = [];
let pinterestLoaded = false;
let pinterestPublishing = false;
let pinterestQueueLoading = false;
let pinterestQueue = [];
let pinterestDescriptionVariation = 0;
let facebookConnection = null;
let facebookConnectionLoaded = false;
let facebookConnectionLoading = false;
let facebookLoaded = false;
let facebookLoading = false;
let facebookSaving = false;
let facebookPosts = [];
let selectedFacebookProductIds = new Set();
let currentFacebookPost = null;
let facebookCaptionGenerated = false;
let facebookCaptionVariation = 0;
let adminFilter = "all";
let restockPresets = [];
let lastBulkRestock = null;
let currentBulkPreview = null;
let sales = [];
let salesLoaded = false;
let analyticsLoaded = false;
let analyticsLoading = false;
let analyticsData = null;
let plannerLoaded = false;
let plannerLoading = false;
let plannerData = null;
const plannerPurchase = new Map();
let operationsLoaded = false;
let shopifyLoaded = false;
let shopifyLoading = false;
let shopifyData = null;
const selectedShopifyProducts = new Set();
let lastShopifyRequest = null;
let salesAnalyticsPanel = document.querySelector("[data-sales-analytics]");
let quickSaleMatches = [];
let quickSalePriceManuallyEdited = false;
let quickSalePriceRequest = 0;
const pinterestCallback = new URLSearchParams(location.search).get("pinterest") || "";
const facebookCallback = new URLSearchParams(location.search).get("facebook") || "";
let currentAdminTab = location.hash === "#facebook" || facebookCallback
  ? "facebook"
  : location.hash === "#pinterest" || pinterestCallback
    ? "pinterest"
    : "dashboard";
let editingSaleId = null;
let savingSaleEditId = null;
let deletingSaleId = null;
const platformPriceNames = ["Depop", "eBay", "Facebook", "Website", "Local", "Other"];
const platformPriceStates = new Map();

const bannerPresets = {
  live: {
    banner: "World Cup Jerseys Available Now!\nA few World Cup jerseys are now available in Small & Large. DM @jerseysfrmjb directly for questions, or use Message or Request for a detailed jersey request.",
    ticker: "ðŸ”¥ WORLD CUP JERSEYS AVAILABLE NOW â€¢ SMALL & LARGE SIZES IN STOCK â€¢ DM @JERSEYSFRMJB FOR REQUESTS â¤ï¸",
    stat: "Small & Large Available"
  },
  almost: {
    banner: "Small Drop Almost Sold Out\nThanks for all the support! Only a few jerseys remain from the small drop. DM @jerseysfrmjb directly, or use Message or Request for a detailed jersey request.",
    ticker: "ðŸš¨ SMALL DROP ALMOST SOLD OUT â€¢ BIG DROP COMING SOON â€¢ DM @JERSEYSFRMJB OR TAP MESSAGE OR REQUEST â¤ï¸",
    stat: "Small Drop Almost Sold Out"
  },
  soon: {
    banner: "Next Drop Coming Soon\nMore jerseys are coming soon. DM @jerseysfrmjb directly, or use Message or Request to request a jersey.",
    ticker: "ðŸ”¥ NEXT DROP COMING SOON â€¢ DM @JERSEYSFRMJB OR TAP MESSAGE OR REQUEST â¤ï¸",
    stat: "More Jerseys Coming Soon"
  }
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function setAdminTab(tab = "dashboard") {
  currentAdminTab = tab;
  adminTabs.forEach(button => button.classList.toggle("active", button.dataset.adminTab === tab));
  if (adminMobileTab) adminMobileTab.value = tab;
  adminSections.forEach(section => {
    section.hidden = section.dataset.adminSection !== tab;
  });
  if (tab === "sales" && !salesLoaded) loadSales();
  if (tab === "analytics" && !analyticsLoaded) loadAnalytics();
  if (tab === "planner" && !plannerLoaded) loadInventoryPlanner();
  if (tab === "operations" && !operationsLoaded) loadOperations();
  if (tab === "feedback" && !feedbackLoaded) loadEbayFeedbackAdmin();
  if (tab === "facebook") {
    if (!facebookConnectionLoaded) loadFacebookConnection();
    if (!facebookLoaded) loadFacebookHistory();
  }
  if (tab === "pinterest" && !pinterestLoaded) loadPinterestStatus();
  if (tab === "shopify" && !shopifyLoaded) loadShopifyStatus();
}

const ANALYTICS_COLORS = ["#7b1638", "#bc5b75", "#d28b42", "#2e6f76", "#5b4b8a", "#708238", "#9b6b43"];

function analyticsNumber(value, maximumFractionDigits = 0) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits });
}

function analyticsDuration(value) {
  const seconds = Math.max(0, Math.round(Number(value || 0)));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}m ${remainder}s`;
}

function renderOperations(data = {}) {
  if (operationsProtection) {
    const protection = data.protection || {};
    operationsProtection.innerHTML = [
      ["Cloudflare D1 Time Travel", protection.cloudflare_time_travel, "Point-in-time database recovery", "Active"],
      ["Weekly export workflow", protection.weekly_export_workflow_installed, "Add the three GitHub secrets once to activate scheduled SQL and CSV artifacts", "Installed"],
      ["API error alerts", protection.api_error_alerts, "Discord alert with 15-minute deduplication", "Active"]
    ].map(([label, active, detail, activeLabel]) => `
      <article class="${active ? "active" : "attention"}">
        <span>${active ? activeLabel : "Setup needed"}</span>
        <strong>${escapeHtml(label)}</strong>
        <small>${escapeHtml(detail)}</small>
      </article>`).join("");
  }
  if (operationsActivity) {
    operationsActivity.innerHTML = (data.activity || []).length
      ? data.activity.map(item => `
        <article>
          <div><strong>${escapeHtml(item.action)} · ${escapeHtml(item.area)}</strong><time>${escapeHtml(analyticsDate(item.created_at))}</time></div>
          <p>${escapeHtml(item.summary || "Admin change")}</p>
          <small>Status ${analyticsNumber(item.status_code)}</small>
        </article>`).join("")
      : '<p class="analytics-empty">Admin changes will appear here.</p>';
  }
  if (operationsErrors) {
    operationsErrors.innerHTML = (data.errors || []).length
      ? data.errors.map(item => `
        <article class="error">
          <div><strong>${escapeHtml(item.method)} ${escapeHtml(item.path)}</strong><time>${escapeHtml(analyticsDate(item.created_at))}</time></div>
          <p>${escapeHtml(item.message || "Server error response")}</p>
          <small>Status ${analyticsNumber(item.status_code)} · Request ${escapeHtml(item.request_id)}</small>
        </article>`).join("")
      : '<p class="analytics-empty">No API errors recorded.</p>';
  }
}

async function loadOperations() {
  if (!operationsStatus) return;
  operationsStatus.textContent = "Loading operations...";
  operationsStatus.className = "form-status";
  if (refreshOperations) refreshOperations.disabled = true;
  try {
    const data = await api("/api/admin/operations");
    renderOperations(data);
    operationsLoaded = true;
    operationsStatus.textContent = "Protection status and activity are up to date.";
    operationsStatus.classList.add("success");
  } catch (error) {
    operationsStatus.textContent = error.message;
    operationsStatus.classList.add("error");
  } finally {
    if (refreshOperations) refreshOperations.disabled = false;
  }
}

function renderCatalogHealth(data = {}) {
  if (!catalogHealthResults) return;
  const summary = data.summary || {};
  const issues = (data.items || []).filter(item => item.status !== "healthy");
  catalogHealthResults.innerHTML = `
    <div class="catalog-health-summary">
      ${[
        ["Healthy", summary.healthy, "healthy"],
        ["Broken", summary.broken, "broken"],
        ["Warnings", Number(summary.warning || 0) + Number(summary.protected || 0), "warning"],
        ["Missing", summary.missing, "missing"]
      ].map(([label, value, tone]) => `<article class="${tone}"><span>${escapeHtml(label)}</span><strong>${analyticsNumber(value)}</strong></article>`).join("")}
    </div>
    ${issues.length ? `
      <div class="catalog-health-issues">
        ${issues.map(item => `
          <article class="${escapeHtml(item.status)}">
            <div>
              <strong>${escapeHtml(item.product_name)}</strong>
              <span>${escapeHtml(item.label)} · ${escapeHtml(item.status)}</span>
            </div>
            <p>${escapeHtml(item.detail)}</p>
            ${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Open URL</a>` : ""}
          </article>`).join("")}
      </div>` : '<p class="catalog-health-clear">All saved product images and marketplace links passed the check.</p>'}
  `;
}

async function runCatalogHealth() {
  if (!catalogHealthStatus || !runCatalogHealthButton) return;
  runCatalogHealthButton.disabled = true;
  runCatalogHealthButton.textContent = "Checking...";
  catalogHealthStatus.textContent = "Checking live product images and marketplace links. This can take a moment.";
  catalogHealthStatus.className = "form-status";
  try {
    const data = await api("/api/admin/catalog-health");
    renderCatalogHealth(data);
    const issueCount = Number(data.summary?.broken || 0)
      + Number(data.summary?.warning || 0)
      + Number(data.summary?.protected || 0)
      + Number(data.summary?.missing || 0);
    catalogHealthStatus.textContent = issueCount
      ? `Checked ${analyticsNumber(data.products)} products. Review ${analyticsNumber(issueCount)} item${issueCount === 1 ? "" : "s"} below.`
      : `Checked ${analyticsNumber(data.products)} products. Everything passed.`;
    catalogHealthStatus.classList.add(issueCount ? "error" : "success");
  } catch (error) {
    catalogHealthStatus.textContent = error.message;
    catalogHealthStatus.classList.add("error");
  } finally {
    runCatalogHealthButton.disabled = false;
    runCatalogHealthButton.textContent = "Run Check";
  }
}

function analyticsDate(value = "") {
  if (!value) return "Never";
  const date = new Date(String(value).endsWith("Z") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function analyticsDayLabel(value = "") {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function analyticsEmpty(message = "No data collected for this period yet.") {
  return `<p class="analytics-empty">${escapeHtml(message)}</p>`;
}

function analyticsLineChart(rows = [], series = []) {
  if (!rows.length || !series.length) return analyticsEmpty();
  const width = 720;
  const height = 230;
  const padding = { top: 18, right: 18, bottom: 34, left: 42 };
  const maximum = Math.max(1, ...rows.flatMap(row => series.map(item => Number(row[item.key] || 0))));
  const x = index => padding.left + (rows.length === 1 ? 0 : (index / (rows.length - 1)) * (width - padding.left - padding.right));
  const y = value => height - padding.bottom - (Number(value || 0) / maximum) * (height - padding.top - padding.bottom);
  const grid = [0, 0.25, 0.5, 0.75, 1].map(fraction => {
    const lineY = y(maximum * fraction);
    return `<line x1="${padding.left}" y1="${lineY}" x2="${width - padding.right}" y2="${lineY}"></line><text x="${padding.left - 8}" y="${lineY + 4}" text-anchor="end">${analyticsNumber(maximum * fraction)}</text>`;
  }).join("");
  const paths = series.map((item, seriesIndex) => {
    const points = rows.map((row, index) => `${x(index)},${y(row[item.key])}`).join(" ");
    return `<polyline points="${points}" style="--chart-color:${ANALYTICS_COLORS[seriesIndex % ANALYTICS_COLORS.length]}"></polyline>`;
  }).join("");
  const firstDay = analyticsDayLabel(rows[0]?.day || "");
  const lastDay = analyticsDayLabel(rows.at(-1)?.day || "");
  return `
    <div class="analytics-chart-wrap">
      <svg class="analytics-line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(series.map(item => item.label).join(" and "))} over time">
        <g class="analytics-chart-grid">${grid}</g>
        ${paths}
        <text class="analytics-axis-label" x="${padding.left}" y="${height - 8}">${escapeHtml(firstDay)}</text>
        <text class="analytics-axis-label" x="${width - padding.right}" y="${height - 8}" text-anchor="end">${escapeHtml(lastDay)}</text>
      </svg>
      <div class="analytics-chart-legend">${series.map((item, index) => `<span><i style="--legend-color:${ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}"></i>${escapeHtml(item.label)}</span>`).join("")}</div>
    </div>`;
}

function analyticsBarChart(items = []) {
  if (!items.length) return analyticsEmpty("Product views will appear here after shoppers browse jerseys.");
  const maximum = Math.max(1, ...items.map(item => Number(item.views || 0)));
  return `<div class="analytics-bars">${items.slice(0, 10).map((item, index) => `
    <div class="analytics-bar-row">
      <span>${index + 1}. ${escapeHtml(item.name)}</span>
      <div><i style="width:${Math.max(2, (Number(item.views || 0) / maximum) * 100)}%"></i></div>
      <strong>${analyticsNumber(item.views)}</strong>
    </div>`).join("")}</div>`;
}

function analyticsSourceChart(sources = []) {
  if (!sources.length) return analyticsEmpty();
  let cursor = 0;
  const stops = sources.map((source, index) => {
    const start = cursor;
    cursor += Number(source.percentage || 0);
    return `${ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]} ${start}% ${cursor}%`;
  }).join(",");
  return `
    <div class="analytics-source-chart">
      <div class="analytics-donut" style="--source-gradient:conic-gradient(${stops})"><span>${analyticsNumber(sources.reduce((sum, item) => sum + Number(item.visitors || 0), 0))}<small>visitors</small></span></div>
      <div class="analytics-source-legend">${sources.map((source, index) => `
        <div><i style="--legend-color:${ANALYTICS_COLORS[index % ANALYTICS_COLORS.length]}"></i><span>${escapeHtml(source.source)}</span><strong>${analyticsNumber(source.percentage, 1)}%</strong><small>${analyticsNumber(source.visitors)} visitors</small></div>`).join("")}</div>
    </div>`;
}

function analyticsProductTable(items = [], emptyMessage = "No matching products yet.") {
  if (!items.length) return analyticsEmpty(emptyMessage);
  return `
    <div class="analytics-table-wrap">
      <table class="analytics-table">
        <thead><tr><th>Product</th><th>Views</th><th>Clicks</th><th>eBay</th><th>Depop</th><th>CTR</th><th>Inventory</th><th>Last viewed</th></tr></thead>
        <tbody>${items.map(item => `
          <tr>
            <td>${escapeHtml(item.name)}</td>
            <td>${analyticsNumber(item.views)}</td>
            <td>${analyticsNumber(item.clicks)}</td>
            <td>${analyticsNumber(item.ebay_clicks)}</td>
            <td>${analyticsNumber(item.depop_clicks)}</td>
            <td>${analyticsNumber(item.ctr, 1)}%</td>
            <td>${item.quantity > 0 ? `${analyticsNumber(item.quantity)} in stock` : "Sold out"}</td>
            <td>${escapeHtml(analyticsDate(item.last_viewed_at))}</td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;
}

function analyticsRankedList(items = [], valueKey = "views", emptyMessage = "No data yet.") {
  if (!items.length) return analyticsEmpty(emptyMessage);
  return `<ol class="analytics-ranked-list">${items.slice(0, 10).map(item => `
    <li><span>${escapeHtml(item.name || item.query || item.source || "Unknown")}</span><strong>${analyticsNumber(item[valueKey])}</strong></li>`).join("")}</ol>`;
}

function analyticsSimpleList(items = [], labelKey = "name", valueKey = "visitors") {
  if (!items.length) return analyticsEmpty();
  return `<ul class="analytics-simple-list">${items.slice(0, 12).map(item => `
    <li><span>${escapeHtml(item[labelKey] || "Unknown")}</span><strong>${analyticsNumber(item[valueKey])}</strong></li>`).join("")}</ul>`;
}

function analyticsDailyMatrix(rows = [], groupKey, valueKey) {
  if (!rows.length) return analyticsEmpty();
  const days = [...new Set(rows.map(item => item.day).filter(Boolean))].slice(-14);
  const groups = [...new Set(rows.map(item => item[groupKey] || "Other"))].slice(0, 8);
  const lookup = new Map(rows.map(item => [`${item.day}|${item[groupKey] || "Other"}`, Number(item[valueKey] || 0)]));
  return `
    <div class="analytics-daily-matrix">
      ${days.map(day => {
        const values = groups.map(group => lookup.get(`${day}|${group}`) || 0);
        return `<div class="analytics-daily-row">
          <time datetime="${escapeHtml(day)}" title="${escapeHtml(day)}">${escapeHtml(analyticsDayLabel(day))}</time>
          <div class="analytics-daily-values">
            ${groups.map((group, index) => `<span><small>${escapeHtml(group)}</small><b>${analyticsNumber(values[index])}</b></span>`).join("")}
            <span class="analytics-daily-total"><small>Total</small><b>${analyticsNumber(values.reduce((sum, value) => sum + value, 0))}</b></span>
          </div>
        </div>`;
      }).join("")}
    </div>`;
}

function analyticsMarketplaceClickList(items = []) {
  if (!items.length) return analyticsEmpty("Marketplace clicks will appear here as shoppers open listings.");
  return `<div class="analytics-click-list">${items.slice(0, 12).map(item => {
    const productLabel = item.product_name || (item.product_id ? `Product ${item.product_id}` : "General marketplace link");
    return `<div class="analytics-click-row">
      <div><strong>${escapeHtml(productLabel)}</strong><small>${escapeHtml(item.product_name ? item.page_path : "Profile, review, footer, or other non-product link")}</small></div>
      <span>${escapeHtml(item.marketplace || "Other")}</span>
      <time>${escapeHtml(analyticsDate(item.occurred_at))}</time>
    </div>`;
  }).join("")}</div>`;
}

function analyticsCampaignTable(items = []) {
  if (!items.length) return analyticsEmpty("Facebook post visits will appear after shoppers open tracked post links.");
  return `
    <div class="analytics-table-wrap">
      <table class="analytics-table">
        <thead><tr><th>Jersey / post</th><th>Campaign</th><th>Visitors</th><th>Page views</th><th>Marketplace clicks</th></tr></thead>
        <tbody>${items.map(item => `
          <tr>
            <td>${escapeHtml(item.product_name || item.content || "Facebook post")}</td>
            <td>${escapeHtml(String(item.campaign || "").replace(/_/g, " "))}</td>
            <td>${analyticsNumber(item.visitors)}</td>
            <td>${analyticsNumber(item.page_views)}</td>
            <td>${analyticsNumber(item.marketplace_clicks)}</td>
          </tr>`).join("")}</tbody>
      </table>
    </div>`;
}

function analyticsConversionFunnel(data = {}) {
  const productViews = Number(data.current?.product_views || 0);
  const products = data.products || [];
  const ebayClicks = products.reduce((sum, item) => sum + Number(item.ebay_clicks || 0), 0);
  const depopClicks = products.reduce((sum, item) => sum + Number(item.depop_clicks || 0), 0);
  const listingClicks = ebayClicks + depopClicks;
  const conversionRate = productViews > 0 ? (listingClicks / productViews) * 100 : 0;
  const clickWidth = productViews > 0 ? Math.min(100, Math.max(listingClicks > 0 ? 8 : 0, conversionRate)) : 0;
  const ebayShare = listingClicks > 0 ? (ebayClicks / listingClicks) * 100 : 0;
  const depopShare = listingClicks > 0 ? 100 - ebayShare : 0;

  return `
    <section class="analytics-card analytics-funnel-card">
      <header class="analytics-section-heading">
        <div><span>Conversion Funnel</span><h3>Jersey views to marketplace clicks</h3></div>
        <div class="analytics-funnel-rate"><strong>${analyticsNumber(conversionRate, 1)}%</strong><small>view-to-click rate</small></div>
      </header>
      <div class="analytics-funnel" aria-label="${analyticsNumber(productViews)} product view events led to ${analyticsNumber(listingClicks)} attributed marketplace click events">
        <article class="views">
          <span>1</span>
          <div><small>Jersey views</small><strong>${analyticsNumber(productViews)}</strong><p>Product view events</p></div>
        </article>
        <i aria-hidden="true">→</i>
        <article class="clicks" style="--funnel-width:${clickWidth}%">
          <span>2</span>
          <div><small>Listing clicks</small><strong>${analyticsNumber(listingClicks)}</strong><p>Clicks tied to a jersey</p></div>
        </article>
        <i aria-hidden="true">→</i>
        <article class="destinations">
          <span>3</span>
          <div>
            <small>Destination</small>
            <div class="analytics-funnel-split">
              <b>eBay <em>${analyticsNumber(ebayClicks)}</em></b>
              <b>Depop <em>${analyticsNumber(depopClicks)}</em></b>
            </div>
            <div class="analytics-funnel-share" title="eBay ${analyticsNumber(ebayShare, 1)}%, Depop ${analyticsNumber(depopShare, 1)}%">
              <span style="width:${ebayShare}%"></span>
            </div>
          </div>
        </article>
      </div>
      <p class="analytics-funnel-note">This funnel uses event totals, not unique shoppers. General footer or profile clicks are excluded so every click shown here is tied to a specific jersey.</p>
    </section>`;
}

function analyticsShopifyFunnel(data = {}) {
  const funnel = data.funnel?.summary || {};
  const stages = [
    ["Product View", funnel.views, funnel.view_to_cart_rate, "to Add to Cart"],
    ["Add to Cart", funnel.add_to_cart, funnel.cart_to_checkout_rate, "to Checkout"],
    ["Checkout Started", funnel.checkout_started, funnel.checkout_to_purchase_rate, "to Purchase"],
    ["Purchase", funnel.purchases, funnel.overall_conversion_rate, "overall conversion"]
  ];
  return `
    <section class="analytics-card analytics-funnel-card">
      <header class="analytics-section-heading">
        <div><span>Conversion Funnel</span><h3>Product View &rarr; Add to Cart &rarr; Checkout Started &rarr; Purchase</h3></div>
        <div class="analytics-funnel-rate"><strong>${analyticsNumber(funnel.overall_conversion_rate, 1)}%</strong><small>view-to-purchase</small></div>
      </header>
      <div class="analytics-funnel analytics-checkout-funnel" aria-label="Shopify checkout conversion funnel">
        ${stages.map(([label, value, rate, rateLabel], index) => `
          ${index ? '<i aria-hidden="true">&rarr;</i>' : ""}
          <article><span>${index + 1}</span><div><small>${escapeHtml(label)}</small><strong>${analyticsNumber(value)}</strong><p>${analyticsNumber(rate, 1)}% ${escapeHtml(rateLabel)}</p></div></article>`).join("")}
      </div>
      <p class="analytics-funnel-note">Event totals are privacy-safe and contain no customer, address, or payment details. Purchases count paid Shopify orders once, even when webhooks are retried.</p>
    </section>`;
}

function analyticsFunnelTable(items = [], emptyMessage = "No funnel activity in this period.") {
  if (!items.length) return analyticsEmpty(emptyMessage);
  return `
    <div class="analytics-table-wrap">
      <table class="analytics-table analytics-funnel-table">
        <thead><tr><th>Item</th><th>Views</th><th>Cart adds</th><th>Checkout</th><th>Purchases</th><th>View &rarr; Cart</th><th>Cart &rarr; Checkout</th><th>Checkout &rarr; Purchase</th><th>Overall</th></tr></thead>
        <tbody>${items.map(item => `<tr>
          <td>${escapeHtml(item.name || item.source || "Unknown")}</td>
          <td>${analyticsNumber(item.views)}</td><td>${analyticsNumber(item.add_to_cart)}</td>
          <td>${analyticsNumber(item.checkout_started)}</td><td>${analyticsNumber(item.purchases)}</td>
          <td>${analyticsNumber(item.view_to_cart_rate, 1)}%</td><td>${analyticsNumber(item.cart_to_checkout_rate, 1)}%</td>
          <td>${analyticsNumber(item.checkout_to_purchase_rate, 1)}%</td><td>${analyticsNumber(item.overall_conversion_rate, 1)}%</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>`;
}

function analyticsFunnelBreakdowns(data = {}) {
  const funnel = data.funnel || {};
  const lists = funnel.lists || {};
  return `
    <section class="analytics-card"><header><span>Product funnel</span><h3>Conversion by product</h3></header>${analyticsFunnelTable(funnel.products)}</section>
    <section class="analytics-detail-grid analytics-funnel-breakdowns">
      <article class="analytics-card"><header><span>Player</span><h3>Conversion by player</h3></header>${analyticsFunnelTable(funnel.players)}</article>
      <article class="analytics-card"><header><span>Team / country</span><h3>Conversion by team or country</h3></header>${analyticsFunnelTable(funnel.teams)}</article>
      <article class="analytics-card analytics-card-wide"><header><span>Traffic source</span><h3>Google, Bing, TikTok, social, direct, and other</h3></header>${analyticsFunnelTable(funnel.sources)}</article>
    </section>
    <section class="analytics-intelligence analytics-funnel-opportunities">
      <article class="analytics-card"><header><span>Opportunity</span><h3>Most viewed with low Add-to-Cart</h3></header>${analyticsFunnelTable(lists.most_viewed_low_add)}</article>
      <article class="analytics-card"><header><span>Checkout drop-off</span><h3>High Add-to-Cart, low checkout</h3></header>${analyticsFunnelTable(lists.high_add_low_checkout)}</article>
      <article class="analytics-card"><header><span>Purchase drop-off</span><h3>High checkout-start, low purchase</h3></header>${analyticsFunnelTable(lists.high_checkout_low_purchase)}</article>
      <article class="analytics-card"><header><span>Best products</span><h3>Highest-converting products</h3></header>${analyticsFunnelTable(lists.highest_converting)}</article>
      <article class="analytics-card"><header><span>Best acquisition</span><h3>Highest-converting traffic sources</h3></header>${analyticsFunnelTable(lists.highest_converting_sources)}</article>
      <article class="analytics-card"><header><span>Unconverted interest</span><h3>Products with views and zero purchases</h3></header>${analyticsFunnelTable(lists.views_zero_purchases)}</article>
    </section>`;
}

function renderAnalytics() {
  if (!analyticsDashboard || !analyticsData) return;
  const data = analyticsData;
  const current = data.current || {};
  const windows = data.windows || {};
  const market = data.marketplace || {};
  const searchEntities = data.searches?.entities || {};
  const geography = data.geography || [];
  const countries = new Map();
  const states = [];
  geography.forEach(item => {
    countries.set(item.country || "Unknown", (countries.get(item.country || "Unknown") || 0) + Number(item.visitors || 0));
    if (item.country === "US" && item.region) states.push({ name: item.region, visitors: item.visitors });
  });
  const countryNames = typeof Intl.DisplayNames === "function"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;
  const countryRows = [...countries].map(([code, visitors]) => ({
    name: countryNames && /^[A-Z]{2}$/.test(code) ? countryNames.of(code) : code,
    visitors
  })).sort((a, b) => b.visitors - a.visitors);
  const ebayClicks = Number(market.totals?.eBay || 0);
  const depopClicks = Number(market.totals?.Depop || 0);

  analyticsDashboard.innerHTML = `
    <section class="analytics-window-grid" aria-label="Visitor totals by period">
      ${[
        ["Today", windows.today?.visitors],
        ["7 days", windows["7d"]?.visitors],
        ["30 days", windows["30d"]?.visitors],
        ["All time", windows.all?.visitors]
      ].map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${analyticsNumber(value)}</strong><small>visitors</small></article>`).join("")}
    </section>

    <section class="analytics-kpi-grid" aria-label="Traffic overview">
      ${[
        ["Page views", analyticsNumber(current.page_views), "Pages loaded"],
        ["Unique visitors", analyticsNumber(current.unique_visitors), "Anonymous browsers"],
        ["Pages / visit", analyticsNumber(current.pages_per_visit, 2), "Average session"],
        ["Avg. duration", analyticsDuration(current.average_session_duration), "Engaged time"],
        ["Bounce rate", `${analyticsNumber(current.bounce_rate, 1)}%`, "Approximate"],
        ["Product views", analyticsNumber(current.product_views), "Jerseys viewed"],
        ["Marketplace clicks", analyticsNumber(current.marketplace_clicks), "Outbound actions"],
        ["Marketplace CTR", `${analyticsNumber(current.marketplace_ctr, 1)}%`, "Clicks / product views"]
      ].map(([label, value, note]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`).join("")}
    </section>

    ${analyticsShopifyFunnel(data)}
    ${analyticsFunnelBreakdowns(data)}

    <section class="analytics-chart-grid">
      <article class="analytics-card analytics-card-wide"><header><span>Traffic</span><h3>Daily visitors and page views</h3></header>${analyticsLineChart(data.daily, [{ key: "visitors", label: "Visitors" }, { key: "page_views", label: "Page views" }])}</article>
      <article class="analytics-card"><header><span>Acquisition</span><h3>Traffic sources</h3></header>${analyticsSourceChart(data.sources)}</article>
      <article class="analytics-card"><header><span>Marketplace</span><h3>Clicks over time</h3></header>${analyticsLineChart(data.daily, [{ key: "marketplace_clicks", label: "Marketplace clicks" }])}</article>
      <article class="analytics-card"><header><span>Search behavior</span><h3>Search trends</h3></header>${analyticsLineChart(data.daily, [{ key: "searches", label: "Searches" }])}</article>
      <article class="analytics-card analytics-card-wide"><header><span>Products</span><h3>Top 10 viewed jerseys</h3></header>${analyticsBarChart(data.product_lists?.most_viewed)}</article>
      <article class="analytics-card analytics-card-wide"><header><span>Acquisition</span><h3>Daily traffic by source</h3></header>${analyticsDailyMatrix(data.source_daily, "source", "visitors")}</article>
      <article class="analytics-card analytics-card-wide"><header><span>Marketplace</span><h3>Daily clicks by marketplace</h3></header>${analyticsDailyMatrix(market.daily, "marketplace", "clicks")}</article>
    </section>

    <section class="analytics-card">
      <header class="analytics-section-heading"><div><span>Marketplace Analytics</span><h3>eBay and Depop performance</h3></div><div class="analytics-inline-stats"><b>${analyticsNumber(ebayClicks)}<small>eBay clicks</small></b><b>${analyticsNumber(depopClicks)}<small>Depop clicks</small></b><b>${analyticsNumber(market.ctr, 1)}%<small>overall CTR</small></b></div></header>
      ${market.general_clicks > 0 ? `<p class="analytics-attribution-note">${analyticsNumber(market.general_clicks)} ${market.general_clicks === 1 ? "click came" : "clicks came"} from a general marketplace link, so ${market.general_clicks === 1 ? "it is" : "they are"} not assigned to a jersey.</p>` : ""}
      ${analyticsProductTable((data.products || []).filter(item => item.clicks > 0).sort((a, b) => b.clicks - a.clicks).slice(0, 20), "Marketplace clicks by product will appear here.")}
    </section>

    <section class="analytics-card">
      <header><span>Marketplace activity</span><h3>Recent marketplace clicks</h3></header>
      ${analyticsMarketplaceClickList(market.recent_clicks)}
    </section>

    <section class="analytics-card">
      <header><span>Campaign attribution</span><h3>Facebook post results</h3></header>
      ${analyticsCampaignTable(data.campaigns?.facebook)}
    </section>

    <section class="analytics-detail-grid">
      <article class="analytics-card"><header><span>Searches</span><h3>Top search terms</h3></header>${analyticsRankedList(data.searches?.terms, "searches")}</article>
      <article class="analytics-card"><header><span>Search quality</span><h3>Zero-result searches</h3></header>${analyticsRankedList(data.searches?.zero_results, "zero_result_searches", "No zero-result searches in this period.")}</article>
      <article class="analytics-card"><header><span>Possible typos</span><h3>Common misspellings</h3></header>${analyticsRankedList(data.searches?.possible_misspellings, "searches", "No likely misspellings detected.")}</article>
      <article class="analytics-card"><header><span>Players searched</span><h3>Most searched players</h3></header>${analyticsRankedList(searchEntities.players, "searches")}</article>
      <article class="analytics-card"><header><span>Clubs searched</span><h3>Most searched clubs</h3></header>${analyticsRankedList(searchEntities.clubs, "searches")}</article>
      <article class="analytics-card"><header><span>Countries searched</span><h3>Most searched countries</h3></header>${analyticsRankedList(searchEntities.countries, "searches")}</article>
      <article class="analytics-card"><header><span>Competitions searched</span><h3>Most searched competitions</h3></header>${analyticsRankedList(searchEntities.competitions, "searches")}</article>
      <article class="analytics-card"><header><span>Popular inventory</span><h3>Most popular teams</h3></header>${analyticsRankedList(data.entities?.teams, "views")}</article>
      <article class="analytics-card"><header><span>Popular inventory</span><h3>Most popular players</h3></header>${analyticsRankedList(data.entities?.players, "views")}</article>
      <article class="analytics-card"><header><span>Popular inventory</span><h3>Most popular competitions</h3></header>${analyticsRankedList(data.entities?.competitions, "views")}</article>
      <article class="analytics-card"><header><span>Geography</span><h3>Visitors by country</h3></header>${analyticsSimpleList(countryRows)}</article>
      <article class="analytics-card"><header><span>United States</span><h3>Visitors by state</h3></header>${analyticsSimpleList(states)}</article>
      <article class="analytics-card"><header><span>Technology</span><h3>Device type</h3></header>${analyticsSimpleList(data.devices)}</article>
      <article class="analytics-card"><header><span>Technology</span><h3>Browser breakdown</h3></header>${analyticsSimpleList(data.browsers)}</article>
    </section>

    <section class="analytics-intelligence">
      <article class="analytics-card"><header><span>Opportunity</span><h3>Highest views with no clicks</h3></header>${analyticsProductTable(data.product_lists?.high_views_no_clicks)}</article>
      <article class="analytics-card"><header><span>Restock signals</span><h3>High clicks and low inventory</h3></header>${analyticsProductTable(data.product_lists?.high_clicks_low_inventory)}</article>
      <article class="analytics-card"><header><span>Inventory</span><h3>Completely sold out</h3></header>${analyticsProductTable(data.product_lists?.sold_out)}</article>
      <article class="analytics-card"><header><span>Visibility</span><h3>Not viewed in 30 days</h3></header>${analyticsProductTable(data.product_lists?.not_viewed_30d)}</article>
      <article class="analytics-card"><header><span>Product discovery</span><h3>Products with zero views</h3></header>${analyticsProductTable(data.product_lists?.zero_views)}</article>
      <article class="analytics-card"><header><span>Product discovery</span><h3>Least viewed jerseys</h3></header>${analyticsProductTable(data.product_lists?.least_viewed)}</article>
      <article class="analytics-card"><header><span>Recently viewed</span><h3>Latest product interest</h3></header>${analyticsProductTable(data.product_lists?.recently_viewed)}</article>
      <article class="analytics-card"><header><span>Conversion</span><h3>Highest marketplace CTR</h3></header>${analyticsProductTable(data.product_lists?.highest_ctr)}</article>
      <article class="analytics-card"><header><span>Conversion</span><h3>Lowest marketplace CTR</h3></header>${analyticsProductTable(data.product_lists?.lowest_ctr)}</article>
    </section>

    <section class="analytics-card analytics-recommendations">
      <header><span>Automatic insights</span><h3>Recommendations</h3></header>
      <ul>${(data.recommendations || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      <p>Privacy: anonymous browser IDs only; no IP addresses are stored. Location is limited to country and U.S. state when available.</p>
    </section>`;
}

async function loadAnalytics() {
  if (!analyticsDashboard || analyticsLoading) return;
  analyticsLoading = true;
  if (analyticsStatus) {
    analyticsStatus.textContent = "Loading analytics...";
    analyticsStatus.classList.remove("error", "success");
  }
  if (refreshAnalytics) refreshAnalytics.disabled = true;
  try {
    analyticsData = await api(`/api/admin/analytics?range=${encodeURIComponent(analyticsRange?.value || "30d")}`);
    analyticsLoaded = true;
    renderAnalytics();
    if (analyticsStatus) {
      const gaStatus = analyticsData.integrations?.ga4_configured
        ? "GA4 connected."
        : "First-party analytics active; add GA4_MEASUREMENT_ID to connect GA4.";
      analyticsStatus.textContent = `Updated ${new Date(analyticsData.generated_at).toLocaleString()}. ${gaStatus}`;
      analyticsStatus.classList.add("success");
    }
    if (exportAnalytics) exportAnalytics.disabled = false;
  } catch (error) {
    analyticsDashboard.innerHTML = analyticsEmpty("Analytics could not be loaded.");
    if (analyticsStatus) {
      analyticsStatus.textContent = error.message;
      analyticsStatus.classList.add("error");
    }
  } finally {
    analyticsLoading = false;
    if (refreshAnalytics) refreshAnalytics.disabled = false;
  }
}

function exportAnalyticsCsv() {
  if (!analyticsData?.products?.length) return;
  const funnelByProduct = new Map((analyticsData.funnel?.products || []).map(item => [String(item.id), item]));
  const rows = [
    ["Product ID", "Product", "Category", "Views", "Add to Cart", "Checkout Started", "Purchases", "View to Cart %", "Cart to Checkout %", "Checkout to Purchase %", "Overall Conversion %", "Marketplace Clicks", "eBay Clicks", "Depop Clicks", "Marketplace CTR", "Inventory", "Views Last 30 Days", "Last Viewed"],
    ...analyticsData.products.map(item => {
      const funnel = funnelByProduct.get(String(item.id)) || {};
      return [
        item.id, item.name, item.category, item.views, funnel.add_to_cart || 0,
        funnel.checkout_started || 0, funnel.purchases || 0, funnel.view_to_cart_rate || 0,
        funnel.cart_to_checkout_rate || 0, funnel.checkout_to_purchase_rate || 0,
        funnel.overall_conversion_rate || 0, item.clicks, item.ebay_clicks, item.depop_clicks,
        `${item.ctr}%`, item.quantity, item.views_30d, item.last_viewed_at
      ];
    })
  ];
  const blob = new Blob([rows.map(row => row.map(csvValue).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jerseysfrmjb-analytics-${analyticsData.range || "30d"}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function saleDateValue(sale) {
  return sale.created_at || sale.timestamp || sale.date || "";
}

const SALES_TIME_ZONE = "America/New_York";

function parseSaleDate(value) {
  if (value instanceof Date) return value;
  const text = String(value || "").trim();
  if (!text) return new Date(NaN);
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return new Date(`${text}T12:00:00Z`);
  const includesTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text);
  return new Date(includesTimeZone ? text : `${text.replace(" ", "T")}Z`);
}

function easternDateParts(value) {
  const date = value instanceof Date ? value : parseSaleDate(value);
  if (Number.isNaN(date.getTime())) return null;
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: SALES_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(date)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value])
  );
}

function easternDateKey(value) {
  const parts = easternDateParts(value);
  return parts ? `${parts.year}-${parts.month}-${parts.day}` : "";
}

function addDaysToDateKey(key, days) {
  const [year, month, day] = String(key).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return date.toISOString().slice(0, 10);
}

function easternWeekStartKey(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  const daysSinceMonday = date.getUTCDay() === 0 ? 6 : date.getUTCDay() - 1;
  return addDaysToDateKey(key, -daysSinceMonday);
}

function easternDayLabel(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString("en-US", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC"
  });
}

function easternWallTimeToIso(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let guess = target;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = easternDateParts(new Date(guess));
    if (!parts) return null;
    const represented = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute)
    );
    guess += target - represented;
  }

  return new Date(guess).toISOString();
}

function formatSaleDate(value) {
  if (!value) return "-";
  const date = parseSaleDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    timeZone: SALES_TIME_ZONE,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  });
}

function saleDateInputValue(value) {
  if (!value) return "";
  return easternDateKey(value) || String(value).slice(0, 10);
}

function saleDateTimeInputValue(value) {
  if (!value) return "";
  const parts = easternDateParts(value);
  return parts ? `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}` : "";
}

function saleIdValue(sale) {
  return sale.id ?? sale.sale_id ?? sale.saleId;
}

function saleJerseyName(sale) {
  return sale.product_name || sale.jersey || sale.name || "Unknown jersey";
}

function cleanSalePlayer(value = "") {
  const player = String(value)
    .replace(/\s+#\d+\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return /^no name(?:\s*\/\s*no number)?$/i.test(player) ? "" : player;
}

function cleanSaleTeam(value = "") {
  return String(value)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(?:\d{2}|\d{4})\/(?:\d{2}|\d{4})\b/g, " ")
    .replace(/\b(?:19|20)\d{2}\b/g, " ")
    .replace(/\b(?:world cup|home|away|third|3rd|off[- ]white|white|black|long sleeve|short sleeve|player version|fan version|jersey|kit)\b/gi, " ")
    .replace(/[|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inferSaleIdentity(value = "") {
  const title = String(value || "").trim();
  if (!title) return { player: "", team: "" };

  if (title.includes("|")) {
    const [playerPart, ...teamParts] = title.split("|");
    return {
      player: cleanSalePlayer(playerPart),
      team: cleanSaleTeam(teamParts.join(" "))
    };
  }

  const numbered = title.match(/^(.+?)\s+#\d+\b\s*(.*)$/);
  if (numbered) {
    return {
      player: cleanSalePlayer(numbered[1]),
      team: cleanSaleTeam(numbered[2])
    };
  }

  return { player: "", team: "" };
}

function salePlayerValue(sale = {}) {
  const saved = String(sale.player || "").trim();
  return saved && !/^unknown$/i.test(saved) ? saved : inferSaleIdentity(saleJerseyName(sale)).player;
}

function saleTeamValue(sale = {}) {
  const saved = String(sale.team_country || sale.team || sale.country || "").trim();
  return saved && !/^unknown$/i.test(saved) ? saved : inferSaleIdentity(saleJerseyName(sale)).team;
}

function formatSalePrice(value) {
  if (value === null || value === undefined || value === "") return "-";
  const number = Number(value);
  if (Number.isNaN(number)) return escapeHtml(value);
  return `$${number.toFixed(2).replace(/\.00$/, "")}`;
}

function salesQuantityValue(sale) {
  const quantity = Math.floor(Number(sale.quantity ?? 0));
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
}

function saleRevenueValue(sale) {
  if (sale.sale_price === null || sale.sale_price === undefined || sale.sale_price === "") return 0;
  const price = Number(sale.sale_price);
  return Number.isFinite(price) ? price : 0;
}

function addSalesCount(map, key, quantity) {
  const normalized = String(key || "").trim() || "Unknown";
  map.set(normalized, (map.get(normalized) || 0) + quantity);
}

function rankedSalesList(map, emptyText = "No sales yet") {
  const rows = Array.from(map.entries())
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5);
  if (!rows.length) return `<li>${escapeHtml(emptyText)}</li>`;
  return rows.map(([label, count]) => `<li><span>${escapeHtml(label)}</span><strong>${count}</strong></li>`).join("");
}

function ensureSalesAnalyticsPanel() {
  if (salesAnalyticsPanel || !salesTable) return salesAnalyticsPanel;
  salesAnalyticsPanel = document.createElement("div");
  salesAnalyticsPanel.setAttribute("data-sales-analytics", "");
  const tableContainer = salesTable.closest(".sales-table-wrap");
  tableContainer?.parentElement?.insertBefore(salesAnalyticsPanel, tableContainer);
  return salesAnalyticsPanel;
}

function renderSalesAnalytics() {
  const panel = ensureSalesAnalyticsPanel();
  if (!panel) return;

  const todayKey = easternDateKey(new Date());
  const weekStartKey = easternWeekStartKey(todayKey);
  const monthKey = todayKey.slice(0, 7);
  const activityKeys = Array.from({ length: 7 }, (_, index) => addDaysToDateKey(todayKey, index - 6));
  const dailyUnits = new Map(activityKeys.map(key => [key, 0]));
  let totalUnits = 0;
  let todayUnits = 0;
  let weekUnits = 0;
  let monthUnits = 0;
  let revenue = 0;
  const byPlatform = new Map();
  const byPlayer = new Map();
  const byTeam = new Map();
  const bySize = new Map();

  sales.forEach(sale => {
    const quantity = salesQuantityValue(sale);
    totalUnits += quantity;
    revenue += saleRevenueValue(sale);
    addSalesCount(byPlatform, sale.platform, quantity);
    addSalesCount(byPlayer, salePlayerValue(sale), quantity);
    addSalesCount(byTeam, saleTeamValue(sale), quantity);
    addSalesCount(bySize, sale.size, quantity);

    const saleKey = easternDateKey(saleDateValue(sale));
    if (saleKey) {
      if (saleKey === todayKey) todayUnits += quantity;
      if (saleKey >= weekStartKey && saleKey <= todayKey) weekUnits += quantity;
      if (saleKey.startsWith(monthKey) && saleKey <= todayKey) monthUnits += quantity;
      if (dailyUnits.has(saleKey)) dailyUnits.set(saleKey, dailyUnits.get(saleKey) + quantity);
    }
  });

  const revenueText = revenue.toFixed(2).replace(/\.00$/, "");
  const activity = activityKeys.map(key => ({ key, units: dailyUnits.get(key) || 0 }));
  const maxDailyUnits = Math.max(1, ...activity.map(day => day.units));
  const activeDays = activity.filter(day => day.units > 0).length;
  panel.innerHTML = `
    <section class="sales-analytics" aria-label="Sales overview">
      <div class="sales-analytics-heading">
        <div>
          <span class="section-kicker">Performance</span>
          <h3>Sales Overview</h3>
        </div>
        <p>Based on all recorded sales</p>
      </div>
      <div class="sales-kpi-grid">
        <article class="sales-kpi-card"><span>Total Units</span><strong>${totalUnits}</strong><small>All time</small></article>
        <article class="sales-kpi-card"><span>Today</span><strong>${todayUnits}</strong><small>Units sold</small></article>
        <article class="sales-kpi-card"><span>This Week</span><strong>${weekUnits}</strong><small>Since Monday</small></article>
        <article class="sales-kpi-card"><span>This Month</span><strong>${monthUnits}</strong><small>Current month</small></article>
        <article class="sales-kpi-card revenue"><span>Recorded Revenue</span><strong>$${escapeHtml(revenueText)}</strong><small>Sales with prices</small></article>
      </div>
      <div class="sales-breakdown-grid">
        <article class="sales-breakdown-card"><span>By Platform</span><ul class="compact-sales-list">${rankedSalesList(byPlatform)}</ul></article>
        <article class="sales-breakdown-card"><span>Best Players</span><ul class="compact-sales-list">${rankedSalesList(byPlayer)}</ul></article>
        <article class="sales-breakdown-card"><span>Best Teams / Countries</span><ul class="compact-sales-list">${rankedSalesList(byTeam)}</ul></article>
        <article class="sales-breakdown-card"><span>Best Sizes</span><ul class="compact-sales-list">${rankedSalesList(bySize)}</ul></article>
      </div>
      <article class="sales-activity-card">
        <div class="sales-activity-heading">
          <div>
            <span>7-Day Sales Tracker</span>
            <strong>Daily units sold in Eastern Time</strong>
          </div>
          <small>${activeDays} active day${activeDays === 1 ? "" : "s"}</small>
        </div>
        <div class="sales-activity-grid">
          ${activity.map(day => {
            const width = day.units ? Math.max(14, Math.round((day.units / maxDailyUnits) * 100)) : 0;
            return `
              <div class="sales-activity-day${day.units ? " active" : ""}">
                <strong>${day.units}</strong>
                <span class="sales-activity-bar"><i style="--activity-width:${width}%"></i></span>
                <small>${escapeHtml(easternDayLabel(day.key))}</small>
              </div>
            `;
          }).join("")}
        </div>
      </article>
    </section>
  `;
}

function filteredSales() {
  const query = (salesSearch?.value || "").trim().toLowerCase();
  const platform = salesPlatform?.value || "all";
  const dateFilter = salesDate?.value || "";
  return sales.filter(sale => {
    const saleText = [saleJerseyName(sale), salePlayerValue(sale), saleTeamValue(sale), sale.size, sale.platform].join(" ").toLowerCase();
    const platformMatch = platform === "all" || String(sale.platform || "").toLowerCase() === platform.toLowerCase();
    const dateMatch = !dateFilter || saleDateInputValue(saleDateValue(sale)) === dateFilter;
    return (!query || saleText.includes(query)) && platformMatch && dateMatch;
  });
}

function saleInventoryItem(sale = {}) {
  const productId = String(sale.product_id ?? sale.productId ?? "").trim();
  return productId
    ? inventory.find(item => String(item.id) === productId)
    : null;
}

function renderSaleJerseyCell(sale) {
  const product = saleInventoryItem(sale);
  const photo = product?.photos?.[0] || {};
  const name = saleJerseyName(sale);
  const visual = photo.src
    ? `<img src="${escapeHtml(photo.src)}" alt="" width="22" height="22" loading="lazy" decoding="async">`
    : `<span class="sale-jersey-fallback" aria-hidden="true">&#9917;</span>`;

  return `
    <div class="sale-jersey-cell">
      ${visual}
      <div>
        <strong>${escapeHtml(name)}</strong>
      </div>
    </div>
  `;
}

function renderSales() {
  if (!salesTable) return;
  renderSalesAnalytics();
  const rows = filteredSales();
  if (!rows.length) {
    salesTable.innerHTML = `<tr><td colspan="6" class="sales-empty">${salesLoaded ? "No sales match those filters." : "Log in to view sales."}</td></tr>`;
    return;
  }
  salesTable.innerHTML = rows.map(sale => {
    const saleId = saleIdValue(sale);
    if (String(saleId) === String(editingSaleId)) return renderSaleEditRow(sale);
    return `
      <tr data-sale-row="${escapeHtml(saleId || "")}">
        <td>${escapeHtml(formatSaleDate(saleDateValue(sale)))}</td>
        <td>${renderSaleJerseyCell(sale)}</td>
        <td>${escapeHtml(sale.size || "-")}</td>
        <td>${escapeHtml(sale.quantity ?? 0)}</td>
        <td>${escapeHtml(sale.platform || "-")}</td>
        <td>
          <div class="sale-price-cell">
            <strong>${formatSalePrice(sale.sale_price)}</strong>
            <div class="sale-row-actions">
              <button type="button" class="admin-small-button" data-sale-edit="${escapeHtml(saleId || "")}">Edit</button>
              <button type="button" class="admin-small-button danger" data-sale-delete="${escapeHtml(saleId || "")}">Delete</button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function renderSaleEditRow(sale) {
  const saleId = saleIdValue(sale);
  const platform = sale.platform || "Website";
  const platforms = ["Depop", "eBay", "Facebook", "Website", "Local", "Other"];
  return `
    <tr data-sale-edit-row="${escapeHtml(saleId || "")}">
      <td><input type="datetime-local" value="${escapeHtml(saleDateTimeInputValue(saleDateValue(sale)))}" data-sale-edit-date></td>
      <td>${renderSaleJerseyCell(sale)}</td>
      <td>${escapeHtml(sale.size || "-")}</td>
      <td><input type="number" min="1" step="1" value="${escapeHtml(sale.quantity ?? 1)}" data-sale-edit-quantity></td>
      <td>
        <select data-sale-edit-platform>
          ${platforms.map(option => `<option value="${escapeHtml(option)}"${option.toLowerCase() === String(platform).toLowerCase() ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}
        </select>
      </td>
      <td>
        <input type="number" min="0" step="0.01" value="${escapeHtml(sale.sale_price ?? "")}" placeholder="Price" data-sale-edit-price>
        <input type="text" value="${escapeHtml(sale.notes || "")}" placeholder="Notes" data-sale-edit-notes>
        <button type="button" class="admin-small-button" data-sale-save="${escapeHtml(saleId || "")}">Save</button>
        <button type="button" class="admin-small-button" data-sale-cancel>Cancel</button>
      </td>
    </tr>
  `;
}

async function saveSaleEdit(saleId) {
  if (!saleId || savingSaleEditId) return;
  const row = salesTable?.querySelector(`[data-sale-edit-row="${CSS.escape(String(saleId))}"]`);
  if (!row) return;
  const quantity = Math.floor(Number(row.querySelector("[data-sale-edit-quantity]")?.value || 0));
  if (!Number.isFinite(quantity) || quantity < 1) {
    if (salesStatus) salesStatus.textContent = "Enter a quantity of at least 1.";
    return;
  }
  const priceText = row.querySelector("[data-sale-edit-price]")?.value.trim() || "";
  const salePrice = priceText ? Number(priceText) : null;
  if (priceText && !Number.isFinite(salePrice)) {
    if (salesStatus) salesStatus.textContent = "Enter a valid sale price or leave it blank.";
    return;
  }
  const dateText = row.querySelector("[data-sale-edit-date]")?.value || "";
  const payload = {
    id: saleId,
    quantity,
    platform: row.querySelector("[data-sale-edit-platform]")?.value || "Website",
    sale_price: salePrice,
    notes: row.querySelector("[data-sale-edit-notes]")?.value.trim() || "",
    created_at: dateText ? easternWallTimeToIso(dateText) : null
  };

  savingSaleEditId = saleId;
  row.querySelectorAll("button, input, select").forEach(control => { control.disabled = true; });
  if (salesStatus) salesStatus.textContent = "Saving sale edit...";

  try {
    await api("/api/admin/sales", {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
    editingSaleId = null;
    if (salesStatus) salesStatus.textContent = "Sale updated.";
    await loadSales();
  } catch (error) {
    row.querySelectorAll("button, input, select").forEach(control => { control.disabled = false; });
    if (salesStatus) salesStatus.textContent = error.message || "Could not update sale.";
  } finally {
    savingSaleEditId = null;
  }
}

async function deleteSaleRecord(saleId) {
  if (!saleId || deletingSaleId) return;
  const sale = sales.find(item => String(saleIdValue(item)) === String(saleId));
  const saleName = sale ? saleJerseyName(sale) : "this sale";

  if (!window.confirm(`Delete ${saleName} from sales history?`)) return;
  const restoreInventory = window.confirm("Return this quantity to inventory?");
  const row = salesTable?.querySelector(`[data-sale-row="${CSS.escape(String(saleId))}"]`);

  deletingSaleId = saleId;
  row?.querySelectorAll("button").forEach(button => { button.disabled = true; });
  if (salesStatus) salesStatus.textContent = restoreInventory ? "Restoring inventory and deleting sale..." : "Deleting sale...";

  try {
    const result = await api("/api/admin/sales", {
      method: "DELETE",
      body: JSON.stringify({ id: saleId, restore_inventory: restoreInventory })
    });
    const warning = result?.restore_warning || "";
    await loadSales();
    await loadInventory();
    if (salesStatus) salesStatus.textContent = warning || (restoreInventory ? "Sale deleted and inventory restored." : "Sale deleted.");
  } catch (error) {
    row?.querySelectorAll("button").forEach(button => { button.disabled = false; });
    if (salesStatus) salesStatus.textContent = error.message || "Could not delete sale.";
  } finally {
    deletingSaleId = null;
  }
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

function normalizeQuickSaleText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function quickSaleSizeCode(value) {
  const text = normalizeQuickSaleText(value);
  const sizes = {
    s: "S",
    small: "S",
    m: "M",
    medium: "M",
    l: "L",
    large: "L",
    xl: "XL",
    "2xl": "2XL",
    "3xl": "3XL",
    "4xl": "4XL"
  };
  return sizes[text] || "";
}

function quickSaleSizeLabel(size) {
  return {
    S: "Small",
    M: "Medium",
    L: "Large",
    XL: "XL",
    "2XL": "2XL",
    "3XL": "3XL",
    "4XL": "4XL"
  }[size] || size || "-";
}

function quickSaleProductName(item) {
  return item.name || item.title || item.jersey_name || item.product_name || "Jersey";
}

function quickSalePlayer(item) {
  return salePlayerValue({ ...item, product_name: quickSaleProductName(item) });
}

function quickSaleTeam(item) {
  return saleTeamValue({ ...item, product_name: quickSaleProductName(item) });
}

function parseQuickSaleQuery(query) {
  const parts = normalizeQuickSaleText(query).split(/\s+/).filter(Boolean);
  let size = "";
  const terms = parts.filter(part => {
    const parsedSize = quickSaleSizeCode(part);
    if (parsedSize && !size) {
      size = parsedSize;
      return false;
    }
    return true;
  });
  return { terms, size };
}

function quickSaleSearchText(item) {
  return normalizeQuickSaleText([
    quickSaleProductName(item),
    quickSalePlayer(item),
    quickSaleTeam(item),
    item.category,
    activeSizeText(item)
  ].join(" "));
}

function findQuickSaleMatches(query) {
  const parsed = parseQuickSaleQuery(query);
  if (!parsed.terms.length && !parsed.size) return [];

  return inventory.flatMap(item => {
    const sizes = itemSizes(item);
    const availableSizes = sizeOptions
      .map(size => ({ size, quantity: Number(sizes[size]) || 0 }))
      .filter(entry => entry.quantity > 0 && (!parsed.size || entry.size === parsed.size));

    if (!availableSizes.length) return [];

    const searchable = quickSaleSearchText(item);
    if (parsed.terms.some(term => !searchable.includes(term))) return [];

    return availableSizes.map(entry => ({ item, ...entry }));
  }).slice(0, 20);
}

function updateQuickSaleSubmit() {
  if (!quickSaleSubmit) return;
  const index = Number(quickSaleMatch?.value);
  quickSaleSubmit.disabled = !Number.isInteger(index) || index < 0 || index >= quickSaleMatches.length;
}

function updateQuickSaleMatches() {
  if (!quickSaleMatch) return;

  quickSaleMatches = findQuickSaleMatches(quickSaleSearch?.value || "");
  quickSaleMatch.innerHTML = `<option value="">Select a matching jersey and size</option>${quickSaleMatches.map((match, index) => `
    <option value="${index}">${escapeHtml(quickSaleProductName(match.item))} - ${escapeHtml(quickSaleSizeLabel(match.size))} (${match.quantity} available)</option>
  `).join("")}`;

  if (quickSaleStatus) {
    quickSaleStatus.textContent = quickSaleMatches.length
      ? "Choose the matching jersey before recording the sale."
      : "Type a jersey/player and size to find a match.";
  }
  updateQuickSaleSubmit();
  applyQuickSalePlatformPrice();
}

function selectedQuickSaleMatch() {
  const index = Number(quickSaleMatch?.value);
  if (!Number.isInteger(index) || index < 0 || index >= quickSaleMatches.length) return null;
  return quickSaleMatches[index];
}

async function applyQuickSalePlatformPrice() {
  const requestId = ++quickSalePriceRequest;
  if (!quickSalePrice || quickSalePriceManuallyEdited) return;

  const match = selectedQuickSaleMatch();
  quickSalePrice.value = "";
  if (!match) return;

  try {
    const prices = await loadPlatformPriceData(match.item.id);
    if (requestId !== quickSalePriceRequest || quickSalePriceManuallyEdited) return;
    quickSalePrice.value = prices[quickSalePlatform?.value || "Website"] ?? "";
  } catch (error) {
    if (requestId === quickSalePriceRequest && !quickSalePriceManuallyEdited) {
      quickSalePrice.value = "";
    }
  }
}

async function submitQuickSale(event) {
  event.preventDefault();
  const match = selectedQuickSaleMatch();
  if (!match) {
    if (quickSaleStatus) quickSaleStatus.textContent = "Select a matching jersey and size first.";
    return;
  }

  const quantity = Math.floor(Number(quickSaleQuantity?.value || 1));
  if (!Number.isFinite(quantity) || quantity < 1) {
    if (quickSaleStatus) quickSaleStatus.textContent = "Enter a quantity of at least 1.";
    return;
  }
  if (quantity > match.quantity) {
    if (quickSaleStatus) quickSaleStatus.textContent = `Only ${match.quantity} available in ${quickSaleSizeLabel(match.size)}.`;
    return;
  }

  const priceText = quickSalePrice?.value.trim() || "";
  const salePrice = priceText ? Number(priceText) : null;
  if (priceText && !Number.isFinite(salePrice)) {
    if (quickSaleStatus) quickSaleStatus.textContent = "Enter a valid sale price or leave it blank.";
    return;
  }

  const item = match.item;
  const payload = {
    product_id: item.id,
    product_name: quickSaleProductName(item),
    jersey_name: quickSaleProductName(item),
    player: quickSalePlayer(item),
    team_country: quickSaleTeam(item),
    size: match.size,
    quantity,
    platform: quickSalePlatform?.value || "Website",
    sale_price: salePrice,
    notes: quickSaleNotes?.value.trim() || "",
    adjust_inventory: true
  };

  if (quickSaleSubmit) {
    quickSaleSubmit.disabled = true;
    quickSaleSubmit.textContent = "Saving...";
  }
  if (quickSaleStatus) quickSaleStatus.textContent = "Saving sale...";

  try {
    await api("/api/admin/sales", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    quickSaleForm.reset();
    quickSalePriceManuallyEdited = false;
    quickSalePriceRequest += 1;
    if (quickSaleQuantity) quickSaleQuantity.value = "1";
    quickSaleMatches = [];
    if (quickSaleMatch) quickSaleMatch.innerHTML = `<option value="">Select a matching jersey and size</option>`;
    await loadInventory();
    await loadSales();
    if (quickSaleStatus) quickSaleStatus.textContent = "Sale recorded and inventory updated.";
  } catch (error) {
    if (quickSaleStatus) quickSaleStatus.textContent = error.message || "Could not record sale.";
  } finally {
    if (quickSaleSubmit) quickSaleSubmit.textContent = "Record Sale";
    updateQuickSaleSubmit();
  }
}

function sizeQuantityDecreases(original, nextSizes) {
  const previousSizes = itemSizes(original);
  return sizeOptions
    .map(size => {
      const previousQuantity = Math.max(0, Math.floor(Number(previousSizes[size] || 0)));
      const nextQuantity = Math.max(0, Math.floor(Number(nextSizes[size] || 0)));
      return nextQuantity < previousQuantity
        ? { size, quantity: previousQuantity - nextQuantity, previousQuantity, nextQuantity }
        : null;
    })
    .filter(Boolean);
}

function showInventorySaleForm(item, decreases) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:9999",
      "display:grid",
      "place-items:center",
      "padding:20px",
      "background:rgba(15,10,10,.72)"
    ].join(";");

    const form = document.createElement("form");
    form.style.cssText = [
      "width:min(460px,100%)",
      "max-height:calc(100vh - 40px)",
      "overflow:auto",
      "background:#fff",
      "border:1px solid #d8d1cb",
      "box-shadow:0 22px 60px rgba(0,0,0,.28)",
      "padding:22px",
      "border-radius:8px",
      "color:#1c1413"
    ].join(";");

    const decreaseSummary = decreases
      .map(decrease => `${escapeHtml(quickSaleSizeLabel(decrease.size))}: ${decrease.quantity}`)
      .join(", ");

    form.innerHTML = `
      <h3 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;">Record Sale</h3>
      <p style="margin:0 0 14px;line-height:1.45;"><strong>${escapeHtml(quickSaleProductName(item))}</strong><br>${decreaseSummary} sold</p>
      <label style="display:grid;gap:6px;margin-bottom:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px;color:#7b1d3d;">
        Platform
        <select data-sale-platform style="padding:10px;border:1px solid #d8d1cb;border-radius:6px;">
          <option>Depop</option>
          <option>eBay</option>
          <option>Facebook</option>
          <option>Website</option>
          <option>Local</option>
          <option>Other</option>
        </select>
      </label>
      <label style="display:grid;gap:6px;margin-bottom:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px;color:#7b1d3d;">
        Sale Price <span style="text-transform:none;letter-spacing:0;color:#6f6863;font-weight:600;">optional</span>
        <input data-sale-price type="number" min="0" step="0.01" placeholder="55" style="padding:10px;border:1px solid #d8d1cb;border-radius:6px;">
      </label>
      <label style="display:grid;gap:6px;margin-bottom:16px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px;color:#7b1d3d;">
        Notes <span style="text-transform:none;letter-spacing:0;color:#6f6863;font-weight:600;">optional</span>
        <textarea data-sale-notes rows="3" style="padding:10px;border:1px solid #d8d1cb;border-radius:6px;resize:vertical;"></textarea>
      </label>
      <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
        <button type="button" data-cancel style="padding:10px 16px;border-radius:999px;border:1px solid #d8d1cb;background:#fff;font-weight:800;">Cancel</button>
        <button type="submit" class="shop-button" style="border:0;">Record Sale</button>
      </div>
    `;

    const cleanup = result => {
      overlay.remove();
      resolve(result);
    };
    const platformSelect = form.querySelector("[data-sale-platform]");
    const priceInput = form.querySelector("[data-sale-price]");
    let priceManuallyEdited = false;
    let priceRequest = 0;

    const applyPlatformPrice = async () => {
      const requestId = ++priceRequest;
      if (priceManuallyEdited) return;
      priceInput.value = "";
      try {
        const prices = await loadPlatformPriceData(item.id);
        if (requestId !== priceRequest || priceManuallyEdited || !overlay.isConnected) return;
        priceInput.value = prices[platformSelect.value] ?? "";
      } catch (error) {
        if (requestId === priceRequest && !priceManuallyEdited) priceInput.value = "";
      }
    };

    overlay.addEventListener("click", event => {
      if (event.target === overlay) cleanup(null);
    });
    form.querySelector("[data-cancel]").addEventListener("click", () => cleanup(null));
    priceInput.addEventListener("input", () => {
      priceManuallyEdited = true;
      priceRequest += 1;
    });
    platformSelect.addEventListener("change", applyPlatformPrice);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      submit.textContent = "Recording...";
      const priceText = form.querySelector("[data-sale-price]").value.trim();
      const salePrice = priceText ? Number(priceText) : null;
      if (priceText && !Number.isFinite(salePrice)) {
        submit.disabled = false;
        submit.textContent = "Record Sale";
        form.querySelector("[data-sale-price]").focus();
        return;
      }
      cleanup({
        platform: form.querySelector("[data-sale-platform]").value,
        sale_price: salePrice,
        notes: form.querySelector("[data-sale-notes]").value.trim()
      });
    });

    overlay.appendChild(form);
    document.body.appendChild(overlay);
    platformSelect.focus();
    applyPlatformPrice();
  });
}

async function recordInventoryDecreaseSales(item, decreases, details) {
  for (const decrease of decreases) {
    await api("/api/admin/sales", {
      method: "POST",
      body: JSON.stringify({
        product_id: item.id,
        product_name: quickSaleProductName(item),
        jersey_name: quickSaleProductName(item),
        player: quickSalePlayer(item),
        team_country: quickSaleTeam(item),
        size: decrease.size,
        quantity: decrease.quantity,
        platform: details.platform,
        sale_price: details.sale_price,
        notes: details.notes
      })
    });
  }
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
  const { timeoutMs = 0, ...requestOptions } = options;
  const controller = timeoutMs > 0 ? new AbortController() : null;
  const timeout = controller ? window.setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    response = await fetch(path, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...requestOptions,
      ...(controller ? { signal: controller.signal } : {})
    });
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("This request timed out. No Shopify products were created. Try the preview again.");
    throw new Error("Could not reach the server. Refresh and try again.");
  } finally {
    if (timeout) window.clearTimeout(timeout);
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

function renderFacebookConnection() {
  const connected = Boolean(facebookConnection?.connected);
  const hasAuthorization = Boolean(facebookConnection?.has_authorization);
  const needsPage = Boolean(facebookConnection?.needs_page_selection);
  const pageName = String(facebookConnection?.page?.name || "");
  if (facebookBadge) {
    facebookBadge.textContent = connected ? "Connected" : needsPage ? "Choose Page" : "Not connected";
    facebookBadge.className = `facebook-connection-badge ${connected ? "connected" : "disconnected"}`;
  }
  if (facebookConnectionName) {
    facebookConnectionName.textContent = connected
      ? pageName
      : needsPage
        ? "Authorization received — choose a Page"
        : "No Facebook Page connected";
  }
  if (facebookConnectionDetail) {
    facebookConnectionDetail.textContent = connected
      ? "Posts publish directly to this Page. Personal profiles and Marketplace are never used."
      : needsPage
        ? "Your Facebook account manages more than one Page."
        : "Authorize the Page owner once to enable direct publishing.";
  }
  if (facebookConnect) {
    facebookConnect.hidden = hasAuthorization && !facebookConnection?.expired;
    facebookConnect.textContent = facebookConnection?.expired ? "Reconnect Facebook Page" : "Connect Facebook Page";
  }
  if (disconnectFacebookButton) disconnectFacebookButton.hidden = !hasAuthorization;
  if (facebookPagePicker) facebookPagePicker.hidden = !needsPage;
  updateFacebookActions();
}

async function loadFacebookPages() {
  if (!facebookPageSelect || !facebookConnection?.needs_page_selection) return;
  facebookPageSelect.disabled = true;
  facebookPageSelect.innerHTML = '<option value="">Loading Pages...</option>';
  try {
    const data = await api("/api/admin/facebook/pages");
    const pages = Array.isArray(data.pages) ? data.pages : [];
    facebookPageSelect.innerHTML = '<option value="">Choose a Facebook Page</option>' + pages.map(page =>
      `<option value="${escapeHtml(page.id)}">${escapeHtml(page.name)}</option>`
    ).join("");
    if (!pages.length) facebookPageSelect.innerHTML = '<option value="">No manageable Pages found</option>';
  } catch (error) {
    facebookPageSelect.innerHTML = '<option value="">Pages could not be loaded</option>';
    setFacebookStatus(error.message, "error");
  } finally {
    facebookPageSelect.disabled = false;
  }
}

async function loadFacebookConnection() {
  if (!facebookBadge || facebookConnectionLoading) return;
  facebookConnectionLoading = true;
  facebookBadge.textContent = "Checking";
  facebookBadge.className = "facebook-connection-badge";
  if (refreshFacebookConnectionButton) refreshFacebookConnectionButton.disabled = true;
  try {
    facebookConnection = await api("/api/admin/facebook/status");
    facebookConnectionLoaded = true;
    renderFacebookConnection();
    if (facebookConnection.needs_page_selection) await loadFacebookPages();

    const callbackMessage = new URLSearchParams(location.search).get("message") || "";
    if (facebookCallback === "error") {
      setFacebookStatus(callbackMessage || "Facebook could not be connected.", "error");
    } else if (facebookCallback === "select-page") {
      setFacebookStatus(callbackMessage || "Choose the Facebook Page to publish to.", "success");
    } else if (facebookCallback === "connected") {
      setFacebookStatus(callbackMessage || "Facebook Page connected successfully.", "success");
    }
  } catch (error) {
    facebookConnectionLoaded = false;
    facebookConnection = null;
    renderFacebookConnection();
    if (facebookConnectionDetail) facebookConnectionDetail.textContent = error.message;
    setFacebookStatus(error.message, "error");
  } finally {
    facebookConnectionLoading = false;
    if (refreshFacebookConnectionButton) refreshFacebookConnectionButton.disabled = false;
  }
}

async function chooseFacebookPage() {
  const pageId = String(facebookPageSelect?.value || "");
  if (!pageId || selectFacebookPageButton?.disabled) {
    setFacebookStatus("Choose a Facebook Page.", "error");
    return;
  }
  selectFacebookPageButton.disabled = true;
  selectFacebookPageButton.textContent = "Connecting...";
  setFacebookStatus("Connecting the selected Facebook Page...");
  try {
    const data = await api("/api/admin/facebook/pages", {
      method: "POST",
      body: JSON.stringify({ page_id: pageId })
    });
    facebookConnection = {
      ...(facebookConnection || {}),
      connected: true,
      has_authorization: true,
      needs_page_selection: false,
      page: data.page
    };
    renderFacebookConnection();
    setFacebookStatus(`${data.page.name} is connected for direct publishing.`, "success");
  } catch (error) {
    setFacebookStatus(error.message, "error");
  } finally {
    selectFacebookPageButton.disabled = false;
    selectFacebookPageButton.textContent = "Use This Page";
  }
}

async function disconnectFacebook() {
  if (!facebookConnection?.has_authorization
    || !confirm("Disconnect this Facebook Page? Existing Facebook posts will not be deleted.")) return;
  if (disconnectFacebookButton) disconnectFacebookButton.disabled = true;
  setFacebookStatus("Disconnecting Facebook...");
  try {
    await api("/api/admin/facebook/disconnect", { method: "POST", body: "{}" });
    facebookConnection = { connected: false, has_authorization: false };
    renderFacebookConnection();
    setFacebookStatus("Facebook disconnected. Existing Page posts were not changed.", "success");
  } catch (error) {
    setFacebookStatus(error.message, "error");
  } finally {
    if (disconnectFacebookButton) disconnectFacebookButton.disabled = false;
  }
}

const FACEBOOK_MAX_PRODUCTS = 5;
const FACEBOOK_SITE_ORIGIN = "https://jerseysfrmjb.com";

function facebookAvailableProducts() {
  return inventory
    .filter(item => isAvailable(item) && Array.isArray(item.photos) && item.photos.some(photo => photo?.src))
    .sort((left, right) =>
      Number(Boolean(right.new_arrival)) - Number(Boolean(left.new_arrival))
      || String(right.date_added || "").localeCompare(String(left.date_added || ""))
      || left.name.localeCompare(right.name)
    );
}

function selectedFacebookProducts() {
  const byId = new Map(inventory.map(item => [String(item.id), item]));
  return [...selectedFacebookProductIds]
    .map(id => byId.get(String(id)))
    .filter(Boolean);
}

function facebookSizeLabel(size = "") {
  return {
    S: "Small",
    M: "Medium",
    L: "Large",
    XL: "Extra Large",
    "2XL": "2XL",
    "3XL": "3XL",
    "4XL": "4XL"
  }[size] || size;
}

function facebookAvailableSizes(product) {
  return Object.entries(product?.sizes || {})
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([size]) => facebookSizeLabel(size));
}

function facebookDefaultCaption(products, campaign = facebookCampaign?.value || "new_arrivals", variation = 0) {
  return window.JBFacebookCaptions.generateFacebookCaption(products, {
    campaign,
    variation,
    siteOrigin: FACEBOOK_SITE_ORIGIN
  });
}

function facebookSelectedPhotos() {
  return selectedFacebookProducts().flatMap(product =>
    (product.photos || [])
      .filter(photo => photo?.src)
      .slice(0, 2)
      .map(photo => ({
        product_id: product.id,
        product_name: product.name,
        src: photo.src,
        alt: photo.alt || product.name
      }))
  );
}

function setFacebookStatus(message, tone = "") {
  if (!facebookStatusLine) return;
  facebookStatusLine.textContent = message;
  facebookStatusLine.className = `form-status${tone ? ` ${tone}` : ""}`;
}

function updateFacebookActions() {
  const selectionCount = selectedFacebookProductIds.size;
  if (facebookSelectionCount) facebookSelectionCount.textContent = `${selectionCount} / ${FACEBOOK_MAX_PRODUCTS}`;
  if (generateFacebookPostButton) {
    generateFacebookPostButton.disabled = selectionCount < 1 || selectionCount > FACEBOOK_MAX_PRODUCTS;
  }
  const hasCaption = Boolean(facebookCaption?.value.trim());
  if (saveFacebookDraftButton) {
    saveFacebookDraftButton.disabled = facebookSaving
      || selectionCount < 1
      || !facebookCaptionGenerated
      || !hasCaption
      || Boolean(currentFacebookPost);
  }
  if (copyFacebookPostButton) copyFacebookPostButton.disabled = !hasCaption;
  if (publishFacebookPostButton) {
    publishFacebookPostButton.disabled = facebookSaving
      || !facebookConnection?.connected
      || selectionCount < 1
      || !facebookCaptionGenerated
      || !hasCaption
      || currentFacebookPost?.status === "posted";
  }
  if (markFacebookPostedButton) {
    markFacebookPostedButton.disabled = facebookSaving
      || !currentFacebookPost
      || currentFacebookPost.status === "posted";
  }
  if (facebookCaptionCount) facebookCaptionCount.textContent = String(facebookCaption?.value.length || 0);
}

function renderFacebookProducts() {
  if (!facebookProducts) return;
  const availableIds = new Set(facebookAvailableProducts().map(item => String(item.id)));
  selectedFacebookProductIds = new Set(
    [...selectedFacebookProductIds].filter(id => availableIds.has(String(id)))
  );
  const query = String(facebookProductSearch?.value || "").trim().toLowerCase();
  const products = facebookAvailableProducts().filter(product => !query || itemSearchText(product).includes(query));

  facebookProducts.innerHTML = products.length ? products.map(product => {
    const id = String(product.id);
    const checked = selectedFacebookProductIds.has(id);
    const disabled = !checked && selectedFacebookProductIds.size >= FACEBOOK_MAX_PRODUCTS;
    const links = itemLinks(product);
    const sizes = facebookAvailableSizes(product);
    return `
      <label class="facebook-product-option${checked ? " selected" : ""}">
        <input type="checkbox" value="${escapeHtml(id)}" data-facebook-product ${checked ? "checked" : ""} ${disabled ? "disabled" : ""}>
        <img src="${escapeHtml(product.photos?.[0]?.src || "assets/jerseysfrmjb-logo.jpg")}" alt="${escapeHtml(product.photos?.[0]?.alt || product.name)}">
        <span class="facebook-product-copy">
          <b>${escapeHtml(product.name)}</b>
          <small>${escapeHtml(sizes.join(", "))}</small>
          <i>${product.new_arrival ? "New arrival" : escapeHtml(categoryLabel(product.category))}${links.ebay ? " \u00b7 eBay" : ""}${links.depop ? " \u00b7 Depop" : ""}</i>
        </span>
      </label>`;
  }).join("") : '<p class="empty-featured">No matching in-stock jerseys with product photos.</p>';
  updateFacebookActions();
}

function renderFacebookPhotos(photos = facebookSelectedPhotos()) {
  if (!facebookPhotos) return;
  facebookPhotos.innerHTML = photos.length ? photos.map((photo, index) => {
    const src = typeof photo === "string" ? photo : photo.src;
    const alt = typeof photo === "string" ? `Facebook product photo ${index + 1}` : photo.alt;
    const productName = typeof photo === "string" ? "Product photo" : photo.product_name;
    return `
      <article>
        <img src="${escapeHtml(src)}" alt="${escapeHtml(alt || productName)}">
        <div>
          <span>${escapeHtml(productName || "Product photo")}</span>
          <a href="${escapeHtml(src)}" download>Download Photo</a>
        </div>
      </article>`;
  }).join("") : "<p>Selected product photos will appear here.</p>";
}

function generateFacebookPost() {
  const products = selectedFacebookProducts();
  if (!products.length) {
    setFacebookStatus("Choose at least one jersey.", "error");
    return;
  }
  currentFacebookPost = null;
  facebookCaptionGenerated = true;
  if (facebookCaption) {
    facebookCaption.value = facebookDefaultCaption(
      products,
      facebookCampaign?.value || "new_arrivals",
      facebookCaptionVariation
    );
  }
  facebookCaptionVariation += 1;
  renderFacebookPhotos();
  updateFacebookActions();
  setFacebookStatus("Post generated. Review the caption and photos, then save the draft.", "success");
}

function facebookHistoryDate(value = "") {
  return value ? formatMessageDate(value) : "";
}

function renderFacebookHistory() {
  if (!facebookHistoryList) return;
  facebookHistoryList.innerHTML = facebookPosts.length ? facebookPosts.map(post => {
    const posted = post.status === "posted";
    const productNames = Array.isArray(post.product_names) ? post.product_names : [];
    return `
      <article class="facebook-history-card ${posted ? "posted" : "draft"}" data-facebook-post-id="${escapeHtml(post.id)}">
        <div class="facebook-history-main">
          <div class="facebook-history-meta">
            <span>${posted ? "Posted" : "Draft"}</span>
            <time>${escapeHtml(facebookHistoryDate(post.posted_at || post.created_at))}</time>
          </div>
          <h4>${escapeHtml(productNames.join(" + ") || "Facebook inventory post")}</h4>
          <p>${escapeHtml(post.caption).replace(/\n/g, "<br>")}</p>
        </div>
        <div class="facebook-history-actions">
          <button type="button" data-facebook-history-load="${escapeHtml(post.id)}">${posted ? "View Post" : "Open Draft"}</button>
          <button type="button" data-facebook-history-copy="${escapeHtml(post.id)}">Copy Text</button>
          ${post.facebook_post_url
            ? `<a href="${escapeHtml(post.facebook_post_url)}" target="_blank" rel="noopener">View on Facebook</a>`
            : ""}
          ${posted
            ? ""
            : `<button type="button" data-facebook-history-posted="${escapeHtml(post.id)}">Mark Posted</button>
               <button type="button" class="danger" data-facebook-history-delete="${escapeHtml(post.id)}">Delete Draft</button>`}
        </div>
      </article>`;
  }).join("") : '<p class="empty-featured">No Facebook posts have been saved yet.</p>';
}

function updateFacebookPostInHistory(post) {
  const index = facebookPosts.findIndex(item => Number(item.id) === Number(post.id));
  if (index >= 0) facebookPosts[index] = post;
  else facebookPosts.unshift(post);
  renderFacebookHistory();
}

function openFacebookHistoryPost(post) {
  if (!post) return;
  selectedFacebookProductIds = new Set((post.product_ids || []).map(String));
  currentFacebookPost = post;
  facebookCaptionGenerated = true;
  if (facebookCampaign) facebookCampaign.value = post.campaign || "new_arrivals";
  if (facebookCaption) facebookCaption.value = post.caption || "";
  renderFacebookProducts();
  renderFacebookPhotos(post.photo_urls || []);
  updateFacebookActions();
  setFacebookStatus(
    post.status === "posted"
      ? post.facebook_post_url
        ? "Published Facebook post opened. Use View on Facebook to see the live Page post."
        : "Manually posted history opened. You can copy its text, but it cannot be marked twice."
      : post.publish_error
        ? `Draft opened. Last publishing attempt: ${post.publish_error}`
        : "Saved draft opened. Publish it directly or use the manual fallback.",
    "success"
  );
  facebookEditor?.scrollIntoView({ behavior: "smooth", block: "start" });
  facebookEditor?.classList.add("facebook-editor-highlight");
  window.setTimeout(() => facebookEditor?.classList.remove("facebook-editor-highlight"), 1600);
}

async function loadFacebookHistory() {
  if (!facebookHistoryList || facebookLoading) return;
  facebookLoading = true;
  if (refreshFacebookHistoryButton) refreshFacebookHistoryButton.disabled = true;
  setFacebookStatus("Loading Facebook post history...");
  renderFacebookProducts();
  try {
    const data = await api("/api/admin/facebook-posts");
    facebookPosts = Array.isArray(data.posts) ? data.posts : [];
    facebookLoaded = true;
    renderFacebookHistory();
    if (!facebookCallback) {
      setFacebookStatus(
        facebookPosts.length
          ? `${facebookPosts.length} saved Facebook post${facebookPosts.length === 1 ? "" : "s"} loaded.`
          : "Choose up to five jerseys to prepare a Facebook post.",
        "success"
      );
    }
  } catch (error) {
    facebookLoaded = false;
    setFacebookStatus(error.message, "error");
    if (facebookHistoryList) facebookHistoryList.innerHTML = '<p class="empty-featured">Facebook history could not be loaded.</p>';
  } finally {
    facebookLoading = false;
    if (refreshFacebookHistoryButton) refreshFacebookHistoryButton.disabled = false;
  }
}

async function persistFacebookDraft() {
  try {
    const data = await api("/api/admin/facebook-posts", {
      method: "POST",
      body: JSON.stringify({
        product_ids: [...selectedFacebookProductIds],
        caption: facebookCaption.value.trim(),
        campaign: facebookCampaign?.value || "new_arrivals"
      })
    });
    currentFacebookPost = data.post;
    updateFacebookPostInHistory(data.post);
    renderFacebookPhotos(data.post.photo_urls || []);
    return data.post;
  } catch (error) {
    if (!error.duplicate) throw error;
    currentFacebookPost = error.duplicate;
    updateFacebookPostInHistory(error.duplicate);
    renderFacebookPhotos(error.duplicate.photo_urls || []);
    return error.duplicate;
  }
}

async function saveFacebookDraft() {
  if (facebookSaving || !facebookCaption?.value.trim()) return null;
  facebookSaving = true;
  updateFacebookActions();
  if (saveFacebookDraftButton) saveFacebookDraftButton.textContent = "Saving...";
  setFacebookStatus("Saving Facebook draft...");
  try {
    const post = await persistFacebookDraft();
    setFacebookStatus("Draft saved. Publish directly or use the manual fallback.", "success");
    return post;
  } catch (error) {
    if (error.duplicate) {
      currentFacebookPost = error.duplicate;
      updateFacebookPostInHistory(error.duplicate);
      openFacebookHistoryPost(error.duplicate);
      return error.duplicate;
    } else {
      setFacebookStatus(error.message, "error");
    }
    return null;
  } finally {
    facebookSaving = false;
    if (saveFacebookDraftButton) saveFacebookDraftButton.textContent = "Save Draft";
    updateFacebookActions();
  }
}

async function publishFacebookPost() {
  if (facebookSaving || !facebookConnection?.connected || !facebookCaption?.value.trim()) return;
  if (!confirm(`Publish this post now to ${facebookConnection.page?.name || "the connected Facebook Page"}?`)) return;

  facebookSaving = true;
  updateFacebookActions();
  if (publishFacebookPostButton) publishFacebookPostButton.textContent = "Publishing...";
  setFacebookStatus("Preparing photos and publishing to Facebook...");
  try {
    let post = currentFacebookPost;
    if (!post) post = await persistFacebookDraft();
    if (!post || post.status === "posted") {
      if (post?.facebook_post_url) {
        setFacebookStatus("This post was already published. Open it from Post History.", "success");
      }
      return;
    }
    const data = await api("/api/admin/facebook/publish", {
      method: "POST",
      body: JSON.stringify({ post_id: post.id })
    });
    currentFacebookPost = data.post;
    updateFacebookPostInHistory(data.post);
    setFacebookStatus(
      data.warning
        ? `${data.warning} The post is live on ${facebookConnection.page?.name || "Facebook"}.`
        : `Published successfully to ${facebookConnection.page?.name || "Facebook"}.`,
      "success"
    );
  } catch (error) {
    setFacebookStatus(error.message, "error");
    if (error.reconnect_required) {
      facebookConnection = { connected: false, has_authorization: false, expired: true };
      renderFacebookConnection();
    }
    if (currentFacebookPost) {
      currentFacebookPost.publish_error = error.message;
      updateFacebookPostInHistory(currentFacebookPost);
    }
  } finally {
    facebookSaving = false;
    if (publishFacebookPostButton) publishFacebookPostButton.textContent = "Publish to Facebook";
    updateFacebookActions();
  }
}

async function copyFacebookCaption(value = facebookCaption?.value || "") {
  const text = String(value || "").trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
  }
  setFacebookStatus("Facebook post text copied.", "success");
}

async function markFacebookPostAsPosted(post = currentFacebookPost) {
  if (facebookSaving || !post || post.status === "posted") return;
  if (!confirm("Mark this Facebook Page post as posted? This keeps it in history to prevent duplicates.")) return;
  facebookSaving = true;
  updateFacebookActions();
  setFacebookStatus("Updating Facebook post history...");
  try {
    const data = await api("/api/admin/facebook-posts", {
      method: "PATCH",
      body: JSON.stringify({ id: post.id, status: "posted" })
    });
    currentFacebookPost = data.post;
    updateFacebookPostInHistory(data.post);
    setFacebookStatus("Post marked as posted. Duplicate protection is active.", "success");
  } catch (error) {
    setFacebookStatus(error.message, "error");
  } finally {
    facebookSaving = false;
    updateFacebookActions();
  }
}

async function deleteFacebookDraft(post) {
  if (!post || post.status !== "draft") return;
  if (!confirm("Delete this saved Facebook draft? This cannot be undone.")) return;
  setFacebookStatus("Deleting Facebook draft...");
  try {
    await api(`/api/admin/facebook-posts?id=${encodeURIComponent(post.id)}`, { method: "DELETE" });
    facebookPosts = facebookPosts.filter(item => Number(item.id) !== Number(post.id));
    if (Number(currentFacebookPost?.id) === Number(post.id)) {
      currentFacebookPost = null;
      facebookCaptionGenerated = Boolean(facebookCaption?.value.trim());
    }
    renderFacebookHistory();
    updateFacebookActions();
    setFacebookStatus("Draft deleted. Posted history was not affected.", "success");
  } catch (error) {
    setFacebookStatus(error.message, "error");
  }
}

function pinterestAvailableProducts() {
  return inventory
    .filter(item => Number(item.quantity || 0) > 0 && Array.isArray(item.photos) && item.photos.some(photo => photo?.src))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function pinterestProductLink(item) {
  return window.JBPinterestContent?.permanentProductUrl(item)
    || new URL(`/products/${encodeURIComponent(String(item?.id || ""))}`, "https://jerseysfrmjb.com").toString();
}

function pinterestGeneratedContent(item, variation = pinterestDescriptionVariation) {
  return window.JBPinterestContent?.generatePinContent(item, variation) || {
    title: String(item?.name || "Jersey").slice(0, 100),
    description: `${item?.name || "Jersey"} available to view through JerseysFrmJB.`.slice(0, 800),
    link: pinterestProductLink(item),
    boardSuggestions: []
  };
}

function selectedPinterestProduct() {
  return inventory.find(item => String(item.id) === String(pinterestProduct?.value || ""));
}

function selectedPinterestPhotoIndex() {
  return Math.max(0, Number(pinterestImages?.querySelector("[data-pinterest-photo]:checked")?.value || 0));
}

function selectSuggestedPinterestBoard(product, force = false) {
  if (!pinterestBoard || !product || (!force && pinterestBoard.value)) return;
  const normalize = value => String(value || "")
    .replace(/^JerseysFrmJB\s+Trial\s*-\s*/i, "")
    .replace(/\bfootball\b/gi, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
  const suggestions = pinterestGeneratedContent(product).boardSuggestions || [];
  const match = suggestions.map(normalize).reduce((found, suggestion) => found || pinterestBoards.find(board => {
    const boardName = normalize(board.name);
    return boardName === suggestion || boardName.includes(suggestion) || suggestion.includes(boardName);
  }), null);
  if (match) pinterestBoard.value = match.id;
}

function updatePinterestCounts() {
  if (pinterestTitleCount) pinterestTitleCount.textContent = String(pinterestTitle?.value.length || 0);
  if (pinterestDescriptionCount) pinterestDescriptionCount.textContent = String(pinterestDescription?.value.length || 0);
}

function renderPinterestPreview() {
  if (!pinterestPreview) return;
  const product = selectedPinterestProduct();
  const photo = product?.photos?.[selectedPinterestPhotoIndex()] || product?.photos?.[0];
  if (!product || !photo?.src) {
    pinterestPreview.innerHTML = '<div class="pinterest-preview-placeholder">Choose a product to preview the Pin.</div>';
    return;
  }
  pinterestPreview.innerHTML = `
    <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || product.name)}">
    <div>
      <span>Inventory product</span>
      <h3>${escapeHtml(pinterestTitle?.value || product.name)}</h3>
      <p>${escapeHtml(pinterestDescription?.value || pinterestGeneratedContent(product).description)}</p>
      <small>${escapeHtml(pinterestProductLink(product))}</small>
    </div>`;
}

function updatePinterestPublishState() {
  const incomplete = Boolean(
    pinterestPublishing
    || !pinterestConnection?.connected
    || !pinterestProduct?.value
    || !pinterestBoard?.value
    || !pinterestTitle?.value.trim()
    || !pinterestDescription?.value.trim()
  );
  if (pinterestQueueAdd) pinterestQueueAdd.disabled = incomplete;
  if (pinterestPublish) pinterestPublish.disabled = incomplete || !pinterestConnection?.can_publish;
}

function renderPinterestProductOptions() {
  if (!pinterestProduct) return;
  const current = pinterestProduct.value;
  const products = pinterestAvailableProducts();
  pinterestProduct.innerHTML = '<option value="">Choose an available jersey</option>' + products.map(item =>
    `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} (${escapeHtml(item.size || "size available")})</option>`
  ).join("");
  if (products.some(item => String(item.id) === current)) pinterestProduct.value = current;
  updatePinterestPublishState();
}

function renderPinterestProductEditor(resetText = false) {
  const product = selectedPinterestProduct();
  if (!product) {
    if (pinterestImages) pinterestImages.innerHTML = "<p>Choose an inventory product to see its photos.</p>";
    if (pinterestTitle) pinterestTitle.value = "";
    if (pinterestDescription) pinterestDescription.value = "";
    if (pinterestLink) pinterestLink.value = "";
    updatePinterestCounts();
    renderPinterestPreview();
    updatePinterestPublishState();
    return;
  }

  if (resetText) pinterestDescriptionVariation = 0;
  const photos = (product.photos || []).filter(photo => photo?.src);
  if (pinterestImages) {
    pinterestImages.innerHTML = photos.map((photo, index) => `
      <label class="pinterest-image-option">
        <input type="radio" name="pinterest_photo" value="${index}" data-pinterest-photo ${index === 0 ? "checked" : ""}>
        <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || `${product.name} photo ${index + 1}`)}">
        <span>${index === 0 ? "Primary photo" : `Photo ${index + 1}`}</span>
      </label>`).join("");
  }
  const generated = pinterestGeneratedContent(product);
  if (resetText || !pinterestTitle?.value) pinterestTitle.value = generated.title.slice(0, 100);
  if (resetText || !pinterestDescription?.value) pinterestDescription.value = generated.description.slice(0, 800);
  if (pinterestLink) pinterestLink.value = generated.link;
  if (pinterestVariationLabel) pinterestVariationLabel.textContent = `Variation ${pinterestDescriptionVariation + 1} of 4`;
  if (pinterestAllowDuplicate && resetText) pinterestAllowDuplicate.checked = false;
  selectSuggestedPinterestBoard(product, resetText);
  updatePinterestCounts();
  renderPinterestPreview();
  updatePinterestPublishState();
}

function renderPinterestConnection() {
  const connected = Boolean(pinterestConnection?.connected);
  const reconnectRequired = Boolean(pinterestConnection?.reconnect_required);
  const hasConnection = Boolean(pinterestConnection?.has_connection || connected);
  if (pinterestBadge) {
    pinterestBadge.textContent = connected ? "Connected" : reconnectRequired ? "Reconnect required" : "Not connected";
    pinterestBadge.className = `pinterest-connection-badge ${connected ? "connected" : "disconnected"}`;
  }
  if (pinterestConnect) pinterestConnect.hidden = connected;
  if (pinterestConnect) pinterestConnect.textContent = reconnectRequired ? "Reconnect Pinterest" : "Connect Pinterest";
  if (disconnectPinterestButton) disconnectPinterestButton.hidden = !hasConnection;
  if (pinterestPublisher) pinterestPublisher.hidden = !connected;
  const accessMode = pinterestConnection?.access_mode === "standard" ? "Standard" : "Trial";
  if (pinterestModeLabel) pinterestModeLabel.textContent = `${accessMode} mode`;
  if (pinterestModeCopy) pinterestModeCopy.textContent = pinterestConnection?.status_message || (
    accessMode === "Trial"
      ? "Test Pins are sent only to the Pinterest API Sandbox and remain separate from production."
      : "Standard Access approval is required before production Pins can be published."
  );
  if (pinterestPublish) {
    pinterestPublish.textContent = pinterestConnection?.can_publish
      ? accessMode === "Trial" ? "Publish Test Pin" : "Publish Pin"
      : "Standard Approval Pending";
  }
  if (!connected && pinterestBoard) {
    pinterestBoard.innerHTML = '<option value="">Connect Pinterest to load boards</option>';
  }
  renderPinterestProductOptions();
  updatePinterestPublishState();
}

async function loadPinterestBoards() {
  if (!pinterestBoard || !pinterestConnection?.connected) return;
  pinterestBoard.disabled = true;
  pinterestBoard.innerHTML = '<option value="">Loading boards...</option>';
  try {
    const data = await api("/api/admin/pinterest/boards");
    pinterestBoards = (Array.isArray(data.boards) ? data.boards : [])
      .filter(board => !/\bcustomer\b.*\bphoto|\bphoto\b.*\bcustomer\b/i.test(board.name));
    pinterestBoard.innerHTML = '<option value="">Choose a board</option>' + pinterestBoards.map(board =>
      `<option value="${escapeHtml(board.id)}">${escapeHtml(board.name)}${board.privacy && board.privacy !== "PUBLIC" ? ` (${escapeHtml(board.privacy.toLowerCase())})` : ""}</option>`
    ).join("");
    if (!pinterestBoards.length) {
      pinterestBoard.innerHTML = '<option value="">No Pinterest boards found</option>';
      if (createPinterestBoardsButton) createPinterestBoardsButton.hidden = pinterestConnection?.environment !== "sandbox";
      if (pinterestStatusLine) {
        pinterestStatusLine.textContent = "The API Sandbox has separate boards. Create the suggested Trial boards to publish test Pins.";
        pinterestStatusLine.className = "form-status";
      }
    } else if (createPinterestBoardsButton) {
      createPinterestBoardsButton.hidden = pinterestConnection?.environment !== "sandbox";
      createPinterestBoardsButton.textContent = "Sync Trial Boards";
    }
    selectSuggestedPinterestBoard(selectedPinterestProduct());
  } catch (error) {
    pinterestBoard.innerHTML = '<option value="">Boards could not be loaded</option>';
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  } finally {
    pinterestBoard.disabled = false;
    updatePinterestPublishState();
  }
}

async function createPinterestTrialBoards() {
  if (!pinterestConnection?.connected || createPinterestBoardsButton?.disabled) return;
  if (createPinterestBoardsButton) {
    createPinterestBoardsButton.disabled = true;
    createPinterestBoardsButton.textContent = "Creating...";
  }
  if (pinterestStatusLine) {
    pinterestStatusLine.textContent = "Creating any missing suggested Trial boards...";
    pinterestStatusLine.className = "form-status";
  }
  try {
    const data = await api("/api/admin/pinterest/boards", { method: "POST", body: "{}" });
    pinterestBoards = (Array.isArray(data.boards) ? data.boards : [])
      .filter(board => !/\bcustomer\b.*\bphoto|\bphoto\b.*\bcustomer\b/i.test(board.name));
    pinterestBoard.innerHTML = '<option value="">Choose a board</option>' + pinterestBoards.map(board =>
      `<option value="${escapeHtml(board.id)}">${escapeHtml(board.name)}${board.privacy && board.privacy !== "PUBLIC" ? ` (${escapeHtml(board.privacy.toLowerCase())})` : ""}</option>`
    ).join("");
    selectSuggestedPinterestBoard(selectedPinterestProduct());
    if (createPinterestBoardsButton) createPinterestBoardsButton.hidden = pinterestConnection?.environment !== "sandbox";
    updatePinterestPublishState();
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = data.created
        ? `${data.created} missing Trial boards created. Choose a product to continue.`
        : "All suggested Trial boards already exist.";
      pinterestStatusLine.className = "form-status success";
    }
  } catch (error) {
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  } finally {
    if (createPinterestBoardsButton) {
      createPinterestBoardsButton.disabled = false;
      createPinterestBoardsButton.textContent = "Sync Trial Boards";
    }
  }
}

function pinterestQueuePayload() {
  const product = selectedPinterestProduct();
  const board = pinterestBoards.find(item => String(item.id) === String(pinterestBoard?.value || ""));
  if (!product || !board) return null;
  return {
    product_id: product.id,
    board_id: board.id,
    board_name: board.name,
    photo_index: selectedPinterestPhotoIndex(),
    title: pinterestTitle?.value.trim() || "",
    description: pinterestDescription?.value.trim() || "",
    allow_duplicate: Boolean(pinterestAllowDuplicate?.checked)
  };
}

function renderPinterestQueue() {
  if (pinterestQueueCount) pinterestQueueCount.textContent = String(pinterestQueue.length);
  if (!pinterestQueueList) return;
  if (!pinterestQueue.length) {
    pinterestQueueList.innerHTML = '<p class="empty-featured">No Pins are queued yet.</p>';
    return;
  }
  pinterestQueueList.innerHTML = pinterestQueue.map(pin => {
    const actionLabel = pin.status === "failed" ? "Retry" : "Publish";
    const publishAction = pin.status !== "published"
      ? `<button class="shop-button secondary-admin" type="button" data-pinterest-queue-publish="${pin.id}" ${pinterestConnection?.can_publish ? "" : "disabled"}>${actionLabel}</button>`
      : "";
    const openAction = pin.pinterest_url
      ? `<a class="shop-button secondary-admin" href="${escapeHtml(pin.pinterest_url)}" target="_blank" rel="noopener">Open Pin</a>`
      : "";
    const deleteAction = pin.status !== "published"
      ? `<button class="shop-button secondary-admin danger-admin" type="button" data-pinterest-queue-delete="${pin.id}">Remove</button>`
      : "";
    return `<article class="pinterest-queue-card">
      <img src="${escapeHtml(pin.image_url)}" alt="${escapeHtml(pin.product_name)} Pinterest image">
      <div>
        <div class="pinterest-queue-card-head">
          <span class="pinterest-queue-status ${escapeHtml(pin.status)}">${escapeHtml(pin.status)}</span>
          <small>${escapeHtml(pin.environment === "standard" ? "Standard" : "Trial")} · ${escapeHtml(pin.board_name)}</small>
        </div>
        <h4>${escapeHtml(pin.title)}</h4>
        <p>${escapeHtml(pin.product_name)}</p>
        <small>${pin.publish_error ? escapeHtml(pin.publish_error) : `Saved ${escapeHtml(formatMessageDate(pin.created_at))}`}</small>
      </div>
      <div class="pinterest-queue-card-actions">${publishAction}${openAction}${deleteAction}</div>
    </article>`;
  }).join("");
}

async function loadPinterestQueue() {
  if (pinterestQueueLoading) return;
  pinterestQueueLoading = true;
  if (refreshPinterestQueue) refreshPinterestQueue.disabled = true;
  try {
    const data = await api("/api/admin/pinterest/queue");
    pinterestQueue = Array.isArray(data.queue) ? data.queue : [];
    renderPinterestQueue();
  } catch (error) {
    if (pinterestQueueList) pinterestQueueList.innerHTML = `<p class="form-status error">${escapeHtml(error.message)}</p>`;
  } finally {
    pinterestQueueLoading = false;
    if (refreshPinterestQueue) refreshPinterestQueue.disabled = false;
  }
}

async function addPinterestQueueItem({ quiet = false } = {}) {
  const payload = pinterestQueuePayload();
  if (!payload) throw new Error("Choose an inventory product and Pinterest board.");
  if (pinterestQueueAdd) pinterestQueueAdd.disabled = true;
  try {
    const data = await api("/api/admin/pinterest/queue", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    pinterestQueue = [data.pin, ...pinterestQueue.filter(item => Number(item.id) !== Number(data.pin.id))];
    renderPinterestQueue();
    if (!quiet && pinterestStatusLine) {
      pinterestStatusLine.textContent = "Pin added to the publishing queue. Nothing was published yet.";
      pinterestStatusLine.className = "form-status success";
    }
    return data.pin;
  } catch (error) {
    if (error.duplicate) {
      pinterestQueue = [error.duplicate, ...pinterestQueue.filter(item => Number(item.id) !== Number(error.duplicate.id))];
      renderPinterestQueue();
      if (!quiet && pinterestStatusLine) {
        pinterestStatusLine.textContent = error.message;
        pinterestStatusLine.className = "form-status error";
      }
      return error.duplicate;
    }
    throw error;
  } finally {
    updatePinterestPublishState();
  }
}

async function publishPinterestQueueItem(id) {
  if (pinterestPublishing) return;
  if (!pinterestConnection?.can_publish) {
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = pinterestConnection?.status_message || "Standard Access approval is still pending. The Pin remains safely queued.";
      pinterestStatusLine.className = "form-status error";
    }
    return;
  }
  pinterestPublishing = true;
  updatePinterestPublishState();
  renderPinterestQueue();
  if (pinterestStatusLine) {
    pinterestStatusLine.textContent = pinterestConnection.access_mode === "trial" ? "Publishing a Sandbox test Pin..." : "Publishing the queued Pin...";
    pinterestStatusLine.className = "form-status";
  }
  try {
    const data = await api("/api/admin/pinterest/publish", {
      method: "POST",
      body: JSON.stringify({ queue_id: id })
    });
    const published = data.queue_item || data.pin;
    pinterestQueue = pinterestQueue.map(item => Number(item.id) === Number(id) ? published : item);
    renderPinterestQueue();
    const link = published?.pinterest_url || "";
    if (pinterestStatusLine) {
      pinterestStatusLine.innerHTML = link
        ? `${published.environment === "trial" ? "Test Pin" : "Pin"} published. <a href="${escapeHtml(link)}" target="_blank" rel="noopener">Open it on Pinterest</a>.`
        : "Pinterest confirmed the Pin was published.";
      pinterestStatusLine.className = "form-status success";
    }
  } catch (error) {
    await loadPinterestQueue();
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  } finally {
    pinterestPublishing = false;
    renderPinterestConnection();
    renderPinterestQueue();
    updatePinterestPublishState();
  }
}

async function removePinterestQueueItem(id) {
  if (!confirm("Remove this unpublished Pin from the queue?")) return;
  try {
    await api(`/api/admin/pinterest/queue?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    pinterestQueue = pinterestQueue.filter(item => Number(item.id) !== Number(id));
    renderPinterestQueue();
  } catch (error) {
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  }
}

async function loadPinterestStatus() {
  if (!pinterestBadge) return;
  pinterestBadge.textContent = "Checking";
  pinterestBadge.className = "pinterest-connection-badge";
  if (pinterestStatusLine) {
    pinterestStatusLine.textContent = "Checking Pinterest connection...";
    pinterestStatusLine.className = "form-status";
  }
  try {
    pinterestConnection = await api("/api/admin/pinterest/status");
    pinterestLoaded = true;
    renderPinterestConnection();
    if (pinterestConnection.connected) {
      await Promise.all([loadPinterestBoards(), loadPinterestQueue()]);
      if (pinterestStatusLine && pinterestBoards.length) {
        const callbackMessage = pinterestCallback === "connected"
          ? `Pinterest connected successfully. ${pinterestConnection.status_message}`
          : pinterestConnection.status_message || "Pinterest is connected.";
        pinterestStatusLine.textContent = callbackMessage;
        pinterestStatusLine.className = "form-status success";
      }
    } else if (pinterestStatusLine) {
      pinterestStatusLine.textContent = pinterestConnection.reconnect_required
        ? "Reconnect Pinterest once to authorize the API Sandbox required for Trial access."
        : "Connect your Pinterest business account to begin.";
      pinterestStatusLine.className = "form-status";
    }
    if (pinterestCallback === "error" && pinterestStatusLine) {
      const message = new URLSearchParams(location.search).get("message") || "Pinterest could not be connected.";
      pinterestStatusLine.textContent = message;
      pinterestStatusLine.className = "form-status error";
    }
  } catch (error) {
    pinterestLoaded = false;
    pinterestConnection = null;
    renderPinterestConnection();
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  }
}

async function disconnectPinterest() {
  if (!pinterestConnection?.connected || !confirm("Disconnect Pinterest from this admin? Existing Pins will not be deleted.")) return;
  if (disconnectPinterestButton) disconnectPinterestButton.disabled = true;
  if (pinterestStatusLine) pinterestStatusLine.textContent = "Disconnecting Pinterest...";
  try {
    await api("/api/admin/pinterest/disconnect", { method: "DELETE" });
    pinterestConnection = { connected: false };
    pinterestBoards = [];
    renderPinterestConnection();
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = "Pinterest disconnected. Existing Pins were not changed.";
      pinterestStatusLine.className = "form-status success";
    }
  } catch (error) {
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  } finally {
    if (disconnectPinterestButton) disconnectPinterestButton.disabled = false;
  }
}

async function publishPinterestPin(event) {
  event.preventDefault();
  if (pinterestPublishing) return;
  try {
    const queued = await addPinterestQueueItem({ quiet: true });
    if (queued.status === "published" && !pinterestAllowDuplicate?.checked) {
      throw new Error("That exact product image was already published to this board. Enable manual duplicates to create another Pin.");
    }
    await publishPinterestQueueItem(queued.id);
  } catch (error) {
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  }
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
  if (messageCount) messageCount.textContent = unreadMessages + " new";
  messagesList.innerHTML = messages.length ? messages.map(message => {
    const normalizedStatus = message.status === "read"
      ? "in_progress"
      : message.status === "unread"
        ? "new"
        : message.status || "new";
    const read = normalizedStatus !== "new";
    const username = String(message.instagram_username || "").replace(/^@+/, "");
    const contactLabel = message.contact_preference === "email" ? message.email : `@${username}`;
    const replyUrl = message.contact_preference === "email"
      ? `mailto:${encodeURIComponent(message.email || "")}`
      : instagramProfile(username);
    const requestLabel = String(message.request_type || "jersey_request").replace(/_/g, " ");
    const requestedProducts = Array.isArray(message.requested_products) ? message.requested_products : [];
    return `
      <article class="admin-message-card ${read ? "read" : "unread"}" data-id="${escapeHtml(message.id)}" data-status="${escapeHtml(normalizedStatus)}">
        <div class="admin-message-main">
          <div class="admin-message-title">
            <span>${escapeHtml(requestLabel)}</span>
            <h3>${escapeHtml(contactLabel)}</h3>
          </div>
          <p><b>Jersey/request:</b> ${escapeHtml(message.jersey_request)}</p>
          ${requestedProducts.length ? `<div class="message-requested-products"><b>Requested jerseys</b>${requestedProducts.map(product => `<span>${escapeHtml(product.product_name || product.product_id)} <small>${escapeHtml(product.requested_size || message.size || "Any size")}</small></span>`).join("")}</div>` : (message.product_name ? `<p><b>Product:</b> ${escapeHtml(message.product_name)}</p>` : "")}
          <p><b>Size:</b> ${escapeHtml(message.size || "Not specified")}</p>
          <p><b>Marketplace:</b> ${escapeHtml(message.marketplace_preference || "No preference")}</p>
          <p class="admin-message-body">${escapeHtml(message.message)}</p>
          <small>${escapeHtml(formatMessageDate(message.created_at))}</small>
        </div>
        <label class="message-status-control">Status
          <select data-message-status>
            ${[
              ["new", "New"],
              ["in_progress", "In progress"],
              ["waiting", "Waiting for customer"],
              ["resolved", "Resolved"]
            ].map(([value, label]) => `<option value="${value}" ${normalizedStatus === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        <label class="message-notes-control">Private admin notes
          <textarea rows="2" maxlength="1000" data-message-notes placeholder="Add follow-up notes...">${escapeHtml(message.admin_notes || "")}</textarea>
        </label>
        <label class="message-contact-control"><input type="checkbox" data-message-contacted ${message.contacted_at ? "checked" : ""}> Contacted on Instagram${message.contacted_at ? `<small>${escapeHtml(formatMessageDate(message.contacted_at))}</small>` : ""}</label>
        <div class="admin-message-actions">
          <button type="button" data-copy-contact="${escapeHtml(contactLabel)}">Copy Contact</button>
          <a href="${escapeHtml(replyUrl)}" ${message.contact_preference === "email" ? "" : 'target="_blank" rel="noopener"'}>${message.contact_preference === "email" ? "Reply to legacy email" : "Open Instagram"}</a>
          <button type="button" data-save-message>Save Request</button>
          <button type="button" data-delete-message>Delete</button>
        </div>
      </article>`;
  }).join("") : '<p class="empty-featured">No messages yet.</p>';
}

function renderRequestSummary() {
  if (!requestSummary) return;
  requestSummary.innerHTML = requestSummaryRows.length ? `
    <div class="request-summary-head"><div><span class="section-kicker">Restock intelligence</span><h3>Requests by Jersey</h3></div><strong>${requestSummaryRows.reduce((total, row) => total + Number(row.request_count || 0), 0)} total</strong></div>
    <div class="request-summary-grid">${requestSummaryRows.map(row => `
      <article>
        <div><h4>${escapeHtml(row.product_name || row.product_id || "Custom request")}</h4><strong>${Number(row.request_count || 0)} request${Number(row.request_count || 0) === 1 ? "" : "s"}</strong></div>
        <p><b>Sizes:</b> ${Object.entries(row.sizes || {}).map(([size, count]) => `${escapeHtml(size)} (${count})`).join(", ") || "Any size"}</p>
        <p><b>Instagram:</b> ${(row.usernames || []).map(username => `<a href="${escapeHtml(instagramProfile(username))}" target="_blank" rel="noopener">@${escapeHtml(username)}</a>`).join(", ") || "Not provided"}</p>
        <footer><span>${Number(row.contacted || 0)} contacted</span><span class="${Number(row.pending || 0) ? "needs-contact" : ""}">${Number(row.pending || 0)} to contact</span></footer>
      </article>`).join("")}</div>
  ` : '<p class="empty-featured">No jersey or restock requests yet.</p>';
}

function applyMessageData(data) {
  if (Array.isArray(data.messages)) messages = data.messages;
  if (Array.isArray(data.request_summary)) requestSummaryRows = data.request_summary;
  unreadMessages = Number(data.unread || 0);
  renderMessages();
  renderRequestSummary();
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

async function updateMessage(id, status, adminNotes = "", contacted = false) {
  statusLine.textContent = "Updating message...";
  applyMessageData(await api("/api/admin/messages", {
    method: "PATCH",
    body: JSON.stringify({ id, status, admin_notes: adminNotes, contacted })
  }));
  statusLine.textContent = "Message updated.";
}

async function deleteMessage(id) {
  statusLine.textContent = "Deleting message...";
  applyMessageData(await api("/api/admin/messages?id=" + encodeURIComponent(id), { method: "DELETE" }));
  statusLine.textContent = "Message deleted.";
}

function formatFeedbackDate(value = "") {
  if (!value) return "Date unavailable";
  const date = new Date(String(value).endsWith("Z") ? value : value + "Z");
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function renderEbayFeedbackAdmin() {
  if (!feedbackList) return;
  const pending = ebayFeedback.filter(item => item.moderation_status === "pending").length;
  if (feedbackCount) feedbackCount.textContent = `${pending} pending`;
  const selectedFilter = feedbackFilter?.value || "pending";
  const visibleFeedback = ebayFeedback.filter(item => {
    const moderation = item.moderation_status || "pending";
    const visibility = item.visibility_status || "active";
    if (selectedFilter === "all") return true;
    if (selectedFilter === "hidden") return visibility === "hidden";
    return visibility !== "hidden" && moderation === selectedFilter;
  });

  feedbackList.innerHTML = visibleFeedback.length ? visibleFeedback.map(item => {
    const feedbackId = String(item.feedback_id || "");
    const marketplace = String(item.marketplace || "ebay").toLowerCase();
    const moderation = item.moderation_status || "pending";
    const visibility = item.visibility_status || "active";
    const saving = savingFeedbackIds.has(feedbackId);
    return `
      <article class="admin-feedback-card" data-feedback-id="${escapeHtml(feedbackId)}">
        <div class="admin-feedback-card-head">
          <div>
            <div class="admin-feedback-badges">
              <span class="feedback-marketplace ${escapeHtml(marketplace)}">${escapeHtml(marketplace)}</span>
              <span class="feedback-rating ${escapeHtml(String(item.rating_type || "").toLowerCase())}">${escapeHtml(item.rating_type || "UNKNOWN")}</span>
              <span class="feedback-moderation ${escapeHtml(moderation)}">${escapeHtml(moderation)}</span>
              <span class="feedback-visibility ${escapeHtml(visibility)}">${escapeHtml(visibility)}</span>
            </div>
            <h3>${escapeHtml(item.listing_title || "eBay purchase")}</h3>
            <small>${marketplace === "depop" ? `${escapeHtml(item.star_rating || 5)} stars &middot; ` : ""}${escapeHtml(formatFeedbackDate(item.feedback_date))}${marketplace === "ebay" && item.item_id ? ` &middot; Item ${escapeHtml(item.item_id)}` : ""}</small>
          </div>
        </div>
        <blockquote>${escapeHtml(item.comment || "")}</blockquote>
        <div class="admin-feedback-actions">
          <button type="button" data-feedback-moderation="approved" ${saving || moderation === "approved" ? "disabled" : ""}>Approve</button>
          <button type="button" data-feedback-moderation="rejected" ${saving || moderation === "rejected" ? "disabled" : ""}>Reject</button>
          <button type="button" data-feedback-visibility="${visibility === "hidden" ? "active" : "hidden"}" ${saving ? "disabled" : ""}>${visibility === "hidden" ? "Unhide" : "Hide"}</button>
        </div>
      </article>`;
  }).join("") : `<p class="empty-featured">No ${escapeHtml(selectedFilter === "all" ? "" : selectedFilter + " ")}feedback records.</p>`;
}

function applyFeedbackData(data) {
  if (Array.isArray(data.feedback)) ebayFeedback = data.feedback;
  feedbackLoaded = true;
  renderEbayFeedbackAdmin();
}

async function loadEbayFeedbackAdmin() {
  if (!feedbackList) return;
  feedbackList.innerHTML = '<p class="empty-featured">Loading eBay feedback...</p>';
  if (feedbackStatus) feedbackStatus.textContent = "";
  try {
    applyFeedbackData(await api("/api/admin/ebay-feedback"));
  } catch (error) {
    feedbackLoaded = false;
    feedbackList.innerHTML = `<p class="form-status error">${escapeHtml(error.message)}</p>`;
  }
}

async function updateEbayFeedback(feedbackId, update) {
  if (!feedbackId || savingFeedbackIds.has(feedbackId)) return;
  savingFeedbackIds.add(feedbackId);
  renderEbayFeedbackAdmin();
  if (feedbackStatus) feedbackStatus.textContent = "Saving feedback update...";
  try {
    applyFeedbackData(await api("/api/admin/ebay-feedback", {
      method: "PATCH",
      body: JSON.stringify({ feedback_id: feedbackId, ...update })
    }));
    if (feedbackStatus) feedbackStatus.textContent = "Feedback updated.";
  } catch (error) {
    if (feedbackStatus) feedbackStatus.textContent = error.message;
  } finally {
    savingFeedbackIds.delete(feedbackId);
    renderEbayFeedbackAdmin();
  }
}

function cleanEbayPasteLine(value = "") {
  return String(value)
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseEbayFeedbackPaste(value = "") {
  const lines = String(value)
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const records = [];

  lines.forEach((listingLine, index) => {
    const itemMatch = listingLine.match(/#(?:\[)?(\d{9,})/);
    if (!itemMatch || index === 0) return;

    const partyIndex = lines.findIndex((line, candidateIndex) => (
      candidateIndex > index
      && candidateIndex <= index + 4
      && /^(Buyer|Seller):/i.test(cleanEbayPasteLine(line))
    ));
    if (partyIndex < 0) return;

    const partyLine = cleanEbayPasteLine(lines[partyIndex]);
    if (/^Seller:/i.test(partyLine)) return;

    const verifiedIndex = lines.findIndex((line, candidateIndex) => (
      candidateIndex > partyIndex
      && candidateIndex <= partyIndex + 5
      && /^Verified purchase$/i.test(cleanEbayPasteLine(line))
    ));
    if (verifiedIndex < 0) return;

    const dateLine = cleanEbayPasteLine(lines[verifiedIndex + 1] || "");
    const comment = cleanEbayPasteLine(lines[index - 1]);
    const listingTitle = cleanEbayPasteLine(listingLine)
      .replace(/\s*\(#\d{9,}\)\s*$/, "")
      .trim();
    const sourceReference = partyLine.replace(/^Buyer:\s*/i, "").split(/\s|\(/)[0];

    if (!comment || !listingTitle || !dateLine || /^Reply$/i.test(dateLine)) return;
    records.push({
      marketplace: "ebay",
      comment,
      rating_type: "POSITIVE",
      star_rating: 5,
      listing_title: listingTitle,
      item_id: itemMatch[1],
      feedback_date: dateLine,
      source_reference: sourceReference
    });
  });

  return records;
}

function isDepopFeedbackDate(value = "") {
  return /^(?:(?:about\s+)?(?:a|an|\d+)\s+(?:minute|hour|day|week|month|year)s?\s+ago|today|yesterday)$/i.test(value);
}

function depopStarRating(value = "") {
  const filledStars = (String(value).match(/\u2605/g) || []).length;
  const numericMatch = String(value).match(/(?:^|\s)([1-5])(?:\s*\/\s*5|\s+(?:out of 5|stars?))(?:\s|$)/i);
  return Math.min(5, Math.max(1, filledStars || Number(numericMatch?.[1] || 0) || 5));
}

function isDepopStarLine(value = "") {
  return /[\u2605\u2606]/.test(value)
    || /(?:^|\s)[1-5](?:\s*\/\s*5|\s+(?:out of 5|stars?))(?:\s|$)/i.test(value);
}

function parseDepopFeedbackPaste(value = "") {
  const lines = String(value)
    .split(/\r?\n|\t+/)
    .map(cleanEbayPasteLine)
    .filter(Boolean);
  const records = [];
  const recordKeys = new Set();

  function addRecord({ username, stars, comment, date }) {
    const cleanComment = cleanEbayPasteLine(comment);
    const cleanDate = cleanEbayPasteLine(date);
    if (!username || !cleanComment || !isDepopFeedbackDate(cleanDate)) return;
    const starRating = depopStarRating(stars);
    const key = `${username.toLowerCase()}|${cleanDate.toLowerCase()}|${cleanComment.toLowerCase()}`;
    if (recordKeys.has(key)) return;
    recordKeys.add(key);
    records.push({
      marketplace: "depop",
      comment: cleanComment,
      star_rating: starRating,
      rating_type: starRating >= 4 ? "POSITIVE" : starRating === 3 ? "NEUTRAL" : "NEGATIVE",
      listing_title: "Depop purchase",
      item_id: "depop-profile",
      feedback_date: cleanDate,
      source_reference: username
    });
  }

  lines.forEach((line, index) => {
    const usernameMatch = line.match(/^@([a-z0-9._-]+)$/i);
    if (!usernameMatch) return;

    const nextUsernameIndex = lines.findIndex((candidate, candidateIndex) => (
      candidateIndex > index && /^@[a-z0-9._-]+$/i.test(candidate)
    ));
    const entryEnd = nextUsernameIndex < 0 ? lines.length : nextUsernameIndex;
    const ratingIndex = lines.findIndex((candidate, candidateIndex) => (
      candidateIndex > index
      && candidateIndex < Math.min(entryEnd, index + 4)
      && isDepopStarLine(candidate)
    ));
    const commentStart = ratingIndex < 0 ? index + 1 : ratingIndex + 1;

    const dateIndex = lines.findIndex((candidate, candidateIndex) => (
      candidateIndex >= commentStart
      && candidateIndex < entryEnd
      && isDepopFeedbackDate(candidate)
    ));
    if (dateIndex < 0) return;

    const comment = lines.slice(commentStart, dateIndex).join(" ").trim();
    if (!comment) return;
    const starLine = ratingIndex < 0 ? "5 stars" : lines[ratingIndex];
    addRecord({
      username: usernameMatch[1],
      stars: starLine,
      comment,
      date: lines[dateIndex]
    });
  });

  const compactText = cleanEbayPasteLine(value);
  const compactEntry = /@([a-z0-9._-]+)\s+(?:((?:[\u2605\u2606]\s*){1,5}|[1-5]\s*(?:\/\s*5|(?:out of 5|stars?)))\s+)?(.+?)\s+((?:about\s+)?(?:a|an|\d+)\s+(?:minute|hour|day|week|month|year)s?\s+ago|today|yesterday)(?=\s+@[a-z0-9._-]+|$)/gi;
  let compactMatch;
  while ((compactMatch = compactEntry.exec(compactText)) !== null) {
    addRecord({
      username: compactMatch[1],
      stars: compactMatch[2] || "5 stars",
      comment: compactMatch[3],
      date: compactMatch[4]
    });
  }

  return records;
}

async function importPastedEbayFeedback() {
  if (!feedbackImportText || !importFeedbackButton || importFeedbackButton.disabled) return;
  const records = parseEbayFeedbackPaste(feedbackImportText.value);
  if (!records.length) {
    if (feedbackStatus) feedbackStatus.textContent = "No complete buyer feedback entries were found in that paste.";
    feedbackImportText.focus();
    return;
  }

  importFeedbackButton.disabled = true;
  importFeedbackButton.textContent = "Importing...";
  if (feedbackStatus) feedbackStatus.textContent = `Importing ${records.length} pending feedback record${records.length === 1 ? "" : "s"}...`;

  try {
    const data = await api("/api/admin/ebay-feedback", {
      method: "POST",
      body: JSON.stringify({ records })
    });
    applyFeedbackData(data);
    feedbackImportText.value = "";
    if (feedbackStatus) {
      const duplicateText = data.duplicates ? ` ${data.duplicates} duplicate${data.duplicates === 1 ? " was" : "s were"} skipped.` : "";
      feedbackStatus.textContent = `${data.imported || 0} feedback record${data.imported === 1 ? "" : "s"} imported as Pending.${duplicateText}`;
    }
  } catch (error) {
    if (feedbackStatus) feedbackStatus.textContent = error.message;
  } finally {
    importFeedbackButton.disabled = false;
    importFeedbackButton.textContent = "Import Pending Feedback";
  }
}

async function importPastedDepopFeedback() {
  if (!depopFeedbackImportText || !importDepopFeedbackButton || importDepopFeedbackButton.disabled) return;
  const records = parseDepopFeedbackPaste(depopFeedbackImportText.value);
  if (!records.length) {
    if (feedbackStatus) feedbackStatus.textContent = "No complete Depop reviews were found. Copy the text from the Sold feedback window and try again.";
    depopFeedbackImportText.focus();
    return;
  }

  importDepopFeedbackButton.disabled = true;
  importDepopFeedbackButton.textContent = "Importing...";
  if (feedbackStatus) feedbackStatus.textContent = `Importing ${records.length} pending Depop review${records.length === 1 ? "" : "s"}...`;

  try {
    const data = await api("/api/admin/ebay-feedback", {
      method: "POST",
      body: JSON.stringify({ records })
    });
    applyFeedbackData(data);
    depopFeedbackImportText.value = "";
    if (feedbackStatus) {
      const duplicateText = data.duplicates ? ` ${data.duplicates} duplicate${data.duplicates === 1 ? " was" : "s were"} skipped.` : "";
      feedbackStatus.textContent = `${data.imported || 0} Depop review${data.imported === 1 ? "" : "s"} imported as Pending.${duplicateText}`;
    }
  } catch (error) {
    if (feedbackStatus) feedbackStatus.textContent = error.message;
  } finally {
    importDepopFeedbackButton.disabled = false;
    importDepopFeedbackButton.textContent = "Import Pending Depop Feedback";
  }
}

async function addDevelopmentSampleFeedback() {
  if (!addSampleFeedback || addSampleFeedback.disabled) return;
  addSampleFeedback.disabled = true;
  if (feedbackStatus) feedbackStatus.textContent = "Adding local sample feedback...";
  try {
    const data = await api("/api/admin/ebay-feedback", { method: "POST", body: "{}" });
    applyFeedbackData(data);
    if (feedbackStatus) {
      feedbackStatus.textContent = data.sample_created
        ? "Sample pending feedback added."
        : "The sample feedback record already exists.";
    }
  } catch (error) {
    if (feedbackStatus) feedbackStatus.textContent = error.message;
  } finally {
    addSampleFeedback.disabled = false;
  }
}

async function copyUsername(username) {
  const value = /^[^@\s]+@[^@\s]+$/.test(username)
    ? username
    : username.startsWith("@")
      ? username
      : "@" + username;
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

function platformPriceState(productId) {
  if (!platformPriceStates.has(productId)) {
    platformPriceStates.set(productId, {
      loaded: false,
      loading: false,
      loadPromise: null,
      saving: false,
      prices: Object.fromEntries(platformPriceNames.map(platform => [platform, ""])),
      message: "",
      tone: ""
    });
  }
  return platformPriceStates.get(productId);
}

async function loadPlatformPriceData(productId) {
  const state = platformPriceState(productId);
  if (state.loaded) return state.prices;
  if (state.loadPromise) return state.loadPromise;

  state.loading = true;
  state.loadPromise = (async () => {
    const data = await api("/api/admin/platform-prices?product_id=" + encodeURIComponent(productId));
    const savedPrices = Object.fromEntries(platformPriceNames.map(platform => [platform, ""]));
    (data.prices || []).forEach(entry => {
      if (platformPriceNames.includes(entry.platform) && entry.price !== null && entry.price !== undefined) {
        savedPrices[entry.platform] = String(entry.price);
      }
    });
    state.prices = savedPrices;
    state.loaded = true;
    return savedPrices;
  })();

  try {
    return await state.loadPromise;
  } finally {
    state.loading = false;
    state.loadPromise = null;
  }
}

function renderPlatformPriceContent(productId) {
  const state = platformPriceState(productId);
  if (!state.loaded) {
    return `
      <p class="platform-prices-status ${escapeHtml(state.tone)}" role="status" aria-live="polite">${escapeHtml(state.message || "Open this section to load saved prices.")}</p>
      ${state.tone === "error" && !state.loading ? '<button class="platform-prices-retry" type="button" data-retry-platform-prices>Retry</button>' : ""}`;
  }

  return `
    <div class="platform-prices-grid">
      ${platformPriceNames.map(platform => `
        <label>
          ${escapeHtml(platform)}
          <span class="platform-price-input"><span aria-hidden="true">$</span><input type="number" min="0" step="0.01" inputmode="decimal" value="${escapeHtml(state.prices[platform] ?? "")}" data-platform-price="${escapeHtml(platform)}" aria-label="${escapeHtml(platform)} price in dollars" ${state.saving ? "disabled" : ""}></span>
        </label>`).join("")}
    </div>
    <div class="platform-prices-actions">
      <button class="shop-button" type="button" data-save-platform-prices ${state.saving ? "disabled" : ""}>${state.saving ? "Saving..." : "Save Prices"}</button>
      <p class="platform-prices-status ${escapeHtml(state.tone)}" role="status" aria-live="polite">${escapeHtml(state.message)}</p>
    </div>`;
}

function renderPlatformPriceEditor(productId) {
  return `
    <details class="platform-prices-editor" data-platform-prices>
      <summary>Platform Prices</summary>
      <div class="platform-prices-content" data-platform-prices-content>
        ${renderPlatformPriceContent(productId)}
      </div>
    </details>`;
}

function updatePlatformPriceEditor(card) {
  const productId = card.dataset.id;
  const activeCard = list.querySelector(`[data-id="${CSS.escape(productId)}"]`) || card;
  const content = activeCard.querySelector("[data-platform-prices-content]");
  if (content) content.innerHTML = renderPlatformPriceContent(productId);
}

async function loadPlatformPrices(card) {
  const productId = card.dataset.id;
  const state = platformPriceState(productId);
  if (state.loaded) return;

  state.message = "Loading prices...";
  state.tone = "";
  updatePlatformPriceEditor(card);

  try {
    await loadPlatformPriceData(productId);
    state.message = "";
  } catch (error) {
    state.message = error.message;
    state.tone = "error";
  } finally {
    updatePlatformPriceEditor(card);
  }
}

async function savePlatformPrices(card) {
  const productId = card.dataset.id;
  const state = platformPriceState(productId);
  if (!state.loaded || state.saving) return;

  const draftPrices = { ...state.prices };
  let invalidPlatform = "";
  let validationMessage = "";

  card.querySelectorAll("[data-platform-price]").forEach(input => {
    const platform = input.dataset.platformPrice;
    const value = input.value.trim();
    draftPrices[platform] = value;
    if (invalidPlatform || !value) return;
    if (value.startsWith("-")) {
      invalidPlatform = platform;
      validationMessage = `${platform} price cannot be negative.`;
    } else if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
      invalidPlatform = platform;
      validationMessage = `${platform} price must be a dollar amount with no more than two decimal places.`;
    }
  });

  state.prices = draftPrices;
  if (invalidPlatform) {
    state.message = validationMessage;
    state.tone = "error";
    updatePlatformPriceEditor(card);
    card.querySelector(`[data-platform-price="${invalidPlatform}"]`)?.focus();
    return;
  }

  state.saving = true;
  state.message = "Saving prices...";
  state.tone = "";
  updatePlatformPriceEditor(card);

  try {
    await api("/api/admin/platform-prices", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        prices: platformPriceNames.map(platform => ({
          platform,
          price: draftPrices[platform] === "" ? null : draftPrices[platform]
        }))
      })
    });
    state.message = "Platform prices saved.";
    state.tone = "success";
  } catch (error) {
    state.message = error.message;
    state.tone = "error";
  } finally {
    state.saving = false;
    updatePlatformPriceEditor(card);
  }
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
          ${renderPlatformPriceEditor(item.id)}
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
  renderFacebookProducts();
  renderPinterestProductOptions();
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
  if (!original) throw new Error("Inventory item not found.");
  const saveButton = card.querySelector("[data-save]");
  if (saveButton?.disabled) return;

  const links = { ...(original.links || {}) };
  links.depop = card.querySelector('[data-field="depop"]').value.trim();
  links.ebay = card.querySelector('[data-field="ebay"]').value.trim();

  const featured = card.querySelector('[data-field="featured"]').checked;
  const featuredOrder = Number(card.querySelector('[data-field="featured_order"]').value);
  const sizes = readSizeControls(card);
  const quantity = Object.values(sizes).reduce((sum, qty) => sum + Number(qty), 0);
  const decreases = sizeQuantityDecreases(original, sizes);
  let saleDetails = null;

  if (decreases.length && window.confirm("Record this as a sale?")) {
    saleDetails = await showInventorySaleForm(original, decreases);
    if (!saleDetails) {
      statusLine.textContent = "Save canceled.";
      return;
    }
  }

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

  try {
    if (saveButton) {
      saveButton.disabled = true;
      saveButton.textContent = "Saving...";
    }
    statusLine.textContent = "Saving...";
    const data = await api("/api/admin/inventory", { method: "PATCH", body: JSON.stringify(payload) });
    applyAdminData(data);
    render();
    if (saleDetails) await recordInventoryDecreaseSales(original, decreases, saleDetails);
    statusLine.textContent = saleDetails ? "Saved and sale recorded." : "Saved.";
    if (saleDetails) await loadSales();
  } finally {
    if (saveButton) {
      saveButton.disabled = false;
      saveButton.textContent = "Save Changes";
    }
  }
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
refreshOperations?.addEventListener("click", () => {
  operationsLoaded = false;
  loadOperations();
});
runCatalogHealthButton?.addEventListener("click", runCatalogHealth);
refreshFeedback?.addEventListener("click", loadEbayFeedbackAdmin);
feedbackFilter?.addEventListener("change", renderEbayFeedbackAdmin);
refreshFacebookHistoryButton?.addEventListener("click", loadFacebookHistory);
refreshFacebookConnectionButton?.addEventListener("click", loadFacebookConnection);
disconnectFacebookButton?.addEventListener("click", disconnectFacebook);
selectFacebookPageButton?.addEventListener("click", chooseFacebookPage);
facebookProductSearch?.addEventListener("input", renderFacebookProducts);
facebookProducts?.addEventListener("change", event => {
  const checkbox = event.target.closest("[data-facebook-product]");
  if (!checkbox) return;
  const id = String(checkbox.value);
  if (checkbox.checked) {
    if (selectedFacebookProductIds.size >= FACEBOOK_MAX_PRODUCTS) {
      checkbox.checked = false;
      setFacebookStatus(`Choose no more than ${FACEBOOK_MAX_PRODUCTS} jerseys.`, "error");
      return;
    }
    selectedFacebookProductIds.add(id);
  } else {
    selectedFacebookProductIds.delete(id);
  }
  currentFacebookPost = null;
  facebookCaptionGenerated = false;
  renderFacebookProducts();
  renderFacebookPhotos();
  updateFacebookActions();
  setFacebookStatus("Selection changed. Generate the Facebook post when ready.");
});
generateFacebookPostButton?.addEventListener("click", generateFacebookPost);
facebookCampaign?.addEventListener("change", () => {
  currentFacebookPost = null;
  if (facebookCaptionGenerated && selectedFacebookProductIds.size) {
    facebookCaption.value = facebookDefaultCaption(selectedFacebookProducts());
    setFacebookStatus("Campaign changed. Tracked product links were refreshed.", "success");
  }
  updateFacebookActions();
});
facebookCaption?.addEventListener("input", () => {
  if (currentFacebookPost && facebookCaption.value.trim() !== currentFacebookPost.caption) {
    currentFacebookPost = null;
  }
  facebookCaptionGenerated = Boolean(facebookCaption.value.trim());
  updateFacebookActions();
});
saveFacebookDraftButton?.addEventListener("click", saveFacebookDraft);
publishFacebookPostButton?.addEventListener("click", publishFacebookPost);
copyFacebookPostButton?.addEventListener("click", () => copyFacebookCaption());
markFacebookPostedButton?.addEventListener("click", () => markFacebookPostAsPosted());
facebookHistoryList?.addEventListener("click", event => {
  const loadButton = event.target.closest("[data-facebook-history-load]");
  const copyButton = event.target.closest("[data-facebook-history-copy]");
  const postedButton = event.target.closest("[data-facebook-history-posted]");
  const deleteButton = event.target.closest("[data-facebook-history-delete]");
  const id = loadButton?.dataset.facebookHistoryLoad
    || copyButton?.dataset.facebookHistoryCopy
    || postedButton?.dataset.facebookHistoryPosted
    || deleteButton?.dataset.facebookHistoryDelete;
  if (!id) return;
  const post = facebookPosts.find(item => String(item.id) === String(id));
  if (!post) return;
  if (loadButton) openFacebookHistoryPost(post);
  if (copyButton) copyFacebookCaption(post.caption);
  if (postedButton) markFacebookPostAsPosted(post);
  if (deleteButton) deleteFacebookDraft(post);
});
refreshPinterest?.addEventListener("click", loadPinterestStatus);
createPinterestBoardsButton?.addEventListener("click", createPinterestTrialBoards);
disconnectPinterestButton?.addEventListener("click", disconnectPinterest);
pinterestProduct?.addEventListener("change", () => renderPinterestProductEditor(true));
pinterestBoard?.addEventListener("change", updatePinterestPublishState);
pinterestImages?.addEventListener("change", event => {
  if (event.target.matches("[data-pinterest-photo]")) renderPinterestPreview();
});
pinterestRotate?.addEventListener("click", () => {
  const product = selectedPinterestProduct();
  if (!product) return;
  pinterestDescriptionVariation = (pinterestDescriptionVariation + 1) % 4;
  const generated = pinterestGeneratedContent(product);
  if (pinterestTitle) pinterestTitle.value = generated.title.slice(0, 100);
  if (pinterestDescription) pinterestDescription.value = generated.description.slice(0, 800);
  if (pinterestVariationLabel) pinterestVariationLabel.textContent = `Variation ${pinterestDescriptionVariation + 1} of 4`;
  updatePinterestCounts();
  renderPinterestPreview();
  updatePinterestPublishState();
});
pinterestQueueAdd?.addEventListener("click", async () => {
  try {
    await addPinterestQueueItem();
  } catch (error) {
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  }
});
refreshPinterestQueue?.addEventListener("click", loadPinterestQueue);
pinterestQueueList?.addEventListener("click", event => {
  const publishButton = event.target.closest("[data-pinterest-queue-publish]");
  const deleteButton = event.target.closest("[data-pinterest-queue-delete]");
  if (publishButton) publishPinterestQueueItem(publishButton.dataset.pinterestQueuePublish);
  if (deleteButton) removePinterestQueueItem(deleteButton.dataset.pinterestQueueDelete);
});
pinterestTitle?.addEventListener("input", () => {
  updatePinterestCounts();
  renderPinterestPreview();
  updatePinterestPublishState();
});
pinterestDescription?.addEventListener("input", () => {
  updatePinterestCounts();
  renderPinterestPreview();
  updatePinterestPublishState();
});
pinterestForm?.addEventListener("submit", publishPinterestPin);
addSampleFeedback?.addEventListener("click", addDevelopmentSampleFeedback);
importFeedbackButton?.addEventListener("click", importPastedEbayFeedback);
importDepopFeedbackButton?.addEventListener("click", importPastedDepopFeedback);
if (addSampleFeedback && ["localhost", "127.0.0.1", "::1", "[::1]"].includes(location.hostname)) {
  addSampleFeedback.hidden = false;
}

function plannerMoney(value, blank = "—") {
  if (value === null || value === undefined || value === "") return blank;
  return Number(value).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function plannerPercent(value) {
  if (value === null || value === undefined) return "—";
  return `${analyticsNumber(value, 1)}%`;
}

function plannerTypeLabel(value) {
  return {
    fan: "Fan Version",
    retro_short: "Retro Short Sleeve",
    retro_long: "Retro Long Sleeve"
  }[value] || value;
}

function plannerCustomizationLabel(value) {
  return value === "nameset_patches" ? "Name + Number + Patches" : "Base";
}

function plannerRiskLabel(value) {
  return {
    sold_out: "Sold out",
    one_unit: "One unit left",
    one_size: "One size left",
    selling_quickly: "Selling quickly",
    not_selling: "Not selling"
  }[value] || value;
}

function renderPlannerSuppliers() {
  if (!plannerSuppliers || !plannerData) return;
  const rules = [
    ["fan:base", "Fan", "Base"],
    ["fan:nameset_patches", "Fan", "Nameset + patches"],
    ["retro_short:base", "Retro short", "Base"],
    ["retro_short:nameset_patches", "Retro short", "Nameset + patches"],
    ["retro_long:base", "Retro long", "Base"],
    ["retro_long:nameset_patches", "Retro long", "Nameset + patches"]
  ];
  plannerSuppliers.innerHTML = plannerData.suppliers.map((supplier, index) => `
    <article class="planner-supplier-card" data-planner-supplier="${escapeHtml(supplier.id)}">
      <div class="planner-supplier-head">
        <label>
          <span>Supplier name</span>
          <input type="text" data-supplier-name value="${escapeHtml(supplier.name)}" maxlength="80">
        </label>
        <label class="planner-enabled-toggle">
          <input type="checkbox" data-supplier-enabled ${supplier.enabled ? "checked" : ""}>
          <span>Use in comparisons</span>
        </label>
      </div>
      <div class="planner-cost-grid">
        ${rules.map(([key, type, customization]) => `
          <label>
            <span>${escapeHtml(type)} <small>${escapeHtml(customization)}</small></span>
            <span class="planner-money-input"><i>$</i><input type="number" min="0" step="0.01" data-supplier-rule="${escapeHtml(key)}" value="${supplier.costs?.[key] ?? ""}" placeholder="—"></span>
          </label>`).join("")}
      </div>
    </article>`).join("");
}

function renderPlannerSummary() {
  if (!plannerSummary || !plannerData) return;
  const summary = plannerData.summary || {};
  const cards = [
    ["Products", summary.products, "Live inventory"],
    ["Sold Out", summary.sold_out, "Restock candidates"],
    ["One Unit Left", summary.one_unit, "Low-stock risk"],
    ["Suggested Units", summary.suggested_units, "Across recommendations"],
    ["Suggested Cost", plannerMoney(summary.suggested_supplier_total), "Cheapest suppliers"],
    ["Expected Profit", plannerMoney(summary.suggested_expected_profit), "If suggestions sell"]
  ];
  plannerSummary.innerHTML = cards.map(([label, value, detail], index) => `
    <article class="${index === cards.length - 1 ? "featured" : ""}">
      <span>${escapeHtml(label)}</span>
      <strong>${typeof value === "number" ? analyticsNumber(value) : escapeHtml(value)}</strong>
      <small>${escapeHtml(detail)}</small>
    </article>`).join("");
}

function renderPlannerReorders() {
  if (!plannerReorders || !plannerData) return;
  const items = plannerData.reorder_suggestions || [];
  plannerReorders.innerHTML = items.length ? `
    <div class="planner-ranked-list">
      ${items.slice(0, 7).map(product => `
        <article>
          <span class="planner-score ${product.demand_score >= 70 ? "hot" : ""}">${analyticsNumber(product.demand_score)}</span>
          <div><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.demand_label)} demand · ${analyticsNumber(product.inventory_remaining)} in stock</small></div>
          <span><b>Order ${analyticsNumber(product.recommended_quantity)}</b><small>${plannerMoney(product.expected_profit)} profit</small></span>
        </article>`).join("")}
    </div>` : '<p class="analytics-empty">No reorder suggestions yet.</p>';
}

function renderPlannerRisks() {
  if (!plannerRisks || !plannerData) return;
  const products = (plannerData.products || [])
    .filter(product => product.risks?.length)
    .sort((a, b) => b.demand_score - a.demand_score)
    .slice(0, 8);
  plannerRisks.innerHTML = products.length ? `
    <div class="planner-risk-list">
      ${products.map(product => `
        <article>
          <div><strong>${escapeHtml(product.name)}</strong><small>${analyticsNumber(product.inventory_remaining)} units · ${escapeHtml(product.available_sizes.join(", ") || "No sizes")}</small></div>
          <div class="planner-risk-chips">${product.risks.map(risk => `<span class="${escapeHtml(risk)}">${escapeHtml(plannerRiskLabel(risk))}</span>`).join("")}</div>
        </article>`).join("")}
    </div>` : '<p class="analytics-empty">No inventory risks detected.</p>';
}

function renderPlannerProfit() {
  if (!plannerProfit || !plannerData) return;
  const analysis = plannerData.profit_analysis || {};
  const profitList = (title, items) => `
    <section>
      <h4>${escapeHtml(title)}</h4>
      ${(items || []).length ? `<div class="planner-profit-list">${items.map(product => `
        <article><span>${escapeHtml(product.name)}</span><strong>${plannerMoney(product.gross_profit)}</strong></article>`).join("")}</div>` : '<p class="analytics-empty">Add supplier costs to calculate profit.</p>'}
    </section>`;
  plannerProfit.innerHTML = `
    <div class="planner-profit-grid">
      ${profitList("Highest profit", analysis.highest)}
      ${profitList("Lowest profit", analysis.lowest)}
      <section>
        <h4>Average profit by group</h4>
        <div class="planner-profit-list">
          ${(analysis.averages || []).slice(0, 12).map(group => `
            <article><span>${escapeHtml(group.name)} <small>${analyticsNumber(group.products)} products</small></span><strong>${plannerMoney(group.average_profit)}</strong></article>`).join("")}
        </div>
      </section>
    </div>`;
}

function plannerFilteredProducts() {
  if (!plannerData) return [];
  const query = String(plannerSearch?.value || "").trim().toLowerCase();
  const risk = plannerRiskFilter?.value || "all";
  const sort = plannerSort?.value || "demand";
  const products = (plannerData.products || []).filter(product => {
    const matchesSearch = !query || `${product.name} ${product.player} ${product.team_country}`.toLowerCase().includes(query);
    const matchesRisk = risk === "all"
      || (risk === "reorder" ? product.recommended_quantity > 0 : product.risks.includes(risk));
    return matchesSearch && matchesRisk;
  });
  const sorters = {
    demand: (a, b) => b.demand_score - a.demand_score || b.total_sales - a.total_sales,
    reorder: (a, b) => b.recommended_quantity - a.recommended_quantity || b.demand_score - a.demand_score,
    profit: (a, b) => Number(b.gross_profit ?? -Infinity) - Number(a.gross_profit ?? -Infinity),
    inventory: (a, b) => a.inventory_remaining - b.inventory_remaining || b.demand_score - a.demand_score,
    name: (a, b) => a.name.localeCompare(b.name)
  };
  return products.sort(sorters[sort] || sorters.demand);
}

function plannerTimingLabel(days, neverLabel) {
  if (days === null || days === undefined) return neverLabel;
  if (Number(days) === 0) return "Today";
  return `${analyticsNumber(days)}d ago`;
}

function renderPlannerProducts() {
  if (!plannerProducts || !plannerData) return;
  const products = plannerFilteredProducts();
  plannerProducts.innerHTML = products.length ? products.map(product => {
    const purchase = plannerPurchase.get(product.id);
    const selectedSupplier = purchase?.supplier_id
      || product.preferred_supplier_id
      || product.recommended_supplier?.id
      || product.supplier_options?.[0]?.id
      || "";
    const purchaseQuantity = purchase?.quantity || Math.max(1, product.recommended_quantity || 1);
    const scoreTone = product.demand_score >= 70 ? "hot" : product.demand_score >= 40 ? "warm" : "";
    return `
      <article class="planner-product-card ${purchase ? "selected" : ""}" data-planner-product="${escapeHtml(product.id)}">
        <header class="planner-product-card-head">
          <label class="planner-product-select">
            <input type="checkbox" data-planner-select ${purchase ? "checked" : ""} ${product.supplier_options?.length ? "" : "disabled"}>
            <span>${product.supplier_options?.length ? "Add to purchase list" : "Add supplier cost first"}</span>
          </label>
          <span class="planner-demand-badge ${scoreTone}"><b>${product.demand_score >= 85 ? "🔥 " : ""}${analyticsNumber(product.demand_score)}</b><small>${escapeHtml(product.demand_label)} demand</small></span>
        </header>
        <div class="planner-product-identity">
          ${product.photo ? `<img src="${escapeHtml(product.photo)}" alt="">` : ""}
          <div>
            <span>${escapeHtml(product.category === "retro" ? "Retro" : "Fan Version")}</span>
            <h4>${escapeHtml(product.name)}</h4>
            <p>${escapeHtml([product.player, product.team_country].filter(Boolean).join(" · "))}</p>
          </div>
        </div>
        <div class="planner-price-strip">
          <article class="supplier"><span>${escapeHtml(product.recommended_supplier?.name || "No supplier")}</span><strong>${plannerMoney(product.supplier_cost)}</strong><small>Supplier cost</small></article>
          ${["Website", "eBay", "Depop", "Facebook"].map(platform => `
            <article><span>${escapeHtml(platform)}</span><strong>${plannerMoney(product.prices[platform])}</strong><small>Selling price</small></article>`).join("")}
        </div>
        <div class="planner-profit-band">
          <span><small>Gross profit</small><strong>${plannerMoney(product.gross_profit)}</strong></span>
          <span><small>Gross margin</small><strong>${plannerPercent(product.gross_profit_percent)}</strong></span>
          <span><small>Planning price</small><strong>${plannerMoney(product.planning_price)}</strong></span>
        </div>
        <div class="planner-metric-grid">
          <span><small>Inventory</small><b>${analyticsNumber(product.inventory_remaining)}</b></span>
          <span><small>Sizes</small><b>${escapeHtml(product.available_sizes.join(", ") || "Sold out")}</b></span>
          <span><small>Views</small><b>${analyticsNumber(product.total_views)}</b></span>
          <span><small>Clicks</small><b>${analyticsNumber(product.marketplace_clicks)}</b></span>
          <span><small>Sales</small><b>${analyticsNumber(product.total_sales)}</b></span>
          <span><small>Conversion</small><b>${plannerPercent(product.conversion_rate)}</b></span>
          <span><small>Last sale</small><b>${escapeHtml(plannerTimingLabel(product.days_since_last_sale, "No sales"))}</b></span>
          <span><small>Inventory age</small><b>${analyticsNumber(product.days_in_inventory)}d</b></span>
          <span><small>Searches</small><b>${analyticsNumber(product.search_frequency)}</b></span>
          <span><small>Requests</small><b>${analyticsNumber(product.request_count)}</b></span>
        </div>
        ${product.request_count ? `<div class="planner-request-intelligence">
          <div><small>Requested sizes</small><strong>${Object.entries(product.request_details?.sizes || {}).map(([size, count]) => `${escapeHtml(size)} (${count})`).join(", ") || "Any size"}</strong></div>
          <div><small>Instagram customers</small><strong>${(product.request_details?.usernames || []).map(username => `@${escapeHtml(username)}`).join(", ") || "Not provided"}</strong></div>
          <div><small>Follow-up</small><strong>${analyticsNumber(product.request_details?.contacted || 0)} contacted · ${analyticsNumber(product.request_details?.pending || 0)} pending</strong></div>
        </div>` : ""}
        ${product.risks?.length ? `<div class="planner-risk-chips">${product.risks.map(risk => `<span class="${escapeHtml(risk)}">${escapeHtml(plannerRiskLabel(risk))}</span>`).join("")}</div>` : ""}
        <div class="planner-reorder-band">
          <div><small>Recommendation</small><strong>Order ${analyticsNumber(product.recommended_quantity)}</strong><span>${plannerMoney(product.expected_profit)} expected profit</span></div>
          <label><span>Order qty</span><input type="number" min="1" max="99" step="1" data-planner-quantity value="${purchaseQuantity}"></label>
          <label><span>Supplier</span><select data-planner-purchase-supplier ${product.supplier_options?.length ? "" : "disabled"}>
            ${product.supplier_options?.length ? product.supplier_options.map(option => `<option value="${escapeHtml(option.id)}" ${option.id === selectedSupplier ? "selected" : ""}>${escapeHtml(option.name)} · ${plannerMoney(option.cost)}</option>`).join("") : '<option value="">No priced supplier</option>'}
          </select></label>
        </div>
        <details class="planner-product-settings">
          <summary>Adjust cost classification</summary>
          <div>
            <label><span>Jersey type</span><select data-planner-type>
              <option value="fan" ${product.jersey_type === "fan" ? "selected" : ""}>Fan Version</option>
              <option value="retro_short" ${product.jersey_type === "retro_short" ? "selected" : ""}>Retro Short Sleeve</option>
              <option value="retro_long" ${product.jersey_type === "retro_long" ? "selected" : ""}>Retro Long Sleeve</option>
            </select></label>
            <label><span>Customization</span><select data-planner-customization>
              <option value="base" ${product.customization === "base" ? "selected" : ""}>Base</option>
              <option value="nameset_patches" ${product.customization === "nameset_patches" ? "selected" : ""}>Name + Number + Patches</option>
            </select></label>
            <button class="shop-button secondary-admin" type="button" data-save-planner-product>Save</button>
          </div>
        </details>
      </article>`;
  }).join("") : '<p class="analytics-empty">No jerseys match these planner filters.</p>';
}

function plannerSupplierOptions(jerseyType, customization) {
  if (!plannerData) return [];
  const rule = `${jerseyType}:${customization}`;
  return plannerData.suppliers
    .filter(supplier => supplier.enabled)
    .map(supplier => ({ id: supplier.id, name: supplier.name, cost: supplier.costs?.[rule] }))
    .filter(option => option.cost !== null && option.cost !== undefined && Number.isFinite(Number(option.cost)))
    .sort((a, b) => Number(a.cost) - Number(b.cost) || a.name.localeCompare(b.name));
}

function plannerPurchaseProduct(rowId, purchase) {
  if (!plannerData) return null;
  const productId = purchase.product_id || (plannerData.products.some(product => product.id === rowId) ? rowId : "");
  return plannerData.products.find(product => product.id === productId) || null;
}

function addPlannerPurchaseRow(seed = {}) {
  if (!plannerData) return;
  const rowId = seed.row_id || `purchase-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const product = seed.product_id ? plannerData.products.find(item => item.id === seed.product_id) : null;
  const category = seed.category || product?.category || "club";
  const jerseyType = seed.jersey_type || product?.jersey_type || (category === "retro" ? "retro_short" : "fan");
  const customization = seed.customization || product?.customization || "nameset_patches";
  const options = plannerSupplierOptions(jerseyType, customization);
  plannerPurchase.set(rowId, {
    product_id: product?.id || "",
    name: seed.name || product?.name || "",
    category,
    jersey_type: jerseyType,
    customization,
    size: seed.size || "",
    supplier_id: seed.supplier_id || product?.preferred_supplier_id || options[0]?.id || "",
    quantity: Math.max(1, Number(seed.quantity || product?.recommended_quantity || 1)),
    selling_price: seed.selling_price ?? product?.planning_price ?? ""
  });
  renderPlannerPurchaseTable();
  renderPlannerPurchaseSummary();
  renderPlannerProducts();
  plannerPurchaseTable?.querySelector(`[data-purchase-row="${CSS.escape(rowId)}"] [data-purchase-name]`)?.focus();
}

function matchPlannerPurchaseProduct(rowId) {
  const purchase = plannerPurchase.get(rowId);
  if (!purchase || !plannerData) return;
  const query = String(purchase.name || "").trim().toLowerCase();
  let product = plannerData.products.find(item =>
    item.id.toLowerCase() === query || item.name.toLowerCase() === query
  );
  if (!product && query.length >= 3) {
    const partialMatches = plannerData.products.filter(item =>
      item.name.toLowerCase().includes(query)
      || `${item.player} ${item.team_country}`.toLowerCase().includes(query)
    );
    if (partialMatches.length === 1) product = partialMatches[0];
  }
  if (product) {
    const options = plannerSupplierOptions(product.jersey_type, product.customization);
    Object.assign(purchase, {
      product_id: product.id,
      name: product.name,
      category: product.category,
      jersey_type: product.jersey_type,
      customization: product.customization,
      supplier_id: product.preferred_supplier_id || options[0]?.id || "",
      selling_price: product.planning_price
    });
  } else {
    purchase.product_id = "";
    const options = plannerSupplierOptions(purchase.jersey_type, purchase.customization);
    if (!options.some(option => option.id === purchase.supplier_id)) {
      purchase.supplier_id = options[0]?.id || "";
    }
  }
  plannerPurchase.set(rowId, purchase);
  renderPlannerPurchaseTable();
  renderPlannerPurchaseSummary();
}

function renderPlannerPurchaseTable() {
  if (!plannerPurchaseTable || !plannerData) return;
  if (plannerProductOptions) {
    plannerProductOptions.innerHTML = plannerData.products.map(product =>
      `<option value="${escapeHtml(product.name)}">${escapeHtml(product.id)}</option>`
    ).join("");
  }
  if (!plannerPurchase.size) {
    plannerPurchaseTable.innerHTML = '<tr><td colspan="11" class="sales-empty">Add a jersey row or select a product below.</td></tr>';
    return;
  }
  plannerPurchaseTable.innerHTML = [...plannerPurchase.entries()].map(([rowId, purchase]) => {
    const product = plannerPurchaseProduct(rowId, purchase);
    const options = plannerSupplierOptions(purchase.jersey_type, purchase.customization);
    const supplier = options.find(option => option.id === purchase.supplier_id) || options[0] || null;
    if (supplier && supplier.id !== purchase.supplier_id) purchase.supplier_id = supplier.id;
    const quantity = Math.max(1, Number(purchase.quantity || 1));
    const unitCost = Number(supplier?.cost || 0);
    return `
      <tr data-purchase-row="${escapeHtml(rowId)}">
        <td data-label="Jersey">
          <label class="planner-order-name">
            <input type="text" list="planner-existing-products" data-purchase-name value="${escapeHtml(purchase.name || "")}" placeholder="Type or match a jersey">
            <span class="${product ? "matched" : "new"}">${product ? "Matched to inventory" : "New jersey"}</span>
          </label>
        </td>
        <td data-label="Category"><select data-purchase-category>
          <option value="club" ${purchase.category === "club" ? "selected" : ""}>Club</option>
          <option value="world" ${purchase.category === "world" ? "selected" : ""}>International</option>
          <option value="retro" ${purchase.category === "retro" ? "selected" : ""}>Retro</option>
        </select></td>
        <td data-label="Version"><select data-purchase-type>
          <option value="fan" ${purchase.jersey_type === "fan" ? "selected" : ""}>Fan</option>
          <option value="retro_short" ${purchase.jersey_type === "retro_short" ? "selected" : ""}>Retro short</option>
          <option value="retro_long" ${purchase.jersey_type === "retro_long" ? "selected" : ""}>Retro long</option>
        </select></td>
        <td data-label="Customization"><select data-purchase-customization>
          <option value="base" ${purchase.customization === "base" ? "selected" : ""}>Base</option>
          <option value="nameset_patches" ${purchase.customization === "nameset_patches" ? "selected" : ""}>Nameset + patches</option>
        </select></td>
        <td data-label="Size"><input class="planner-order-size" type="text" list="planner-size-options" data-purchase-size value="${escapeHtml(purchase.size || "")}" placeholder="M"></td>
        <td data-label="Supplier"><select data-purchase-supplier ${options.length ? "" : "disabled"}>
          ${options.length ? options.map(option => `<option value="${escapeHtml(option.id)}" ${option.id === supplier?.id ? "selected" : ""}>${escapeHtml(option.name)}</option>`).join("") : '<option value="">Add pricing</option>'}
        </select></td>
        <td data-label="Qty"><input class="planner-order-qty" type="number" min="1" max="99" step="1" data-purchase-quantity value="${quantity}"></td>
        <td data-label="Unit Cost"><strong data-purchase-unit-cost>${plannerMoney(supplier?.cost)}</strong></td>
        <td data-label="Expected Sell"><span class="planner-money-input compact"><i>$</i><input type="number" min="0" step="0.01" data-purchase-selling-price value="${purchase.selling_price ?? ""}" placeholder="0.00"></span></td>
        <td data-label="Line Total"><strong data-purchase-line-total>${plannerMoney(unitCost * quantity)}</strong></td>
        <td><button class="planner-order-remove" type="button" data-remove-purchase-row aria-label="Remove ${escapeHtml(purchase.name || "jersey")}">×</button></td>
      </tr>`;
  }).join("");
  if (plannerProductOptions) plannerProductOptions.id = "planner-existing-products";
}

function plannerSelectedRows() {
  if (!plannerData) return [];
  return [...plannerPurchase.entries()].map(([rowId, purchase]) => {
    const matchedProduct = plannerPurchaseProduct(rowId, purchase);
    const options = plannerSupplierOptions(purchase.jersey_type, purchase.customization);
    const supplier = options.find(option => option.id === purchase.supplier_id) || options[0] || null;
    const quantity = Math.max(1, Number(purchase.quantity || 1));
    const cost = Number(supplier?.cost || 0);
    const sellingPrice = Number(purchase.selling_price ?? matchedProduct?.planning_price ?? 0);
    const supplierTotal = quantity * cost;
    const revenue = quantity * sellingPrice;
    return {
      row_id: rowId,
      product: matchedProduct || {
        id: "",
        name: purchase.name || "New jersey",
        category: purchase.category,
        jersey_type: purchase.jersey_type,
        customization: purchase.customization
      },
      size: purchase.size || "",
      category: purchase.category,
      jersey_type: purchase.jersey_type,
      customization: purchase.customization,
      selling_price: sellingPrice,
      supplier,
      quantity,
      unit_cost: cost,
      supplier_total: supplierTotal,
      estimated_revenue: revenue,
      expected_profit: sellingPrice > 0 ? revenue - supplierTotal : 0
    };
  });
}

function renderPlannerPurchaseSummary() {
  if (!plannerPurchaseSummary) return;
  const rows = plannerSelectedRows();
  if (!rows.length) {
    plannerPurchaseSummary.innerHTML = `
      <div><span class="section-kicker">Purchase List</span><h3>Nothing selected yet</h3><p>Select jerseys below to build a supplier order.</p></div>`;
    if (exportPurchase) exportPurchase.disabled = true;
    return;
  }
  const units = rows.reduce((sum, row) => sum + row.quantity, 0);
  const cost = rows.reduce((sum, row) => sum + row.supplier_total, 0);
  const revenue = rows.reduce((sum, row) => sum + row.estimated_revenue, 0);
  const profit = rows.reduce((sum, row) => sum + row.expected_profit, 0);
  const margin = revenue > 0 ? profit / revenue * 100 : 0;
  const missingSellPrices = rows.filter(row => row.selling_price <= 0).length;
  plannerPurchaseSummary.innerHTML = `
    <div><span class="section-kicker">Purchase List</span><h3>${analyticsNumber(rows.length)} jersey styles selected</h3><p>${analyticsNumber(units)} total jerseys across ${analyticsNumber(new Set(rows.map(row => row.supplier?.id).filter(Boolean)).size)} supplier${new Set(rows.map(row => row.supplier?.id).filter(Boolean)).size === 1 ? "" : "s"}.${missingSellPrices ? ` Add an expected sell price to ${analyticsNumber(missingSellPrices)} row${missingSellPrices === 1 ? "" : "s"} for complete profit projections.` : ""}</p></div>
    <div class="planner-purchase-totals">
      <span><small>Supplier total</small><strong>${plannerMoney(cost)}</strong></span>
      <span><small>Estimated revenue</small><strong>${plannerMoney(revenue)}</strong></span>
      <span><small>Expected profit</small><strong>${plannerMoney(profit)}</strong></span>
      <span><small>Profit margin</small><strong>${plannerPercent(margin)}</strong></span>
      <span><small>Units</small><strong>${analyticsNumber(units)}</strong></span>
    </div>`;
  if (exportPurchase) exportPurchase.disabled = false;
}

function renderInventoryPlanner() {
  renderPlannerSuppliers();
  renderPlannerSummary();
  renderPlannerReorders();
  renderPlannerRisks();
  renderPlannerProfit();
  renderPlannerProducts();
  renderPlannerPurchaseTable();
  renderPlannerPurchaseSummary();
}

async function loadInventoryPlanner() {
  if (!plannerStatus || plannerLoading) return;
  plannerLoading = true;
  plannerStatus.textContent = "Calculating demand, supplier costs, and reorder recommendations...";
  plannerStatus.className = "form-status";
  if (refreshPlanner) refreshPlanner.disabled = true;
  try {
    plannerData = await api("/api/admin/inventory-planner");
    for (const [rowId, purchase] of plannerPurchase) {
      if (purchase.product_id && !plannerData.products.some(product => product.id === purchase.product_id)) {
        purchase.product_id = "";
        plannerPurchase.set(rowId, purchase);
      }
    }
    renderInventoryPlanner();
    plannerLoaded = true;
    plannerStatus.textContent = `Planner updated for ${analyticsNumber(plannerData.products.length)} jerseys.`;
    plannerStatus.classList.add("success");
  } catch (error) {
    plannerStatus.textContent = error.message;
    plannerStatus.classList.add("error");
  } finally {
    plannerLoading = false;
    if (refreshPlanner) refreshPlanner.disabled = false;
  }
}

async function savePlannerSupplierSettings() {
  if (!plannerData || !plannerSuppliers || !savePlannerSuppliers) return;
  const cards = [...plannerSuppliers.querySelectorAll("[data-planner-supplier]")];
  const suppliers = cards.map((card, index) => ({
    id: card.dataset.plannerSupplier || `supplier-${index + 1}`,
    name: card.querySelector("[data-supplier-name]")?.value.trim() || `Supplier ${index + 1}`,
    enabled: Boolean(card.querySelector("[data-supplier-enabled]")?.checked),
    costs: Object.fromEntries([...card.querySelectorAll("[data-supplier-rule]")].map(input => [
      input.dataset.supplierRule,
      input.value.trim() === "" ? null : input.value
    ]))
  }));
  savePlannerSuppliers.disabled = true;
  const original = savePlannerSuppliers.textContent;
  savePlannerSuppliers.textContent = "Saving...";
  try {
    await api("/api/admin/inventory-planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_suppliers", suppliers })
    });
    plannerStatus.textContent = "Supplier pricing saved. Recalculating the planner...";
    plannerStatus.className = "form-status success";
    plannerLoaded = false;
    await loadInventoryPlanner();
  } catch (error) {
    plannerStatus.textContent = error.message;
    plannerStatus.className = "form-status error";
  } finally {
    savePlannerSuppliers.disabled = false;
    savePlannerSuppliers.textContent = original;
  }
}

async function savePlannerProductSettings(card) {
  const productId = card?.dataset.plannerProduct;
  const button = card?.querySelector("[data-save-planner-product]");
  if (!productId || !button) return;
  button.disabled = true;
  button.textContent = "Saving...";
  try {
    await api("/api/admin/inventory-planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save_override",
        product_id: productId,
        jersey_type: card.querySelector("[data-planner-type]")?.value,
        customization: card.querySelector("[data-planner-customization]")?.value,
        preferred_supplier_id: card.querySelector("[data-planner-purchase-supplier]")?.value || ""
      })
    });
    plannerStatus.textContent = "Jersey cost classification saved.";
    plannerStatus.className = "form-status success";
    plannerLoaded = false;
    await loadInventoryPlanner();
  } catch (error) {
    plannerStatus.textContent = error.message;
    plannerStatus.className = "form-status error";
  } finally {
    button.disabled = false;
    button.textContent = "Save";
  }
}

function addInventoryPlannerSupplier() {
  if (!plannerData) return;
  const nextNumber = plannerData.suppliers.length + 1;
  plannerData.suppliers.push({
    id: `supplier-${Date.now()}`,
    name: `Supplier ${nextNumber}`,
    enabled: false,
    sort_order: nextNumber * 10,
    costs: {}
  });
  renderPlannerSuppliers();
  plannerSuppliers.querySelector("[data-planner-supplier]:last-child [data-supplier-name]")?.focus();
}

function exportPlannerPurchaseCsv() {
  const rows = plannerSelectedRows();
  if (!rows.length) return;
  const csvRows = [
    ["Product ID", "Jersey", "Category", "Version", "Customization", "Size", "Supplier", "Quantity", "Unit Cost", "Supplier Total", "Expected Sell Price", "Estimated Revenue", "Expected Profit", "Profit Margin"],
    ...rows.map(row => [
      row.product.id,
      row.product.name,
      row.category === "world" ? "International" : row.category === "retro" ? "Retro" : "Club",
      plannerTypeLabel(row.jersey_type),
      plannerCustomizationLabel(row.customization),
      row.size,
      row.supplier?.name || "",
      row.quantity,
      row.unit_cost.toFixed(2),
      row.supplier_total.toFixed(2),
      row.selling_price.toFixed(2),
      row.estimated_revenue.toFixed(2),
      row.expected_profit.toFixed(2),
      row.estimated_revenue > 0 ? `${(row.expected_profit / row.estimated_revenue * 100).toFixed(1)}%` : "0%"
    ])
  ];
  const csv = csvRows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `jerseysfrmjb-purchase-plan-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

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

  if (event.target.matches("[data-copy-contact]")) {
    copyUsername(event.target.dataset.copyContact || "");
    return;
  }

  if (event.target.matches("[data-save-message]")) {
    const nextStatus = card.querySelector("[data-message-status]")?.value || "new";
    const notes = card.querySelector("[data-message-notes]")?.value || "";
    const contacted = Boolean(card.querySelector("[data-message-contacted]")?.checked);
    try {
      await updateMessage(card.dataset.id, nextStatus, notes, contacted);
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

  if (event.target.matches("[data-save-platform-prices]")) {
    await savePlatformPrices(card);
    return;
  }

  if (event.target.matches("[data-retry-platform-prices]")) {
    await loadPlatformPrices(card);
    return;
  }

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

feedbackList?.addEventListener("click", event => {
  const card = event.target.closest("[data-feedback-id]");
  if (!card) return;
  const moderationButton = event.target.closest("[data-feedback-moderation]");
  const visibilityButton = event.target.closest("[data-feedback-visibility]");
  if (moderationButton) {
    updateEbayFeedback(card.dataset.feedbackId, { moderation_status: moderationButton.dataset.feedbackModeration });
  } else if (visibilityButton) {
    updateEbayFeedback(card.dataset.feedbackId, { visibility_status: visibilityButton.dataset.feedbackVisibility });
  }
});

list.addEventListener("toggle", event => {
  const editor = event.target.closest("[data-platform-prices]");
  if (!editor?.open) return;
  const card = editor.closest(".admin-card");
  if (card) loadPlatformPrices(card);
}, true);

list.addEventListener("input", event => {
  if (!event.target.matches("[data-platform-price]")) return;
  const card = event.target.closest(".admin-card");
  if (!card) return;
  const state = platformPriceState(card.dataset.id);
  state.prices[event.target.dataset.platformPrice] = event.target.value.trim();
  state.message = "";
  state.tone = "";
  const priceStatus = card.querySelector(".platform-prices-status");
  if (priceStatus) {
    priceStatus.textContent = "";
    priceStatus.classList.remove("success", "error");
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
adminMobileTab?.addEventListener("change", () => setAdminTab(adminMobileTab.value || currentAdminTab));
refreshPlanner?.addEventListener("click", () => {
  plannerLoaded = false;
  loadInventoryPlanner();
});
savePlannerSuppliers?.addEventListener("click", savePlannerSupplierSettings);
addPlannerSupplier?.addEventListener("click", addInventoryPlannerSupplier);
addPurchaseRow?.addEventListener("click", () => addPlannerPurchaseRow());
exportPurchase?.addEventListener("click", exportPlannerPurchaseCsv);
plannerSearch?.addEventListener("input", renderPlannerProducts);
plannerRiskFilter?.addEventListener("change", renderPlannerProducts);
plannerSort?.addEventListener("change", renderPlannerProducts);
plannerProducts?.addEventListener("change", event => {
  const card = event.target.closest("[data-planner-product]");
  if (!card || !plannerData) return;
  const productId = card.dataset.plannerProduct;
  const product = plannerData.products.find(item => item.id === productId);
  if (!product) return;
  if (event.target.matches("[data-planner-select]")) {
    if (event.target.checked) {
      plannerPurchase.set(productId, {
        product_id: product.id,
        name: product.name,
        category: product.category,
        jersey_type: product.jersey_type,
        customization: product.customization,
        size: "",
        quantity: Math.max(1, Number(card.querySelector("[data-planner-quantity]")?.value || product.recommended_quantity || 1)),
        supplier_id: card.querySelector("[data-planner-purchase-supplier]")?.value || product.recommended_supplier?.id || "",
        selling_price: product.planning_price
      });
    } else {
      plannerPurchase.delete(productId);
    }
    card.classList.toggle("selected", event.target.checked);
  }
  if (event.target.matches("[data-planner-quantity], [data-planner-purchase-supplier]") && plannerPurchase.has(productId)) {
    const current = plannerPurchase.get(productId);
    current.quantity = Math.max(1, Number(card.querySelector("[data-planner-quantity]")?.value || 1));
    current.supplier_id = card.querySelector("[data-planner-purchase-supplier]")?.value || "";
    plannerPurchase.set(productId, current);
  }
  renderPlannerPurchaseTable();
  renderPlannerPurchaseSummary();
});
plannerProducts?.addEventListener("input", event => {
  if (!event.target.matches("[data-planner-quantity]")) return;
  const card = event.target.closest("[data-planner-product]");
  if (!card || !plannerPurchase.has(card.dataset.plannerProduct)) return;
  const current = plannerPurchase.get(card.dataset.plannerProduct);
  current.quantity = Math.max(1, Number(event.target.value || 1));
  plannerPurchase.set(card.dataset.plannerProduct, current);
  renderPlannerPurchaseTable();
  renderPlannerPurchaseSummary();
});
plannerProducts?.addEventListener("click", event => {
  const save = event.target.closest("[data-save-planner-product]");
  if (save) savePlannerProductSettings(save.closest("[data-planner-product]"));
});
plannerPurchaseTable?.addEventListener("input", event => {
  const row = event.target.closest("[data-purchase-row]");
  const purchase = row ? plannerPurchase.get(row.dataset.purchaseRow) : null;
  if (!row || !purchase) return;
  if (event.target.matches("[data-purchase-name]")) purchase.name = event.target.value;
  if (event.target.matches("[data-purchase-size]")) purchase.size = event.target.value;
  if (event.target.matches("[data-purchase-quantity]")) purchase.quantity = Math.max(1, Number(event.target.value || 1));
  if (event.target.matches("[data-purchase-selling-price]")) purchase.selling_price = event.target.value;
  plannerPurchase.set(row.dataset.purchaseRow, purchase);
  if (event.target.matches("[data-purchase-quantity]")) {
    const options = plannerSupplierOptions(purchase.jersey_type, purchase.customization);
    const supplier = options.find(option => option.id === purchase.supplier_id) || options[0];
    const total = Number(supplier?.cost || 0) * purchase.quantity;
    const totalElement = row.querySelector("[data-purchase-line-total]");
    if (totalElement) totalElement.textContent = plannerMoney(total);
  }
  renderPlannerPurchaseSummary();
});
plannerPurchaseTable?.addEventListener("change", event => {
  const row = event.target.closest("[data-purchase-row]");
  const purchase = row ? plannerPurchase.get(row.dataset.purchaseRow) : null;
  if (!row || !purchase) return;
  const rowId = row.dataset.purchaseRow;
  if (event.target.matches("[data-purchase-name]")) {
    purchase.name = event.target.value;
    plannerPurchase.set(rowId, purchase);
    matchPlannerPurchaseProduct(rowId);
    return;
  }
  if (event.target.matches("[data-purchase-category]")) {
    const previousCategory = purchase.category;
    purchase.category = event.target.value;
    if (purchase.category === "retro" && previousCategory !== "retro") {
      purchase.jersey_type = "retro_short";
      purchase.customization = "nameset_patches";
    } else if (purchase.category !== "retro" && previousCategory === "retro") {
      purchase.jersey_type = "fan";
      purchase.customization = "nameset_patches";
    }
    purchase.product_id = "";
  }
  if (event.target.matches("[data-purchase-type]")) {
    purchase.jersey_type = event.target.value;
    purchase.product_id = "";
  }
  if (event.target.matches("[data-purchase-customization]")) {
    purchase.customization = event.target.value;
    purchase.product_id = "";
  }
  if (event.target.matches("[data-purchase-supplier]")) purchase.supplier_id = event.target.value;
  if (event.target.matches("[data-purchase-size]")) purchase.size = event.target.value;
  if (event.target.matches("[data-purchase-quantity]")) purchase.quantity = Math.max(1, Number(event.target.value || 1));
  if (event.target.matches("[data-purchase-selling-price]")) purchase.selling_price = event.target.value;
  const options = plannerSupplierOptions(purchase.jersey_type, purchase.customization);
  if (!options.some(option => option.id === purchase.supplier_id)) purchase.supplier_id = options[0]?.id || "";
  plannerPurchase.set(rowId, purchase);
  renderPlannerPurchaseTable();
  renderPlannerPurchaseSummary();
});
plannerPurchaseTable?.addEventListener("click", event => {
  const remove = event.target.closest("[data-remove-purchase-row]");
  const row = remove?.closest("[data-purchase-row]");
  if (!row) return;
  plannerPurchase.delete(row.dataset.purchaseRow);
  renderPlannerPurchaseTable();
  renderPlannerPurchaseSummary();
  renderPlannerProducts();
});

function shopifyStatusLabel(status = "") {
  return ({
    ready: "Ready", created: "Created", updated: "Updated", unchanged: "Unchanged",
    missing_information: "Missing information", failed: "Failed", needs_review: "Needs review",
    unmapped: "Not mapped"
  })[status] || String(status || "Not mapped").replaceAll("_", " ");
}

function updateShopifyActionState({ busy = false } = {}) {
  const configuration = shopifyData?.configuration || {};
  const canSync = Boolean(configuration.sync_enabled && configuration.admin_configured);
  const hasRetryableProducts = Boolean((shopifyData?.products || []).some(product => ["failed", "needs_review"].includes(product.sync_status)));
  [previewShopify, previewShopifyAll, suggestShopifyPilot].filter(Boolean).forEach(button => {
    button.disabled = busy;
    button.toggleAttribute("aria-busy", busy);
  });
  [runShopify, syncShopifyAll].filter(Boolean).forEach(button => {
    button.disabled = busy || !canSync;
    button.toggleAttribute("aria-busy", busy);
    button.title = canSync ? "" : "Enable Shopify sync and configure the Admin API before applying changes.";
  });
  if (retryShopifySync) {
    retryShopifySync.disabled = busy || !canSync || !hasRetryableProducts;
    retryShopifySync.toggleAttribute("aria-busy", busy);
    retryShopifySync.title = canSync ? (hasRetryableProducts ? "" : "There are no failed Shopify products to retry.") : "Enable Shopify sync and configure the Admin API before retrying changes.";
  }
}

function renderShopifyAdmin() {
  if (!shopifyData) return;
  const configuration = shopifyData.configuration || {};
  if (shopifyConfig) {
    const checks = [
      ["Store", configuration.store_domain || "Not configured", Boolean(configuration.store_domain)],
      ["Admin API", configuration.admin_configured ? `Configured (${configuration.admin_auth_mode === "client_credentials" ? "client credentials" : "legacy token"})` : "Missing", configuration.admin_configured],
      ["Storefront API", configuration.storefront_configured ? "Configured" : "Missing", configuration.storefront_configured],
      ["Webhook secret", configuration.webhook_configured ? "Configured" : "Missing", configuration.webhook_configured],
      ["Storefront publication", configuration.publication_configured ? "Configured" : "Auto-detect", true],
      ["Sync flag", configuration.sync_enabled ? "On" : "Off", configuration.sync_enabled],
      ["Checkout flag", configuration.checkout_enabled ? "On" : "Off", configuration.checkout_enabled]
    ];
    shopifyConfig.innerHTML = checks.map(([label, value, healthy]) => `<article class="${healthy ? "healthy" : "waiting"}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("");
  }
  if (shopifyCounts) {
    const counts = shopifyData.counts || {};
    const last = shopifyData.last_run;
    shopifyCounts.innerHTML = [
      ["Mapped products", counts.mapped_products], ["Not mapped", counts.unmapped_products],
      ["Mapped variants", counts.mapped_variants], ["Unmapped variants", counts.unmapped_variants],
      ["Inventory mismatches", counts.inventory_mismatches],
      ["Last sync", last?.completed_at ? analyticsDate(last.completed_at) : "Never"]
    ].map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value ?? 0)}</strong></article>`).join("");
  }
  renderShopifyProducts();
  if (shopifyOrders) {
    shopifyOrders.innerHTML = (shopifyData.recent_orders || []).length
      ? shopifyData.recent_orders.map(order => `<article class="shopify-order-row"><div><strong>${escapeHtml(order.order_number || order.shopify_order_id)}</strong><span>${escapeHtml(order.payment_status || "Pending")} · ${escapeHtml(order.fulfillment_status || "Unfulfilled")}</span></div><div><b>${plannerMoney(order.subtotal)} ${escapeHtml(order.currency || "USD")}</b><time>${escapeHtml(analyticsDate(order.updated_at))}</time></div></article>`).join("")
      : '<p class="empty-featured">No Shopify orders recorded.</p>';
  }
  if (shopifyWebhooks) {
    shopifyWebhooks.innerHTML = (shopifyData.failed_events || []).length
      ? shopifyData.failed_events.map(event => `<article class="shopify-webhook-row"><div><strong>${escapeHtml(event.topic)}</strong><span>${escapeHtml(event.error || "Processing failed")}</span></div><button class="shop-button secondary-admin" type="button" data-shopify-retry-event="${escapeHtml(event.event_id)}">Retry</button></article>`).join("")
      : '<p class="empty-featured">No failed Shopify events.</p>';
  }
  updateShopifyActionState();
}

function renderShopifySetupAudit(setup = {}) {
  if (!shopifySetupAudit) return;
  shopifySetupAudit.hidden = false;
  const selectedLocationId = setup.configured_location_id || setup.recommended_location_id;
  const selectedPublicationId = setup.configured_publication_id || setup.recommended_publication_id;
  const location = (setup.locations || []).find(item => item.id === selectedLocationId);
  const publication = (setup.publications || []).find(item => item.id === selectedPublicationId);
  const missingScopes = setup.missing_scopes || [];
  const missingTopics = setup.missing_webhook_topics || [];
  const checks = [
    ["Connection", setup.connected ? `${setup.store?.name || "Shopify store"} connected` : setup.error || setup.checks?.connection || "Not connected", setup.connected],
    ["API scopes", missingScopes.length ? `Missing: ${missingScopes.join(", ")}` : "All required scopes granted", !missingScopes.length],
    ["Location", setup.configured_location_id ? location?.name || "Configured location" : location ? `Recommended: ${location.name}` : "No usable location found", Boolean(location)],
    ["Publication", setup.configured_publication_id ? publication?.name || "Configured publication" : publication ? `Recommended: ${publication.name}` : "No usable publication found", Boolean(publication)],
    ["Webhooks", missingTopics.length ? `Missing: ${missingTopics.join(", ")}` : "All required webhooks registered", !missingTopics.length]
  ];
  shopifySetupAudit.innerHTML = `<div class="shopify-admin-section-head"><div><span class="section-kicker">Connection Audit</span><h3>Shopify readiness</h3><p>No access tokens or customer data are shown here.</p></div></div><div class="shopify-setup-checks">${checks.map(([label, value, healthy]) => `<article class="${healthy ? "healthy" : "waiting"}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("")}</div>${!setup.configured_location_id && setup.recommended_location_id ? `<p class="shopify-setup-hint">Set <code>SHOPIFY_LOCATION_ID</code> to <code>${escapeHtml(setup.recommended_location_id)}</code> in Cloudflare.</p>` : ""}${!setup.configured_publication_id && setup.recommended_publication_id ? `<p class="shopify-setup-hint">Set <code>SHOPIFY_PUBLICATION_ID</code> to <code>${escapeHtml(setup.recommended_publication_id)}</code> in Cloudflare.</p>` : ""}`;
}

async function inspectShopifyConnection({ registerWebhooks = false } = {}) {
  if (shopifyLoading) return;
  if (registerWebhooks && !window.confirm("Register any missing Shopify order, refund, and fulfillment webhooks now? Existing matching webhooks will be left unchanged.")) return;
  shopifyLoading = true;
  if (shopifyAdminStatus) shopifyAdminStatus.textContent = registerWebhooks ? "Registering missing Shopify webhooks..." : "Checking Shopify connection, scopes, locations, publications, and webhooks...";
  try {
    const setup = await api("/api/admin/shopify/setup", registerWebhooks ? {
      method: "POST",
      body: JSON.stringify({ action: "register_webhooks", confirm: true })
    } : {});
    renderShopifySetupAudit(setup.setup || setup);
    if (shopifyAdminStatus) shopifyAdminStatus.textContent = registerWebhooks
      ? "Webhook registration finished. Review the readiness audit below."
      : "Shopify connection audit complete.";
  } catch (error) {
    if (shopifyAdminStatus) shopifyAdminStatus.textContent = error.message;
  } finally {
    shopifyLoading = false;
  }
}

function renderShopifyProducts() {
  if (!shopifyProducts || !shopifyData) return;
  const query = String(shopifySearch?.value || "").trim().toLowerCase();
  const products = (shopifyData.products || []).filter(product => !query || `${product.id} ${product.title}`.toLowerCase().includes(query));
  shopifyProducts.innerHTML = products.length ? products.map(product => {
    const selected = selectedShopifyProducts.has(product.id);
    const sizes = product.variants.map(variant => `${variant.size}: ${variant.quantity}`).join(" · ");
    const status = product.missing?.length ? "missing_information" : product.sync_status;
    return `<article class="shopify-product-row ${selected ? "selected" : ""}" data-shopify-product-row="${escapeHtml(product.id)}">
      <label class="shopify-product-select"><input type="checkbox" data-shopify-select ${selected ? "checked" : ""}><span><strong>${escapeHtml(product.title)}</strong><small>${escapeHtml(product.id)} · ${escapeHtml(sizes || "No size data")}</small></span></label>
      <div class="shopify-product-meta"><span class="shopify-sync-status status-${escapeHtml(status)}">${escapeHtml(shopifyStatusLabel(status))}</span><b>${product.website_price === null ? "No price" : plannerMoney(product.website_price)}</b></div>
      <label class="shopify-pilot-toggle"><input type="checkbox" data-shopify-pilot ${product.pilot_enabled ? "checked" : ""}><span>Pilot checkout</span></label>
      ${product.shopify_admin_url ? `<a class="shop-button secondary-admin" href="${escapeHtml(product.shopify_admin_url)}" target="_blank" rel="noopener">Open in Shopify</a>` : ""}
    </article>`;
  }).join("") : '<p class="empty-featured">No matching products.</p>';
}

async function loadShopifyStatus(force = false) {
  if (shopifyLoading) return;
  if (shopifyLoaded && !force) { renderShopifyAdmin(); return; }
  shopifyLoading = true;
  if (shopifyAdminStatus) shopifyAdminStatus.textContent = "Checking Shopify configuration and mappings...";
  try {
    shopifyData = await api("/api/admin/shopify/status");
    shopifyLoaded = true;
    renderShopifyAdmin();
    if (shopifyAdminStatus) shopifyAdminStatus.textContent = shopifyData.configuration?.sync_enabled
      ? "Shopify sync is available. Preview before applying changes."
      : "Safe mode: Shopify sync is off. Dry-run previews remain available.";
  } catch (error) {
    if (shopifyAdminStatus) shopifyAdminStatus.textContent = error.message;
  } finally {
    shopifyLoading = false;
  }
}

function renderShopifyPreview(data) {
  if (!shopifyPreviewResults) return;
  shopifyPreviewResults.hidden = false;
  const summary = data.summary || {};
  shopifyPreviewResults.innerHTML = `<div class="shopify-admin-section-head"><div><span class="section-kicker">${data.dry_run ? "Dry Run" : "Sync Result"}</span><h3>${data.dry_run ? "Proposed Shopify changes" : "Shopify sync completed"}</h3><p>${Number(summary.created || 0)} created · ${Number(summary.updated || 0)} updated · ${Number(summary.unchanged || 0)} unchanged · ${Number(summary.needs_review || 0)} needs review · ${Number(summary.failed || 0)} failed</p></div>${data.dry_run ? '<button class="shop-button secondary-admin" type="button" data-shopify-retry-preview>Retry preview</button>' : ""}</div>
    <div class="shopify-preview-items">${(data.items || []).map(item => `<article><div class="shopify-preview-summary"><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.product_id)} · ${item.variants.length} size variant${item.variants.length === 1 ? "" : "s"}</span></div><b class="shopify-sync-status status-${escapeHtml(item.status)}">${escapeHtml(shopifyStatusLabel(item.status))}</b></div>${item.missing?.length ? `<small>Missing: ${escapeHtml(item.missing.join(", "))}</small>` : ""}${item.error ? `<small>${escapeHtml(item.error)}</small>` : ""}${item.shopify_request_preview ? `<details class="shopify-request-preview"><summary>View exact Shopify request</summary><pre>${escapeHtml(JSON.stringify(item.shopify_request_preview, null, 2))}</pre></details>` : ""}</article>`).join("")}</div>`;
  shopifyPreviewResults.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function runShopifySync({ dryRun = true, scope = "selected", productIds = [] } = {}) {
  if (shopifyLoading) return;
  if (!dryRun && !(shopifyData?.configuration?.sync_enabled && shopifyData?.configuration?.admin_configured)) {
    if (shopifyAdminStatus) shopifyAdminStatus.textContent = "Shopify sync is safely disabled. Enable the sync flag and configure the Admin API before applying changes; dry-run previews remain available.";
    updateShopifyActionState();
    return;
  }
  const ids = productIds.length ? productIds : [...selectedShopifyProducts];
  if (scope !== "all" && !ids.length) {
    if (shopifyAdminStatus) shopifyAdminStatus.textContent = "Select at least one product first.";
    return;
  }
  if (!dryRun && scope === "all" && !window.confirm("Sync every inventory product to Shopify now? Preview All first and confirm your credentials, pricing, and Shopify test mode.")) return;
  if (!dryRun && scope !== "all" && !window.confirm(`Sync ${ids.length} selected product${ids.length === 1 ? "" : "s"} to Shopify now?`)) return;
  const request = { dryRun, scope, productIds: ids };
  lastShopifyRequest = request;
  shopifyLoading = true;
  updateShopifyActionState({ busy: true });
  if (shopifyPreviewResults) {
    shopifyPreviewResults.hidden = false;
    shopifyPreviewResults.innerHTML = `<div class="shopify-request-progress" role="status" aria-live="polite"><strong>${dryRun ? "Preparing safe dry-run preview" : "Preparing Shopify sync"}</strong><span>Reading ${scope === "all" ? "the live inventory" : `${ids.length} selected product${ids.length === 1 ? "" : "s"}`} and validating the request. No products will be created while dry-run mode is active.</span><i></i></div>`;
  }
  if (shopifyAdminStatus) shopifyAdminStatus.textContent = dryRun ? "Building a safe dry-run preview… Please keep this tab open." : "Syncing products to Shopify…";
  try {
    const data = await api("/api/admin/shopify/sync", {
      method: "POST",
      body: JSON.stringify({ dry_run: dryRun, scope, product_ids: ids, confirm_all: scope === "all" }),
      timeoutMs: dryRun ? (scope === "all" ? 90000 : 45000) : 90000
    });
    renderShopifyPreview(data);
    if (shopifyAdminStatus) shopifyAdminStatus.textContent = dryRun ? "Preview ready. No Shopify data was changed." : "Sync finished. Review the result below.";
    if (!dryRun) { shopifyLoaded = false; await loadShopifyStatus(true); }
  } catch (error) {
    if (shopifyAdminStatus) shopifyAdminStatus.textContent = error.message;
    if (shopifyPreviewResults) {
      shopifyPreviewResults.hidden = false;
      shopifyPreviewResults.innerHTML = `<div class="shopify-request-error" role="alert"><strong>Preview could not be completed</strong><span>${escapeHtml(error.message)}</span><button class="shop-button secondary-admin" type="button" data-shopify-retry-preview>Retry preview</button></div>`;
    }
  } finally {
    shopifyLoading = false;
    updateShopifyActionState();
  }
}

shopifyProducts?.addEventListener("change", async event => {
  const row = event.target.closest("[data-shopify-product-row]");
  if (!row) return;
  const id = row.dataset.shopifyProductRow;
  if (event.target.matches("[data-shopify-select]")) {
    if (event.target.checked) selectedShopifyProducts.add(id); else selectedShopifyProducts.delete(id);
    renderShopifyProducts();
  }
  if (event.target.matches("[data-shopify-pilot]")) {
    event.target.disabled = true;
    try {
      await api("/api/admin/shopify/pilot", { method: "PATCH", body: JSON.stringify({ product_id: id, enabled: event.target.checked }) });
      const product = shopifyData.products.find(item => item.id === id);
      if (product) product.pilot_enabled = event.target.checked;
      if (shopifyAdminStatus) shopifyAdminStatus.textContent = `${product?.title || id} pilot checkout ${event.target.checked ? "enabled" : "disabled"}. The global checkout flag must also be on.`;
    } catch (error) {
      event.target.checked = !event.target.checked;
      if (shopifyAdminStatus) shopifyAdminStatus.textContent = error.message;
    } finally { event.target.disabled = false; }
  }
});
shopifyWebhooks?.addEventListener("click", async event => {
  const button = event.target.closest("[data-shopify-retry-event]");
  if (!button) return;
  button.disabled = true;
  try { await api("/api/admin/shopify/retry", { method: "POST", body: JSON.stringify({ event_id: button.dataset.shopifyRetryEvent }) }); shopifyLoaded = false; await loadShopifyStatus(true); }
  catch (error) { if (shopifyAdminStatus) shopifyAdminStatus.textContent = error.message; }
  finally { button.disabled = false; }
});
shopifySearch?.addEventListener("input", renderShopifyProducts);
shopifyPreviewResults?.addEventListener("click", event => {
  if (!event.target.closest("[data-shopify-retry-preview]") || !lastShopifyRequest) return;
  runShopifySync(lastShopifyRequest);
});
refreshShopify?.addEventListener("click", () => loadShopifyStatus(true));
checkShopifyConnection?.addEventListener("click", () => inspectShopifyConnection());
registerShopifyWebhooksButton?.addEventListener("click", () => inspectShopifyConnection({ registerWebhooks: true }));
suggestShopifyPilot?.addEventListener("click", () => {
  (shopifyData?.suggested_pilot_products || []).forEach(id => selectedShopifyProducts.add(id));
  renderShopifyProducts();
  if (shopifyAdminStatus) shopifyAdminStatus.textContent = "Suggested pilot products selected. Review them, enable Pilot checkout individually, then run Preview Selected.";
});
previewShopify?.addEventListener("click", () => runShopifySync({ dryRun: true }));
runShopify?.addEventListener("click", () => runShopifySync({ dryRun: false }));
previewShopifyAll?.addEventListener("click", () => runShopifySync({ dryRun: true, scope: "all" }));
syncShopifyAll?.addEventListener("click", () => runShopifySync({ dryRun: false, scope: "all" }));
retryShopifySync?.addEventListener("click", () => {
  const failed = (shopifyData?.products || []).filter(product => ["failed", "needs_review"].includes(product.sync_status)).map(product => product.id);
  runShopifySync({ dryRun: false, scope: "retry", productIds: failed });
});
refreshSales?.addEventListener("click", loadSales);
refreshAnalytics?.addEventListener("click", loadAnalytics);
analyticsRange?.addEventListener("change", () => {
  analyticsLoaded = false;
  loadAnalytics();
});
exportAnalytics?.addEventListener("click", exportAnalyticsCsv);
salesSearch?.addEventListener("input", renderSales);
salesPlatform?.addEventListener("change", renderSales);
salesDate?.addEventListener("change", renderSales);
salesExport?.addEventListener("click", exportSalesCsv);
salesTable?.addEventListener("click", event => {
  const editButton = event.target.closest("[data-sale-edit]");
  const saveButton = event.target.closest("[data-sale-save]");
  const cancelButton = event.target.closest("[data-sale-cancel]");
  const deleteButton = event.target.closest("[data-sale-delete]");

  if (editButton) {
    editingSaleId = editButton.dataset.saleEdit;
    renderSales();
    if (salesStatus) salesStatus.textContent = "Editing sale. Save when finished.";
    return;
  }

  if (saveButton) {
    saveSaleEdit(saveButton.dataset.saleSave);
    return;
  }

  if (cancelButton) {
    editingSaleId = null;
    renderSales();
    if (salesStatus) salesStatus.textContent = "Sale edit canceled.";
    return;
  }

  if (deleteButton) {
    deleteSaleRecord(deleteButton.dataset.saleDelete);
  }
});
quickSaleSearch?.addEventListener("input", updateQuickSaleMatches);
quickSaleMatch?.addEventListener("change", () => {
  updateQuickSaleSubmit();
  applyQuickSalePlatformPrice();
});
quickSalePlatform?.addEventListener("change", applyQuickSalePlatformPrice);
quickSalePrice?.addEventListener("input", () => {
  quickSalePriceManuallyEdited = true;
  quickSalePriceRequest += 1;
});
quickSaleForm?.addEventListener("submit", submitQuickSale);

searchInput.addEventListener("input", render);
categorySelect.addEventListener("change", render);
loadInventory();
