"use client";

/**
 * Lookbook — asimetrik editoryal galeri. İlk görsel büyük sergilenir,
 * kalanlar ikişerli dizilir; hover'da caption belirir.
 */
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LookbookItem } from "@/types";
import { Reveal } from "@/components/ui/Reveal";

function LookCard({ item, tall = false }: { item: LookbookItem; tall?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className={`group relative overflow-hidden bg-cream-dark shadow-soft
        ${tall ? "aspect-[3/4]" : "aspect-square"}`}
    >
      <Image
        src={item.imageUrl}
        alt={item.caption ?? "Gültenim Butik stil önerisi"}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {item.caption && (
        <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t
          from-bordeaux/75 to-transparent p-5 pt-12 opacity-0 transition-all duration-500
          group-hover:translate-y-0 group-hover:opacity-100">
          <p className="font-display text-base italic text-cream">{item.caption}</p>
        </div>
      )}
    </motion.div>
  );
}

export function Lookbook({ items }: { items: LookbookItem[] }) {
  if (items.length === 0) return null;
  const [first, ...rest] = items;

  return (
    <section id="lookbook" className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
      <Reveal className="text-center mb-12">
        <p className="section-subtitle">Lookbook</p>
        <h2 className="section-title mt-3">Stil Önerileri</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-bordeaux/55">
          Sezonun öne çıkan kombinleri — ilham alın, beğendiğiniz parçayı
          WhatsApp&apos;tan sorun.
        </p>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <Reveal>
          <LookCard item={first} tall />
        </Reveal>
        <div className="grid grid-cols-2 gap-4 lg:gap-6 content-start">
          {rest.slice(0, 4).map((item, i) => (
            <Reveal key={item.id} delay={i * 0.08}>
              <LookCard item={item} />
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-12 text-center">
        <Link href="/urunler" className="btn-outline">
          Koleksiyonda Keşfet
        </Link>
      </Reveal>
    </section>
  );
}
