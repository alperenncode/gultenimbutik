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
} from "@/lib/data";

// Ana sayfa 5 dakikada bir yeniden oluşturulur (ISR) — admin değişiklikleri hızlı yansır
export const revalidate = 300;

export default async function HomePage() {
  const [categories, newProducts, popularProducts, lookbook, testimonials] =
    await Promise.all([
      getCategories(),
      getNewProducts(8),
      getPopularProducts(8),
      getLookbook(),
      getTestimonials(),
    ]);

  // Hero görseli: lookbook'un ilk görseli, yoksa ilk yeni ürünün görseli
  const heroImage = lookbook[0]?.imageUrl ?? newProducts[0]?.images?.[0];

  return (
    <>
      <Hero imageUrl={heroImage} />
      <CategoryCards categories={categories} />
      <ProductShowcase
        subtitle="Yeni Sezon"
        title="Yeni Gelenler"
        products={newProducts}
        viewAllHref="/urunler?filtre=yeni"
      />
      <Lookbook items={lookbook} />
      <ProductShowcase
        subtitle="Çok Beğenilenler"
        title="Popüler Ürünler"
        products={popularProducts}
        viewAllHref="/urunler"
        tinted
      />
      <Testimonials testimonials={testimonials} />
    </>
  );
}
