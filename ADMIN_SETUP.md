# Inventory Admin Setup

This site now supports a Cloudflare D1-backed inventory admin page at `/admin.html`.

## Google Analytics 4

The public site uses the JerseysFrmJB web stream `G-P42JD6TLP3`. The optional
Cloudflare Pages Text variable `GA4_MEASUREMENT_ID` can override that ID in
Production or Preview later. The private D1 analytics dashboard works
independently of GA4.

## Storage

Inventory is stored in Cloudflare D1 using the `inventory` table from `schema.sql`.
The local file `data/inventory.json` is only a preview/seed fallback. Live admin changes should be saved in D1, so redeploying the site will not erase stock updates.

## Cloudflare setup

1. In Cloudflare, create a D1 database, for example `jerseysfrmjb_inventory`.
2. Run `schema.sql` on the database.
3. Run `seed-inventory.sql` once to load the current jerseys. It uses `INSERT OR IGNORE`, so it will not overwrite later admin edits.
4. In the Cloudflare Pages project settings, add a D1 binding:
   - Binding name: `DB`
   - Database: your inventory database
5. Add environment variables in Cloudflare Pages:
   - `ADMIN_PASSWORD`: the password you want for `/admin.html`
   - `ADMIN_SESSION_SECRET`: any long random phrase, different from the password
6. Redeploy the site.

## Weekly D1 backups

The repository includes a weekly GitHub Actions workflow that exports:

- A full D1 SQL backup.
- A private inventory CSV with exact quantities and platform prices.

Add these repository secrets under **GitHub → Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`
- `CLOUDFLARE_API_TOKEN`

Create the API token with permission to read and export the JerseysFrmJB D1
database. After adding the secrets, open **GitHub → Actions → Weekly D1 backup**
and run it once manually. Successful backup artifacts are retained for 30 days.
Cloudflare D1 Time Travel remains a separate recovery option.

The admin **Operations** section also provides an on-demand inventory CSV,
recent admin activity, and recent API errors. API errors use the existing
`DISCORD_WEBHOOK_URL` secret for deduplicated alerts.

## How it works

- Quantity `0` means sold out.
- Quantity above `0` means in stock.
- Sold-out jerseys show an Out of Stock badge, hide the active purchase button, and move below available jerseys.
- Available jerseys move above sold-out jerseys automatically.
- The public shop pages use filters for All, Available, Sold Out, and Size.

## Shopify checkout pilot

Shopify is an optional checkout and order backend. The custom website and D1
inventory remain in place. Both feature flags default to off when omitted.

Add these variables in Cloudflare Pages for Production and Preview as needed:

- `SHOPIFY_STORE_DOMAIN` — the permanent `your-store.myshopify.com` domain, not a storefront URL.
- `SHOPIFY_ADMIN_ACCESS_TOKEN` — secret; used only by authenticated admin sync endpoints.
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` — secret; used only by the server-side cart endpoint.
- `SHOPIFY_WEBHOOK_SECRET` — secret shown when configuring Shopify webhooks.
- `SHOPIFY_API_VERSION` — optional; defaults to `2026-07`.
- `SHOPIFY_LOCATION_ID` — optional Admin GraphQL location GID. The sync discovers the first active location when omitted.
- `SHOPIFY_PUBLICATION_ID` — recommended Storefront/Headless publication GID. The sync auto-detects only when there is one unambiguous publication.
- `SHOPIFY_SYNC_ENABLED` — set to `true` only after reviewing a dry-run preview.
- `SHOPIFY_CHECKOUT_ENABLED` — set to `true` only during the selected-product pilot.

Never place access tokens in browser JavaScript, HTML, Git, screenshots, or
logs. The admin UI reports only whether each credential is configured.

Run migration `0016_shopify_checkout.sql`, then use **Admin → Shopify**:

1. Select the suggested three pilot jerseys (one single-size, one multi-size,
   and one low-stock product).
2. Enable **Pilot checkout** only for those products.
3. Run **Preview Selected** while the sync flag remains off.
4. Confirm titles, Website/base fallback prices, images, SKUs, size variants,
   and inventory.
5. Turn on `SHOPIFY_SYNC_ENABLED`, sync those selected products, and inspect the
   resulting Shopify products. Pilot products are published only to the chosen
   Storefront publication; non-pilot products remain drafts.
6. Complete a Shopify test-mode checkout before turning on
   `SHOPIFY_CHECKOUT_ENABLED`.

Stable SKUs use `JFB-<D1-product-id>-<size>`. D1 sends product and size-level
inventory changes to Shopify. Paid-order webhooks map the Shopify variant back
to the same D1 product and size, record a Website sale, and decrement D1 once.
Marketplace sales continue to reduce D1 through the existing sales workflow;
the next Shopify sync sends that lower size-level quantity to Shopify.

Configure Shopify webhook delivery to:

`https://jerseysfrmjb.com/api/shopify/webhooks`

Subscribe to paid orders, cancellations, refunds, and fulfillment updates.
The receiver verifies the raw-body HMAC, stores only a sanitized order summary
(no name, email, address, or payment information), and deduplicates events.
