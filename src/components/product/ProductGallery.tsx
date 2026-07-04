"use client";

/**
 * Ürün görsel galerisi — tam ekran görüntüleyici (lightbox) ile.
 *
 * Ana görsele dokununca/tıklayınca sayfanın düzenini BOZMADAN tam ekran
 * görüntüleyici açılır:
 *  - Sağa/sola kaydırarak (veya ok tuşları/butonlarla) görseller arası geçiş
 *  - Büyüteç butonu veya çift dokunuşla 2x büyütme; büyükken parmakla gezinme
 *  - X, Esc veya arka plana dokunarak kapanır; sayfa kaydırması kilitlenir
 */
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Expand } from "lucide-react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-cream-dark">
        <span className="font-display text-7xl italic text-rosegold/40">G</span>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {/* Ana görsel — dokununca tam ekran açılır */}
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="Görseli tam ekran aç"
        className="group relative aspect-[3/4] w-full overflow-hidden bg-cream-dark
          shadow-soft cursor-zoom-in focus:outline-none focus-visible:ring-2
          focus-visible:ring-rosegold"
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
              // object-contain: fotoğraf hangi oranda olursa olsun KIRPILMADAN
              // tamamı görünür (kenarlarda zarif krem dolgu kalabilir)
              className="object-contain transition-transform duration-500 lg:group-hover:scale-[1.03]"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        <span
          className="pointer-events-none absolute bottom-4 right-4 flex h-9 w-9 items-center
            justify-center rounded-full bg-white/85 text-bordeaux/70 shadow-soft"
        >
          <Expand size={15} />
        </span>
        <span
          className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-white/85
            px-3 py-1.5 text-[10px] uppercase tracking-wider text-bordeaux/60 shadow-soft"
        >
          Büyütmek için dokunun
        </span>
      </button>

      {/* Thumbnail rayı */}
      {images.length > 1 && (
        <div className="flex max-w-full gap-3 overflow-x-auto pb-1">
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

      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={images}
            name={name}
            index={active}
            setIndex={setActive}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Lightbox({
  images,
  name,
  index,
  setIndex,
  onClose,
}: {
  images: string[];
  name: string;
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(
    () => setIndex((index - 1 + images.length) % images.length),
    [index, images.length, setIndex]
  );
  const next = useCallback(
    () => setIndex((index + 1) % images.length),
    [index, images.length, setIndex]
  );

  // Sayfa kaydırmasını kilitle
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Klavye: Esc kapat, oklarla gezin
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  // Görsel değişince zoom sıfırlanır
  useEffect(() => setZoomed(false), [index]);

  // Büyütünce görüntüyü ortala
  useEffect(() => {
    const el = scrollRef.current;
    if (zoomed && el) {
      requestAnimationFrame(() => {
        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
        el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
      });
    }
  }, [zoomed]);

  const ctrlBtn =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream " +
    "backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/25";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] flex flex-col bg-bordeaux/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} görselleri`}
    >
      {/* Üst bar: sayaç + kapat */}
      <div className="flex items-center justify-between px-4 py-3 pt-safe">
        <span className="text-xs tracking-widest text-cream/70">
          {index + 1} / {images.length}
        </span>
        <button onClick={onClose} className={ctrlBtn} aria-label="Kapat">
          <X size={20} />
        </button>
      </div>

      {/* Görsel alanı — büyükken kaydırarak gezinilir */}
      <div
        ref={scrollRef}
        className={`flex-1 overscroll-contain ${zoomed ? "overflow-auto" : "overflow-hidden"}`}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          // Kaydırma jesti yalnızca büyütme kapalıyken görsel değiştirir
          if (zoomed || touchStartX.current === null) return;
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (dx > 60) prev();
          else if (dx < -60) next();
          touchStartX.current = null;
        }}
      >
        <div
          className={
            zoomed
              ? "w-[200%] sm:w-[160%]"
              : "flex h-full w-full items-center justify-center p-2"
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[index]}
            alt={`${name} — görsel ${index + 1}`}
            onDoubleClick={() => setZoomed((v) => !v)}
            draggable={false}
            className={
              zoomed
                ? "w-full h-auto select-none"
                : "max-h-full max-w-full object-contain select-none"
            }
          />
        </div>
      </div>

      {/* Alt kontroller */}
      <div className="flex items-center justify-center gap-4 px-4 py-4 pb-safe">
        {images.length > 1 && (
          <button onClick={prev} className={ctrlBtn} aria-label="Önceki görsel">
            <ChevronLeft size={20} />
          </button>
        )}
        <button
          onClick={() => setZoomed((v) => !v)}
          className={ctrlBtn}
          aria-label={zoomed ? "Küçült" : "Büyüt"}
        >
          {zoomed ? <ZoomOut size={19} /> : <ZoomIn size={19} />}
        </button>
        {images.length > 1 && (
          <button onClick={next} className={ctrlBtn} aria-label="Sonraki görsel">
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
