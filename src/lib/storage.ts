/**
 * Görsel yükleme yardımcıları — Vercel Blob (client tarafı).
 *
 * Yükleme, /api/upload rotası üzerinden yetkilendirilir: tarayıcı Firebase
 * ID token'ını gönderir, sunucu admin olduğunu doğrulayıp tek kullanımlık
 * yükleme izni üretir. İlerleme yüzdesi raporlanır.
 *
 * Not: Firebase Storage yerine Vercel Blob kullanılır (Blaze planı gerekmez).
 */
import { upload } from "@vercel/blob/client";
import { auth } from "@/lib/firebase-client";

async function getIdToken(): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Oturum bulunamadı — yeniden giriş yapın.");
  return token;
}

export async function uploadImage(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const idToken = await getIdToken();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  const blob = await upload(`${folder}/${safeName}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    clientPayload: idToken,
    onUploadProgress: ({ percentage }) => onProgress?.(Math.round(percentage)),
  });

  return blob.url;
}

/** İndirme URL'sinden Blob dosyasını siler (dosya zaten yoksa sessizce geçer). */
export async function deleteImageByUrl(url: string): Promise<void> {
  // Blob dışı adresler (ör. eski site görselleri) sessizce atlanır
  if (!url.includes(".blob.vercel-storage.com/")) return;

  const idToken = await getIdToken();
  const res = await fetch("/api/upload", {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Görsel silinemedi");
  }
}
