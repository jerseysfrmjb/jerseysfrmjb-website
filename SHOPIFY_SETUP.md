# Shopify testing setup

The integration stays disabled for customers until both feature flags are deliberately changed. During setup keep:

```text
SHOPIFY_SYNC_ENABLED=false
SHOPIFY_CHECKOUT_ENABLED=false
```

## 1. Dev Dashboard app credentials

Use a Shopify Dev Dashboard app owned by the same organization that owns the store.

1. Open the Shopify Dev Dashboard and select the JerseysFrmJB app.
2. Create and release an app version with Admin API version `2026-07`.
3. Grant only these Admin API scopes:
   - `read_products`
   - `write_products`
   - `read_inventory`
   - `write_inventory`
   - `read_locations`
   - `read_publications`
   - `write_publications`
   - `read_orders`
   - `read_fulfillments`
4. Install or update the app on the JerseysFrmJB store and approve the requested access.
5. In the app's **Settings**, copy the **Client ID** and **Client secret**.
6. Never paste the client secret into chat, source code, a commit, or a build log.

The website exchanges the client credentials for short-lived Admin API tokens automatically. A permanent Admin token is not required for this Dev Dashboard flow.

## 2. Storefront API token

1. In Shopify Admin, open **Sales channels** and install/open **Headless**.
2. Create a storefront for JerseysFrmJB.
3. Under Storefront API access, enable product listing and inventory read access needed by the cart.
4. Create/copy the public Storefront API access token.
5. Treat the token as a Cloudflare secret even though Shopify calls it a public Storefront token.

## 3. Cloudflare production variables

Open **Workers & Pages → jerseysfrmjb-website → Settings → Variables and Secrets → Production**.

Add these as **Text**:

```text
SHOPIFY_STORE_DOMAIN=<permanent-store-name>.myshopify.com
SHOPIFY_API_VERSION=2026-07
SHOPIFY_CLIENT_ID=<client ID>
SHOPIFY_LOCATION_ID=<selected gid://shopify/Location/... value>
SHOPIFY_PUBLICATION_ID=<selected gid://shopify/Publication/... value>
SHOPIFY_SYNC_ENABLED=false
SHOPIFY_CHECKOUT_ENABLED=false
```

Add these as **Secret**:

```text
SHOPIFY_CLIENT_SECRET=<client secret>
SHOPIFY_STOREFRONT_ACCESS_TOKEN=<Storefront API token>
```

`SHOPIFY_WEBHOOK_SECRET` can be omitted: Shopify signs app webhooks with the app client secret, which the integration uses automatically. `SHOPIFY_ADMIN_ACCESS_TOKEN` should remain unset for a Dev Dashboard app.

Redeploy the latest production deployment after changing variables.

## 4. Production D1 migration

Confirmed target: D1 database `jerseysfrmjb_inventory`, bound to the Pages Functions environment as `DB`.

From an authenticated Cloudflare Wrangler session in the repository root, run exactly:

```powershell
npx wrangler d1 execute jerseysfrmjb_inventory --remote --file=migrations/0016_shopify_checkout.sql
npx wrangler d1 execute jerseysfrmjb_inventory --remote --file=migrations/0017_conversion_funnel.sql
```

These migrations add Shopify mapping, sync, webhook, order, refund, and privacy-safe conversion-event fields. They do not enable syncing or checkout and do not change existing inventory quantities.

## 5. Connection, IDs, and webhooks

1. Sign in to the website admin and open **Shopify**.
2. Click **Check Connection**.
3. Confirm the store name, granted scopes, active fulfillment location, publication, and webhook status.
4. Copy the recommended location and publication GIDs into the Cloudflare Text variables above, then redeploy.
5. Click **Register Webhooks** once. The action only creates missing topic/URL pairs and leaves existing matching subscriptions unchanged.
6. Click **Check Connection** again and confirm that no required webhook topic is missing.

Required webhook topics:

- Orders create
- Orders paid
- Orders cancelled
- Refunds create
- Fulfillments create
- Fulfillments update

All point to `https://jerseysfrmjb.com/api/shopify/webhooks`. The endpoint validates the HMAC against the raw request body before parsing JSON and uses Shopify's delivery ID plus database uniqueness to prevent duplicate processing.

## 6. Three-product pilot dry run

1. Keep both feature flags off.
2. In Admin → Shopify, click **Use Suggested 3**.
3. Click **Preview Selected**.
4. Expand **View exact Shopify request** for every product.
5. Review title, description, vendor, category/tags, images, stable SKU, size variants, website/base fallback price, inventory quantities, location GID, permanent product URL, and publication GID.

Dry run writes only an internal preview record. It does not create or update a Shopify product. Do not use **Sync Selected** until the migration, connection audit, IDs, and previews all pass and `SHOPIFY_SYNC_ENABLED` is deliberately enabled for the pilot.

## 7. Shopify Admin checklist before a test order

- Payments account and business verification completed by the store owner.
- Shipping profile covers the intended test destination and rates appear at checkout.
- Three-day return policy is published and linked.
- Store currency is USD.
- Active fulfillment location has the correct address and fulfills online orders.
- Headless publication/storefront is active.
- Taxes and duties are reviewed for the intended selling regions.
- Customer contact email, sender email, and order notification templates are correct.
- A test payment method is available (Shopify Payments test mode or Shopify Bogus Gateway) before the test order.
- Only the three pilot products are synced and published for the test.
- Test orders, refunds, cancellations, and fulfillments are checked in both Shopify and the website admin.

Customer checkout remains unavailable until `SHOPIFY_CHECKOUT_ENABLED=true` is explicitly approved and deployed.
