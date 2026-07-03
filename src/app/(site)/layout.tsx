import type { ReactNode } from "react";
import { Providers } from "@/context/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingSocialButtons } from "@/components/layout/FloatingSocialButtons";
import { getCategories } from "@/lib/data";

// Kategoriler 10 dakikada bir tazelenir (admin değişiklikleri kısa sürede yansır)
export const revalidate = 600;

/**
 * Vitrin layout'u — Header, Footer ve sabit sosyal butonlar burada;
 * /admin bu grubun DIŞINDA olduğundan kendi sade layout'unu kullanır.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const categories = await getCategories();

  return (
    <Providers>
      <Header categories={categories} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={categories} />
      <FloatingSocialButtons />
    </Providers>
  );
}
