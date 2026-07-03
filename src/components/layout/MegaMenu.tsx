"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types";

/**
 * Masaüstü mega menü — kategori kartlarıyla açılan panel.
 * Escape ile kapanır; kategori görseli yoksa zarif bir monogram gösterilir.
 */
export function MegaMenu({
  categories,
  onClose,
}: {
  categories: Category[];
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute inset-x-0 top-full hidden lg:block border-t border-rosegold/20
        bg-cream-light shadow-lifted"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="mx-auto max-w-7xl px-8 py-10">
        {categories.length === 0 ? (
          <p className="text-sm text-bordeaux/50 text-center py-4">
            Kategoriler yakında eklenecek.
          </p>
        ) : (
          <div className="grid grid-cols-3 xl:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/kategori/${cat.slug}`} className="group block" onClick={onClose}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark">
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        sizes="200px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="font-display text-4xl text-rosegold/50">
                          {cat.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-bordeaux/0 transition-colors duration-300 group-hover:bg-bordeaux/10" />
                  </div>
                  <p className="mt-3 text-sm text-bordeaux transition-colors group-hover:text-rosegold-dark">
                    {cat.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-rosegold/15 pt-5 flex justify-end">
          <Link
            href="/urunler"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-luxe
              text-rosegold-dark transition-colors hover:text-bordeaux"
          >
            Tüm Koleksiyonu Gör <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
