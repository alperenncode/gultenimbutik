/**
 * Görsel yükleme/silme API'si — Vercel Blob.
 *
 * Güvenlik: Her istekte Firebase ID token doğrulanır ve e-postanın
 * Firestore'daki admins koleksiyonunda kayıtlı olması şart koşulur.
 * Yalnızca görsel dosyalara (maks. 10 MB) izin verilir.
 *
 * BLOB_READ_WRITE_TOKEN, Vercel'de Blob store proje ile eşleştirilince
 * otomatik tanımlanır; yerelde .env.local'a eklenmelidir.
 */
import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { del } from "@vercel/blob";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

/** ID token'ı doğrular, e-posta admins koleksiyonunda yoksa hata fırlatır */
async function assertAdmin(idToken: string | undefined | null): Promise<string> {
  if (!idToken) throw new Error("Oturum bulunamadı — yeniden giriş yapın.");
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const email = decoded.email?.toLowerCase();
  if (!email) throw new Error("Hesabın e-posta bilgisi yok.");
  const adminDoc = await getAdminDb().collection("admins").doc(email).get();
  if (!adminDoc.exists) throw new Error("Bu hesabın yükleme yetkisi yok.");
  return email;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        // clientPayload = tarayıcıdan gelen Firebase ID token
        await assertAdmin(clientPayload);
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      // Yükleme sonrası ek işlem gerekmiyor (URL'ler Firestore'a formdan yazılır)
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Yükleme başarısız" },
      { status: 400 }
    );
  }
}

/** Görsel silme — yalnızca admin, yalnızca Blob URL'leri */
export async function DELETE(request: Request): Promise<NextResponse> {
  try {
    const idToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    await assertAdmin(idToken);

    const { url } = (await request.json()) as { url?: string };
    if (!url || !url.includes(".blob.vercel-storage.com/")) {
      return NextResponse.json({ error: "Geçersiz görsel adresi" }, { status: 400 });
    }
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Silme başarısız" },
      { status: 400 }
    );
  }
}
