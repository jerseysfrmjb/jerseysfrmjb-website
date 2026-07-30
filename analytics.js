(function initializeJerseysAnalytics(window, document) {
  "use strict";

  if (window.__jerseysAnalyticsInitialized) return;
  window.__jerseysAnalyticsInitialized = true;

  const EVENT_ENDPOINT = "/api/analytics/events";
  const CONFIG_ENDPOINT = "/api/analytics/config";
  const PRODUCT_SELECTOR = "[data-meta-product]";
  const SEARCH_SELECTOR = "[data-inventory-search]";
  const MARKETPLACE_BUTTON_SELECTOR = ".platform-buy-button,.review-profile-button,.community-link,.secondary-buy-action,.help-instagram-link";
  const STORAGE_VISITOR = "jerseys_analytics_visitor";
  const STORAGE_SESSION = "jerseys_analytics_session";
  const STORAGE_SOURCE = "jerseys_analytics_source";
  const privacyOptOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
  const viewedProducts = new Set();
  const trackedSearches = new Set();
  let gaEnabled = false;
  let activeStartedAt = document.visibilityState === "visible" ? performance.now() : 0;
  let activeSeconds = 0;
  let sentEngagementSeconds = 0;

  if (privacyOptOut) return;

  function randomId(prefix) {
    const random = globalThis.crypto?.randomUUID?.().replace(/-/g, "")
      || `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
    return `${prefix}_${random}`.slice(0, 80);
  }

  function storageId(storage, key, prefix) {
    try {
      const existing = storage.getItem(key);
      if (existing) return existing;
      const value = randomId(prefix);
      storage.setItem(key, value);
      return value;
    } catch {
      return randomId(prefix);
    }
  }

  const visitorId = storageId(window.localStorage, STORAGE_VISITOR, "v");
  const sessionId = storageId(window.sessionStorage, STORAGE_SESSION, "s");

  function sourceFromLocation() {
    const params = new URLSearchParams(window.location.search);
    const campaignSource = String(params.get("utm_source") || "").toLowerCase();
    const referrer = document.referrer;
    let host = "";
    try {
      host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      host = "";
    }
    const value = campaignSource || host;
    if (/google/.test(value)) return "Google";
    if (/bing/.test(value)) return "Bing";
    if (/pinterest/.test(value)) return "Pinterest";
    if (/facebook|fb\.com|m\.me/.test(value)) return "Facebook";
    if (/instagram/.test(value)) return "Instagram";
    if (!value || host === window.location.hostname.replace(/^www\./, "")) return "Direct";
    return "Other";
  }

  function sessionSource() {
    try {
      const existing = window.sessionStorage.getItem(STORAGE_SOURCE);
      if (existing) return existing;
      const source = sourceFromLocation();
      window.sessionStorage.setItem(STORAGE_SOURCE, source);
      return source;
    } catch {
      return sourceFromLocation();
    }
  }

  const trafficSource = sessionSource();

  function basePayload(eventType, details = {}) {
    return {
      event_type: eventType,
      visitor_id: visitorId,
      session_id: sessionId,
      page_path: window.location.pathname,
      page_title: document.title,
      traffic_source: trafficSource,
      ...details
    };
  }

  function send(payload, beacon = false) {
    const body = JSON.stringify(payload);
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(EVENT_ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(EVENT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin"
    }).catch(() => {});
  }

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || gtag;

  function gaEvent(name, parameters = {}) {
    if (!gaEnabled) return;
    window.gtag("event", name, parameters);
  }

  async function initializeGa4() {
    try {
      const response = await fetch(CONFIG_ENDPOINT, { credentials: "same-origin" });
      const config = response.ok ? await response.json() : {};
      const measurementId = String(config.measurement_id || "");
      if (!/^G-[A-Z0-9]{6,20}$/.test(measurementId)) return;
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
      gaEnabled = true;
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        anonymize_ip: true,
        allow_google_signals: false,
        send_page_view: true
      });
    } catch {
      // First-party analytics continues even if GA4 is unavailable.
    }
  }

  function productData(element) {
    const product = element?.matches?.(PRODUCT_SELECTOR)
      ? element
      : element?.closest?.(PRODUCT_SELECTOR);
    return {
      id: String(element?.dataset?.analyticsProductId || product?.dataset?.productId || "").trim(),
      name: String(element?.dataset?.analyticsProductName || product?.dataset?.productName || "").trim(),
      category: String(product?.dataset?.productCategory || "").trim(),
      value: Number(product?.dataset?.productValue || 0)
    };
  }

  function trackProductView(element) {
    const product = productData(element);
    if (!product.id || viewedProducts.has(product.id)) return;
    viewedProducts.add(product.id);
    send(basePayload("product_view", { product_id: product.id }));
    gaEvent("view_item", {
      currency: "USD",
      value: Number.isFinite(product.value) ? product.value : 0,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category
      }]
    });
  }

  const productObserver = "IntersectionObserver" in window
    ? new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        trackProductView(entry.target);
        productObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 })
    : null;

  function observeProducts(root = document) {
    root.querySelectorAll(PRODUCT_SELECTOR).forEach(product => {
      if (product.dataset.analyticsObserved) return;
      product.dataset.analyticsObserved = "true";
      if (productObserver) productObserver.observe(product);
      else product.addEventListener("click", () => trackProductView(product), { once: true });
    });
  }

  function marketplaceName(url) {
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "depop.com" || host.endsWith(".depop.com")) return "Depop";
    if (host === "ebay.com" || host.endsWith(".ebay.com") || host.endsWith(".ebay.us")) return "eBay";
    if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "m.me") return "Facebook";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "pinterest.com" || host.endsWith(".pinterest.com")) return "Pinterest";
    return "";
  }

  function trackMarketplaceClick(event) {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    let destination;
    try {
      destination = new URL(link.href, window.location.href);
    } catch {
      return;
    }
    const marketplace = String(link.dataset.analyticsMarketplace || "").trim()
      || marketplaceName(destination)
      || (destination.origin !== window.location.origin && link.matches(MARKETPLACE_BUTTON_SELECTOR) ? "Other" : "");
    if (!marketplace) return;
    const product = productData(link);
    send(basePayload("marketplace_click", {
      product_id: product.id,
      marketplace
    }));
    gaEvent("marketplace_click", {
      marketplace,
      item_id: product.id,
      item_name: product.name,
      link_url: `${destination.origin}${destination.pathname}`
    });
  }

  function visibleProductCount(input) {
    const scope = input.closest("[data-shop-all-controls]")?.parentElement
      || input.closest(".inventory-page")
      || document;
    return [...scope.querySelectorAll("[data-inventory-grid] article")].filter(card => !card.hidden).length;
  }

  function setupSearchTracking(root = document) {
    root.querySelectorAll(SEARCH_SELECTOR).forEach(input => {
      if (input.dataset.analyticsSearchReady) return;
      input.dataset.analyticsSearchReady = "true";
      let timer = 0;
      input.addEventListener("input", () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const query = input.value.trim().replace(/\s+/g, " ").slice(0, 80);
          const key = query.toLowerCase();
          if (query.length < 2 || query.includes("@") || /\d{7,}/.test(query) || trackedSearches.has(key)) return;
          trackedSearches.add(key);
          const results = visibleProductCount(input);
          send(basePayload("search", {
            search_query: query,
            search_results: results
          }));
          gaEvent("search", { search_term: query, results_count: results });
        }, 900);
      });
    });
  }

  function updateActiveTime() {
    if (!activeStartedAt) return;
    activeSeconds += Math.max(0, (performance.now() - activeStartedAt) / 1000);
    activeStartedAt = 0;
  }

  function sendEngagement() {
    updateActiveTime();
    const wholeSeconds = Math.floor(activeSeconds);
    const delta = wholeSeconds - sentEngagementSeconds;
    if (delta < 1) return;
    sentEngagementSeconds = wholeSeconds;
    send(basePayload("engagement", { duration_seconds: delta }), true);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendEngagement();
    } else if (!activeStartedAt) {
      activeStartedAt = performance.now();
    }
  });
  window.addEventListener("pagehide", sendEngagement);
  document.addEventListener("click", trackMarketplaceClick, true);

  send(basePayload("page_view"));
  observeProducts();
  setupSearchTracking();
  initializeGa4();

  window.JerseysAnalytics = Object.freeze({
    observeProducts,
    setupSearchTracking,
    trackProductView
  });
})(window, document);
