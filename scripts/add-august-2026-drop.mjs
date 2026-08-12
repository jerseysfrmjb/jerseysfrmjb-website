import { readFile, writeFile } from "node:fs/promises";

const inventoryPath = new URL("../data/inventory.json", import.meta.url);
const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
const links = {
  depop: "https://www.depop.com/jerseysfrmjb/",
  ebay: "https://www.ebay.com/usr/jerseysfrmjb"
};

const products = [
  ["club-real-madrid-bellingham-away-2627", "club", "Jude Bellingham #5 | Real Madrid 26/27 Away Kit", 40, 340, "club-real-madrid-bellingham-away-2627", "Jude Bellingham Real Madrid 26/27 away jersey"],
  ["club-psg-dembele-home-2627", "club", "Ousmane Dembele #10 | PSG 26/27 Home Kit", 40, 350, "club-psg-dembele-home-2627", "Ousmane Dembele PSG 26/27 home jersey"],
  ["club-arsenal-saka-home-2627", "club", "Bukayo Saka #7 | Arsenal 26/27 Home Kit", 40, 360, "club-arsenal-saka-home-2627", "Bukayo Saka Arsenal 26/27 home jersey"],
  ["retro-england-beckham-home-9901", "retro", "David Beckham #7 | England 1999-2001 Home", 50, 370, "retro-england-beckham-home-9901", "David Beckham England 1999-2001 home jersey"],
  ["retro-barcelona-cactus-jack", "retro", "Barcelona x Cactus Jack Jersey", 50, 380, "retro-barcelona-cactus-jack", "Barcelona x Cactus Jack jersey"],
  ["retro-brazil-ronaldo-home-1998", "retro", "Ronaldo #9 | Brazil 1998 Home", 50, 390, "retro-brazil-ronaldo-home-1998", "Ronaldo Brazil 1998 home jersey"],
  ["retro-juventus-pogba-pink-1516", "retro", "Paul Pogba #10 | Juventus 2015/16 Pink", 50, 400, "retro-juventus-pogba-pink-1516", "Paul Pogba Juventus 2015/16 pink jersey"],
  ["retro-france-zidane-home-2006", "retro", "Zinedine Zidane #10 | France 2006 Home", 50, 410, "retro-france-zidane-home-2006", "Zinedine Zidane France 2006 home jersey"],
  ["retro-brazil-ronaldinho-home-2002", "retro", "Ronaldinho #11 | Brazil 2002 Home", 50, 420, "retro-brazil-ronaldinho-home-2002", "Ronaldinho Brazil 2002 home jersey"],
  ["retro-chelsea-hazard-home-1415", "retro", "Eden Hazard #10 | Chelsea 2014/15 Home", 50, 430, "retro-chelsea-hazard-home-1415", "Eden Hazard Chelsea 2014/15 home jersey"],
  ["retro-arsenal-henry-home-0506", "retro", "Thierry Henry #14 | Arsenal 2005/06 Home", 50, 440, "retro-arsenal-henry-home-0506", "Thierry Henry Arsenal 2005/06 home jersey"],
  ["retro-ac-milan-kaka-home-0607-long", "retro", "Kaka #22 | AC Milan 2006/07 Home Long Sleeve", 55, 450, "retro-ac-milan-kaka-home-0607", "Kaka AC Milan 2006/07 home long sleeve jersey"]
].map(([id, category, name, price, sort_order, photoStem, alt]) => ({
  sort_order,
  id,
  photos: [
    { src: `assets/inventory/${photoStem}-front.jpg`, alt: `${alt} front` },
    { src: `assets/inventory/${photoStem}-back.jpg`, alt: `${alt} back` }
  ],
  size: "M",
  sizes: { M: 2 },
  price,
  category,
  name,
  quantity: 2,
  links,
  featured: false,
  featured_order: 0,
  new_arrival: true,
  date_added: "2026-08-12"
}));

const existingIds = new Set(inventory.items.map(item => item.id));
for (const product of products) {
  if (!existingIds.has(product.id)) inventory.items.push(product);
}

for (const id of ["world-portugal-ronaldo-home", "retro-ronaldo-united-short-0708"]) {
  const product = inventory.items.find(item => item.id === id);
  if (!product) throw new Error(`Missing existing Ronaldo product: ${id}`);
  if (product.date_added !== "2026-08-12") {
    product.size = "M";
    product.sizes = { ...(product.sizes || {}), M: 2 };
    product.quantity = Object.values(product.sizes).reduce((sum, quantity) => sum + Number(quantity || 0), 0);
    product.new_arrival = true;
    product.date_added = "2026-08-12";
  }
}

inventory.items.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0) || a.name.localeCompare(b.name));
await writeFile(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
