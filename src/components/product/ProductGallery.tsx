"use client";

/**
 * Ürün görsel galerisi.
 * - Masaüstü: imleç konumuna göre yakınlaşan hover-zoom (büyüteç etkisi)
 * - Mobil: dokunuşla zoom aç/kapa
 * - Thumbnail rayı: seçili görsele rose gold çerçeve, crossfade geçiş
 */
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn } from "lucide-react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const frameRef = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
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
      {/* Ana görsel */}
      <div
        ref={frameRef}
        className={`relative aspect-[3/4] overflow-hidden bg-cream-dark shadow-soft
          ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onClick={() => setZoomed((v) => !v)}
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
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-200"
              style={{
                transformOrigin: origin,
                transform: zoomed ? "scale(1.8)" : "scale(1)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {!zoomed && (
          <span className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9
            items-center justify-center rounded-full bg-white/85 text-bordeaux/70 shadow-soft">
            <ZoomIn size={16} />
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
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
