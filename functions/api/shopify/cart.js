import { addCartLine, createCart, getCart, removeCartLine, updateCartLine } from "./_cart.js";
import { json, shopifyConfiguration, shopifyGraphql } from "./_shared.js";
import { discoverShopifyPublication, normalizeSize, publishShopifyProduct } from "./_products.js";

const ACTIVATE_PRODUCT_MUTATION = `
  mutation ActivateJerseysFrmJBCheckoutProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product { id status }
      userErrors { field message }
    }
  }
`;

function cleanId(value, limit = 500) {
  const result = String(value || "").trim();
  return result && result.length <= limit ? result : "";
}

function quantity(value) {
  const number = Math.floor(Number(value));
  return Number.isFinite(number) && number > 0 && number <= 25 ? number : 1;
}

async function mappedVariant(env, productId, size, requestedQuantity) {
  const row = await env.DB.prepare(`
    SELECT inventory.id, inventory.name, inventory.sizes_json,
      product_mappings.shopify_product_id,
      variant_mappings.shopify_variant_id, variant_mappings.size
    FROM inventory
    JOIN shopify_product_mappings AS product_mappings ON product_mappings.product_id = inventory.id
    JOIN shopify_variant_mappings AS variant_mappings
      ON variant_mappings.product_id = inventory.id AND variant_mappings.size = ?
    WHERE inventory.id = ?
    LIMIT 1
  `).bind(size, productId).first();
  if (!row?.shopify_variant_id || !row.shopify_product_id) throw new Error("Website checkout is not mapped for this jersey and size yet.");
  let sizes = {};
  try { sizes = JSON.parse(row.sizes_json || "{}"); } catch { sizes = {}; }
  const available = Math.max(0, Math.floor(Number(sizes[size] || 0)));
  if (!available) throw new Error("That size is sold out.");
  if (requestedQuantity > available) throw new Error("The requested quantity is no longer available.");
  return row;
}

async function ensureCheckoutProductPublished(env, mapping) {
  const productId = String(mapping?.shopify_product_id || "").trim();
  if (!productId) throw new Error("Website checkout is not mapped for this jersey yet.");
  const data = await shopifyGraphql(env, "admin", ACTIVATE_PRODUCT_MUTATION, {
    input: { id: productId, status: "ACTIVE" }
  });
  const errors = data.productUpdate?.userErrors || [];
  if (errors.length) throw new Error(errors.map(error => error.message).join("; "));
  const publicationId = await discoverShopifyPublication(env);
  if (!publicationId) throw new Error("Website checkout publication is not configured.");
  await publishShopifyProduct(env, productId, publicationId);
}

function unpublishedMerchandise(error) {
  return /merchandise/i.test(String(error?.message || ""))
    && /not exist|not available|invalid/i.test(String(error?.message || ""));
}

function staleCart(error) {
  const message = String(error?.message || "");
  return /\bcart\b/i.test(message)
    && /does not exist|not found|invalid|expired/i.test(message);
}

async function createOrAddCart(env, action, cartId, line, mapping) {
  const submit = () => action === "add" && cartId
    ? addCartLine(env, cartId, line)
    : createCart(env, line);
  try {
    return await submit();
  } catch (error) {
    if (action === "add" && cartId && staleCart(error)) {
      return createCart(env, line);
    }
    if (!unpublishedMerchandise(error)) throw error;
    await ensureCheckoutProductPublished(env, mapping);
    const retryDelays = [250, 750, 1500, 2500];
    let retryError = error;
    for (const delay of retryDelays) {
      await new Promise(resolve => setTimeout(resolve, delay));
      try {
        return await submit();
      } catch (nextError) {
        retryError = nextError;
        if (action === "add" && cartId && staleCart(nextError)) {
          return createCart(env, line);
        }
        if (!unpublishedMerchandise(nextError)) throw nextError;
      }
    }
    throw retryError;
  }
}

