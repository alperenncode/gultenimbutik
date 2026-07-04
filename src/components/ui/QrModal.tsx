"use client";

/**
 * QR paylaşım penceresi — header'daki QR butonuna tıklanınca açılır.
 * Kod, ziyaretçinin o an baktığı adres için TARAYICIDA üretilir; yani site
 * hangi alan adında yayındaysa QR hep doğru adresi taşır.
 * Ortasında Gültenim Boutique logosu bulunur (hata düzeltme H sayesinde
 * kod sorunsuz okunur).
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { X, ScanLine } from "lucide-react";

export function QrModal({ onClose }: { onClose: () => void }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    QRCode.toString(window.location.origin, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 0,
      color: { dark: "#2C1A1A", light: "#0000" },
    })
      .then(setSvg)
      .catch(() => {});
  }, []);

  // Esc ile kapat
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-bordeaux/60
        backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Siteyi QR kod ile paylaş"
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ type: "spring", damping: 24, stiffness: 300 }}
        className="w-full max-w-xs bg-cream p-7 text-center shadow-lifted"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="text-left">
            <p className="section-subtitle">Gültenim Butik</p>
            <h2 className="mt-1 font-display text-xl text-bordeaux">Siteyi Paylaşın</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-bordeaux/60 transition-colors hover:text-bordeaux"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* QR — ortasında logo */}
        <div className="relative mx-auto mt-5 w-fit rounded-xl border border-rosegold/40
          bg-white p-4 shadow-soft">
          {svg ? (
            <>
              <div
                aria-hidden="true"
                className="h-52 w-52 [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
              <span className="absolute left-1/2 top-1/2 w-[88px] -translate-x-1/2
                -translate-y-1/2 overflow-hidden rounded-[4px] shadow-soft">
                <Image src="/logo-plaka.png" alt="" width={1200} height={302}
                  className="h-auto w-full" />
              </span>
            </>
          ) : (
            <div className="h-52 w-52 animate-pulse bg-cream-dark" />
          )}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-bordeaux/55">
          <ScanLine size={14} className="text-rosegold-dark" />
          Telefon kamerasıyla okutun — site açılır
        </p>
      </motion.div>
    </motion.div>
  );
}
