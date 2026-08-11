import { shopifyGraphql } from "./_shared.js";

const CART_FRAGMENT = `
  fragment JerseysFrmJBCart on Cart {
    id checkoutUrl totalQuantity
    cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    lines(first: 100) {
      nodes {
        id quantity
        cost { totalAmount { amount currencyCode } }
        merchandise {
          ... on ProductVariant {
            id title sku
            product { title }
            image { url altText }
          }
        }
      }
    }
  }
`;

const CART_QUERY = `${CART_FRAGMENT}
  query JerseysFrmJBCart($id: ID!) { cart(id: $id) { ...JerseysFrmJBCart } }
`;
const CART_CREATE = `${CART_FRAGMENT}
  mutation JerseysFrmJBCartCreate($input: CartInput!) {
    cartCreate(input: $input) { cart { ...JerseysFrmJBCart } userErrors { field message code } }
  }
`;
const CART_ADD = `${CART_FRAGMENT}
  mutation JerseysFrmJBCartAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...JerseysFrmJBCart } userErrors { field message code } }
  }
`;
const CART_UPDATE = `${CART_FRAGMENT}
  mutation JerseysFrmJBCartUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...JerseysFrmJBCart } userErrors { field message code } }
  }
`;
const CART_REMOVE = `${CART_FRAGMENT}
  mutation JerseysFrmJBCartRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...JerseysFrmJBCart } userErrors { field message code } }
  }
`;
const CART_ATTRIBUTES_UPDATE = `${CART_FRAGMENT}
  mutation JerseysFrmJBCartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart { ...JerseysFrmJBCart }
      userErrors { field message code }
    }
  }
`;

function userError(payload) {
  const errors = payload?.userErrors || [];
  return errors.length ? errors.map(error => error.message).join("; ") : "";
}
export function publicCart(cart) {
  if (!cart?.id) return null;
  return {
    id: cart.id,
    checkout_url: String(cart.checkoutUrl || ""),
    total_quantity: Number(cart.totalQuantity || 0),
    subtotal: Number(cart.cost?.subtotalAmount?.amount || 0),
    total: Number(cart.cost?.totalAmount?.amount || 0),
    currency: String(cart.cost?.subtotalAmount?.currencyCode || "USD"),
    lines: (cart.lines?.nodes || []).map(line => ({
      id: line.id,
      quantity: Number(line.quantity || 0),
      total: Number(line.cost?.totalAmount?.amount || 0),
      variant_id: line.merchandise?.id || "",
      sku: line.merchandise?.sku || "",
      size: line.merchandise?.title || "",
      title: line.merchandise?.product?.title || "Jersey",
      image: line.merchandise?.image?.url || "",
      image_alt: line.merchandise?.image?.altText || ""
    }))
  };
}

function cartResult(data, key) {
  const payload = data?.[key];
  const error = userError(payload);
  if (error) throw new Error(error);
  if (!payload?.cart?.id) throw new Error("Shopify did not return a cart.");
  return publicCart(payload.cart);
}

export async function getCart(env, cartId, options = {}) {
  const data = await shopifyGraphql(env, "storefront", CART_QUERY, { id: cartId }, options);
  return publicCart(data.cart);
}

export async function createCart(env, line, options = {}) {
  const { cartAttributes = [], ...requestOptions } = options;
  const input = {
    ...(line ? { lines: [line] } : {}),
    ...(cartAttributes.length ? { attributes: cartAttributes } : {})
  };
  const data = await shopifyGraphql(env, "storefront", CART_CREATE, { input }, requestOptions);
  return cartResult(data, "cartCreate");
}

export async function updateCartAttributes(env, cartId, attributes, options = {}) {
  const data = await shopifyGraphql(env, "storefront", CART_ATTRIBUTES_UPDATE, {
    cartId,
    attributes
  }, options);
  return cartResult(data, "cartAttributesUpdate");
}

export async function addCartLine(env, cartId, line, options = {}) {
  const data = await shopifyGraphql(env, "storefront", CART_ADD, { cartId, lines: [line] }, options);
  return cartResult(data, "cartLinesAdd");
}

export async function updateCartLine(env, cartId, lineId, quantity, options = {}) {
  const data = await shopifyGraphql(env, "storefront", CART_UPDATE, {
    cartId,
    lines: [{ id: lineId, quantity }]
  }, options);
  return cartResult(data, "cartLinesUpdate");
}

export async function removeCartLine(env, cartId, lineId, options = {}) {
  const data = await shopifyGraphql(env, "storefront", CART_REMOVE, { cartId, lineIds: [lineId] }, options);
  return cartResult(data, "cartLinesRemove");
}
