import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const outputDirectory = path.resolve(process.argv[2] || "backups");

if (!accountId || !databaseId || !apiToken) {
  throw new Error("CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_API_TOKEN are required.");
}

await mkdir(outputDirectory, { recursive: true });
const headers = {
  Authorization: `Bearer ${apiToken}`,
  "Content-Type": "application/json"
};
const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}`;

async function cloudflare(pathname, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.errors?.[0]?.message || data.result?.error || `Cloudflare API returned ${response.status}`);
  }
  return data.result;
}

async function wait(milliseconds) {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}

const started = await cloudflare("/export", { output_format: "polling" });
if (!started?.at_bookmark) throw new Error("D1 export did not return a polling bookmark.");

let completed;
for (let attempt = 0; attempt < 30; attempt += 1) {
  const result = await cloudflare("/export", { current_bookmark: started.at_bookmark });
  if (result?.status === "error") throw new Error(result.error || "D1 export failed.");
  const signedUrl = result?.signed_url || result?.result?.signed_url;
  if (signedUrl) {
    completed = { ...result, signed_url: signedUrl };
    break;
  }
  await wait(5000);
}
if (!completed?.signed_url) throw new Error("D1 export did not finish within 150 seconds.");

const dumpResponse = await fetch(completed.signed_url);
if (!dumpResponse.ok) throw new Error(`D1 backup download returned ${dumpResponse.status}.`);
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const sqlPath = path.join(outputDirectory, `jerseysfrmjb-d1-${stamp}.sql`);
await writeFile(sqlPath, new Uint8Array(await dumpResponse.arrayBuffer()));

const queryResult = await cloudflare("/query", {
  sql: `SELECT inventory.id, inventory.name, inventory.category, inventory.quantity,
    inventory.sizes_json, inventory.price AS base_price,
    MAX(CASE WHEN product_platform_prices.platform = 'Website' THEN product_platform_prices.price END) AS website_price,
    MAX(CASE WHEN product_platform_prices.platform = 'Facebook' THEN product_platform_prices.price END) AS facebook_price,
    MAX(CASE WHEN product_platform_prices.platform = 'eBay' THEN product_platform_prices.price END) AS ebay_price,
    MAX(CASE WHEN product_platform_prices.platform = 'Depop' THEN product_platform_prices.price END) AS depop_price,
    inventory.updated_at
  FROM inventory
  LEFT JOIN product_platform_prices ON product_platform_prices.product_id = inventory.id
  GROUP BY inventory.id
  ORDER BY inventory.category, inventory.name`
});
const rows = Array.isArray(queryResult) ? queryResult[0]?.results || [] : queryResult?.results || [];
const columns = [
  "id", "name", "category", "quantity", "sizes_json", "base_price",
  "website_price", "facebook_price", "ebay_price", "depop_price", "updated_at"
];
const csvCell = value => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const csv = [columns.join(","), ...rows.map(row => columns.map(key => csvCell(row[key])).join(","))].join("\r\n");
await writeFile(path.join(outputDirectory, `jerseysfrmjb-inventory-${stamp}.csv`), csv);

console.log(`Created ${sqlPath} and a matching inventory CSV.`);
