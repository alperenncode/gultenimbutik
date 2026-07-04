import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { getProductBySlug, getProductsByCategory } from "@/lib/data";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductShowcase } from "@/components/home/ProductShowcase";

// Ürün detayları 5 dakikada bir tazelenir
export const revalidate = 300;

interface Props {
  params: { slug: string };
}

/**
 * Open Graph etiketleri — WhatsApp/Instagram'da paylaşılan ürün linklerinde
 * doğru başlık, açıklama ve görsel önizlemesi çıkmasını sağlar.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Ürün Bulunamadı" };

  const description =
    product.description?.slice(0, 160) ||
    `${product.brand} — ${product.name}. Sipariş için WhatsApp: ${SITE.phoneDisplay}`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | ${SITE.name}`,
      description,
      type: "website",
      images: product.images[0] ? [{ url: product.images[0], width: 900, height: 1200 }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const productUrl = `${SITE.url}/urun/${product.slug}`;

  // Aynı kategoriden diğer ürünler (kendisi hariç, en fazla 4)
  const related = (await getProductsByCategory(product.categorySlug))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav
          className="mb-8 flex items-center gap-1.5 text-xs text-bordeaux/50"
          aria-label="Sayfa yolu"
        >
          <Link href="/" className="shrink-0 hover:text-rosegold-dark transition-colors">
            Ana Sayfa
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <Link
            href={`/kategori/${product.categorySlug}`}
            className="shrink-0 hover:text-rosegold-dark transition-colors"
          >
            {product.categorySlug ? product.categorySlug.replace(/-/g, " ") : "Koleksiyon"}
          </Link>
          <ChevronRight size={12} className="shrink-0" />
          <span className="min-w-0 truncate text-bordeaux/80">{product.name}</span>
        </nav>

        {/* grid-cols-1 şart: minmax(0,1fr) sayesinde thumbnail rayı kolonu ekrandan geniş yapamaz */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />
          <ProductInfo product={product} productUrl={productUrl} />
        </div>
      </div>

      {/* Müşteri yorumları — onaylılar listelenir, üyeler yeni yorum yazabilir */}
      <ProductReviews
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
      />

      {related.length > 0 && (
        <ProductShowcase
          subtitle="Benzer Parçalar"
          title="Bunlar da İlginizi Çekebilir"
          products={related}
          viewAllHref={`/kategori/${product.categorySlug}`}
          tinted
        />
      )}
    </>
  );
}
