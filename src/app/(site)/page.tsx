import type { ReactNode } from "react";
import { Hero } from "@/components/home/Hero";
import { CategoryCards } from "@/components/home/CategoryCards";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { Lookbook } from "@/components/home/Lookbook";
import { Testimonials } from "@/components/home/Testimonials";
import type { HomeSectionKey } from "@/types";
import {
  getCategories,
  getNewProducts,
  getPopularProducts,
  getAllActiveProducts,
  getLookbook,
  getTestimonials,
  getApprovedReviewsAsTestimonials,
  getSiteSettings,
} from "@/lib/data";

// Ana sayfa 5 dakikada bir yeniden oluşturulur (ISR) — admin değişiklikleri hızlı yansır
export const revalidate = 300;

export default async function HomePage() {
  const [categories, newProducts, popularProducts, allProducts, lookbook, testimonials, productReviews, settings] =
    await Promise.all([
      getCategories(),
      getNewProducts(8),
      getPopularProducts(8),
      getAllActiveProducts(),
      getLookbook(),
      getTestimonials(),
      getApprovedReviewsAsTestimonials(6),
      getSiteSettings(),
    ]);

  // "Sizden Gelenler": onaylı ürün yorumları (en yeniler) + elle eklenen vitrin
  // yorumları birlikte gösterilir; bileşen ilk 6 tanesini alır
  const combinedTestimonials = [...productReviews, ...testimonials];

  // Hero hep sabit ilk sırada; kalan bölümler admin panelindeki (Görünüm)
  // sıra ve açık/kapalı ayarına göre dizilir
  const sectionsByKey: Record<HomeSectionKey, ReactNode> = {
    products: (
      <ProductShowcase
        subtitle="Koleksiyon"
        title="Tüm Ürünler"
        products={allProducts.slice(0, 20)}
        viewAllHref="/urunler"
      />
    ),
    popular: (
      <ProductShowcase
        subtitle="Çok Beğenilenler"
        title="Popüler Ürünler"
        products={popularProducts}
        viewAllHref="/urunler"
        tinted
      />
    ),
    lookbook: <Lookbook items={lookbook} />,
    categories: <CategoryCards categories={categories} />,
    new: (
      <ProductShowcase
        subtitle="Yeni Sezon"
        title="Yeni Gelenler"
        products={newProducts}
        viewAllHref="/urunler?filtre=yeni"
      />
    ),
    testimonials: <Testimonials testimonials={combinedTestimonials} />,
  };

  return (
    <>
      <Hero />
      {settings.homeSections
        .filter((section) => section.enabled)
        .map((section) => (
          <div key={section.key}>{sectionsByKey[section.key]}</div>
        ))}
    </>
  );
}
