const MARKETPLACE_LINKS = {
  depop: "https://www.depop.com/jerseysfrmjb/",
  ebay: "https://www.ebay.com/usr/jerseysfrmjb"
};

const KIDS_KIT = (id, name, photos, quantity, sortOrder, platformPrices = { Depop: 40, eBay: 45 }) => ({
  id,
  category: "kids",
  name,
  size: "24",
  sizes: { "24": quantity },
  price: 40,
  platform_prices: platformPrices,
  quantity,
  photos: photos.map(([src, alt]) => ({ src, alt })),
  links: MARKETPLACE_LINKS,
  featured: false,
  featured_order: 0,
  new_arrival: true,
  date_added: "2026-09-12",
  sort_order: sortOrder
});

export const kidsKitInventory = [
  KIDS_KIT(
    "kids-manchester-united-home-blank-2627",
    "No Name/No Number | Manchester United Home Kit (Kids)",
    [
      ["assets/inventory/kids-manchester-united-home-blank-front.jpg", "Manchester United kids home kit front"],
      ["assets/inventory/kids-manchester-united-home-blank-back.jpg", "Manchester United kids home kit back"]
    ],
    2,
    600
  ),
  KIDS_KIT(
    "kids-barcelona-yamal-home-2627",
    "Lamine Yamal #10 | Barcelona Home Kit (Kids)",
    [
      ["assets/inventory/kids-barcelona-yamal-10-front.jpg", "Lamine Yamal Barcelona kids home kit front"],
      ["assets/inventory/kids-barcelona-yamal-10-back.jpg", "Lamine Yamal Barcelona kids home kit back"]
    ],
    2,
    610
  ),
  KIDS_KIT(
    "kids-barcelona-kobe-bryant-blank",
    "No Name/No Number | Barcelona x Kobe Bryant Kit (Kids)",
    [
      ["assets/inventory/kids-barcelona-kobe-bryant-blank-front.jpg", "Barcelona x Kobe Bryant kids kit front"],
      ["assets/inventory/kids-barcelona-kobe-bryant-blank-back.jpg", "Barcelona x Kobe Bryant kids kit back"]
    ],
    2,
    620
  ),
  KIDS_KIT(
    "kids-real-madrid-pink-blank",
    "No Name/No Number | Real Madrid Pink/Red Kit (Kids)",
    [
      ["assets/inventory/kids-real-madrid-pink-blank-front.jpg", "Real Madrid pink and red kids kit front"],
      ["assets/inventory/kids-real-madrid-pink-blank-back.jpg", "Real Madrid pink and red kids kit back"]
    ],
    2,
    630
  ),
  KIDS_KIT(
    "kids-arsenal-saka-home-2627",
    "Bukayo Saka #7 | Arsenal Home Kit (Kids)",
    [
      ["assets/inventory/kids-arsenal-saka-7-front.jpg", "Bukayo Saka Arsenal kids home kit front"],
      ["assets/inventory/kids-arsenal-saka-7-back.jpg", "Bukayo Saka Arsenal kids home kit back"]
    ],
    1,
    640
  ),
  KIDS_KIT(
    "kids-liverpool-home-blank-2627",
    "No Name/No Number | Liverpool Home Kit (Kids)",
    [
      ["assets/inventory/kids-liverpool-home-blank-front.jpg", "Liverpool kids home kit front"],
      ["assets/inventory/kids-liverpool-home-blank-back.jpg", "Liverpool kids home kit back"]
    ],
    1,
    650
  )
];

export const adultSeptemberInventory = [
  {
    id: "club-liverpool-barcola-29",
    category: "club",
    name: "B. Barcola #29 | Liverpool Home Jersey",
    size: "M",
    sizes: { M: 1 },
    price: 55,
    platform_prices: { Depop: 50, eBay: 55 },
    quantity: 1,
    photos: [
      { src: "assets/inventory/club-liverpool-barcola-29-front.jpg", alt: "B. Barcola Liverpool men's jersey front" },
      { src: "assets/inventory/club-liverpool-barcola-29-back.jpg", alt: "B. Barcola Liverpool men's jersey back" }
    ],
    links: MARKETPLACE_LINKS,
    featured: false,
    featured_order: 0,
    new_arrival: true,
    date_added: "2026-09-12",
    sort_order: 660
  },
  {
    id: "club-manchester-united-baleba-20",
    category: "club",
    name: "Carlos Baleba #20 | Manchester United Home Jersey",
    size: "M",
    sizes: { M: 1 },
    price: 55,
    platform_prices: { Depop: 50, eBay: 55 },
    quantity: 1,
    photos: [
      { src: "assets/inventory/club-manchester-united-baleba-20-front.jpg", alt: "Carlos Baleba Manchester United men's jersey front" },
      { src: "assets/inventory/club-manchester-united-baleba-20-back.jpg", alt: "Carlos Baleba Manchester United men's jersey back" }
    ],
    links: MARKETPLACE_LINKS,
    featured: false,
    featured_order: 0,
    new_arrival: true,
    date_added: "2026-09-12",
    sort_order: 670
  },
  {
    id: "club-manchester-city-enzo-17",
    category: "club",
    name: "Enzo #17 | Manchester City Home Jersey",
    size: "M",
    sizes: { M: 1 },
    price: 55,
    platform_prices: { Depop: 50, eBay: 55 },
    quantity: 1,
    photos: [
      { src: "assets/inventory/club-manchester-city-enzo-17-front.jpg", alt: "Enzo Manchester City men's jersey front" },
      { src: "assets/inventory/club-manchester-city-enzo-17-back.jpg", alt: "Enzo Manchester City men's jersey back" }
    ],
    links: MARKETPLACE_LINKS,
    featured: false,
    featured_order: 0,
    new_arrival: true,
    date_added: "2026-09-12",
    sort_order: 680
  }
];


