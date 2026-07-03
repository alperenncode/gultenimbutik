"use client";

/** Ürün vitrini bölümü — "Yeni Gelenler" ve "Popüler Ürünler" için ortak kullanılır. */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

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
  if (products.length === 0) return null;

  return (
    <section className={tinted ? "bg-cream-light py-20" : "py-20"}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="flex flex-col items-center text-center mb-12">
          <p className="section-subtitle">{subtitle}</p>
          <h2 className="section-title mt-3">{title}</h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <Link
            href={viewAllHref}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-luxe
              text-bordeaux border-b border-rosegold pb-1.5
              transition-colors hover:text-rosegold-dark"
          >
            Tümünü Gör
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
