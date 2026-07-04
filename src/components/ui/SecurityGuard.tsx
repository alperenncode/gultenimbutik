"use client";

/**
 * Güvenlik caydırıcıları — YALNIZCA canlı sitede (production) çalışır;
 * geliştirme ortamını etkilemez.
 *
 *  - Konsol çıktıları susturulur ve konsola öz-XSS uyarısı yazılır
 *    (dolandırıcılar kurbanlara "konsola şunu yapıştır" der — bu uyarı
 *    gerçek bir koruma sağlar)
 *  - Ürün fotoğraflarında sağ tık ve sürükleme engellenir (görsel hırsızlığı
 *    caydırma)
 *  - F12, Ctrl+Shift+I/J/C ve Ctrl+U kısayolları engellenir
 *
 * Not: Asıl güvenlik sunucudadır (Firestore kuralları, yetki denetimleri,
 * güvenlik başlıkları). Tarayıcı tarafı önlemler caydırıcıdır; siteyi
 * "bozabilecek" hiçbir işlem zaten istemciden yapılamaz.
 */
import { useEffect } from "react";

export function SecurityGuard() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    // 1) Konsol uyarısı + susturma (error korunur: gerçek sorunlar izlenebilsin)
    try {
      // eslint-disable-next-line no-console
      console.log(
        "%cDUR!",
        "color:#B00020;font-size:44px;font-weight:bold;text-shadow:1px 1px 2px #000"
      );
      // eslint-disable-next-line no-console
      console.log(
        "%cBu alan geliştiriciler içindir. Birisi buraya bir şey yapıştırmanızı " +
          "söylediyse, bu bir dolandırıcılık girişimidir — hesabınız çalınabilir. " +
          "Hiçbir şey yapıştırmayın ve sayfayı kapatın.",
        "color:#2C1A1A;font-size:15px;line-height:1.5"
      );
      const noop = () => {};
      console.log = noop;
      console.info = noop;
      console.debug = noop;
      console.table = noop;
      console.dir = noop;
      console.trace = noop;
    } catch {
      /* konsol kilitliyse sorun değil */
    }

    // 2) Görsellerde sağ tık ve sürükleme engeli
    const onContextMenu = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("img, picture, svg")) e.preventDefault();
    };
    const onDragStart = (e: DragEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("img, picture")) e.preventDefault();
    };

    // 3) Geliştirici araçları kısayolları
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toUpperCase();
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (k === "I" || k === "J" || k === "C")) ||
        (e.ctrlKey && !e.shiftKey && k === "U")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("dragstart", onDragStart);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("dragstart", onDragStart);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