async function validateCartLineQuantity(env, cart, lineId, requestedQuantity) {
  const line = cart?.lines?.find(item => item.id === lineId);
  if (!line?.variant_id) throw new Error("That cart item is no longer available.");
  const mapping = await env.DB.prepare(`
    SELECT variant_mappings.product_id, variant_mappings.size, inventory.sizes_json
    FROM shopify_variant_mappings AS variant_mappings
    JOIN shopify_product_mappings AS product_mappings
      ON product_mappings.product_id = variant_mappings.product_id
    JOIN inventory ON inventory.id = variant_mappings.product_id
    WHERE variant_mappings.shopify_variant_id = ?
       OR variant_mappings.shopify_variant_id LIKE ?
    LIMIT 1
  `).bind(line.variant_id, `%/${String(line.variant_id).match(/(\d+)$/)?.[1] || "__missing__"}`).first();
  if (!mapping?.product_id) {
    throw new Error("That cart item is no longer mapped for website checkout.");
  }
  let sizes = {};
  try { sizes = JSON.parse(mapping.sizes_json || "{}"); } catch { sizes = {}; }
  const available = Math.max(0, Math.floor(Number(sizes[mapping.size] || 0)));
  if (requestedQuantity > available) throw new Error("The requested quantity is no longer available.");
}

function variantGid(value = "") {
  const raw = String(value || "").trim();
  if (/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(raw)) return raw;
  const numeric = raw.match(/^(\d+)$/)?.[1] || raw.match(/(?:^|\/)(\d+)$/)?.[1] || "";
  return numeric ? `gid://shopify/ProductVariant/${numeric}` : "";
}

function lineInput(variantId, requestedQuantity) {
  const merchandiseId = variantGid(variantId);
  if (!merchandiseId) throw new Error("Website checkout is not mapped for this jersey and size yet.");
  return { merchandiseId, quantity: requestedQuantity };
}

export async function onRequestPost({ request, env }) {
  if (!env?.DB) return json({ error: "Inventory is unavailable." }, 503);
  const configuration = shopifyConfiguration(env);
  if (!configuration.checkout) return json({ error: "Website checkout is not enabled yet. Please use eBay or Depop." }, 409);
  if (!configuration.storefrontConfigured) return json({ error: "Secure checkout is temporarily unavailable." }, 503);
  try {
    const body = await request.json().catch(() => ({}));
    const action = cleanId(body.action, 30).toLowerCase();
    const cartId = cleanId(body.cart_id);
    if (action === "get") {
      if (!cartId) return json({ cart: null });
      return json({ cart: await getCart(env, cartId) });
    }
    if (action === "create" || action === "add" || action === "buy_now") {
      const productId = cleanId(body.product_id, 180);
      const size = normalizeSize(body.size);
      const requestedQuantity = quantity(body.quantity);
      if (!productId || !size) return json({ error: "Choose an available size." }, 400);
      const mapping = await mappedVariant(env, productId, size, requestedQuantity);
      const line = lineInput(mapping.shopify_variant_id, requestedQuantity);
      const cart = await createOrAddCart(env, action, cartId, line, mapping);
      return json({ cart, checkout: action === "buy_now" });
    }
    if (action === "update") {
      const lineId = cleanId(body.line_id);
      if (!cartId || !lineId) return json({ error: "Cart line is required." }, 400);
      const requestedQuantity = Math.max(0, Math.min(25, Math.floor(Number(body.quantity || 0))));
      if (requestedQuantity > 0) {
        const existingCart = await getCart(env, cartId);
        await validateCartLineQuantity(env, existingCart, lineId, requestedQuantity);
      }
      const cart = requestedQuantity === 0
        ? await removeCartLine(env, cartId, lineId)
        : await updateCartLine(env, cartId, lineId, requestedQuantity);
      return json({ cart });
    }
    if (action === "remove") {
      const lineId = cleanId(body.line_id);
      if (!cartId || !lineId) return json({ error: "Cart line is required." }, 400);
      return json({ cart: await removeCartLine(env, cartId, lineId) });
    }
    return json({ error: "Unsupported cart action." }, 400);
  } catch (error) {
    const message = String(error?.message || "Secure checkout is temporarily unavailable.");
    const stale = staleCart(error);
    return json({ error: stale ? "Your saved cart expired. Please add the jersey again." : message, clear_cart: stale }, stale ? 404 : 502);
  }
}
