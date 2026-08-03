/**
 * SUNUCU tarafı veri çekme katmanı (Admin SDK).
 * Ana sayfa, kategori ve ürün detay sayfaları (SSR/ISR + SEO) buradan beslenir.
 *
 * Service account henüz tanımlı değilse site çökmez: boş veri döner ve
 * konsola uyarı yazılır — böylece geliştirme, Firebase kurulumundan önce başlayabilir.
 */
import "server-only";
import { cache } from "react";
import type { Product, Category, Testimonial, LookbookItem, SiteSettings } from "@/types";
import { mergeSettings, DEFAULT_SETTINGS } from "@/lib/site";

type DocData = FirebaseFirestore.DocumentSnapshot;

function toMillis(v: unknown): number {
  if (typeof v === "number") return v;
  if (v && typeof v === "object" && "toMillis" in v) {
    return (v as { toMillis(): number }).toMillis();
  }
  return 0;
}

function mapProduct(doc: DocData): Product {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    name: d.name ?? "",
    slug: d.slug ?? "",
    categoryId: d.categoryId ?? "",
    categorySlug: d.categorySlug ?? "",
    brand: d.brand ?? "",
    price: d.price ?? 0,
    oldPrice: d.oldPrice,
    colors: d.colors ?? [],
    sizes: d.sizes ?? [],
    colorImages: d.colorImages ?? {},
    outOfStockColors: d.outOfStockColors ?? [],
    outOfStockSizes: d.outOfStockSizes ?? [],
    images: d.images ?? [],
    description: d.description ?? "",
    fabricCare: d.fabricCare,
    isNew: d.isNew ?? false,
    isPopular: d.isPopular ?? false,
    isActive: d.isActive ?? true,
    createdAt: toMillis(d.createdAt),
    updatedAt: toMillis(d.updatedAt),
  };
}

async function getDb() {
  const { getAdminDb } = await import("./firebase-admin");
  return getAdminDb();
}

/** Hata durumunda boş dizi döndüren sarmalayıcı — kurulum öncesi geliştirme için */
async function safeQuery<T>(fn: () => Promise<T[]>, label: string): Promise<T[]> {
  try {
    return await fn();
  } catch (err) {
    console.warn(
      `[data] ${label} çekilemedi (FIREBASE_SERVICE_ACCOUNT_KEY tanımlı mı?):`,
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db.collection("categories").orderBy("order", "asc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Category);
  }, "categories");
}

// Not: Sorgularda yalnızca eşitlik filtreleri kullanılır (composite index
// gerektirmez); sıralama bellekte yapılır. Bu katalog ölçeğinde (yüzlerce ürün)
// en sade ve bakım gerektirmeyen yaklaşım budur.

function sortByNewest(products: Product[]): Product[] {
  return products.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getNewProducts(count = 8): Promise<Product[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db
      .collection("products")
      .where("isActive", "==", true)
      .where("isNew", "==", true)
      .get();
    return sortByNewest(snap.docs.map(mapProduct)).slice(0, count);
  }, "yeni ürünler");
}

export async function getPopularProducts(count = 8): Promise<Product[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db
      .collection("products")
      .where("isActive", "==", true)
      .where("isPopular", "==", true)
      .get();
    return sortByNewest(snap.docs.map(mapProduct)).slice(0, count);
  }, "popüler ürünler");
}

export async function getAllActiveProducts(): Promise<Product[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db.collection("products").where("isActive", "==", true).get();
    return sortByNewest(snap.docs.map(mapProduct));
  }, "tüm ürünler");
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db
      .collection("products")
      .where("categorySlug", "==", categorySlug)
      .where("isActive", "==", true)
      .get();
    return sortByNewest(snap.docs.map(mapProduct));
  }, `kategori:${categorySlug}`);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const db = await getDb();
    const snap = await db
      .collection("products")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    const product = mapProduct(snap.docs[0]);
    return product.isActive ? product : null;
  } catch (err) {
    console.warn(`[data] ürün çekilemedi (${slug}):`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const db = await getDb();
    const snap = await db
      .collection("categories")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Category;
  } catch {
    return null;
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db.collection("testimonials").where("isActive", "==", true).get();
    return snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Testimonial)
      .sort((a, b) => a.order - b.order);
  }, "yorumlar");
}

/**
 * Onaylı ürün yorumları — ana sayfadaki "Sizden Gelenler" bölümünde
 * vitrin yorumlarıyla birlikte gösterilmek üzere Testimonial biçimine çevrilir.
 * En yeni yorumlar önce gelir.
 */
export async function getApprovedReviewsAsTestimonials(count = 6): Promise<Testimonial[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db.collection("reviews").where("approved", "==", true).get();
    return snap.docs
      .map((doc) => {
        const d = doc.data();
        return {
          review: {
            id: `review-${doc.id}`,
            name: d.name ?? "Müşteri",
            quote: d.text ?? "",
            rating: d.rating ?? 5,
            order: 0,
            isActive: true,
          } as Testimonial,
          createdAt: toMillis(d.createdAt),
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count)
      .map((x) => x.review);
  }, "onaylı ürün yorumları");
}

/**
 * Site ayarları — settings/site dokümanı, varsayılanlarla birleştirilir.
 * Firestore'a ulaşılamazsa site sabitleriyle çalışmaya devam eder.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const db = await getDb();
    const snap = await db.collection("settings").doc("site").get();
    return mergeSettings(snap.exists ? snap.data() : null);
  } catch (err) {
    console.warn(
      "[data] site ayarları çekilemedi, varsayılanlar kullanılıyor:",
      err instanceof Error ? err.message : err
    );
    return DEFAULT_SETTINGS;
  }
});

export async function getLookbook(): Promise<LookbookItem[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db.collection("lookbook").where("isActive", "==", true).get();
    return snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as LookbookItem)
      .sort((a, b) => a.order - b.order);
  }, "lookbook");
}
