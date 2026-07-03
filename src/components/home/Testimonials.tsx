"use client";

/** Müşteri yorumları — koyu bordo zemin üzerinde zarif alıntı kartları. */
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import type { Testimonial } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t, i) => (
            <Reveal key={t.id} delay={i * 0.1}>
              <motion.figure
                whileHover={{ y: -4 }}
                transition={{ type: "spring", damping: 22, stiffness: 280 }}
                className="relative h-full border border-cream/10 bg-bordeaux-light/40 p-7"
              >
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
              </motion.figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
