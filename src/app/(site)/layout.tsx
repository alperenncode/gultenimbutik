import type { ReactNode } from "react";
import { Providers } from "@/context/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LegalConsentBar } from "@/components/layout/LegalConsentBar";
import { FloatingSocialButtons } from "@/components/layout/FloatingSocialButtons";
import { VisitTracker } from "@/components/ui/VisitTracker";
import { getCategories, getSiteSettings } from "@/lib/data";

// Kategoriler ve site ayarları 10 dakikada bir tazelenir
export const revalidate = 600;

/**
 * Vitrin layout'u — Header, Footer ve sabit sosyal butonlar burada;
 * /admin bu grubun DIŞINDA olduğundan kendi sade layout'unu kullanır.
 * Site ayarları (iletişim, duyuru vb.) sunucuda çekilip context ile dağıtılır.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [categories, settings] = await Promise.all([getCategories(), getSiteSettings()]);

  return (
    <Providers settings={settings}>
      <Header categories={categories} />
      <LegalConsentBar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer categories={categories} settings={settings} />
      <FloatingSocialButtons />
      <VisitTracker />
    </Providers>
  );
}
