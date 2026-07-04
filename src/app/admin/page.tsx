"use client";

/** Panel özeti — canlı ziyaretçi istatistikleri + koleksiyon sayıları. */
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, FolderTree, MessageSquareQuote, Images, Plus, Radio,
  CalendarDays, CalendarRange, CalendarClock, Users,
} from "lucide-react";
import { doc, getDoc, collection, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { HelpTip } from "@/components/admin/HelpTip";
import { fetchAllProductsAdmin } from "@/lib/firestore/products";
import { fetchCategories } from "@/lib/firestore/categories";
import { fetchAllTestimonialsAdmin } from "@/lib/firestore/testimonials";
import { fetchAllLookbookAdmin } from "@/lib/firestore/lookbook";

/** Yerel tarihe göre YYYY-AA-GG */
function dayKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(d);
}

/** stats/visits içindeki günlük kırılımdan bugün / son 7 gün / son 30 gün toplamları */
function summarize(days: Record<string, number> | undefined, total: number) {
  const now = new Date();
  let today = 0, week = 0, month = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const n = days?.[dayKey(d)] ?? 0;
    if (i === 0) today = n;
    if (i < 7) week += n;
    month += n;
  }
  return { today, week, month, total };
}

/** Şu anda sitede sayılan eşik: son 2,5 dakika içinde sinyal verenler */
const ACTIVE_WINDOW_MS = 150_000;
/** 30 dakikadan eski varlık kayıtları panel açıkken sessizce temizlenir */
const STALE_MS = 30 * 60_000;

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ products: 0, active: 0, categories: 0, testimonials: 0, lookbook: 0 });
  const [visits, setVisits] = useState({ today: 0, week: 0, month: 0, total: 0 });
  const [beats, setBeats] = useState<{ id: string; t: number }[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);

  // Koleksiyon sayıları + ziyaret istatistikleri
  useEffect(() => {
    Promise.all([
      fetchAllProductsAdmin(),
      fetchCategories(),
      fetchAllTestimonialsAdmin(),
      fetchAllLookbookAdmin(),
      getDoc(doc(db, "stats", "visits")).catch(() => null),
    ])
      .then(([products, categories, testimonials, lookbook, visitSnap]) => {
        setCounts({
          products: products.length,
          active: products.filter((p) => p.isActive).length,
          categories: categories.length,
          testimonials: testimonials.length,
          lookbook: lookbook.length,
        });
        const d = visitSnap?.exists() ? visitSnap.data() : undefined;
        setVisits(summarize(d?.days, d?.total ?? 0));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Anlık ziyaretçi — presence koleksiyonunu CANLI dinler
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "presence"),
      (snap) => {
        const list: { id: string; t: number }[] = [];
        const stale: string[] = [];
        snap.forEach((d) => {
          const t = d.data().lastSeen?.toMillis?.() ?? 0;
          list.push({ id: d.id, t });
          if (Date.now() - t > STALE_MS) stale.push(d.id);
        });
        setBeats(list);
        // Eski kayıtları arka planda temizle (koleksiyon şişmesin)
        stale.slice(0, 30).forEach((id) =>
          deleteDoc(doc(db, "presence", id)).catch(() => {})
        );
      },
      () => {}
    );
    // Sinyal gelmese de sayı tazelensin (ayrılanlar düşsün)
    const tick = setInterval(() => setNow(Date.now()), 20_000);
    return () => {
      unsub();
      clearInterval(tick);
    };
  }, []);

  const activeNow = beats.filter((b) => b.t >= now - ACTIVE_WINDOW_MS).length;

  const visitStats = [
    { label: "Şu An Sitede", value: activeNow, icon: Radio, live: true },
    { label: "Bugün", value: visits.today, icon: CalendarClock },
    { label: "Son 7 Gün", value: visits.week, icon: CalendarDays },
    { label: "Son 30 Gün", value: visits.month, icon: CalendarRange },
    { label: "Toplam", value: visits.total, icon: Users },
  ];

  const cards = [
    { label: "Ürün", value: `${counts.active}/${counts.products}`, note: "aktif / toplam", href: "/admin/urunler", icon: Package },
    { label: "Kategori", value: counts.categories, note: "koleksiyon", href: "/admin/kategoriler", icon: FolderTree },
    { label: "Lookbook", value: counts.lookbook, note: "görsel", href: "/admin/lookbook", icon: Images },
    { label: "Yorum", value: counts.testimonials, note: "müşteri yorumu", href: "/admin/yorumlar", icon: MessageSquareQuote },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl text-bordeaux">
            Panel
            <HelpTip title="Yönetim Paneli Nasıl Kullanılır?">
              <p>
                Burası sitenizin kontrol merkezidir. Soldaki menüden (telefonda sol
                üstteki üç çizgiye dokunarak) tüm bölümlere ulaşırsınız:
              </p>
              <ul>
                <li><strong>Ürünler:</strong> Satıştaki kıyafetleri eklersiniz, düzenlersiniz, gizlersiniz.</li>
                <li><strong>Kategoriler:</strong> Elbise, Takım gibi grupları yönetirsiniz.</li>
                <li><strong>Lookbook:</strong> Ana sayfadaki ilham/kombin fotoğraflarını yönetirsiniz.</li>
                <li><strong>Yorumlar:</strong> Müşterilerin ürün yorumlarını onaylarsınız ve ana sayfa vitrin yorumlarını yazarsınız.</li>
                <li><strong>Site Ayarları:</strong> Telefon, Instagram, adres, duyuru yazısı ve Hakkımızda metnini değiştirirsiniz.</li>
              </ul>
              <p>
                <strong>Ziyaretçiler bölümü:</strong> &ldquo;Şu An Sitede&rdquo; canlı sayıdır —
                son 2-3 dakika içinde sitede gezinen kişi sayısını gösterir ve
                kendiliğinden güncellenir. Bugün / 7 gün / 30 gün / toplam sayıları,
                her ziyaretçinin oturum başına bir kez sayılmasıyla oluşur.
              </p>
              <p>
                <strong>Önemli:</strong> Yaptığınız değişiklikler sitede anında değil,
                en geç 10 dakika içinde görünür. Bu normaldir — site hız için
                sayfaları önceden hazırlar.
              </p>
            </HelpTip>
          </h1>
          <p className="mt-1 text-sm text-bordeaux/50">Gültenim Butik yönetim özeti</p>
        </div>
        <Link href="/admin/urunler/yeni" className="btn-primary !py-2.5 text-xs">
          <Plus size={15} /> Yeni Ürün
        </Link>
      </div>

      {/* Ziyaretçi istatistikleri */}
      <div className="mb-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-bordeaux/50">
          Ziyaretçiler
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {visitStats.map((s) => (
            <div key={s.label} className="border border-bordeaux/10 bg-white p-4">
              <div className="flex items-center gap-1.5">
                <s.icon size={15} className="text-rosegold-dark" strokeWidth={1.7} />
                {s.live && (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping
                      rounded-full bg-green-500 opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                )}
              </div>
              <p className="mt-2.5 font-display text-2xl text-bordeaux">
                {loading && !s.live ? "…" : s.value.toLocaleString("tr-TR")}
              </p>
              <p className="mt-0.5 text-[11px] text-bordeaux/50">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group border border-bordeaux/10 bg-white p-6 transition-shadow hover:shadow-card"
          >
            <card.icon size={20} className="text-rosegold-dark" strokeWidth={1.6} />
            <p className="mt-4 font-display text-3xl text-bordeaux">
              {loading ? "…" : card.value}
            </p>
            <p className="mt-1 text-xs text-bordeaux/50">
              {card.label} · {card.note}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-10 border border-rosegold/25 bg-rosegold/5 p-6 text-sm leading-relaxed text-bordeaux/70">
        <p className="font-medium text-bordeaux mb-1.5">Hatırlatma</p>
        Yaptığınız değişiklikler vitrine en geç 10 dakika içinde yansır (önbellek).
        Yeni admin eklemek için Firebase Console → Firestore → <code>admins</code>{" "}
        koleksiyonuna, kişinin e-postasını (küçük harflerle) doküman ID&apos;si olarak ekleyin.
      </div>
    </div>
  );
}
