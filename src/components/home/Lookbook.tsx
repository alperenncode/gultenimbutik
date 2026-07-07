"use client";

/**
 * Lookbook — simetrik editoryal galeri: tüm kartlar eşit boyutta (3:4),
 * hover'da caption belirir. En fazla 6 görsel gösterilir.
 */
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LookbookItem } from "@/types";
import { Reveal } from "@/components/ui/Reveal";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export function Lookbook({ items }: { items: LookbookItem[] }) {
  const { theme } = useSiteSettings();
  if (items.length === 0) return null;

  return (
    <section id="lookbook" className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
      <Reveal className="text-center mb-12">
        <p style={{ color: theme.accentColorDark }} className="text-xs uppercase tracking-luxe font-medium">
          Lookbook
        </p>
        <h2 style={{ color: theme.headingColor }} className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl">
          Stil Önerileri
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-bordeaux/55">
          Sezonun öne çıkan kombinleri — ilham alın, beğendiğiniz parçayı
          WhatsApp&apos;tan sorun.
        </p>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
        {items.slice(0, 6).map((item, i) => (
          <Reveal key={item.id} delay={(i % 3) * 0.08}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="group relative aspect-[3/4] overflow-hidden bg-cream-dark shadow-soft"
            >
              <Image
                src={item.imageUrl}
                alt={item.caption ?? "Gültenim Butik stil önerisi"}
                fill
                quality={85}
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {item.caption && (
                // Mobilde açıklama her zaman görünür; masaüstünde hover'da belirir
                <div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t
                    from-bordeaux/75 to-transparent p-5 pt-12 transition-all duration-500
                    opacity-100 translate-y-0
                    lg:opacity-0 lg:translate-y-2 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
                >
                  <p className="font-display text-sm md:text-base italic text-cream">{item.caption}</p>
                </div>
              )}
            </motion.div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12 text-center">
        <Link href="/urunler" className="btn-outline">
          Koleksiyonda Keşfet
        </Link>
      </Reveal>
    </section>
  );
}
