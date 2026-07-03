"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { X, ChevronDown, Instagram, Phone } from "lucide-react";
import { SITE } from "@/lib/site";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import type { Category } from "@/types";
import { useAuth } from "@/context/AuthContext";

/** Mobil menü — soldan kayan çekmece, kategoriler akordeon olarak açılır. */
export function MobileNav({
  categories,
  onClose,
}: {
  categories: Category[];
  onClose: () => void;
}) {
  const [catsOpen, setCatsOpen] = useState(true);
  const { user } = useAuth();

  const item = "block py-3 text-bordeaux/85 text-[15px] tracking-wide border-b border-rosegold/10";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-bordeaux/40 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="h-full w-[85%] max-w-sm bg-cream shadow-lifted flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-rosegold/15">
          <div>
            <span className="font-display text-xl text-bordeaux">Gültenim</span>
            <span className="ml-2 text-[10px] uppercase tracking-luxe text-rosegold-dark">
              Butik
            </span>
          </div>
          <button onClick={onClose} className="p-2 text-bordeaux/70" aria-label="Menüyü kapat">
            <X size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-4" aria-label="Mobil menü">
          <Link href="/" onClick={onClose} className={item}>
            Ana Sayfa
          </Link>

          {/* Kategoriler akordeonu */}
          <button
            className={`${item} flex w-full items-center justify-between`}
            onClick={() => setCatsOpen((v) => !v)}
            aria-expanded={catsOpen}
          >
            Koleksiyon
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${catsOpen ? "rotate-180" : ""}`}
            />
          </button>
          <motion.div
            initial={false}
            animate={{ height: catsOpen ? "auto" : 0 }}
            className="overflow-hidden"
          >
            <div className="py-1 pl-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  onClick={onClose}
                  className="block py-2.5 text-sm text-bordeaux/70 hover:text-rosegold-dark transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/urunler"
                onClick={onClose}
                className="block py-2.5 text-sm text-rosegold-dark font-medium"
              >
                Tüm Ürünler →
              </Link>
            </div>
          </motion.div>

          <Link href="/urunler?filtre=yeni" onClick={onClose} className={item}>
            Yeni Gelenler
          </Link>
          <Link href="/hakkimizda" onClick={onClose} className={item}>
            Hakkımızda
          </Link>
          <Link href="/iletisim" onClick={onClose} className={item}>
            İletişim
          </Link>
          <Link href={user ? "/hesabim" : "/giris"} onClick={onClose} className={item}>
            {user ? "Hesabım" : "Giriş Yap / Üye Ol"}
          </Link>
        </nav>

        {/* Alt iletişim kısayolları */}
        <div className="px-6 py-5 border-t border-rosegold/15 flex gap-3">
          <a
            href={buildGeneralWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white
              py-3 text-sm font-medium"
          >
            <Phone size={16} /> WhatsApp
          </a>
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-bordeaux text-cream
              py-3 text-sm font-medium"
          >
            <Instagram size={16} /> Instagram
          </a>
        </div>
      </motion.aside>
    </motion.div>
  );
}
