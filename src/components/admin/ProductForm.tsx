"use client";

/**
 * Ürün ekleme/düzenleme formu — /admin/urunler/yeni ve /admin/urunler/[id]/duzenle
 * tarafından ortak kullanılır. Slug, ürün adından otomatik üretilir (düzenlenebilir).
 * Renk ve bedenler virgülle ayrılarak girilir.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { SITE } from "@/lib/site";
import { slugify } from "@/lib/utils";
import type { Category, Product } from "@/types";
import { fetchCategories } from "@/lib/firestore/categories";
import { createProduct, updateProduct, type ProductInput } from "@/lib/firestore/products";
import { ImageUploader } from "./ImageUploader";

const DEFAULT_SIZES = "36, 38, 40, 42, 44";

function parseList(s: string): string[] {
  return s.split(",").map((x) => x.trim()).filter(Boolean);
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [brand, setBrand] = useState(product?.brand ?? SITE.brands[0]);
  const [price, setPrice] = useState(product?.price ? String(product.price) : "");
  const [oldPrice, setOldPrice] = useState(product?.oldPrice ? String(product.oldPrice) : "");
  const [colors, setColors] = useState(product?.colors.join(", ") ?? "");
  const [sizes, setSizes] = useState(product?.sizes.join(", ") ?? DEFAULT_SIZES);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [description, setDescription] = useState(product?.description ?? "");
  const [fabricCare, setFabricCare] = useState(product?.fabricCare ?? "");
  const [isNew, setIsNew] = useState(product?.isNew ?? true);
  const [isPopular, setIsPopular] = useState(product?.isPopular ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  // Ad değişince slug otomatik güncellenir (elle düzenlenmediyse)
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const category = categories.find((c) => c.id === categoryId);
    if (!category) return setError("Lütfen bir kategori seçin.");
    if (!name.trim()) return setError("Ürün adı boş olamaz.");
    if (!price || Number(price) <= 0) return setError("Geçerli bir fiyat girin.");
    if (images.length === 0) return setError("En az bir görsel yükleyin.");

    const input: ProductInput = {
      name: name.trim(),
      slug: slug || slugify(name),
      categoryId: category.id,
      categorySlug: category.slug,
      brand,
      price: Math.round(Number(price)),
      ...(oldPrice && Number(oldPrice) > 0
        ? { oldPrice: Math.round(Number(oldPrice)) }
        : {}),
      colors: parseList(colors),
      sizes: parseList(sizes),
      images,
      description: description.trim(),
      ...(fabricCare.trim() ? { fabricCare: fabricCare.trim() } : {}),
      isNew,
      isPopular,
      isActive,
    } as ProductInput;

    setBusy(true);
    try {
      if (isEdit && product) await updateProduct(product.id, input);
      else await createProduct(input);
      router.push("/admin/urunler");
    } catch (err) {
      console.error(err);
      setError("Kaydedilemedi. Yetkinizi ve bağlantınızı kontrol edin.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="input-label">Ürün Adı *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Örn: Şifon Detaylı Elbise — Bordo"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="input-label">URL (slug)</label>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="input-field font-mono text-xs"
          />
        </div>

        <div>
          <label className="input-label">Kategori *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="input-field"
          >
            <option value="">Seçin…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Marka *</label>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field">
            {SITE.brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">Fiyat (₺) *</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="input-field"
            placeholder="2800"
          />
        </div>

        <div>
          <label className="input-label">İndirim Öncesi Fiyat (₺)</label>
          <input
            type="number"
            min="0"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            className="input-field"
            placeholder="Boş bırakılabilir"
          />
        </div>

        <div>
          <label className="input-label">Renkler (virgülle)</label>
          <input
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            className="input-field"
            placeholder="Bordo, Siyah, Vizon"
          />
        </div>

        <div>
          <label className="input-label">Bedenler (virgülle)</label>
          <input
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
            className="input-field"
            placeholder={DEFAULT_SIZES}
          />
        </div>
      </div>

      <div>
        <label className="input-label">Görseller * (ilk görsel kapak olur)</label>
        <ImageUploader
          images={images}
          onChange={setImages}
          folder={`products/${product?.id ?? "yeni"}`}
        />
      </div>

      <div>
        <label className="input-label">Açıklama</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="input-field resize-y"
          placeholder="Ürünün kesimi, kumaşı, kombin önerisi…"
        />
      </div>

      <div>
        <label className="input-label">Kumaş & Bakım</label>
        <textarea
          value={fabricCare}
          onChange={(e) => setFabricCare(e.target.value)}
          rows={3}
          className="input-field resize-y"
          placeholder="%100 viskon. 30°C'de hassas yıkama önerilir."
        />
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-bordeaux/75">
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)}
            className="h-4 w-4 accent-rosegold-dark" />
          Yeni ürün rozeti
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={isPopular} onChange={(e) => setIsPopular(e.target.checked)}
            className="h-4 w-4 accent-rosegold-dark" />
          Popüler (ana sayfada göster)
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-rosegold-dark" />
          Vitrinde aktif
        </label>
      </div>

      {error && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isEdit ? "Güncelle" : "Ürünü Kaydet"}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-outline">
          Vazgeç
        </button>
      </div>
    </form>
  );
}
