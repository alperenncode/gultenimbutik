/**
 * Ürünler — CLIENT SDK sorguları.
 * /urunler sayfası (client-side filtreleme) ve admin paneli buradan kullanır.
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { Product } from "@/types";

function mapProduct(d: DocumentSnapshot | QueryDocumentSnapshot): Product {
  const data = d.data() ?? {};
  return {
    id: d.id,
    name: data.name ?? "",
    slug: data.slug ?? "",
    categoryId: data.categoryId ?? "",
    categorySlug: data.categorySlug ?? "",
    brand: data.brand ?? "",
    price: data.price ?? 0,
    oldPrice: data.oldPrice,
    colors: data.colors ?? [],
    sizes: data.sizes ?? [],
    colorImages: data.colorImages ?? {},
    outOfStockColors: data.outOfStockColors ?? [],
    outOfStockSizes: data.outOfStockSizes ?? [],
    images: data.images ?? [],
    description: data.description ?? "",
    fabricCare: data.fabricCare,
    isNew: data.isNew ?? false,
    isPopular: data.isPopular ?? false,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toMillis?.() ?? 0,
    updatedAt: data.updatedAt?.toMillis?.() ?? 0,
  };
}

/** Vitrindeki tüm aktif ürünler — /urunler sayfası tek seferde çeker, filtre client-side.
 *  Sıralama bellekte yapılır (composite index gerekmesin diye). */
export async function fetchActiveProducts(): Promise<Product[]> {
  const q = query(collection(db, "products"), where("isActive", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(mapProduct).sort((a, b) => b.createdAt - a.createdAt);
}

/** Admin: aktif+pasif tüm ürünler */
export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(mapProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, "products", id));
  return snap.exists() ? mapProduct(snap) : null;
}

/** Favoriler sayfası: ID listesinden ürünleri çeker (10'arlı 'in' sorgu limiti gözetilir) */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const q = query(collection(db, "products"), where("__name__", "in", chunk));
      const snap = await getDocs(q);
      return snap.docs.map(mapProduct);
    })
  );
  return results.flat().filter((p) => p.isActive);
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export async function createProduct(input: ProductInput): Promise<string> {
  const ref = await addDoc(collection(db, "products"), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  await updateDoc(doc(db, "products", id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, "products", id));
}
