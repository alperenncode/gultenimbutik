/**
 * Admin bir ayar/kategori kaydettiğinde çağrılır — /api/revalidate'i
 * tetikleyerek değişikliğin ISR beklemeden anında siteye yansımasını sağlar.
 * Hata sessizce yutulur: kayıt işlemi zaten tamamlanmıştır, bu yalnızca
 * "hızlandırma" katmanıdır (yardımcı olmasa da en geç birkaç dakikada
 * mevcut zamanlayıcı zaten güncelleyecektir).
 */
import { auth } from "@/lib/firebase-client";

export async function triggerRevalidate(): Promise<void> {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return;
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { authorization: `Bearer ${idToken}` },
    });
  } catch {
    // sessizce yut
  }
}
