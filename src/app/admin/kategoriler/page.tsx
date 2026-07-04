"use client";

/** Kategori yönetimi — liste + ekleme/düzenleme modalı. */
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import { HelpTip } from "@/components/admin/HelpTip";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/firestore/categories";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null | "new">(null);
  const [busyId, setBusyId] = useState("");

  function load() {
    fetchCategories().then(setCategories).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function onDelete(cat: Category) {
    if (!confirm(`"${cat.name}" silinsin mi? Bu kategorideki ürünler vitrinde kategorisiz kalır.`))
      return;
    setBusyId(cat.id);
    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl text-bordeaux">
            Kategoriler
            <HelpTip title="Kategori Yönetimi Nasıl Çalışır?">
              <p>
                Kategoriler, ürünlerinizi gruplara ayırır: Elbise, Takım, Dış Giyim
                gibi. Sitede üç yerde görünürler:
              </p>
              <ul>
                <li>Ana sayfadaki <strong>&ldquo;Size Özel Seçkiler&rdquo;</strong> kartları</li>
                <li>Üst menüdeki <strong>Koleksiyon</strong> açılır menüsü</li>
                <li>Ürünler sayfasındaki <strong>kategori filtresi</strong></li>
              </ul>
              <p><strong>Yeni kategori eklemek için:</strong></p>
              <ol>
                <li><strong>Yeni Kategori</strong> butonuna dokunun.</li>
                <li>Adını yazın (ör. &ldquo;Tunik&rdquo;).</li>
                <li>Güzel bir temsil fotoğrafı yükleyin — ana sayfa kartında bu görünür.</li>
                <li><strong>Sıra</strong> numarası küçük olan önce gösterilir (1 en başta).</li>
              </ol>
              <p>
                <strong>Dikkat — silme:</strong> İçinde ürün olan bir kategoriyi silerseniz
                o ürünler kaybolmaz ama vitrinde kategorisiz kalır; ürünleri düzenleyip
                yeni bir kategori seçmeniz gerekir. Silmeden önce ürünleri başka
                kategoriye taşımak en temizidir.
              </p>
            </HelpTip>
          </h1>
          <p className="mt-1 text-sm text-bordeaux/50">{categories.length} kategori</p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary !py-2.5 text-xs">
          <Plus size={15} /> Yeni Kategori
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="animate-spin text-rosegold-dark" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 border border-bordeaux/10 bg-white p-4">
              <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-cream-dark">
                {cat.imageUrl && (
                  <Image src={cat.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-bordeaux">{cat.name}</p>
                <p className="text-xs text-bordeaux/40">/{cat.slug} · sıra {cat.order}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(cat)}
                  className="p-2 text-bordeaux/50 hover:text-rosegold-dark transition-colors"
                  aria-label="Düzenle"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(cat)}
                  disabled={busyId === cat.id}
                  className="p-2 text-bordeaux/50 hover:text-red-600 transition-colors"
                  aria-label="Sil"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <CategoryModal
            category={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [order, setOrder] = useState(String(category?.order ?? 1));
  const [description, setDescription] = useState(category?.description ?? "");
  const [images, setImages] = useState<string[]>(category?.imageUrl ? [category.imageUrl] : []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Kategori adı boş olamaz.");
    setBusy(true);
    setError("");
    try {
      const input = {
        name: name.trim(),
        slug: category?.slug ?? slugify(name),
        order: Number(order) || 1,
        imageUrl: images[0] ?? "",
        description: description.trim(),
      };
      if (category) await updateCategory(category.id, input);
      else await createCategory(input);
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Kaydedilemedi. Yetkinizi kontrol edin.");
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bordeaux/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 12 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-cream p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-bordeaux">
            {category ? "Kategoriyi Düzenle" : "Yeni Kategori"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-bordeaux/60" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="input-label">Ad *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field"
              placeholder="Örn: Elbise" />
          </div>
          <div>
            <label className="input-label">Sıra</label>
            <input type="number" min="1" value={order} onChange={(e) => setOrder(e.target.value)}
              className="input-field" />
          </div>
          <div>
            <label className="input-label">Açıklama</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="input-field resize-y" />
          </div>
          <div>
            <label className="input-label">Kapak Görseli</label>
            <ImageUploader images={images} onChange={(imgs) => setImages(imgs.slice(-1))}
              folder="categories" max={1} />
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Kaydet
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
