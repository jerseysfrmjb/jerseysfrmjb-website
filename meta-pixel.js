(function initializeJerseysMetaPixel(window, document) {
  "use strict";

  const PIXEL_ID = "1059066979981582";
  const META_SCRIPT_URL = "https://connect.facebook.net/en_US/fbevents.js";
  const PRODUCT_SELECTOR = "[data-meta-product]";
  const MARKETPLACE_LINK_SELECTOR = [
    ".platform-buy-button",
    ".shop-button",
    ".review-profile-button",
    ".community-link",
    ".secondary-buy-action",
    ".help-instagram-link"
  ].join(",");
  const viewedProductIds = new Set();

  if (window.__jerseysMetaPixelInitialized) return;
  window.__jerseysMetaPixelInitialized = true;

  // Official Meta Pixel base loader.
  (function loadMetaPixel(f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function metaPixelQueue() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", META_SCRIPT_URL);

  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");

  function finitePrice(value) {
    if (value === null || value === undefined || String(value).trim() === "") return null;
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 ? amount : null;
  }

  function productParameters(card) {
    const contentId = String(card?.dataset?.productId || "").trim();
    const contentName = String(card?.dataset?.productName || "").trim();
    const value = finitePrice(card?.dataset?.productValue);
    const params = {
      content_ids: contentId ? [contentId] : [],
      content_name: contentName,
      content_type: "product",
      content_category: String(card?.dataset?.productCategory || "").trim(),
      availability: String(card?.dataset?.productAvailability || "").trim(),
      currency: "USD"
    };
    if (value !== null) params.value = value;
    return params;
  }

  function trackProductView(card) {
    const contentId = String(card?.dataset?.productId || "").trim();
    if (!contentId || viewedProductIds.has(contentId)) return;
    viewedProductIds.add(contentId);
    window.fbq("track", "ViewContent", productParameters(card));
  }

  const productObserver = "IntersectionObserver" in window
    ? new window.IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
        trackProductView(entry.target);
        productObserver.unobserve(entry.target);
      });
    }, { threshold: 0.5 })
    : null;

  function observeProducts(root = document) {
    root.querySelectorAll(PRODUCT_SELECTOR).forEach(card => {
      if (card.dataset.metaPixelObserved) return;
      card.dataset.metaPixelObserved = "true";
      if (productObserver) {
        productObserver.observe(card);
      } else {
        card.addEventListener("click", () => trackProductView(card), { once: true });
        card.addEventListener("focusin", () => trackProductView(card), { once: true });
      }
    });
  }

  function marketplaceName(url, link) {
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "depop.com" || host.endsWith(".depop.com")) return "Depop";
    if (host === "ebay.com" || host.endsWith(".ebay.com")) return "eBay";
    if (
      host === "facebook.com" ||
      host.endsWith(".facebook.com") ||
      host === "messenger.com" ||
      host.endsWith(".messenger.com") ||
      host === "m.me"
    ) return "Facebook";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "pinterest.com" || host.endsWith(".pinterest.com")) return "Pinterest";

    const buttonMatch = link.textContent.match(/(?:buy|shop|open|view|follow)(?:\s+on)?\s+(.+)/i);
    return buttonMatch?.[1]?.trim().slice(0, 60) || host;
  }

  function safeDestination(url) {
    return `${url.origin}${url.pathname}`;
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

    const marketplace = marketplaceName(destination, link);
    const isKnownMarketplace = ["Depop", "eBay", "Facebook", "Instagram", "Pinterest"].includes(marketplace);
    const isMarketplaceButton = link.matches(MARKETPLACE_LINK_SELECTOR);
    if (!isKnownMarketplace && !isMarketplaceButton) return;

    const card = link.closest(PRODUCT_SELECTOR);
    const product = card ? productParameters(card) : {
      content_ids: link.dataset.analyticsProductId ? [link.dataset.analyticsProductId] : [],
      content_name: String(link.dataset.analyticsProductName || "").trim(),
      content_type: "product"
    };
    window.fbq("trackCustom", "MarketplaceOutboundClick", {
      marketplace,
      destination_url: safeDestination(destination),
      link_text: link.textContent.trim().replace(/\s+/g, " ").slice(0, 100),
      content_ids: product.content_ids || [],
      content_name: product.content_name || "",
      content_type: product.content_type || "product"
    });
  }

  document.addEventListener("click", trackMarketplaceClick, true);
  observeProducts();

  window.JerseysMetaPixel = Object.freeze({
    pixelId: PIXEL_ID,
    observeProducts,
    trackProductView
  });
})(window, document);
