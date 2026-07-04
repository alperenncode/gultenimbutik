"use client";

/**
 * Müşteri yorumları — kayan vitrin (carousel).
 * Aynı anda en fazla 3 yorum görünür (telefonda 1, tablette 2);
 * yorumlar birkaç saniyede bir soldan sağa doğru kayarak değişir.
 * Oklarla elle gezilebilir; fare üzerindeyken otomatik kayma durur.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

const AUTOPLAY_MS = 4500;
const MAX_ITEMS = 12;

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const items = testimonials.slice(0, MAX_ITEMS);
  const [visible, setVisible] = useState(3);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Ekran genişliğine göre aynı anda görünen kart sayısı (CSS ile birebir aynı)
  useEffect(() => {
    const calc = () =>
      setVisible(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const maxIndex = Math.max(0, items.length - visible);

  // Ekran büyüyünce index taşmasın
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // Otomatik kaydırma — sona gelince başa döner
  useEffect(() => {
    if (paused || items.length <= visible) return;
    const timer = setInterval(
      () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
      AUTOPLAY_MS
    );
    return () => clearInterval(timer);
  }, [paused, maxIndex, visible, items.length]);

  if (items.length === 0) return null;

  const canSlide = items.length > visible;

  return (
    <section className="bg-bordeaux py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <p className="text-xs uppercase tracking-luxe text-rosegold font-medium">
            Mutlu Müşterilerimiz
          </p>
          <h2 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl text-cream">
            Sizden Gelenler
          </h2>
        </Reveal>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Kayan şerit */}
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${index * (100 / visible)}%` }}
              transition={{ duration: 0.65, ease: [0.32, 0.72, 0.24, 1] }}
            >
              {items.map((t) => (
                <div key={t.id} className="w-full shrink-0 px-2.5 sm:w-1/2 lg:w-1/3">
                  <figure className="h-full border border-cream/10 bg-bordeaux-light/40 p-7">
                    <Quote size={28} className="text-rosegold/40" />
                    <blockquote className="mt-4 text-sm leading-relaxed text-cream/80 italic">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-6 flex items-center justify-between">
                      <span className="text-sm font-medium text-cream">{t.name}</span>
                      {t.rating && (
                        <span className="flex gap-0.5" aria-label={`${t.rating} yıldız`}>
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star
                              key={s}
                              size={13}
                              className={s < (t.rating ?? 0) ? "text-rosegold" : "text-cream/20"}
                              fill={s < (t.rating ?? 0) ? "currentColor" : "none"}
                            />
                          ))}
                        </span>
                      )}
                    </figcaption>
                  </figure>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Oklar */}
          {canSlide && (
            <>
              <button
                onClick={() => setIndex((i) => (i <= 0 ? maxIndex : i - 1))}
                aria-label="Önceki yorumlar"
                className="absolute -left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center
                  justify-center rounded-full bg-cream/10 text-cream backdrop-blur-sm
                  transition-colors hover:bg-cream/20 sm:-left-4"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setIndex((i) => (i >= maxIndex ? 0 : i + 1))}
                aria-label="Sonraki yorumlar"
                className="absolute -right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center
                  justify-center rounded-full bg-cream/10 text-cream backdrop-blur-sm
                  transition-colors hover:bg-cream/20 sm:-right-4"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Noktalar */}
        {canSlide && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}. sayfaya git`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-rosegold" : "w-1.5 bg-cream/25 hover:bg-cream/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
