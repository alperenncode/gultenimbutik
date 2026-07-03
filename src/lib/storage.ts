/**
 * Firebase Storage yükleme yardımcıları (client).
 * uploadBytesResumable ile ilerleme yüzdesi raporlanır; dosya adı çakışmasın
 * diye zaman damgası + rastgele ek kullanılır.
 */
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase-client";

export function uploadImage(
  file: File,
  folder: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const task = uploadBytesResumable(ref(storage, path), file, {
      contentType: file.type,
    });

    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try {
          resolve(await getDownloadURL(task.snapshot.ref));
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/** İndirme URL'sinden Storage dosyasını siler (dosya zaten yoksa sessizce geçer). */
export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    await deleteObject(ref(storage, url));
  } catch (err: unknown) {
    if ((err as { code?: string })?.code !== "storage/object-not-found") throw err;
  }
}
