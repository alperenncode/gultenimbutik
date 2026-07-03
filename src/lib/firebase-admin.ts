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
import { getAuth, type Auth } from "firebase-admin/auth";

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

  // Yapıştırma hatalarına dayanıklı ayrıştırma:
  // baştaki/sondaki tırnaklar ve boşluklar temizlenir; düz JSON veya base64 kabul edilir
  let cleaned = raw.trim().replace(/^["']+|["']+$/g, "").trim();
  let json: string;
  if (cleaned.startsWith("{")) {
    json = cleaned;
  } else {
    // Base64 içinde satır sonu/boşluk olabilir — ayıkla
    json = Buffer.from(cleaned.replace(/\s+/g, ""), "base64").toString("utf8");
  }

  let parsed: object;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY değeri bozuk görünüyor (geçerli JSON/base64 değil). " +
        "Vercel → Settings → Environment Variables'da değeri doğru anahtarla güncelleyin."
    );
  }

  return initializeApp({ credential: cert(parsed) });
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

/** Görsel yükleme API'sinde admin doğrulaması için (ID token kontrolü) */
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
