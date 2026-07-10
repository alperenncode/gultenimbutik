"use client";

/** Ürün vitrini bölümü — "Yeni Gelenler" ve "Popüler Ürünler" için ortak kullanılır. */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { useSiteSettings } from "@/context/SiteSettingsContext";

export function ProductShowcase({
  subtitle,
  title,
  products,
  viewAllHref,
  tinted = false,
}: {
  subtitle: string;
  title: string;
  products: Product[];
  viewAllHref: string;
  tinted?: boolean;
}) {
  const { theme } = useSiteSettings();
  if (products.length === 0) return null;

  return (
    <section className={tinted ? "bg-cream-light py-20" : "py-20"}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-center text-center mb-12">
          <p style={{ color: theme.accentColorDark }} className="text-xs uppercase tracking-luxe font-medium">
            {subtitle}
          </p>
          <h2 style={{ color: theme.headingColor }} className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl">
            {title}
          </h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <Link href={viewAllHref} className="btn-outline group">
            Tümünü Gör
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
