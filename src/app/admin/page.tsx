"use client";

/** Panel özeti — koleksiyon sayıları ve hızlı erişim kartları. */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, FolderTree, MessageSquareQuote, Images, Plus } from "lucide-react";
import { fetchAllProductsAdmin } from "@/lib/firestore/products";
import { fetchCategories } from "@/lib/firestore/categories";
import { fetchAllTestimonialsAdmin } from "@/lib/firestore/testimonials";
import { fetchAllLookbookAdmin } from "@/lib/firestore/lookbook";

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ products: 0, active: 0, categories: 0, testimonials: 0, lookbook: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllProductsAdmin(),
      fetchCategories(),
      fetchAllTestimonialsAdmin(),
      fetchAllLookbookAdmin(),
    ])
      .then(([products, categories, testimonials, lookbook]) =>
        setCounts({
          products: products.length,
          active: products.filter((p) => p.isActive).length,
          categories: categories.length,
          testimonials: testimonials.length,
          lookbook: lookbook.length,
        })
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="font-display text-2xl text-bordeaux">Panel</h1>
          <p className="mt-1 text-sm text-bordeaux/50">Gültenim Butik yönetim özeti</p>
        </div>
        <Link href="/admin/urunler/yeni" className="btn-primary !py-2.5 text-xs">
          <Plus size={15} /> Yeni Ürün
        </Link>
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
