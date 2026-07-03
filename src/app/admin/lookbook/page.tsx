"use client";

/** Lookbook yönetimi — görsel grid'i + ekleme/düzenleme modalı. */
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import type { LookbookItem } from "@/types";
import {
  fetchAllLookbookAdmin,
  createLookbookItem,
  updateLookbookItem,
  deleteLookbookItem,
} from "@/lib/firestore/lookbook";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminLookbookPage() {
  const [items, setItems] = useState<LookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LookbookItem | null | "new">(null);
  const [busyId, setBusyId] = useState("");

  function load() {
    fetchAllLookbookAdmin().then(setItems).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function onDelete(item: LookbookItem) {
    if (!confirm("Bu lookbook görseli silinsin mi?")) return;
    setBusyId(item.id);
    try {
      await deleteLookbookItem(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
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
          <h1 className="font-display text-2xl text-bordeaux">Lookbook</h1>
          <p className="mt-1 text-sm text-bordeaux/50">
            Ana sayfadaki stil önerileri bölümü — ilk görsel büyük gösterilir
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary !py-2.5 text-xs">
          <Plus size={15} /> Yeni Görsel
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="animate-spin text-rosegold-dark" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative aspect-[3/4] overflow-hidden bg-cream-dark">
              <Image src={item.imageUrl} alt={item.caption ?? ""} fill sizes="200px" className="object-cover" />
              {!item.isActive && (
                <span className="absolute left-2 top-2 bg-gray-800/80 px-2 py-0.5 text-[10px]
                  uppercase tracking-wider text-white">
                  Pasif
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between
                bg-bordeaux/75 px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="truncate text-xs text-cream/80">{item.caption || `Sıra ${item.order}`}</span>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(item)} className="p-1 text-cream" aria-label="Düzenle">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    disabled={busyId === item.id}
                    className="p-1 text-cream hover:text-red-300"
                    aria-label="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <LookbookModal
            item={editing === "new" ? null : editing}
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

function LookbookModal({
  item,
  onClose,
  onSaved,
}: {
  item: LookbookItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [caption, setCaption] = useState(item?.caption ?? "");
  const [order, setOrder] = useState(String(item?.order ?? 1));
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [images, setImages] = useState<string[]>(item?.imageUrl ? [item.imageUrl] : []);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0) return setError("Bir görsel yükleyin.");
    setBusy(true);
    setError("");
    try {
      const input = {
        imageUrl: images[0],
        caption: caption.trim(),
        order: Number(order) || 1,
        isActive,
      };
      if (item) await updateLookbookItem(item.id, input);
      else await createLookbookItem(input);
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
            {item ? "Görseli Düzenle" : "Yeni Lookbook Görseli"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-bordeaux/60" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="input-label">Görsel *</label>
            <ImageUploader images={images} onChange={(imgs) => setImages(imgs.slice(-1))}
              folder="lookbook" max={1} />
          </div>
          <div>
            <label className="input-label">Başlık / Kombin Notu</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} className="input-field"
              placeholder="Örn: Vizon tonlarında sonbahar zarafeti" />
          </div>
          <div>
            <label className="input-label">Sıra</label>
            <input type="number" min="1" value={order} onChange={(e) => setOrder(e.target.value)}
              className="input-field" />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bordeaux/75">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 accent-rosegold-dark" />
            Ana sayfada göster
          </label>

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
