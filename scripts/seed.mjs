/**
 * Gültenim Butik — Firestore/Storage toplu veri yükleme (seed).
 *
 * İKİ AŞAMALI KULLANIM:
 *
 *  1) Şablon üret:      node scripts/seed.mjs init
 *     downloaded-images/manifest.json'dan seed-data/products.json şablonu ve
 *     seed-data/categories.json oluşturur. Şablonu açıp her ürünün
 *     kategorisini, renklerini, bedenlerini ve açıklamasını doldurun.
 *     (Görselleri AI ile iyileştirdiyseniz, klasördeki dosyaların üzerine
 *     aynı adla kaydetmeniz yeterli — script klasördeki güncel halleri yükler.)
 *
 *  2) Yükle:            node scripts/seed.mjs
 *     Kategorileri, ürünleri (görselleri Storage'a yükleyerek), varsa
 *     yorum ve lookbook verilerini Firestore'a yazar. Var olan slug'ları
 *     atlar — script defalarca güvenle çalıştırılabilir.
 *
 * Gereksinim: .env.local içinde FIREBASE_SERVICE_ACCOUNT_KEY (bkz. .env.example)
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const ROOT = process.cwd();
const SEED_DIR = path.join(ROOT, "seed-data");
const IMAGES_DIR = path.join(ROOT, "downloaded-images");
const BUCKET = "gultenimbutik.firebasestorage.app";

// ── .env.local'dan service account anahtarını oku (harici bağımlılık yok) ──
async function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  const content = await readFile(envPath, "utf8");
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

function slugify(text) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u" };
  return text.split("").map((ch) => map[ch] ?? ch).join("").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Ürün adından kategori tahmini — şablonu doldurmayı kolaylaştırır */
function guessCategory(name) {
  const n = name.toLocaleLowerCase("tr-TR");
  if (n.includes("elbise")) return "elbise";
  if (n.includes("abaya")) return "abaya";
  if (n.includes("takım") || n.includes("takim")) return "takim";
  if (n.includes("tunik")) return "tunik";
  if (n.includes("triko") || n.includes("kazak") || n.includes("hırka")) return "triko";
  if (n.includes("kap") || n.includes("ferace") || n.includes("pardösü")) return "dis-giyim";
  return "elbise";
}

const DEFAULT_CATEGORIES = [
  { name: "Elbise", slug: "elbise", order: 1, description: "Zarif tesettür elbise modelleri" },
  { name: "Takım", slug: "takim", order: 2, description: "Şık ikili takım kombinleri" },
  { name: "Tunik", slug: "tunik", order: 3, description: "Günlük ve özel gün tunikleri" },
  { name: "Dış Giyim", slug: "dis-giyim", order: 4, description: "Kap, ferace ve pardösüler" },
  { name: "Triko", slug: "triko", order: 5, description: "Kazak, hırka ve triko elbiseler" },
  { name: "Abaya", slug: "abaya", order: 6, description: "Abaya ve abaya takımları" },
];

