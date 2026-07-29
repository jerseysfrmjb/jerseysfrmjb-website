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
let inventory = [];
let settings = {};
let featuredLimit = 3;
let sizeOptions = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"];
let messages = [];
let unreadMessages = 0;
let ebayFeedback = [];
let feedbackLoaded = false;
const savingFeedbackIds = new Set();
let pinterestConnection = null;
let pinterestBoards = [];
let pinterestLoaded = false;
let pinterestPublishing = false;
let adminFilter = "all";
let restockPresets = [];
let lastBulkRestock = null;
let currentBulkPreview = null;
let sales = [];
let salesLoaded = false;
let analyticsLoaded = false;
let analyticsLoading = false;
let analyticsData = null;
let salesAnalyticsPanel = document.querySelector("[data-sales-analytics]");
let quickSaleMatches = [];
let quickSalePriceManuallyEdited = false;
let quickSalePriceRequest = 0;
const pinterestCallback = new URLSearchParams(location.search).get("pinterest") || "";
let currentAdminTab = location.hash === "#pinterest" || pinterestCallback ? "pinterest" : "dashboard";
let editingSaleId = null;
let savingSaleEditId = null;
let deletingSaleId = null;
const platformPriceNames = ["Depop", "eBay", "Facebook", "Website", "Local", "Other"];
const platformPriceStates = new Map();

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
  if (adminMobileTab) adminMobileTab.value = tab;
  adminSections.forEach(section => {
    section.hidden = section.dataset.adminSection !== tab;
  });
  if (tab === "sales" && !salesLoaded) loadSales();
  if (tab === "analytics" && !analyticsLoaded) loadAnalytics();
  if (tab === "feedback" && !feedbackLoaded) loadEbayFeedbackAdmin();
  if (tab === "pinterest" && !pinterestLoaded) loadPinterestStatus();
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

