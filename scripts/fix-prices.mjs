/**
 * Eski sitenin ana sayfasındaki fiyatları çekip seed-data/products.json'a işler.
 * (Ürün detay sayfalarında fiyat bulunmadığı için liste sayfasından eşleştirilir.)
 * Kullanım: node scripts/fix-prices.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SEED = path.join(process.cwd(), "seed-data", "products.json");
const PAGES = ["https://www.gultenimbutik.com.tr/"];

const priceMap = new Map(); // urlPath -> fiyat (tam TL)

for (const page of PAGES) {
  const html = await (await fetch(page, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  // <a href="URL">AD</a></h4> ... <p class="price"> 7.000,00TL </p>
  const re = /<a href="(https:\/\/www\.gultenimbutik\.com\.tr\/[^"]+)">[^<]*<\/a><\/h4>\s*<p class="price">\s*([\d.]+),\d{2}\s*TL/g;
  for (const m of html.matchAll(re)) {
    const urlPath = decodeURIComponent(new URL(m[1]).pathname);
    const price = Math.round(Number(m[2].replace(/\./g, "")));
    if (price > 0) priceMap.set(urlPath, price);
  }
}
console.log(`Sitede fiyatı bulunan ürün: ${priceMap.size}`);

const manifest = JSON.parse(
  await readFile(path.join(process.cwd(), "downloaded-images", "manifest.json"), "utf8")
);
// manifest: slug -> url path eşlemesi
const slugToPath = new Map(
  manifest.products.map((p) => [p.slug, decodeURIComponent(new URL(p.url).pathname)])
);

const products = JSON.parse(await readFile(SEED, "utf8"));
let updated = 0;
for (const p of products) {
  if (p.price > 0) continue; // elle girilmişse dokunma
  const urlPath = slugToPath.get(p.imagesFolder ?? p.slug);
  const price = urlPath ? priceMap.get(urlPath) : undefined;
  if (price) {
    p.price = price;
    updated++;
    console.log(`✓ ${p.name} → ${price} TL`);
  } else {
    console.log(`⚠ Fiyat bulunamadı: ${p.name} (admin panelinden girebilirsiniz)`);
  }
}

await writeFile(SEED, JSON.stringify(products, null, 2), "utf8");
console.log(`\n${updated} ürünün fiyatı güncellendi → seed-data/products.json`);
