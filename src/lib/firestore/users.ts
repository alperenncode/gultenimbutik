/** Kullanıcı profilleri ve favoriler — CLIENT SDK. */
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { UserProfile } from "@/types";

/** Kayıt sonrası profil dokümanı oluşturur (varsa dokunmaz). */
export async function ensureUserProfile(uid: string, email: string, displayName?: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: email.toLowerCase(),
      displayName: displayName ?? "",
      wishlist: [],
      createdAt: serverTimestamp(),
    });
  }
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    email: d.email ?? "",
    displayName: d.displayName,
    wishlist: d.wishlist ?? [],
    createdAt: d.createdAt?.toMillis?.() ?? 0,
  };
}

/** Favorilere atomik ekleme/çıkarma — yarış koşulu (race condition) güvenli */
export async function addToWishlist(uid: string, productId: string) {
  await updateDoc(doc(db, "users", uid), { wishlist: arrayUnion(productId) });
}

export async function removeFromWishlist(uid: string, productId: string) {
  await updateDoc(doc(db, "users", uid), { wishlist: arrayRemove(productId) });
}

/** Girilen e-postanın admin olup olmadığını kontrol eder (yalnızca kendi e-postası sorgulanabilir). */
export async function checkIsAdmin(email: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, "admins", email.toLowerCase()));
    return snap.exists();
  } catch {
    return false;
  }
}
