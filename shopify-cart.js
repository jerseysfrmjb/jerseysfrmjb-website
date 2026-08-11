(function shopifyCart(window, document) {
  "use strict";

  const CART_KEY = "jfb_shopify_cart_id";
  const VISITOR_KEY = "jfb_commerce_visitor";
  const SESSION_KEY = "jfb_commerce_session";
  const REQUEST_TIMEOUT_MS = 15000;

  function ensureCartInterface() {
    const header = document.querySelector(".site-header");
    if (header && !header.querySelector("[data-shopify-cart-open]")) {
      header.insertAdjacentHTML("beforeend", '<button class="site-cart-button" type="button" data-shopify-cart-open aria-label="Open shopping cart">Cart <span data-shopify-cart-count>0</span></button>');
    }
    if (!document.querySelector(".site-checkout-banner")) {
      const banner = document.createElement("section");
      banner.className = "site-checkout-banner";
      banner.setAttribute("aria-label", "Website checkout available");
      banner.innerHTML = '<div><span aria-hidden="true">&#10003;</span><p><strong>Shop directly on JerseysFrmJB</strong><small>Choose a size, add jerseys to your cart, and check out securely.</small></p></div><button type="button" data-shopify-cart-open>View Cart <span data-shopify-cart-count>0</span></button>';
      header?.insertAdjacentElement("afterend", banner);
    }
    if (!document.querySelector("[data-shopify-cart-drawer]")) {
      document.body.insertAdjacentHTML("beforeend", '<aside class="shopify-cart-drawer" data-shopify-cart-drawer role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden="true"><div class="shopify-cart-head"><div><span>Website cart</span><h2>Your jerseys</h2></div><button type="button" data-shopify-cart-close aria-label="Close cart">&times;</button></div><div data-shopify-cart-lines><p class="shopify-cart-empty">Your cart is empty.</p></div><div class="shopify-cart-footer" data-shopify-cart-footer hidden><p><span>Subtotal</span><strong data-shopify-cart-subtotal>$0.00</strong></p><button type="button" data-shopify-checkout>Continue to Secure Checkout</button><small>Payment and shipping details are entered securely on Shopify.</small></div></aside><button class="shopify-cart-backdrop" type="button" data-shopify-cart-close aria-label="Close cart" hidden></button>');
    }
  }

  ensureCartInterface();
  const drawer = document.querySelector("[data-shopify-cart-drawer]");
  const linesElement = document.querySelector("[data-shopify-cart-lines]");
  const footer = document.querySelector("[data-shopify-cart-footer]");
  const subtotal = document.querySelector("[data-shopify-cart-subtotal]");
  const countElements = [...document.querySelectorAll("[data-shopify-cart-count]")];
  let cart = null;
  let busy = false;
  let cartTrigger = null;

  function identifier(key, session) {
    try {
      const storage = session ? sessionStorage : localStorage;
      let value = storage.getItem(key);
      if (!value) {
        value = crypto.randomUUID();
        storage.setItem(key, value);
      }
      return value;
    } catch {
      return "";
    }
  }

  function cartId() {
    try { return localStorage.getItem(CART_KEY) || ""; } catch { return ""; }
  }

  function saveCart(nextCart) {
    cart = nextCart || null;
    try {
      if (cart?.id) localStorage.setItem(CART_KEY, cart.id);
      else localStorage.removeItem(CART_KEY);
    } catch { /* Storage is optional. */ }
    renderCart();
  }

  function money(value, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(value || 0));
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  async function api(body) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response;
    try {
      response = await fetch("/api/shopify/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("Secure checkout took too long to respond. Please try again.");
      throw new Error("Could not reach secure checkout. Check your connection and try again.");
    } finally {
      window.clearTimeout(timeout);
    }
    const data = await response.json().catch(() => ({}));
    if (data.clear_cart) saveCart(null);
    if (!response.ok) throw new Error(data.error || "Secure checkout is temporarily unavailable.");
    return data;
  }

  function commerceEvent(eventType, details = {}) {
    const payload = {
      event_type: eventType,
      visitor_id: identifier(VISITOR_KEY, false),
      session_id: identifier(SESSION_KEY, true),
      cart_id: cart?.id || cartId(),
      ...details
    };
    fetch("/api/analytics/commerce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
    const gaName = { AddToCart: "add_to_cart", ViewCart: "view_cart", InitiateCheckout: "begin_checkout" }[eventType];
    if (gaName && typeof window.gtag === "function") {
      window.gtag("event", gaName, { currency: "USD", value: Number(details.value || 0), items: details.product_id ? [{ item_id: details.product_id }] : [] });
    }
    if (typeof window.fbq === "function") {
      if (eventType === "AddToCart") window.fbq("track", "AddToCart", { content_ids: details.product_id ? [details.product_id] : [], content_type: "product", currency: "USD", value: Number(details.value || 0) });
      else if (eventType === "InitiateCheckout") window.fbq("track", "InitiateCheckout", { content_type: "product", currency: "USD", value: Number(details.value || 0) });
      else if (eventType === "ViewCart") window.fbq("trackCustom", "ViewCart", { currency: "USD", value: Number(details.value || 0) });
    }
  }

  function renderCart() {
    const lines = cart?.lines || [];
    countElements.forEach(element => { element.textContent = String(cart?.total_quantity || 0); });
    if (!linesElement || !footer) return;
    if (!lines.length) {
      linesElement.innerHTML = '<p class="shopify-cart-empty">Your cart is empty.</p>';
      footer.hidden = true;
      return;
    }
    linesElement.innerHTML = lines.map(line => `
      <article class="shopify-cart-line" data-cart-line="${escapeHtml(line.id)}">
        ${line.image ? `<img src="${escapeHtml(line.image)}" alt="${escapeHtml(line.image_alt || line.title)}">` : ""}
        <div><h3>${escapeHtml(line.title)}</h3><p>Size ${escapeHtml(line.size)}</p><strong>${money(line.total, cart.currency)}</strong>
          <div class="shopify-cart-line-actions"><label><span>Qty</span><input type="number" min="1" max="25" value="${line.quantity}" data-cart-quantity></label><button type="button" data-cart-remove>Remove</button></div>
        </div>
      </article>`).join("");
    footer.hidden = false;
    if (subtotal) subtotal.textContent = money(cart.subtotal, cart.currency);
  }

  function openDrawer(track = true) {
    if (!drawer) return;
    cartTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    drawer.setAttribute("aria-hidden", "false");
    drawer.classList.add("open");
    const backdrop = document.querySelector(".shopify-cart-backdrop");
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add("shopify-cart-open");
    drawer.querySelector("[data-shopify-cart-close]")?.focus();
    if (track) commerceEvent("ViewCart", { value: cart?.subtotal || 0 });
  }

  function closeDrawer() {
    drawer?.setAttribute("aria-hidden", "true");
    drawer?.classList.remove("open");
    const backdrop = document.querySelector(".shopify-cart-backdrop");
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("shopify-cart-open");
    if (cartTrigger?.isConnected) cartTrigger.focus();
    cartTrigger = null;
  }

  async function addProduct(card, buyNow) {
    if (busy) return;
    const size = card.querySelector("[data-shopify-size]")?.value || "";
    const status = card.querySelector("[data-shopify-status]");
    if (!size) {
      if (status) status.textContent = "Choose a size first.";
      return;
    }
    busy = true;
    card.classList.add("is-saving");
    if (status) status.textContent = buyNow ? "Opening secure checkout..." : "Adding to cart...";
    try {
      const data = await api({ action: buyNow ? "buy_now" : cartId() ? "add" : "create", cart_id: cartId(), product_id: card.dataset.productId, size, quantity: 1 });
      saveCart(data.cart);
      commerceEvent("AddToCart", { product_id: card.dataset.productId, value: Number(card.dataset.productPrice || 0) });
      if (buyNow && data.cart?.checkout_url) {
        commerceEvent("InitiateCheckout", { product_id: card.dataset.productId, value: data.cart.subtotal });
        window.location.assign(data.cart.checkout_url);
        return;
      }
      if (status) status.textContent = "Added to your cart.";
      openDrawer(false);
    } catch (error) {
      if (status) status.textContent = error.message;
    } finally {
      busy = false;
      card.classList.remove("is-saving");
    }
  }

  document.addEventListener("click", async event => {
    const add = event.target.closest("[data-shopify-add], [data-shopify-buy-now]");
    if (add) {
      const card = add.closest("[data-shopify-product]");
      if (card) addProduct(card, add.hasAttribute("data-shopify-buy-now"));
      return;
    }
    if (event.target.closest("[data-shopify-cart-open]")) { openDrawer(); return; }
    if (event.target.closest("[data-shopify-cart-close]")) { closeDrawer(); return; }
    const line = event.target.closest("[data-cart-line]");
    if (line && event.target.closest("[data-cart-remove]")) {
      if (busy) return;
      busy = true;
      try { saveCart((await api({ action: "remove", cart_id: cartId(), line_id: line.dataset.cartLine })).cart); }
      catch (error) { linesElement.insertAdjacentHTML("afterbegin", `<p class="shopify-cart-error">${escapeHtml(error.message)}</p>`); }
      finally { busy = false; }
      return;
    }
    if (event.target.closest("[data-shopify-checkout]") && cart?.checkout_url) {
      commerceEvent("InitiateCheckout", { value: cart.subtotal });
      window.location.assign(cart.checkout_url);
    }
  });

  document.addEventListener("change", async event => {
    const input = event.target.closest("[data-cart-quantity]");
    const line = input?.closest("[data-cart-line]");
    if (!line || busy) return;
    busy = true;
    try { saveCart((await api({ action: "update", cart_id: cartId(), line_id: line.dataset.cartLine, quantity: Number(input.value) })).cart); }
    catch (error) { linesElement.insertAdjacentHTML("afterbegin", `<p class="shopify-cart-error">${escapeHtml(error.message)}</p>`); }
    finally { busy = false; }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && drawer?.classList.contains("open")) closeDrawer();
  });

  if (cartId()) api({ action: "get", cart_id: cartId() }).then(data => saveCart(data.cart)).catch(() => saveCart(null));
})(window, document);