// ── 1. AŞAMA: şablon üretimi ──────────────────────────────────────────
async function init() {
  await mkdir(SEED_DIR, { recursive: true });

  const manifestPath = path.join(IMAGES_DIR, "manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("downloaded-images/manifest.json bulunamadı. Önce: npm run download-images");
    process.exit(1);
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  const products = manifest.products.map((p) => ({
    name: p.name,
    slug: p.slug,
    categorySlug: guessCategory(p.name),
    brand: /invee|i̇nvee/i.test(p.name) ? "İnvee" : "Selvi Çetin",
    price: p.price ?? 0,
    colors: [],
    sizes: ["36", "38", "40", "42", "44"],
    imagesFolder: p.slug, // downloaded-images/<klasör>
    description: "",
    fabricCare: "",
    isNew: true,
    isPopular: false,
    isActive: true,
  }));

  await writeFile(
    path.join(SEED_DIR, "products.json"),
    JSON.stringify(products, null, 2),
    "utf8"
  );
  await writeFile(
    path.join(SEED_DIR, "categories.json"),
    JSON.stringify(DEFAULT_CATEGORIES, null, 2),
    "utf8"
  );
  await writeFile(
    path.join(SEED_DIR, "testimonials.json"),
    JSON.stringify(
      [
        { name: "Ayşe K.", quote: "Elbise fotoğraftakinden de güzel çıktı. İlgi ve alaka için teşekkürler.", rating: 5, order: 1, isActive: true },
        { name: "Fatma D.", quote: "WhatsApp'tan yazdım, beden konusunda çok yardımcı oldular. Kalite harika.", rating: 5, order: 2, isActive: true },
      ],
      null,
      2
    ),
    "utf8"
  );

  console.log("✓ seed-data/products.json oluşturuldu — kategori/renk/açıklamaları doldurun.");
  console.log("✓ seed-data/categories.json oluşturuldu — dilerseniz düzenleyin.");
  console.log("✓ seed-data/testimonials.json örnek olarak oluşturuldu — GERÇEK yorumlarla değiştirin.");
  console.log("\nSonra çalıştırın: node scripts/seed.mjs");
}

// ── 2. AŞAMA: yükleme ─────────────────────────────────────────────────
async function seed() {
  await loadEnv();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error("FIREBASE_SERVICE_ACCOUNT_KEY bulunamadı. .env.example'daki adımları izleyin.");
    process.exit(1);
  }
  const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
  initializeApp({ credential: cert(JSON.parse(json)), storageBucket: BUCKET });
  const db = getFirestore();
  const bucket = getStorage().bucket();

  /** Yerel dosyayı Storage'a yükler, kalıcı indirme URL'si döndürür */
  async function uploadFile(localPath, destPath) {
    const token = crypto.randomUUID();
    await bucket.upload(localPath, {
      destination: destPath,
      metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    });
    return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(destPath)}?alt=media&token=${token}`;
  }

  // Kategoriler
  const catFile = path.join(SEED_DIR, "categories.json");
  const categories = existsSync(catFile)
    ? JSON.parse(await readFile(catFile, "utf8"))
    : DEFAULT_CATEGORIES;

  const catIds = {}; // slug -> doc id
  for (const cat of categories) {
    const snap = await db.collection("categories").where("slug", "==", cat.slug).limit(1).get();
    if (!snap.empty) {
      catIds[cat.slug] = snap.docs[0].id;
      console.log(`↷ Kategori zaten var: ${cat.name}`);
      continue;
    }
    const ref = await db.collection("categories").add({ imageUrl: "", ...cat });
    catIds[cat.slug] = ref.id;
    console.log(`✓ Kategori eklendi: ${cat.name}`);
  }

  // Ürünler
  const prodFile = path.join(SEED_DIR, "products.json");
  if (!existsSync(prodFile)) {
    console.error("seed-data/products.json yok. Önce: node scripts/seed.mjs init");
    process.exit(1);
  }
  const products = JSON.parse(await readFile(prodFile, "utf8"));

  for (const p of products) {
    const slug = p.slug || slugify(p.name);
    const existing = await db.collection("products").where("slug", "==", slug).limit(1).get();
    if (!existing.empty) {
      console.log(`↷ Ürün zaten var, atlanıyor: ${p.name}`);
      continue;
    }
    if (!catIds[p.categorySlug]) {
      console.warn(`⚠ "${p.name}" atlandı — bilinmeyen kategori: ${p.categorySlug}`);
      continue;
    }
    if (!p.price || p.price <= 0) {
      console.warn(`⚠ "${p.name}" atlandı — fiyat girilmemiş (products.json'da doldurun)`);
      continue;
    }

    // Görselleri yükle
    const folder = path.join(IMAGES_DIR, p.imagesFolder ?? slug);
    let imageUrls = [];
    if (existsSync(folder)) {
      const files = (await readdir(folder))
        .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
        .sort();
      for (const file of files) {
        const url = await uploadFile(path.join(folder, file), `products/${slug}/${file}`);
        imageUrls.push(url);
        process.stdout.write(".");
      }
    }
    if (imageUrls.length === 0) {
      console.warn(`\n⚠ "${p.name}" atlandı — görsel bulunamadı: ${folder}`);
      continue;
    }

    await db.collection("products").add({
      name: p.name,
      slug,
      categoryId: catIds[p.categorySlug],
      categorySlug: p.categorySlug,
      brand: p.brand ?? "Selvi Çetin",
      price: Math.round(p.price),
      ...(p.oldPrice ? { oldPrice: Math.round(p.oldPrice) } : {}),
      colors: p.colors ?? [],
      sizes: p.sizes ?? [],
      images: imageUrls,
      description: p.description ?? "",
      ...(p.fabricCare ? { fabricCare: p.fabricCare } : {}),
      isNew: p.isNew ?? true,
      isPopular: p.isPopular ?? false,
      isActive: p.isActive ?? true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`\n✓ Ürün eklendi: ${p.name} (${imageUrls.length} görsel)`);
  }

  // Yorumlar (opsiyonel)
  const testFile = path.join(SEED_DIR, "testimonials.json");
  if (existsSync(testFile)) {
    const testimonials = JSON.parse(await readFile(testFile, "utf8"));
    const existing = await db.collection("testimonials").limit(1).get();
    if (existing.empty) {
      for (const t of testimonials) await db.collection("testimonials").add(t);
      console.log(`✓ ${testimonials.length} yorum eklendi`);
    } else {
      console.log("↷ Yorumlar zaten var, atlanıyor");
    }
  }

  // Lookbook (opsiyonel)
  const lookFile = path.join(SEED_DIR, "lookbook.json");
  if (existsSync(lookFile)) {
    const items = JSON.parse(await readFile(lookFile, "utf8"));
    const existing = await db.collection("lookbook").limit(1).get();
    if (existing.empty) {
      for (const item of items) {
        let imageUrl = item.imageUrl ?? "";
        if (item.imageFile) {
          const local = path.join(IMAGES_DIR, item.imageFile);
          if (existsSync(local)) {
            imageUrl = await uploadFile(local, `lookbook/${path.basename(item.imageFile)}`);
          }
        }
        await db.collection("lookbook").add({
          imageUrl,
          caption: item.caption ?? "",
          order: item.order ?? 1,
          isActive: item.isActive ?? true,
        });
      }
      console.log(`✓ ${items.length} lookbook görseli eklendi`);
    } else {
      console.log("↷ Lookbook zaten var, atlanıyor");
    }
  }

  console.log("\nSeed tamamlandı. Siteyi açıp kontrol edin — vitrine yansıması birkaç dakika sürebilir (ISR).");
}

const mode = process.argv[2];
(mode === "init" ? init() : seed()).catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
