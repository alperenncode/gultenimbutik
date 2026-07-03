"use client";

/**
 * Ürün görsel galerisi.
 * - Zoom yalnızca TIKLAYINCA açılır (hover'da istemsiz büyüme yok);
 *   açıkken imleç/parmak konumuna göre gezinilir, tekrar tıklayınca kapanır.
 * - Masaüstü + mobil aynı davranış; Esc ile de kapanır.
 * - Thumbnail rayı: seçili görsele rose gold çerçeve, crossfade geçiş.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut } from "lucide-react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frameRef = useRef<HTMLDivElement>(null);

  const updateOrigin = useCallback((clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setOrigin(`${x}% ${y}%`);
  }, []);

  // Görsel değişince zoom'u kapat; Esc ile kapatma
  useEffect(() => setZoomed(false), [active]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomed(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-cream-dark">
        <span className="font-display text-7xl italic text-rosegold/40">G</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Ana görsel — tıklayınca zoom açılır/kapanır */}
      <div
        ref={frameRef}
        role="button"
        tabIndex={0}
        aria-label={zoomed ? "Yakınlaştırmayı kapat" : "Görseli yakınlaştır"}
        className={`relative aspect-[3/4] select-none overflow-hidden bg-cream-dark shadow-soft
          ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        onClick={(e) => {
          if (!zoomed) updateOrigin(e.clientX, e.clientY);
          setZoomed((v) => !v);
        }}
        onMouseMove={(e) => zoomed && updateOrigin(e.clientX, e.clientY)}
        onTouchMove={(e) => {
          if (zoomed && e.touches[0]) {
            updateOrigin(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setZoomed((v) => !v);
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={images[active]}
              alt={`${name} — görsel ${active + 1}`}
              fill
              priority={active === 0}
              quality={95}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-300 ease-out"
              style={{
                transformOrigin: origin,
                transform: zoomed ? "scale(1.6)" : "scale(1)",
              }}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom durumu göstergesi */}
        <span
          className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9 items-center
            justify-center rounded-full bg-white/85 text-bordeaux/70 shadow-soft"
        >
          {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
        </span>
        {!zoomed && (
          <span
            className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/85
              px-3 py-1.5 text-[10px] uppercase tracking-wider text-bordeaux/60 shadow-soft"
          >
            Yakınlaştırmak için tıklayın
          </span>
        )}
      </div>

      {/* Thumbnail rayı */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Görsel ${i + 1}`}
              className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden transition-all
                duration-300 ${
                  i === active
                    ? "ring-2 ring-rosegold-dark ring-offset-2 ring-offset-cream"
                    : "opacity-60 hover:opacity-100"
                }`}
            >
              <Image src={img} alt="" fill sizes="80px" quality={80} className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