function analyticsDate(value = "") {
  if (!value) return "Never";
  const date = new Date(String(value).endsWith("Z") ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
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
  const firstDay = rows[0]?.day || "";
  const lastDay = rows.at(-1)?.day || "";
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
    <div class="analytics-table-wrap">
      <table class="analytics-table analytics-daily-table">
        <thead><tr><th>Date</th>${groups.map(group => `<th>${escapeHtml(group)}</th>`).join("")}<th>Total</th></tr></thead>
        <tbody>${days.map(day => {
          const values = groups.map(group => lookup.get(`${day}|${group}`) || 0);
          return `<tr><td>${escapeHtml(day)}</td>${values.map(value => `<td>${analyticsNumber(value)}</td>`).join("")}<td><strong>${analyticsNumber(values.reduce((sum, value) => sum + value, 0))}</strong></td></tr>`;
        }).join("")}</tbody>
      </table>
    </div>`;
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
      ${analyticsProductTable((data.products || []).filter(item => item.clicks > 0).sort((a, b) => b.clicks - a.clicks).slice(0, 20), "Marketplace clicks by product will appear here.")}
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
  const rows = [
    ["Product ID", "Product", "Category", "Views", "Marketplace Clicks", "eBay Clicks", "Depop Clicks", "CTR", "Inventory", "Views Last 30 Days", "Last Viewed"],
    ...analyticsData.products.map(item => [
      item.id,
      item.name,
      item.category,
      item.views,
      item.clicks,
      item.ebay_clicks,
      item.depop_clicks,
      `${item.ctr}%`,
      item.quantity,
      item.views_30d,
      item.last_viewed_at
    ])
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

const PINTEREST_CATEGORY_PAGES = {
  world: "/worldcup-jerseys",
  club: "/club-jerseys",
  retro: "/retro-jerseys"
};

function pinterestAvailableProducts() {
  return inventory
    .filter(item => Number(item.quantity || 0) > 0 && Array.isArray(item.photos) && item.photos.some(photo => photo?.src))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function pinterestProductLink(item) {
  const path = PINTEREST_CATEGORY_PAGES[item?.category] || "/shop-all";
  return new URL(path, "https://jerseysfrmjb.com").toString();
}

function pinterestDefaultDescription(item) {
  const sizes = Object.entries(item?.sizes || {})
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([size]) => size);
  const sizeText = sizes.length ? ` Available sizes: ${sizes.join(", ")}.` : "";
  return `${item.name}.${sizeText} Browse current football jersey inventory from JerseysFrmJB.`;
}

function selectedPinterestProduct() {
  return inventory.find(item => String(item.id) === String(pinterestProduct?.value || ""));
}

function selectedPinterestPhotoIndex() {
  return Math.max(0, Number(pinterestImages?.querySelector("[data-pinterest-photo]:checked")?.value || 0));
}

function selectSuggestedPinterestBoard(product, force = false) {
  if (!pinterestBoard || !product || (!force && pinterestBoard.value)) return;
  const boardPattern = product.category === "world"
    ? /\bworld\s*cup\b/i
    : product.category === "retro"
      ? /\bretro\b/i
      : product.category === "club"
        ? /\bclub\b/i
        : null;
  if (!boardPattern) return;
  const match = pinterestBoards.find(board => boardPattern.test(board.name));
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
      <p>${escapeHtml(pinterestDescription?.value || pinterestDefaultDescription(product))}</p>
      <small>${escapeHtml(pinterestProductLink(product))}</small>
    </div>`;
}

function updatePinterestPublishState() {
  if (!pinterestPublish) return;
  pinterestPublish.disabled = Boolean(
    pinterestPublishing
    || !pinterestConnection?.connected
    || !pinterestProduct?.value
    || !pinterestBoard?.value
    || !pinterestTitle?.value.trim()
    || !pinterestDescription?.value.trim()
  );
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

  const photos = (product.photos || []).filter(photo => photo?.src);
  if (pinterestImages) {
    pinterestImages.innerHTML = photos.map((photo, index) => `
      <label class="pinterest-image-option">
        <input type="radio" name="pinterest_photo" value="${index}" data-pinterest-photo ${index === 0 ? "checked" : ""}>
        <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || `${product.name} photo ${index + 1}`)}">
        <span>${index === 0 ? "Primary photo" : `Photo ${index + 1}`}</span>
      </label>`).join("");
  }
  if (resetText || !pinterestTitle?.value) pinterestTitle.value = product.name.slice(0, 100);
  if (resetText || !pinterestDescription?.value) pinterestDescription.value = pinterestDefaultDescription(product).slice(0, 800);
  if (pinterestLink) pinterestLink.value = pinterestProductLink(product);
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
        pinterestStatusLine.textContent = "The API Sandbox has separate boards. Create the three Trial boards to publish your test Pin.";
        pinterestStatusLine.className = "form-status";
      }
    } else if (createPinterestBoardsButton) {
      createPinterestBoardsButton.hidden = true;
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
    pinterestStatusLine.textContent = "Creating World Cup, Retro, and Club Trial boards...";
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
    if (createPinterestBoardsButton) createPinterestBoardsButton.hidden = Boolean(pinterestBoards.length);
    updatePinterestPublishState();
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = data.created
        ? `${data.created} Trial boards created. Choose a product to continue.`
        : "The Trial boards already exist.";
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
      createPinterestBoardsButton.textContent = "Create Trial Boards";
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
      await loadPinterestBoards();
      if (pinterestStatusLine && pinterestBoards.length) {
        const callbackMessage = pinterestCallback === "connected"
          ? "Pinterest connected successfully. Choose a product and board to publish a test Pin."
          : "Pinterest is connected.";
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
  const product = selectedPinterestProduct();
  if (!product || !pinterestBoard?.value) {
    if (pinterestStatusLine) pinterestStatusLine.textContent = "Choose an inventory product and Pinterest board.";
    return;
  }

  pinterestPublishing = true;
  if (pinterestPublish) pinterestPublish.textContent = "Publishing...";
  updatePinterestPublishState();
  if (pinterestStatusLine) {
    pinterestStatusLine.textContent = "Publishing the test Pin...";
    pinterestStatusLine.className = "form-status";
  }
  try {
    const data = await api("/api/admin/pinterest/publish", {
      method: "POST",
      body: JSON.stringify({
        product_id: product.id,
        board_id: pinterestBoard.value,
        photo_index: selectedPinterestPhotoIndex(),
        title: pinterestTitle.value.trim(),
        description: pinterestDescription.value.trim()
      })
    });
    if (pinterestStatusLine) {
      const link = data.pin?.pinterest_url || "";
      pinterestStatusLine.innerHTML = link
        ? `Test Pin published. <a href="${escapeHtml(link)}" target="_blank" rel="noopener">Open it on Pinterest</a>.`
        : "Test Pin published successfully.";
      pinterestStatusLine.className = "form-status success";
    }
  } catch (error) {
    if (pinterestStatusLine) {
      pinterestStatusLine.textContent = error.message;
      pinterestStatusLine.className = "form-status error";
    }
  } finally {
    pinterestPublishing = false;
    if (pinterestPublish) pinterestPublish.textContent = "Publish Test Pin";
    updatePinterestPublishState();
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
refreshFeedback?.addEventListener("click", loadEbayFeedbackAdmin);
feedbackFilter?.addEventListener("change", renderEbayFeedbackAdmin);
refreshPinterest?.addEventListener("click", loadPinterestStatus);
createPinterestBoardsButton?.addEventListener("click", createPinterestTrialBoards);
disconnectPinterestButton?.addEventListener("click", disconnectPinterest);
pinterestProduct?.addEventListener("change", () => renderPinterestProductEditor(true));
pinterestBoard?.addEventListener("change", updatePinterestPublishState);
pinterestImages?.addEventListener("change", event => {
  if (event.target.matches("[data-pinterest-photo]")) renderPinterestPreview();
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
