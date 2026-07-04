import { Hero } from "@/components/home/Hero";
import { CategoryCards } from "@/components/home/CategoryCards";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { Lookbook } from "@/components/home/Lookbook";
import { Testimonials } from "@/components/home/Testimonials";
import {
  getCategories,
  getNewProducts,
  getPopularProducts,
  getLookbook,
  getTestimonials,
  getApprovedReviewsAsTestimonials,
} from "@/lib/data";

// Ana sayfa 5 dakikada bir yeniden oluşturulur (ISR) — admin değişiklikleri hızlı yansır
export const revalidate = 300;

export default async function HomePage() {
  const [categories, newProducts, popularProducts, lookbook, testimonials, productReviews] =
    await Promise.all([
      getCategories(),
      getNewProducts(8),
      getPopularProducts(8),
      getLookbook(),
      getTestimonials(),
      getApprovedReviewsAsTestimonials(6),
    ]);

  // "Sizden Gelenler": onaylı ürün yorumları (en yeniler) + elle eklenen vitrin
  // yorumları birlikte gösterilir; bileşen ilk 6 tanesini alır
  const combinedTestimonials = [...productReviews, ...testimonials];

  // Sıralama: Popüler Ürünler ve Stil Önerileri sayfanın ÜST kısmında
  return (
    <>
      <Hero />
      <ProductShowcase
        subtitle="Çok Beğenilenler"
        title="Popüler Ürünler"
        products={popularProducts}
        viewAllHref="/urunler"
        tinted
      />
      <Lookbook items={lookbook} />
      <CategoryCards categories={categories} />
      <ProductShowcase
        subtitle="Yeni Sezon"
        title="Yeni Gelenler"
        products={newProducts}
        viewAllHref="/urunler?filtre=yeni"
      />
      <Testimonials testimonials={combinedTestimonials} />
    </>
  );
}
