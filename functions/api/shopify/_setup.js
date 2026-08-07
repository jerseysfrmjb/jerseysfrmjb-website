import { shopifyConfiguration, shopifyGraphql } from "./_shared.js";

export const SHOPIFY_WEBHOOK_URI = "https://jerseysfrmjb.com/api/shopify/webhooks";
export const REQUIRED_SHOPIFY_SCOPES = [
  "read_products",
  "write_products",
  "read_inventory",
  "write_inventory",
  "read_locations",
  "read_publications",
  "write_publications",
  "read_orders",
  "read_fulfillments"
];
export const REQUIRED_SHOPIFY_WEBHOOK_TOPICS = [
  "ORDERS_CREATE",
  "ORDERS_PAID",
  "ORDERS_CANCELLED",
  "REFUNDS_CREATE",
  "FULFILLMENTS_CREATE",
  "FULFILLMENTS_UPDATE"
];

const CONNECTION_QUERY = `
  query JerseysFrmJBShopifyConnection {
    shop { name myshopifyDomain currencyCode }
    currentAppInstallation { accessScopes { handle } }
  }
`;

const LOCATIONS_QUERY = `
  query JerseysFrmJBLocations {
    locations(first: 25) { nodes { id name isActive fulfillsOnlineOrders } }
  }
`;

const PUBLICATIONS_QUERY = `
  query JerseysFrmJBPublications {
    publications(first: 25) { nodes { id name autoPublish supportsFuturePublishing } }
  }
`;

const WEBHOOKS_QUERY = `
  query JerseysFrmJBWebhookSubscriptions {
    webhookSubscriptions(first: 100) { nodes { id topic uri } }
  }
`;

const CREATE_WEBHOOK_MUTATION = `
  mutation JerseysFrmJBWebhookCreate($topic: WebhookSubscriptionTopic!, $subscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(topic: $topic, webhookSubscription: $subscription) {
      webhookSubscription { id topic uri }
      userErrors { field message }
    }
  }
`;

function safeError(error) {
  return String(error?.message || "Shopify request failed.")
    .replace(/[A-Za-z0-9_-]{28,}/g, "[redacted]")
    .slice(0, 300);
}

async function safeQuery(env, query, key, options = {}) {
  try {
    const data = await shopifyGraphql(env, "admin", query, {}, options);
    return { ok: true, value: data[key] || null, error: "" };
  } catch (error) {
    return { ok: false, value: null, error: safeError(error) };
  }
}

export function recommendShopifyLocation(locations = []) {
  return locations.find(location => location.isActive && location.fulfillsOnlineOrders)
    || locations.find(location => location.isActive)
    || null;
}

export function recommendShopifyPublication(publications = []) {
  return publications.find(publication => /headless/i.test(String(publication.name || "")))
    || publications.find(publication => /online store/i.test(String(publication.name || "")))
    || (publications.length === 1 ? publications[0] : null);
}

export async function inspectShopifySetup(env, options = {}) {
  const configuration = shopifyConfiguration(env);
  if (!configuration.adminConfigured) {
    return {
      connected: false,
      error: "Shopify Admin API credentials are incomplete.",
      required_scopes: REQUIRED_SHOPIFY_SCOPES,
      missing_scopes: REQUIRED_SHOPIFY_SCOPES,
      locations: [],
      publications: [],
      webhooks: []
    };
  }
  const connection = { ok: false, value: null, error: "" };
  let accessScopes = [];
  try {
    const accessData = await shopifyGraphql(env, "admin", CONNECTION_QUERY, {}, options);
    accessScopes = (accessData.currentAppInstallation?.accessScopes || []).map(scope => scope.handle).filter(Boolean);
    connection.value = accessData.shop || null;
    connection.ok = Boolean(accessData.shop);
  } catch (error) {
    connection.ok = false;
    connection.error = safeError(error);
  }
  const [locationsResult, publicationsResult, webhooksResult] = await Promise.all([
    safeQuery(env, LOCATIONS_QUERY, "locations", options),
    safeQuery(env, PUBLICATIONS_QUERY, "publications", options),
    safeQuery(env, WEBHOOKS_QUERY, "webhookSubscriptions", options)
  ]);
  const locations = locationsResult.value?.nodes || [];
  const publications = publicationsResult.value?.nodes || [];
  const webhooks = webhooksResult.value?.nodes || [];
  const configuredTopics = new Set(webhooks
    .filter(item => String(item.uri || "") === SHOPIFY_WEBHOOK_URI)
    .map(item => item.topic));
  const recommendedLocation = recommendShopifyLocation(locations);
  const recommendedPublication = recommendShopifyPublication(publications);
  return {
    connected: connection.ok,
    store: connection.value ? {
      name: connection.value.name,
      domain: connection.value.myshopifyDomain,
      currency: connection.value.currencyCode
    } : null,
    auth_mode: configuration.adminAuthMode,
    required_scopes: REQUIRED_SHOPIFY_SCOPES,
    granted_scopes: accessScopes,
    missing_scopes: REQUIRED_SHOPIFY_SCOPES.filter(scope => !accessScopes.includes(scope)),
    locations,
    recommended_location_id: recommendedLocation?.id || "",
    configured_location_id: String(env.SHOPIFY_LOCATION_ID || "").trim(),
    publications,
    recommended_publication_id: recommendedPublication?.id || "",
    configured_publication_id: String(env.SHOPIFY_PUBLICATION_ID || "").trim(),
    webhooks,
    missing_webhook_topics: REQUIRED_SHOPIFY_WEBHOOK_TOPICS.filter(topic => !configuredTopics.has(topic)),
    checks: {
      connection: connection.ok ? "ok" : connection.error,
      locations: locationsResult.ok ? "ok" : locationsResult.error,
      publications: publicationsResult.ok ? "ok" : publicationsResult.error,
      webhooks: webhooksResult.ok ? "ok" : webhooksResult.error
    }
  };
}

export async function registerShopifyWebhooks(env, options = {}) {
  const existingData = await shopifyGraphql(env, "admin", WEBHOOKS_QUERY, {}, options);
  const existing = existingData.webhookSubscriptions?.nodes || [];
  const byTopicAndUri = new Set(existing.map(item => `${item.topic}:${item.uri}`));
  const results = [];
  for (const topic of REQUIRED_SHOPIFY_WEBHOOK_TOPICS) {
    if (byTopicAndUri.has(`${topic}:${SHOPIFY_WEBHOOK_URI}`)) {
      results.push({ topic, status: "existing" });
      continue;
    }
    const data = await shopifyGraphql(env, "admin", CREATE_WEBHOOK_MUTATION, {
      topic,
      subscription: { uri: SHOPIFY_WEBHOOK_URI, format: "JSON" }
    }, options);
    const payload = data.webhookSubscriptionCreate || {};
    if (payload.userErrors?.length) {
      results.push({ topic, status: "failed", error: safeError(new Error(payload.userErrors.map(item => item.message).join("; "))) });
      continue;
    }
    results.push({ topic, status: "created", id: payload.webhookSubscription?.id || "" });
  }
  return results;
}
