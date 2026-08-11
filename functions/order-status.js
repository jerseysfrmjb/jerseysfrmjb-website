const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Order Status | JerseysFrmJB</title><meta name="description" content="Return to JerseysFrmJB after completing secure Shopify checkout.">
<meta name="robots" content="noindex,follow"><link rel="stylesheet" href="/styles.css?v=shopify-checkout-1"><script src="/meta-pixel.js?v=1" defer></script><script src="/analytics.js?v=conversion-funnel-1" defer></script></head>
<body><main class="shopify-return-page"><span>Secure checkout</span><h1>Thanks for shopping with JerseysFrmJB.</h1><p>Your official receipt, payment status, and shipping updates are shown on Shopify's order-status page and sent through the contact method used at checkout.</p><p>This page does not display private order information.</p><div><a href="/shop-all">Continue Shopping</a><a href="https://www.instagram.com/jerseysfrmjb/" target="_blank" rel="noopener">Message on Instagram</a></div></main></body></html>`;

export function onRequestGet() {
  return new Response(PAGE, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
