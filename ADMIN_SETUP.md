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
