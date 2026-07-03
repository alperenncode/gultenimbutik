"use client";

/** Kategori vitrini — hover'da görsel yakınlaşır, isim şeridi yukarı kayar. */
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Category } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

export function CategoryCards({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
      <Reveal className="text-center mb-12">
        <p className="section-subtitle">Kategoriler</p>
        <h2 className="section-title mt-3">Size Özel Seçkiler</h2>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
        {categories.map((cat, i) => (
          <Reveal key={cat.id} delay={i * 0.08}>
            <Link href={`/kategori/${cat.slug}`} className="group block">
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative aspect-[3/4] overflow-hidden bg-cream-dark shadow-soft"
              >
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br
                    from-cream-dark to-rosegold-light/50">
                    <span className="font-display text-6xl italic text-bordeaux/15">
                      {cat.name.charAt(0)}
                    </span>
                  </div>
                )}
                {/* Alt bilgi şeridi */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bordeaux/80
                  via-bordeaux/30 to-transparent p-5 pt-14">
                  <p className="font-display text-lg text-cream md:text-xl">{cat.name}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-luxe text-rosegold-light
                    opacity-0 -translate-y-1 transition-all duration-300
                    group-hover:opacity-100 group-hover:translate-y-0">
                    İncele →
                  </p>
                </div>
              </motion.div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
