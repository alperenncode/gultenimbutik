"use client";

/**
 * /hesabim — sekmeli hesap sayfası: Favorilerim + Profilim.
 * Giriş yapılmamışsa /giris sayfasına yönlendirir (client-side guard).
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, User, LogOut, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { fetchProductsByIds } from "@/lib/firestore/products";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";

type Tab = "favoriler" | "profil";

export function AccountTabs() {
  const { user, profile, isAdmin, loading, signOutUser } = useAuth();
  const { wishlist } = useWishlist();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState<Tab>(
    searchParams.get("sekme") === "profil" ? "profil" : "favoriler"
  );
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favsLoading, setFavsLoading] = useState(true);

  // Oturum yoksa girişe yönlendir
  useEffect(() => {
    if (!loading && !user) router.replace("/giris");
  }, [loading, user, router]);

  // Favori ürünleri yükle (wishlist değiştikçe tazelenir)
  useEffect(() => {
    if (!user) return;
    setFavsLoading(true);
    fetchProductsByIds(wishlist)
      .then(setFavorites)
      .catch((err) => console.error("Favoriler yüklenemedi:", err))
      .finally(() => setFavsLoading(false));
  }, [user, wishlist]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-rosegold-dark" />
      </div>
    );
  }

  const tabBtn = (t: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(t)}
      className={`relative flex items-center gap-2 px-5 py-3 text-sm transition-colors ${
        tab === t ? "text-bordeaux font-medium" : "text-bordeaux/50 hover:text-bordeaux"
      }`}
    >
      {icon}
      {label}
      {tab === t && (
        <motion.span
          layoutId="account-tab-underline"
          className="absolute inset-x-2 -bottom-px h-0.5 bg-rosegold-dark"
        />
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
      {/* Karşılama */}
      <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div>
          <p className="section-subtitle">Hesabım</p>
          <h1 className="mt-2 font-display text-3xl text-bordeaux">
            Hoş geldiniz{profile?.displayName ? `, ${profile.displayName}` : ""}
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 border border-rosegold-dark px-4 py-2.5
                text-xs uppercase tracking-wider text-rosegold-dark transition-all
                hover:bg-rosegold-dark hover:text-white"
            >
              <ShieldCheck size={15} /> Yönetim Paneli
            </Link>
          )}
          <button
            onClick={async () => {
              await signOutUser();
              router.push("/");
            }}
            className="inline-flex items-center gap-2 border border-bordeaux/20 px-4 py-2.5
              text-xs uppercase tracking-wider text-bordeaux/70 transition-all
              hover:border-bordeaux hover:text-bordeaux"
          >
            <LogOut size={15} /> Çıkış Yap
          </button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="mb-9 flex border-b border-rosegold/20">
        {tabBtn("favoriler", `Favorilerim (${wishlist.length})`, <Heart size={16} />)}
        {tabBtn("profil", "Profilim", <User size={16} />)}
      </div>

      <AnimatePresence mode="wait">
        {tab === "favoriler" ? (
          <motion.div
            key="favoriler"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {favsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={26} className="animate-spin text-rosegold-dark" />
              </div>
            ) : favorites.length === 0 ? (
              <div className="py-20 text-center">
                <Heart size={40} className="mx-auto text-rosegold/40" />
                <p className="mt-5 font-display text-2xl text-bordeaux/70">
                  Henüz favoriniz yok
                </p>
                <p className="mt-3 text-sm text-bordeaux/50">
                  Beğendiğiniz ürünlerin kalbine dokunun, burada sizi beklesinler.
                </p>
                <Link href="/urunler" className="btn-primary mt-8 inline-flex">
                  Koleksiyonu Keşfet
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
                {favorites.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="profil"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="max-w-md"
          >
            <dl className="space-y-5">
              <div>
                <dt className="input-label">Ad Soyad</dt>
                <dd className="text-sm text-bordeaux">
                  {profile?.displayName || "—"}
                </dd>
              </div>
              <div>
                <dt className="input-label">E-posta</dt>
                <dd className="break-all text-sm text-bordeaux">{user.email}</dd>
              </div>
              <div>
                <dt className="input-label">Favori Sayısı</dt>
                <dd className="text-sm text-bordeaux">{wishlist.length} ürün</dd>
              </div>
            </dl>
            <p className="mt-8 text-xs leading-relaxed text-bordeaux/45">
              Hesabınızla ilgili değişiklik talepleri için bize WhatsApp veya
              Instagram üzerinden ulaşabilirsiniz.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
