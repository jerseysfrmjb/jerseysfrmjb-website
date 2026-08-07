import { adminConfigError, isAuthorized, unauthorized } from "../_auth.js";
import { json, shopifyConfiguration } from "../../shopify/_shared.js";
import { inspectShopifySetup, registerShopifyWebhooks } from "../../shopify/_setup.js";

export async function onRequestGet({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  try {
    return json(await inspectShopifySetup(env));
  } catch (error) {
    return json({ error: `Shopify connection check failed: ${error?.message || "Unknown error"}` }, 502);
  }
}

export async function onRequestPost({ request, env }) {
  const configError = adminConfigError(env, { requireDb: true });
  if (configError) return configError;
  if (!(await isAuthorized(request, env))) return unauthorized();
  const body = await request.json().catch(() => ({}));
  if (body.action !== "register_webhooks" || body.confirm !== true) {
    return json({ error: "Explicit webhook registration confirmation is required." }, 400);
  }
  const configuration = shopifyConfiguration(env);
  if (!configuration.adminConfigured || !configuration.webhookConfigured) {
    return json({ error: "Shopify Admin credentials and the webhook signing secret must be configured first." }, 503);
  }
  try {
    const registrations = await registerShopifyWebhooks(env);
    const setup = await inspectShopifySetup(env);
    return json({ registrations, setup });
  } catch (error) {
    return json({ error: `Shopify webhook registration failed: ${error?.message || "Unknown error"}` }, 502);
  }
}
