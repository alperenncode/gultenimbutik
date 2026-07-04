/**
 * Ürün yorumları — CLIENT SDK sorguları.
 * Yorum yazma yalnızca giriş yapmış üyelere açıktır; yeni yorum onaysız
 * (approved=false) kaydedilir ve admin onaylayana kadar sitede görünmez.
 */
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { Review } from "@/types";

function mapReview(d: DocumentSnapshot | QueryDocumentSnapshot): Review {
  const data = d.data() ?? {};
  return {
    id: d.id,
    productId: data.productId ?? "",
    productSlug: data.productSlug ?? "",
    productName: data.productName ?? "",
    userId: data.userId ?? "",
    name: data.name ?? "Müşteri",
    rating: data.rating ?? 5,
    text: data.text ?? "",
    approved: data.approved ?? false,
    createdAt: data.createdAt?.toMillis?.() ?? 0,
  };
}

/**
 * Görünen adı maskeler: "Ayşe Kaya" → "Ayşe K."
 * Ad yoksa e-postanın @ öncesi kullanılır, o da yoksa "Müşteri".
 */
export function maskDisplayName(displayName: string | null | undefined, email: string | null | undefined): string {
  const fallback = (email ?? "").split("@")[0];
  const clean = (displayName || fallback || "Müşteri").trim().replace(/\s+/g, " ");
  const parts = clean.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 30);
  const first = parts.slice(0, -1).join(" ").slice(0, 28);
  const lastInitial = parts[parts.length - 1].charAt(0).toLocaleUpperCase("tr-TR");
  return `${first} ${lastInitial}.`;
}

/** Ürün sayfası: yalnızca onaylı yorumlar (eşitlik filtreleri — index gerektirmez) */
export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("productId", "==", productId),
    where("approved", "==", true)
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapReview).sort((a, b) => b.createdAt - a.createdAt);
}

/** Yeni yorum — onaysız kaydedilir, admin onaylayınca yayınlanır */
export async function createReview(input: {
  productId: string;
  productSlug: string;
  productName: string;
  userId: string;
  name: string;
  rating: number;
  text: string;
}): Promise<void> {
  await addDoc(collection(db, "reviews"), {
    ...input,
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    text: input.text.trim().slice(0, 1000),
    approved: false,
    createdAt: serverTimestamp(),
  });
}

/** Admin: tüm yorumlar (onay bekleyenler dahil) */
export async function fetchAllReviewsAdmin(): Promise<Review[]> {
  const snap = await getDocs(collection(db, "reviews"));
  return snap.docs.map(mapReview).sort((a, b) => b.createdAt - a.createdAt);
}

/** Admin: yayınla / yayından kaldır */
export async function setReviewApproved(id: string, approved: boolean): Promise<void> {
  await updateDoc(doc(db, "reviews", id), { approved });
}

/** Admin: kalıcı sil */
export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, "reviews", id));
}
