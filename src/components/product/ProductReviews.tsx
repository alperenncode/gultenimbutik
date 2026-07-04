"use client";

/**
 * Ürün yorumları bölümü — ürün sayfasının altında gösterilir.
 * - Onaylı yorumlar herkese açık: maskeli isim ("Ayşe K."), yıldız, tarih, metin
 * - Yorum yazma yalnızca üyelere açık; üye değilse giriş/kayıt yönlendirmesi
 * - Yeni yorum admin onayına düşer; gönderen kişiye bilgi mesajı gösterilir
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Loader2, Send, CheckCircle2, UserRound } from "lucide-react";
import type { Review } from "@/types";
import { useAuth } from "@/context/AuthContext";
import {
  fetchProductReviews,
  createReview,
  maskDisplayName,
} from "@/lib/firestore/reviews";

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} yıldız`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < value ? "text-rosegold-dark" : "text-bordeaux/15"}
          fill={i < value ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

function formatDate(millis: number): string {
  if (!millis) return "";
  return new Date(millis).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ProductReviews({
  productId,
  productSlug,
  productName,
}: {
  productId: string;
  productSlug: string;
  productName: string;
}) {
  const { user, profile, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProductReviews(productId)
      .then(setReviews)
      .catch((err) => console.error("Yorumlar yüklenemedi:", err))
      .finally(() => setLoading(false));
  }, [productId]);

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setError("Lütfen birkaç kelimelik bir yorum yazın.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      await createReview({
        productId,
        productSlug,
        productName,
        userId: user.uid,
        name: maskDisplayName(profile?.displayName ?? user.displayName, user.email),
        rating,
        text: trimmed,
      });
      setSubmitted(true);
      setText("");
    } catch (err) {
      console.error(err);
      setError("Yorum gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-8 pb-6" aria-label="Ürün yorumları">
      <div className="mx-auto max-w-3xl border-t border-rosegold/20 pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-subtitle">Değerlendirmeler</p>
            <h2 className="mt-2 font-display text-2xl text-bordeaux md:text-3xl">
              Müşteri Yorumları
            </h2>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-bordeaux/60">
              <Stars value={Math.round(average)} size={16} />
              <span className="font-medium text-bordeaux">{average.toFixed(1)}</span>
              <span>({reviews.length} yorum)</span>
            </div>
          )}
        </div>

        {/* Yorum listesi */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={22} className="animate-spin text-rosegold-dark" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="py-6 text-sm text-bordeaux/50">
              Bu ürüne henüz yorum yapılmamış — ilk yorumu siz yazın.
            </p>
          ) : (
            <ul className="space-y-6">
              {reviews.map((r) => (
                <li key={r.id} className="border border-rosegold/15 bg-cream-light p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-bordeaux">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full
                        bg-rosegold/15 text-rosegold-dark">
                        <UserRound size={15} />
                      </span>
                      {r.name}
                    </span>
                    <span className="flex items-center gap-3">
                      <Stars value={r.rating} />
                      <span className="text-xs text-bordeaux/40">{formatDate(r.createdAt)}</span>
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-bordeaux/70 whitespace-pre-line">
                    {r.text}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Yorum yazma alanı */}
        <div className="mt-10">
          {authLoading ? null : !user ? (
            <div className="border border-rosegold/20 bg-cream-light p-6 text-center">
              <p className="text-sm text-bordeaux/65">
                Yorum yazabilmek için üye girişi yapmanız gerekiyor.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link href="/giris" className="btn-primary !py-2.5 text-xs">
                  Giriş Yap
                </Link>
                <Link href="/kayit" className="btn-outline !py-2.5 text-xs">
                  Üye Ol
                </Link>
              </div>
            </div>
          ) : submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 border border-green-200 bg-green-50 p-5
                text-sm text-green-800"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <p>
                Yorumunuz alındı, teşekkür ederiz! Kısa bir incelemenin ardından
                onaylanıp burada yayınlanacaktır.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={onSubmit} className="border border-rosegold/20 bg-cream-light p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-bordeaux">
                Yorumunuzu Yazın
              </p>
              <p className="mt-1 text-xs text-bordeaux/45">
                Adınız &ldquo;{maskDisplayName(profile?.displayName ?? user.displayName, user.email)}&rdquo;
                olarak görünecektir.
              </p>

              <div className="mt-4">
                <p className="input-label">Puanınız</p>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRating(r)}
                      onMouseEnter={() => setHoverRating(r)}
                      aria-label={`${r} yıldız ver`}
                      className="p-0.5"
                    >
                      <Star
                        size={24}
                        className={
                          r <= (hoverRating || rating)
                            ? "text-rosegold-dark"
                            : "text-bordeaux/20"
                        }
                        fill={r <= (hoverRating || rating) ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="input-label" htmlFor="review-text">Yorumunuz</label>
                <textarea
                  id="review-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="input-field resize-y"
                  placeholder="Ürün hakkındaki deneyiminizi paylaşın…"
                />
              </div>

              {error && (
                <p className="mt-3 border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700"
                  role="alert">
                  {error}
                </p>
              )}

              <button type="submit" disabled={busy} className="btn-primary mt-5 disabled:opacity-60">
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Yorumu Gönder
              </button>
              <p className="mt-3 text-xs text-bordeaux/40">
                Yorumlar yayınlanmadan önce mağaza tarafından onaylanır.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
