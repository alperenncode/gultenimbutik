import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories } from "@/lib/data";
import { ProductsBrowser } from "@/components/product/ProductsBrowser";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Tüm Ürünler",
  description:
    "Gültenim Butik koleksiyonunun tamamı — elbise, takım, tunik, dış giyim ve triko modelleri. Marka, fiyat ve bedene göre filtreleyin.",
};

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    // useSearchParams kullanan client bileşen Suspense sınırı ister
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <ProductsBrowser categories={categories} />
    </Suspense>
  );
}
