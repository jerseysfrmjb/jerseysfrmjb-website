import { inferProductIdentity } from "../catalog/_products.js";

export const FUNNEL_SOURCES = ["Google", "Bing", "TikTok", "Instagram", "Facebook", "Pinterest", "Direct", "Other"];

function number(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function percent(numerator, denominator) {
  return denominator > 0 ? Math.round((number(numerator) / number(denominator)) * 1000) / 10 : 0;
}

function withRates(row = {}) {
  const views = number(row.views);
  const addToCart = number(row.add_to_cart);
  const checkoutStarted = number(row.checkout_started);
  const purchases = number(row.purchases);
  return {
    ...row,
    views,
    add_to_cart: addToCart,
    checkout_started: checkoutStarted,
    purchases,
    view_to_cart_rate: percent(addToCart, views),
    cart_to_checkout_rate: percent(checkoutStarted, addToCart),
    checkout_to_purchase_rate: percent(purchases, checkoutStarted),
    overall_conversion_rate: percent(purchases, views)
  };
}

function aggregate(rows, labelFor) {
  const groups = new Map();
  for (const row of rows) {
    const label = labelFor(row);
    if (!label) continue;
    const current = groups.get(label) || { name: label, views: 0, add_to_cart: 0, checkout_started: 0, purchases: 0 };
    current.views += row.views;
    current.add_to_cart += row.add_to_cart;
    current.checkout_started += row.checkout_started;
    current.purchases += row.purchases;
    groups.set(label, current);
  }
  return [...groups.values()].map(withRates)
    .sort((a, b) => b.purchases - a.purchases || b.views - a.views || a.name.localeCompare(b.name));
}

export function buildConversionFunnel({ productViews = 0, commerce = [], products = [], sources = [] } = {}) {
  const commerceTotals = Object.fromEntries(commerce.map(row => [row.event_type, number(row.events)]));
  const summary = withRates({
    views: productViews,
    add_to_cart: commerceTotals.AddToCart,
    checkout_started: commerceTotals.InitiateCheckout,
    purchases: commerceTotals.Purchase
  });
  const productRows = products.map(row => withRates({
    id: String(row.id || ""),
    name: String(row.name || row.id || "Unknown product"),
    category: String(row.category || ""),
    views: row.views,
    add_to_cart: row.add_to_cart,
    checkout_started: row.checkout_started,
    purchases: row.purchases
  }));
  const sourceMap = new Map(sources.map(row => [String(row.source || "Other"), row]));
  const sourceRows = FUNNEL_SOURCES.map(source => withRates({
    source,
    ...(sourceMap.get(source) || {})
  }));
  const players = aggregate(productRows, row => inferProductIdentity(row.name).player);
  const teams = aggregate(productRows, row => inferProductIdentity(row.name).team_country);

  const lists = {
    most_viewed_low_add: productRows.filter(row => row.views > 0)
      .sort((a, b) => a.view_to_cart_rate - b.view_to_cart_rate || b.views - a.views).slice(0, 10),
    high_add_low_checkout: productRows.filter(row => row.add_to_cart > 0)
      .sort((a, b) => a.cart_to_checkout_rate - b.cart_to_checkout_rate || b.add_to_cart - a.add_to_cart).slice(0, 10),
    high_checkout_low_purchase: productRows.filter(row => row.checkout_started > 0)
      .sort((a, b) => a.checkout_to_purchase_rate - b.checkout_to_purchase_rate || b.checkout_started - a.checkout_started).slice(0, 10),
    highest_converting: productRows.filter(row => row.views > 0 && row.purchases > 0)
      .sort((a, b) => b.overall_conversion_rate - a.overall_conversion_rate || b.purchases - a.purchases).slice(0, 10),
    highest_converting_sources: sourceRows.filter(row => row.views > 0 && row.purchases > 0)
      .sort((a, b) => b.overall_conversion_rate - a.overall_conversion_rate || b.purchases - a.purchases),
    views_zero_purchases: productRows.filter(row => row.views > 0 && row.purchases === 0)
      .sort((a, b) => b.views - a.views).slice(0, 20)
  };

  const recommendations = [];
  const lowAdd = lists.most_viewed_low_add[0];
  if (lowAdd) recommendations.push(`${lowAdd.name} gets high views but few cart adds (${lowAdd.view_to_cart_rate}%).`);
  const lowCheckout = lists.high_add_low_checkout[0];
  if (lowCheckout) recommendations.push(`${lowCheckout.name} is added to carts but starts checkout less often (${lowCheckout.cart_to_checkout_rate}%).`);
  const lowPurchase = lists.high_checkout_low_purchase[0];
  if (lowPurchase) recommendations.push(`${lowPurchase.name} reaches checkout often but purchases are low (${lowPurchase.checkout_to_purchase_rate}%).`);
  const tiktok = sourceRows.find(row => row.source === "TikTok");
  const facebook = sourceRows.find(row => row.source === "Facebook");
  if (tiktok?.views && facebook?.views && tiktok.overall_conversion_rate !== facebook.overall_conversion_rate) {
    const better = tiktok.overall_conversion_rate > facebook.overall_conversion_rate ? tiktok : facebook;
    const other = better === tiktok ? facebook : tiktok;
    recommendations.push(`${better.source} traffic converts better than ${other.source} in this period (${better.overall_conversion_rate}% vs ${other.overall_conversion_rate}%).`);
  }

  return {
    summary,
    products: productRows.sort((a, b) => b.views - a.views || b.purchases - a.purchases),
    players,
    teams,
    sources: sourceRows,
    lists,
    recommendations
  };
}
