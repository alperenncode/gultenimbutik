"use client";

/**
 * "Renk Seçenekleri" penceresi — ürün sayfasında renk fotoğrafı olan ürünlerde
 * "Tüm Renkleri Gör" bağlantısına tıklayınca açılır. Karta tıklamak o rengi seçer;
 * kartın köşesindeki büyüteç ikonu ise ayrı bir büyütme görünümü açar (sağ/sol
 * oklarla renkler arasında gezinilebilir).
 *
 * NOT: Bilerek AnimatePresence kullanılmıyor — bu projede AnimatePresence +
 * iç içe motion.div + exit kombinasyonu kapanma animasyonunda takılıp elemanı
 * DOM'dan hiç kaldırmıyor (ImageUploader.tsx'teki lightbox'ta tespit edildi).
 * Basit koşullu render + initial/animate her zaman güvenli çalışıyor.
 */
import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

export interface ColorOption {
  name: string;
  imageUrl: string;
  outOfStock: boolean;
}

function ColorZoomView({
  colors,
  index,
  onNavigate,
  onClose,
}: {
  colors: ColorOption[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate(index > 0 ? index - 1 : colors.length - 1);
      if (e.key === "ArrowRight") onNavigate(index < colors.length - 1 ? index + 1 : 0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, colors.length, onClose, onNavigate]);

  const current = colors[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-bordeaux/90 p-4 sm:p-10"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Renk fotoğrafını büyüt"
    >
      <div className="relative h-full w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={current.imageUrl}
          alt={current.name}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm tracking-wide text-cream/90">
          {current.name}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-4 p-2 text-cream/80 transition-colors hover:text-cream"
        aria-label="Kapat"
      >
        <X size={26} />
      </button>

      {colors.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index > 0 ? index - 1 : colors.length - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-cream/80 transition-colors hover:text-cream sm:left-4"
            aria-label="Önceki renk"
          >
            <ChevronLeft size={30} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index < colors.length - 1 ? index + 1 : 0);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cream/80 transition-colors hover:text-cream sm:right-4"
            aria-label="Sonraki renk"
          >
            <ChevronRight size={30} />
          </button>
        </>
      )}
    </motion.div>
  );
}

export function ColorOptionsModal({
  colors,
  onSelect,
  onClose,
  zoomIndex,
  onZoom,
  onCloseZoom,
}: {
  colors: ColorOption[];
  onSelect: (name: string) => void;
  onClose: () => void;
  zoomIndex: number | null;
  onZoom: (index: number) => void;
  onCloseZoom: () => void;
}) {
  useEffect(() => {
    if (zoomIndex !== null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, zoomIndex]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-bordeaux/60
          backdrop-blur-sm p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Renk Seçenekleri"
      >
        <motion.div
          initial={{ scale: 0.95, y: 12 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="max-h-[85vh] w-full max-w-lg overflow-y-auto bg-cream p-6 shadow-lifted sm:p-7"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-xl text-bordeaux">Renk Seçenekleri</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-bordeaux/60 transition-colors hover:text-bordeaux"
              aria-label="Kapat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
            {colors.map((c, i) => (
              <div key={c.name}>
                <div
                  className={`group relative aspect-[3/4] w-full overflow-hidden bg-cream-dark ${
                    c.outOfStock ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={() => !c.outOfStock && onSelect(c.name)}
                >
                  <Image
                    src={c.imageUrl}
                    alt={c.name}
                    fill
                    sizes="150px"
                    className={`object-cover ${c.outOfStock ? "opacity-45" : ""}`}
                  />
                  {c.outOfStock && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top right, transparent calc(50% - 1px), rgba(44,26,26,0.75) 50%, transparent calc(50% + 1px))",
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onZoom(i);
                    }}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center
                      rounded-full bg-white/85 text-bordeaux/70 opacity-0 transition-opacity
                      group-hover:opacity-100"
                    aria-label={`${c.name} fotoğrafını büyüt`}
                  >
                    <ZoomIn size={12} />
                  </button>
                </div>
                <p
                  className={`mt-1.5 text-center text-xs ${
                    c.outOfStock ? "text-bordeaux/35 line-through" : "text-bordeaux/75"
                  }`}
                >
                  {c.name}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {zoomIndex !== null && (
        <ColorZoomView
          colors={colors}
          index={zoomIndex}
          onNavigate={onZoom}
          onClose={onCloseZoom}
        />
      )}
    </>
  );
}
