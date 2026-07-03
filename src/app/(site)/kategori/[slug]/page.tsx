import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE } from "@/lib/site";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/data";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export const revalidate = 300;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Kategori Bulunamadı" };
  return {
    title: `${category.name} Modelleri`,
    description:
      category.description ??
      `${category.name} koleksiyonu — ${SITE.name}. Premium tesettür giyim, WhatsApp'tan kolay sipariş: ${SITE.phoneDisplay}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const [category, products] = await Promise.all([
    getCategoryBySlug(params.slug),
    getProductsByCategory(params.slug),
  ]);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
      <Reveal className="mb-12 text-center">
        <p className="section-subtitle">Koleksiyon</p>
        <h1 className="section-title mt-3">{category.name}</h1>
        {category.description && (
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-bordeaux/55">
            {category.description}
          </p>
        )}
      </Reveal>

      {products.length === 0 ? (
        <p className="py-20 text-center text-sm text-bordeaux/50">
          Bu kategoriye çok yakında yeni ürünler eklenecek. Instagram&apos;dan
          bizi takip ederek ilk siz haberdar olabilirsiniz.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 0.06}>
              <ProductCard product={product} priority={i < 4} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
