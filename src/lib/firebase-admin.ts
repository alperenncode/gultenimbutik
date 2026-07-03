/**
 * Firebase ADMIN SDK — yalnızca sunucuda (Server Component / route handler) çalışır.
 *
 * SSR/ISR sayfaları (ana sayfa, kategori, ürün detay) ve generateMetadata
 * buradan veri çeker; böylece WhatsApp/Instagram'da paylaşılan linklerde
 * doğru başlık ve görsel (Open Graph) çıkar.
 *
 * Kimlik: FIREBASE_SERVICE_ACCOUNT_KEY ortam değişkeni (service account JSON,
 * base64 kodlu). Bu bir SIR'dır — asla client koduna veya git'e girmez.
 * Yerelde .env.local, Vercel'de Environment Variables üzerinden tanımlanır.
 */
import "server-only";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY tanımlı değil. Firebase Console → Proje Ayarları → " +
        "Hizmet hesapları → 'Yeni özel anahtar oluştur' ile JSON indirin, base64'e çevirip " +
        ".env.local (yerel) ve Vercel env vars (prod) içine ekleyin."
    );
  }

  // Hem düz JSON hem base64 kodlu JSON desteklenir
  const json = raw.trim().startsWith("{")
    ? raw
    : Buffer.from(raw, "base64").toString("utf8");

  return initializeApp({ credential: cert(JSON.parse(json)) });
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
