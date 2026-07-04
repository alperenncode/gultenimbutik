"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, Menu, Search, ChevronDown } from "lucide-react";
import type { Category } from "@/types";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { MegaMenu } from "./MegaMenu";
import { SearchBar } from "./SearchBar";
import { MobileNav } from "./MobileNav";

export function Header({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { count } = useWishlist();
  const settings = useSiteSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sayfa değişince açık panelleri kapat
  useEffect(() => {
    setMegaOpen(false);
    setSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const navLink =
    "relative text-sm tracking-wide text-bordeaux/80 transition-colors hover:text-rosegold-dark " +
    "after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-rosegold-dark " +
    "after:transition-all after:duration-300 hover:after:w-full";

  return (
    <>
      {/* Üst duyuru şeridi */}
      <div className="bg-bordeaux text-cream/90 text-center text-[11px] tracking-widest uppercase py-2 px-4">
        {settings.announcement}
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-cream/95 backdrop-blur-md shadow-soft"
            : "bg-cream"
        }`}
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Mobil menü butonu */}
            <button
              className="lg:hidden p-2 -ml-2 text-bordeaux"
              onClick={() => setMobileOpen(true)}
              aria-label="Menüyü aç"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            {/* Logo */}
            <Link href="/" className="group flex flex-col items-center lg:items-start">
              <span className="font-display text-2xl md:text-[1.7rem] leading-none text-bordeaux">
                Gültenim
              </span>
              <span className="text-[10px] uppercase tracking-luxe text-rosegold-dark mt-1 transition-colors group-hover:text-bordeaux">
                Butik
              </span>
            </Link>

            {/* Masaüstü navigasyon */}
            <nav className="hidden lg:flex items-center gap-8" aria-label="Ana menü">
              <Link href="/" className={navLink}>
                Ana Sayfa
              </Link>
              <button
                className={`${navLink} flex items-center gap-1`}
                onMouseEnter={() => setMegaOpen(true)}
                onClick={() => setMegaOpen((v) => !v)}
                aria-expanded={megaOpen}
                aria-haspopup="true"
              >
                Koleksiyon
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`}
                />
              </button>
              <Link href="/urunler?filtre=yeni" className={navLink}>
                Yeni Gelenler
              </Link>
              <Link href="/hakkimizda" className={navLink}>
                Hakkımızda
              </Link>
              <Link href="/iletisim" className={navLink}>
                İletişim
              </Link>
            </nav>

            {/* Sağ ikonlar */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 text-bordeaux/80 transition-colors hover:text-rosegold-dark"
                aria-label="Ara"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              <Link
                href="/hesabim?sekme=favoriler"
                className="relative p-2.5 text-bordeaux/80 transition-colors hover:text-rosegold-dark"
                aria-label="Favorilerim"
              >
                <Heart size={20} strokeWidth={1.5} />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center
                        justify-center rounded-full bg-rosegold-dark px-1 text-[10px] font-semibold text-white"
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              <Link
                href={user ? "/hesabim" : "/giris"}
                className="p-2.5 text-bordeaux/80 transition-colors hover:text-rosegold-dark"
                aria-label={user ? "Hesabım" : "Giriş yap"}
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mega menü */}
        <AnimatePresence>
          {megaOpen && (
            <MegaMenu categories={categories} onClose={() => setMegaOpen(false)} />
          )}
        </AnimatePresence>
      </header>

      {/* Arama paneli */}
      <AnimatePresence>
        {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      {/* Mobil menü çekmecesi */}
      <AnimatePresence>
        {mobileOpen && (
          <MobileNav categories={categories} onClose={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
