/**
 * SUNUCU tarafı veri çekme katmanı (Admin SDK).
 * Ana sayfa, kategori ve ürün detay sayfaları (SSR/ISR + SEO) buradan beslenir.
 *
 * Service account henüz tanımlı değilse site çökmez: boş veri döner ve
 * konsola uyarı yazılır — böylece geliştirme, Firebase kurulumundan önce başlayabilir.
 */
import "server-only";
import type { Product, Category, Testimonial, LookbookItem } from "@/types";

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

export async function getNewProducts(count = 8): Promise<Product[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db
      .collection("products")
      .where("isActive", "==", true)
      .where("isNew", "==", true)
      .orderBy("createdAt", "desc")
      .limit(count)
      .get();
    return snap.docs.map(mapProduct);
  }, "yeni ürünler");
}

export async function getPopularProducts(count = 8): Promise<Product[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db
      .collection("products")
      .where("isActive", "==", true)
      .where("isPopular", "==", true)
      .orderBy("createdAt", "desc")
      .limit(count)
      .get();
    return snap.docs.map(mapProduct);
  }, "popüler ürünler");
}

export async function getAllActiveProducts(): Promise<Product[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db
      .collection("products")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map(mapProduct);
  }, "tüm ürünler");
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db
      .collection("products")
      .where("categorySlug", "==", categorySlug)
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .get();
    return snap.docs.map(mapProduct);
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
    const snap = await db
      .collection("testimonials")
      .where("isActive", "==", true)
      .orderBy("order", "asc")
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Testimonial);
  }, "yorumlar");
}

export async function getLookbook(): Promise<LookbookItem[]> {
  return safeQuery(async () => {
    const db = await getDb();
    const snap = await db
      .collection("lookbook")
      .where("isActive", "==", true)
      .orderBy("order", "asc")
      .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as LookbookItem);
  }, "lookbook");
}
