"use client";

/**
 * Ürün kartı — vitrin grid'lerinde kullanılır.
 * Hover'da ikinci görsele yumuşak geçiş, favori kalbi, "Yeni" rozeti.
 */
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { formatPrice } from "@/lib/site";
import type { Product } from "@/types";
import { useWishlist } from "@/context/WishlistContext";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { isInWishlist, toggle } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const [primary, secondary] = product.images;

  return (
    <motion.article
      whileHover="hover"
      initial="rest"
      animate="rest"
      className="group relative"
    >
      <Link href={`/urun/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark">
          {primary ? (
            <>
              <Image
                src={primary}
                alt={product.name}
                fill
                priority={priority}
                quality={85}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-all duration-700 ${
                  secondary ? "group-hover:opacity-0" : "group-hover:scale-105"
                }`}
              />
              {secondary && (
                <Image
                  src={secondary}
                  alt={`${product.name} — alternatif görünüm`}
                  fill
                  quality={85}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 scale-105 transition-all duration-700
                    group-hover:opacity-100 group-hover:scale-100"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-5xl text-rosegold/40">G</span>
            </div>
          )}

          {/* Rozetler */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-bordeaux px-2.5 py-1 text-[10px] uppercase tracking-widest text-cream">
                Yeni
              </span>
            )}
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="bg-rosegold-dark px-2.5 py-1 text-[10px] uppercase tracking-widest text-white">
                İndirim
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Favori butonu */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(product.id);
        }}
        aria-label={inWishlist ? "Favorilerden çıkar" : "Favorilere ekle"}
        className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full
          shadow-soft transition-all duration-300
          ${
            inWishlist
              ? "bg-rosegold-dark text-white"
              : "bg-white/90 text-bordeaux/70 opacity-0 group-hover:opacity-100 hover:text-rosegold-dark"
          }`}
      >
        <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
      </button>

      {/* Bilgiler */}
      <Link href={`/urun/${product.slug}`} className="block pt-4 pb-2 text-center">
        <p className="text-[10px] uppercase tracking-luxe text-rosegold-dark">{product.brand}</p>
        {/* Sabit yükseklik: isimler 1-2 satır olsa da fiyatlar aynı hizada kalır */}
        <h3 className="mt-1.5 font-display text-[15px] leading-snug text-bordeaux
          transition-colors group-hover:text-rosegold-dark line-clamp-2 min-h-[2.6em]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm">
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-bordeaux/40 line-through">{formatPrice(product.oldPrice)}</span>
          )}
          <span className="font-medium text-bordeaux">{formatPrice(product.price)}</span>
        </div>
      </Link>
    </motion.article>
  );
}
