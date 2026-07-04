"use client";

/**
 * Yorum yönetimi — iki sekme:
 *  1) Ürün Yorumları: müşterilerin ürün sayfalarından gönderdiği yorumlar.
 *     Onay bekleyenler üstte; Onayla / Yayından Kaldır / Sil işlemleri.
 *  2) Vitrin Yorumları: ana sayfada gösterilen, elle eklenen müşteri alıntıları.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Loader2, X, Save, Star,
  CheckCircle2, EyeOff, MessageSquare, Quote, Clock,
} from "lucide-react";
import type { Testimonial, Review } from "@/types";
import {
  fetchAllTestimonialsAdmin,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/firestore/testimonials";
import {
  fetchAllReviewsAdmin,
  setReviewApproved,
  deleteReview,
} from "@/lib/firestore/reviews";

type Tab = "urun" | "vitrin";

export default function AdminCommentsPage() {
  const [tab, setTab] = useState<Tab>("urun");
  const [pendingCount, setPendingCount] = useState(0);

  const tabBtn = (t: Tab, label: string, icon: React.ReactNode, badge?: number) => (
    <button
      onClick={() => setTab(t)}
      className={`relative flex items-center gap-2 px-4 py-3 text-sm transition-colors ${
        tab === t ? "text-bordeaux font-medium" : "text-bordeaux/50 hover:text-bordeaux"
      }`}
    >
      {icon}
      {label}
      {badge ? (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full
          bg-rosegold-dark px-1.5 text-[11px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
      {tab === t && (
        <motion.span
          layoutId="admin-comments-tab"
          className="absolute inset-x-2 -bottom-px h-0.5 bg-rosegold-dark"
        />
      )}
    </button>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-bordeaux">Yorumlar</h1>
        <p className="mt-1 text-sm text-bordeaux/50">
          Ürün yorumlarını onaylayın, ana sayfa vitrin yorumlarını düzenleyin
        </p>
      </div>

      <div className="mb-8 flex border-b border-rosegold/20">
        {tabBtn("urun", "Ürün Yorumları", <MessageSquare size={15} />, pendingCount)}
        {tabBtn("vitrin", "Vitrin Yorumları", <Quote size={15} />)}
      </div>

      {tab === "urun" ? (
        <ProductReviewsTab onPendingCount={setPendingCount} />
      ) : (
        <TestimonialsTab />
      )}
    </div>
  );
}

/* ── Sekme 1: Ürün yorumları ─────────────────────────────────────────── */

function ProductReviewsTab({ onPendingCount }: { onPendingCount: (n: number) => void }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    fetchAllReviewsAdmin()
      .then((list) => {
        setReviews(list);
        onPendingCount(list.filter((r) => !r.approved).length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [onPendingCount]);

  function updateLocal(list: Review[]) {
    setReviews(list);
    onPendingCount(list.filter((r) => !r.approved).length);
  }

  async function toggleApproved(r: Review) {
    setBusyId(r.id);
    try {
      await setReviewApproved(r.id, !r.approved);
      updateLocal(reviews.map((x) => (x.id === r.id ? { ...x, approved: !r.approved } : x)));
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId("");
    }
  }

  async function onDelete(r: Review) {
    if (!confirm(`${r.name} adlı müşterinin "${r.productName}" yorumunu kalıcı olarak silmek istiyor musunuz?`))
      return;
    setBusyId(r.id);
    try {
      await deleteReview(r.id);
      updateLocal(reviews.filter((x) => x.id !== r.id));
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId("");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 size={28} className="animate-spin text-rosegold-dark" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="border border-bordeaux/10 bg-white py-20 text-center">
        <p className="text-sm text-bordeaux/50">
          Henüz ürün yorumu yok. Müşteriler ürün sayfalarından yorum yazabilir;
          yorumlar burada onayınıza düşer.
        </p>
      </div>
    );
  }

  // Onay bekleyenler üstte
  const sorted = [...reviews].sort((a, b) =>
    a.approved === b.approved ? b.createdAt - a.createdAt : a.approved ? 1 : -1
  );

  return (
    <div className="space-y-4">
      {sorted.map((r) => (
        <div
          key={r.id}
          className={`border bg-white p-5 ${
            r.approved ? "border-bordeaux/10" : "border-rosegold-dark/40"
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-bordeaux">{r.name}</p>
                <span className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={12} className="text-rosegold-dark" fill="currentColor" />
                  ))}
                </span>
                {r.approved ? (
                  <span className="flex items-center gap-1 bg-green-100 px-2 py-0.5
                    text-[11px] uppercase tracking-wider text-green-800">
                    <CheckCircle2 size={11} /> Yayında
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-rosegold/20 px-2 py-0.5
                    text-[11px] uppercase tracking-wider text-rosegold-dark">
                    <Clock size={11} /> Onay Bekliyor
                  </span>
                )}
              </div>
              <Link
                href={`/urun/${r.productSlug}`}
                target="_blank"
                className="mt-1 block text-xs text-bordeaux/50 underline-offset-2 hover:underline"
              >
                {r.productName}
              </Link>
            </div>
            <p className="text-xs text-bordeaux/40">
              {r.createdAt
                ? new Date(r.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric", month: "long", year: "numeric",
                  })
                : ""}
            </p>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-bordeaux/70 whitespace-pre-line">
            {r.text}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => toggleApproved(r)}
              disabled={busyId === r.id}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase
                tracking-wider transition-colors disabled:opacity-50 ${
                  r.approved
                    ? "border border-bordeaux/20 text-bordeaux/70 hover:border-bordeaux"
                    : "bg-bordeaux text-cream hover:bg-rosegold-dark"
                }`}
            >
              {busyId === r.id ? (
                <Loader2 size={13} className="animate-spin" />
              ) : r.approved ? (
                <EyeOff size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}
              {r.approved ? "Yayından Kaldır" : "Onayla ve Yayınla"}
            </button>
            <button
              onClick={() => onDelete(r)}
              disabled={busyId === r.id}
              className="inline-flex items-center gap-1.5 border border-red-200 px-3.5 py-2
                text-xs uppercase tracking-wider text-red-600 transition-colors
                hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={13} /> Sil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Sekme 2: Vitrin yorumları (ana sayfa alıntıları) ────────────────── */

function TestimonialsTab() {
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-bordeaux/50">
          Ana sayfada gösterilir — WhatsApp/Instagram&apos;dan gelen güzel geri bildirimleri ekleyin
        </p>
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
