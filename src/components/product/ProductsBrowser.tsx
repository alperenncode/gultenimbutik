"use client";

/**
 * /urunler — tüm koleksiyon + filtreler.
 * Aktif ürünler tek seferde çekilir, filtreleme tamamen client-side yapılır
 * (bu ölçekte en hızlı ve en ekonomik yaklaşım). URL parametreleri desteklenir:
 *   ?kategori=elbise  ?marka=İnvee  ?filtre=yeni  ?ara=takım
 */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import type { Product, Category } from "@/types";
import { SITE } from "@/lib/site";
import { fetchActiveProducts } from "@/lib/firestore/products";
import { ProductCard } from "./ProductCard";

type SortKey = "yeni" | "fiyat-artan" | "fiyat-azalan";

/** Türkçe karakter duyarlı, aksan bağımsız arama karşılaştırması */
function normalize(s: string): string {
  return s.toLocaleLowerCase("tr-TR").replace(/İ/g, "i").replace(/ı/g, "i");
}

export function ProductsBrowser({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtre durumu — URL parametrelerinden başlangıç değerleri alınır
  const [category, setCategory] = useState(searchParams.get("kategori") ?? "");
  const [brand, setBrand] = useState(searchParams.get("marka") ?? "");
  const [onlyNew, setOnlyNew] = useState(searchParams.get("filtre") === "yeni");
  const [search, setSearch] = useState(searchParams.get("ara") ?? "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [sort, setSort] = useState<SortKey>("yeni");

  // URL değişince (ör. header aramasından) filtreleri güncelle
  useEffect(() => {
    setSearch(searchParams.get("ara") ?? "");
    setCategory(searchParams.get("kategori") ?? "");
    setBrand(searchParams.get("marka") ?? "");
    setOnlyNew(searchParams.get("filtre") === "yeni");
  }, [searchParams]);

  useEffect(() => {
    fetchActiveProducts()
      .then(setProducts)
      .catch((err) => console.error("Ürünler yüklenemedi:", err))
      .finally(() => setLoading(false));
  }, []);

  const allSizes = useMemo(
    () => [...new Set(products.flatMap((p) => p.sizes))],
    [products]
  );

  // Marka listesi üründen türetilir (admin yeni marka eklerse filtre otomatik güncellenir)
  const allBrands = useMemo(() => {
    const fromProducts = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    return fromProducts.length > 0 ? fromProducts : [...SITE.brands];
  }, [products]);

  // Renk listesi de ürünlerden türetilir — admin yeni renk girdikçe filtre büyür
  const allColors = useMemo(
    () => [...new Set(products.flatMap((p) => p.colors).filter(Boolean))],
    [products]
  );

  // Filtre seçeneklerinin yanında kaç ürün olduğu gösterilir
  const counts = useMemo(() => {
    const byCategory = new Map<string, number>();
    const byBrand = new Map<string, number>();
    for (const p of products) {
      byCategory.set(p.categorySlug, (byCategory.get(p.categorySlug) ?? 0) + 1);
      if (p.brand) byBrand.set(p.brand, (byBrand.get(p.brand) ?? 0) + 1);
    }
    return { byCategory, byBrand };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (category) list = list.filter((p) => p.categorySlug === category);
    if (brand) list = list.filter((p) => p.brand === brand);
    if (onlyNew) list = list.filter((p) => p.isNew);
    if (onlyDiscount)
      list = list.filter((p) => p.oldPrice != null && p.oldPrice > p.price);
    if (size) list = list.filter((p) => p.sizes.includes(size));
    if (color) list = list.filter((p) => p.colors.includes(color));
    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    if (search.trim()) {
      const q = normalize(search.trim());
      list = list.filter(
        (p) =>
          normalize(p.name).includes(q) ||
          normalize(p.brand).includes(q) ||
          normalize(p.description).includes(q)
      );
    }
    switch (sort) {
      case "fiyat-artan":
        return [...list].sort((a, b) => a.price - b.price);
      case "fiyat-azalan":
        return [...list].sort((a, b) => b.price - a.price);
      default:
        return [...list].sort((a, b) => b.createdAt - a.createdAt);
    }
  }, [products, category, brand, onlyNew, onlyDiscount, size, color, minPrice, maxPrice, search, sort]);

  function clearFilters() {
    setCategory("");
    setBrand("");
    setOnlyNew(false);
    setOnlyDiscount(false);
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSize("");
    setColor("");
  }

  const hasActiveFilter =
    category || brand || onlyNew || onlyDiscount || search || minPrice || maxPrice || size || color;

  const filterPanel = (
    <div className="space-y-7">
      {/* Kategori */}
      <div>
        <p className="input-label">Kategori</p>
        <div className="space-y-1.5">
          <button
            onClick={() => setCategory("")}
            className={`block text-sm transition-colors ${
              !category ? "text-rosegold-dark font-medium" : "text-bordeaux/60 hover:text-bordeaux"
            }`}
          >
            Tümü <span className="text-bordeaux/35">({products.length})</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(category === c.slug ? "" : c.slug)}
              className={`block text-sm transition-colors ${
                category === c.slug
                  ? "text-rosegold-dark font-medium"
                  : "text-bordeaux/60 hover:text-bordeaux"
              }`}
            >
              {c.name}{" "}
              <span className="text-bordeaux/35">({counts.byCategory.get(c.slug) ?? 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Marka */}
      <div>
        <p className="input-label">Marka</p>
        <div className="flex flex-wrap gap-2">
          {allBrands.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(brand === b ? "" : b)}
              className={`border px-3 py-1.5 text-xs transition-all ${
                brand === b
                  ? "border-bordeaux bg-bordeaux text-cream"
                  : "border-bordeaux/20 text-bordeaux/70 hover:border-rosegold-dark"
              }`}
            >
              {b}
              {counts.byBrand.has(b) && (
                <span className={brand === b ? "ml-1 text-cream/60" : "ml-1 text-bordeaux/35"}>
                  ({counts.byBrand.get(b)})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Renk */}
      {allColors.length > 0 && (
        <div>
          <p className="input-label">Renk</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(color === c ? "" : c)}
                className={`border px-3 py-1.5 text-xs transition-all ${
                  color === c
                    ? "border-bordeaux bg-bordeaux text-cream"
                    : "border-bordeaux/20 text-bordeaux/70 hover:border-rosegold-dark"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fiyat aralığı */}
      <div>
        <p className="input-label">Fiyat Aralığı (₺)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="En az"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input-field !py-2 text-xs"
          />
          <span className="text-bordeaux/40">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="En çok"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input-field !py-2 text-xs"
          />
        </div>
      </div>

      {/* Beden */}
      {allSizes.length > 0 && (
        <div>
          <p className="input-label">Beden</p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(size === s ? "" : s)}
                className={`min-w-[44px] border px-2.5 py-1.5 text-xs transition-all ${
                  size === s
                    ? "border-bordeaux bg-bordeaux text-cream"
                    : "border-bordeaux/20 text-bordeaux/70 hover:border-rosegold-dark"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hızlı filtreler */}
      <div className="space-y-2.5">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bordeaux/75">
          <input
            type="checkbox"
            checked={onlyNew}
            onChange={(e) => setOnlyNew(e.target.checked)}
            className="h-4 w-4 accent-rosegold-dark"
          />
          Sadece yeni gelenler
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-bordeaux/75">
          <input
            type="checkbox"
            checked={onlyDiscount}
            onChange={(e) => setOnlyDiscount(e.target.checked)}
            className="h-4 w-4 accent-rosegold-dark"
          />
          Sadece indirimli ürünler
        </label>
      </div>

      {hasActiveFilter && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center gap-1.5 text-xs text-rosegold-dark underline
            underline-offset-4 hover:text-bordeaux transition-colors"
        >
          <X size={13} /> Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
      <div className="mb-10 text-center">
        <p className="section-subtitle">Koleksiyon</p>
        <h1 className="section-title mt-3">
          {search ? `"${search}" için sonuçlar` : "Tüm Ürünler"}
        </h1>
      </div>

      <div className="flex gap-10">
        {/* Masaüstü filtre kolonu */}
        <aside className="hidden w-60 shrink-0 lg:block">{filterPanel}</aside>

        <div className="flex-1">
          {/* Üst çubuk: sonuç sayısı + sıralama + mobil filtre butonu */}
          <div className="mb-7 flex items-center justify-between gap-4">
            <p className="text-xs text-bordeaux/50">
              {loading ? "Yükleniyor…" : `${filtered.length} ürün`}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 border border-bordeaux/20 px-3.5
                  py-2 text-xs text-bordeaux lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filtrele
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="border border-bordeaux/20 bg-transparent px-3 py-2 text-xs
                  text-bordeaux focus:border-rosegold focus:outline-none"
                aria-label="Sırala"
              >
                <option value="yeni">En Yeniler</option>
                <option value="fiyat-artan">Fiyat: Düşükten Yükseğe</option>
                <option value="fiyat-azalan">Fiyat: Yüksekten Düşüğe</option>
              </select>
            </div>
          </div>

          {/* Ürün grid'i */}
          {loading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-cream-dark" />
                  <div className="mx-auto mt-4 h-3 w-2/3 bg-cream-dark" />
                  <div className="mx-auto mt-2 h-3 w-1/3 bg-cream-dark" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-2xl text-bordeaux/70">
                Aradığınız kriterlere uygun ürün bulunamadı
              </p>
              <p className="mt-3 text-sm text-bordeaux/50">
                Filtreleri temizleyip tekrar deneyebilir veya WhatsApp&apos;tan bize sorabilirsiniz.
              </p>
              {hasActiveFilter && (
                <button onClick={clearFilters} className="btn-outline mt-7">
                  Filtreleri Temizle
                </button>
              )}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobil filtre çekmecesi */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-bordeaux/40 backdrop-blur-sm lg:hidden"
            onClick={() => setFiltersOpen(false)}
          >
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="ml-auto h-full w-[85%] max-w-sm overflow-y-auto bg-cream p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="font-display text-lg text-bordeaux">Filtrele</p>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="p-2 text-bordeaux/60"
                  aria-label="Filtreleri kapat"
                >
                  <X size={20} />
                </button>
              </div>
              {filterPanel}
              <button onClick={() => setFiltersOpen(false)} className="btn-primary mt-8 w-full">
                Sonuçları Göster ({filtered.length})
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
