# Inventory Admin Setup

This site now supports a Cloudflare D1-backed inventory admin page at `/admin.html`.

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

## How it works

- Quantity `0` means sold out.
- Quantity above `0` means in stock.
- Sold-out jerseys show an Out of Stock badge, hide the active purchase button, and move below available jerseys.
- Available jerseys move above sold-out jerseys automatically.
- The public shop pages use filters for All, Available, Sold Out, and Size.
