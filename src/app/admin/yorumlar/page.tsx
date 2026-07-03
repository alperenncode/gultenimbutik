"use client";

/** Müşteri yorumları yönetimi — liste + ekleme/düzenleme modalı. */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Loader2, X, Save, Star } from "lucide-react";
import type { Testimonial } from "@/types";
import {
  fetchAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/firestore/testimonials";

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null | "new">(null);
  const [busyId, setBusyId] = useState("");

  function load() {
    fetchAllTestimonialsAdmin().then(setItems).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function onDelete(t: Testimonial) {
    if (!confirm(`${t.name} adlı müşterinin yorumu silinsin mi?`)) return;
    setBusyId(t.id);
    try {
      await deleteTestimonial(t.id);
      setItems((prev) => prev.filter((x) => x.id !== t.id));
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
          <h1 className="font-display text-2xl text-bordeaux">Müşteri Yorumları</h1>
          <p className="mt-1 text-sm text-bordeaux/50">
            Ana sayfada gösterilir — WhatsApp/Instagram&apos;dan gelen güzel geri bildirimleri ekleyin
          </p>
        </div>
        <button onClick={() => setEditing("new")} className="btn-primary !py-2.5 text-xs">
          <Plus size={15} /> Yeni Yorum
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="animate-spin text-rosegold-dark" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="flex flex-col border border-bordeaux/10 bg-white p-5">
              <div className="flex items-start justify-between">
                <p className="font-medium text-bordeaux">{t.name}</p>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(t)}
                    className="p-1.5 text-bordeaux/50 hover:text-rosegold-dark" aria-label="Düzenle">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDelete(t)} disabled={busyId === t.id}
                    className="p-1.5 text-bordeaux/50 hover:text-red-600" aria-label="Sil">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {t.rating && (
                <div className="mt-1 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={12} className="text-rosegold-dark" fill="currentColor" />
                  ))}
                </div>
              )}
              <p className="mt-3 flex-1 text-sm italic leading-relaxed text-bordeaux/60">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-3 text-xs text-bordeaux/35">
                Sıra {t.order} · {t.isActive ? "Yayında" : "Pasif"}
              </p>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing && (
          <TestimonialModal
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

function TestimonialModal({
  item,
  onClose,
  onSaved,
}: {
  item: Testimonial | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [quote, setQuote] = useState(item?.quote ?? "");
  const [rating, setRating] = useState(item?.rating ?? 5);
  const [order, setOrder] = useState(String(item?.order ?? 1));
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) return setError("İsim ve yorum boş olamaz.");
    setBusy(true);
    setError("");
    try {
      const input = {
        name: name.trim(),
        quote: quote.trim(),
        rating,
        order: Number(order) || 1,
        isActive,
      };
      if (item) await updateTestimonial(item.id, input);
      else await createTestimonial(input);
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
        className="w-full max-w-md bg-cream p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl text-bordeaux">
            {item ? "Yorumu Düzenle" : "Yeni Yorum"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-bordeaux/60" aria-label="Kapat">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="input-label">Müşteri Adı *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field"
              placeholder="Örn: Ayşe K." />
          </div>
          <div>
            <label className="input-label">Yorum *</label>
            <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={4}
              className="input-field resize-y"
              placeholder="Elbise fotoğraftakinden de güzel çıktı, bayıldım…" />
          </div>
          <div>
            <label className="input-label">Puan</label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setRating(r)} aria-label={`${r} yıldız`}>
                  <Star
                    size={22}
                    className={r <= rating ? "text-rosegold-dark" : "text-bordeaux/20"}
                    fill={r <= rating ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
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
