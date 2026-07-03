/**
 * Gültenim Butik — mevcut siteden (OpenCart) ürün görsellerini indirir.
 *
 * Ne yapar:
 *  1. Ana sayfadan başlayarak siteyi tarar, ürün sayfalarını bulur
 *     (OpenCart ürün sayfaları "product_id" içerir).
 *  2. Her ürünün görsellerini toplar. Önbellek görseli yerine
 *     ORİJİNAL yüksek çözünürlüklü halini indirmeyi dener:
 *       /image/cache/catalog/X-450x800.jpg  →  /image/catalog/X.jpg
 *     Orijinal yoksa önbellek sürümüne düşer.
 *  3. downloaded-images/<urun-slug>/01.jpg, 02.jpg ... olarak kaydeder.
 *  4. downloaded-images/manifest.json yazar (ürün adı, URL, fiyat, görseller)
 *     — bu dosya daha sonra seed script'ine veri hazırlarken işinize yarar.
 *
 * Kullanım:  npm run download-images
 *
 * Not: Görselleri indirdikten sonra harici bir AI aracıyla (Grok Imagine,
 * Photoroom vb.) stüdyo kalitesine yükseltip admin panelinden yükleyebilirsiniz.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const BASE = "https://www.gultenimbutik.com.tr";
const OUT_DIR = path.resolve(process.cwd(), "downloaded-images");
const MAX_PAGES = 400; // güvenlik sınırı
const DELAY_MS = 250; // sunucuya nazik davran

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Türkçe karakterleri sadeleştirip klasör adı için güvenli slug üretir */
function slugify(text) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u" };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "urun";
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (GultenimButik site migration)" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "";
    if (!type.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Sayfadaki aynı siteye ait tüm linkleri çıkarır */
function extractLinks(html, pageUrl) {
  const links = new Set();
  const re = /href=["']([^"'#]+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1].trim();
    if (/^(mailto:|tel:|javascript:|whatsapp:)/i.test(href)) continue;
    try {
      const u = new URL(href, pageUrl);
      if (u.hostname !== new URL(BASE).hostname) continue;
      // Oturum/sepet/hesap sayfalarını atla
      if (/route=(checkout|account|affiliate)|\/(sepet|hesap|giris|kayit)/i.test(u.href)) continue;
      u.hash = "";
      links.add(u.href);
    } catch {
      /* geçersiz URL — atla */
    }
  }
  return [...links];
}

/** OpenCart ürün sayfası mı? */
function isProductPage(html) {
  return /name=["']product_id["']/i.test(html) || /input[^>]+product_id/i.test(html);
}

function extractTitle(html) {
  const og = html.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    ?? html.match(/content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  if (og) return og[1].trim();
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return h1[1].trim();
  const t = html.match(/<title>([^<]+)<\/title>/i);
  return t ? t[1].trim() : "urun";
}

function extractPrice(html) {
  // "2.800,00TL" / "2.800,00 TL" biçimlerini yakala
  const m = html.match(/([\d.]{1,12},\d{2})\s*TL/);
  if (!m) return null;
  const num = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(num) ? Math.round(num) : null;
}

/**
 * Ürün sayfasındaki görselleri toplar.
 * Önbellek URL'sinden orijinali türetir: /image/cache/catalog/a/b-450x800.jpg → /image/catalog/a/b.jpg
 */
function extractImages(html) {
  const found = new Map(); // originalUrl -> cachedUrl (fallback)
  const re = /["'(]([^"'()]*\/image\/[^"'()]+\.(?:jpe?g|png|webp))["')]/gi;
  let m;
  while ((m = re.exec(html))) {
    let raw = m[1];
    try {
      const u = new URL(raw, BASE);
      raw = u.href;
    } catch {
      continue;
    }
    // Logo, banner, ödeme ikonları gibi katalog dışı görselleri atla
    if (!/\/image\/(cache\/)?catalog\//i.test(raw)) continue;
    if (/logo|banner|slide|payment|kargo|footer/i.test(raw)) continue;

    let original = raw;
    if (/\/image\/cache\/catalog\//i.test(raw)) {
      original = raw
        .replace("/image/cache/catalog/", "/image/catalog/")
        .replace(/-\d+x\d+(\.(?:jpe?g|png|webp))$/i, "$1");
    }
    if (!found.has(original)) found.set(original, raw);
  }
  return found;
}

async function downloadImage(url, filePath) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (GultenimButik site migration)" },
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024) return false; // bozuk/boş dosya
    await writeFile(filePath, buf);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log("Gültenim Butik görsel indirme başlıyor…\n");
  await mkdir(OUT_DIR, { recursive: true });

  const visited = new Set();
  const queue = [BASE + "/"];
  const products = []; // manifest kayıtları

  while (queue.length > 0 && visited.size < MAX_PAGES) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    const html = await fetchHtml(url);
    await sleep(DELAY_MS);
    if (!html) continue;

    // Yeni linkleri kuyruğa ekle
    for (const link of extractLinks(html, url)) {
      if (!visited.has(link) && queue.length + visited.size < MAX_PAGES * 2) {
        queue.push(link);
      }
    }

    if (!isProductPage(html)) continue;

    const title = extractTitle(html);
    const slug = slugify(title);
    const price = extractPrice(html);
    const images = extractImages(html);
    if (images.size === 0) {
      console.log(`⚠ Görsel bulunamadı: ${title} (${url})`);
      continue;
    }

    const dir = path.join(OUT_DIR, slug);
    if (existsSync(dir)) {
      console.log(`↷ Zaten indirilmiş, atlanıyor: ${title}`);
      continue;
    }
    await mkdir(dir, { recursive: true });

    const saved = [];
    let index = 1;
    for (const [original, cached] of images) {
      const ext = (original.match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpg").toLowerCase();
      const fileName = `${String(index).padStart(2, "0")}.${ext}`;
      const filePath = path.join(dir, fileName);

      // Önce orijinal (yüksek çözünürlük), olmazsa önbellek sürümü
      let ok = await downloadImage(original, filePath);
      if (!ok && cached !== original) ok = await downloadImage(cached, filePath);
      if (ok) {
        saved.push(fileName);
        index++;
      }
      await sleep(DELAY_MS);
    }

    if (saved.length > 0) {
      products.push({ name: title, url, slug, price, images: saved });
      console.log(`✓ ${title} — ${saved.length} görsel indirildi${price ? ` (${price} TL)` : ""}`);
    }
  }

  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify({ downloadedAt: new Date().toISOString(), products }, null, 2),
    "utf8"
  );

  console.log(`\nBitti: ${products.length} ürün, klasör: ${OUT_DIR}`);
  console.log("manifest.json seed verisi hazırlarken kullanılabilir.");
}

main().catch((err) => {
  console.error("Beklenmeyen hata:", err);
  process.exit(1);
});
