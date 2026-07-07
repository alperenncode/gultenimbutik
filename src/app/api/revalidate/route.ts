/**
 * Anlık önbellek tazeleme — admin panelinden ayar/kategori kaydedilince
 * çağrılır ki değişiklik ISR zamanlayıcısını (5-10 dk) beklemeden anında
 * tüm sayfalara (ana sayfa, kategori, ürün, iletişim) yansısın.
 *
 * Güvenlik: /api/upload'daki ile aynı desen — Firebase ID token doğrulanır
 * ve e-postanın admins koleksiyonunda kayıtlı olması şart koşulur.
 */
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

async function assertAdmin(idToken: string | undefined | null): Promise<void> {
  if (!idToken) throw new Error("Oturum bulunamadı — yeniden giriş yapın.");
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const email = decoded.email?.toLowerCase();
  if (!email) throw new Error("Hesabın e-posta bilgisi yok.");
  const adminDoc = await getAdminDb().collection("admins").doc(email).get();
  if (!adminDoc.exists) throw new Error("Bu hesabın yetkisi yok.");
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const idToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    await assertAdmin(idToken);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Tazeleme başarısız" },
      { status: 400 }
    );
  }
}
