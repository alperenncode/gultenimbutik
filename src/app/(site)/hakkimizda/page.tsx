import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { getSiteSettings } from "@/lib/data";
import { Reveal } from "@/components/ui/Reveal";

// İçerik admin panelindeki "Site Ayarları" sayfasından düzenlenir
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${SITE.name} — Erzurum'dan Türkiye'nin her yerine premium tesettür giyim. Selvi Çetin ve İnvee koleksiyonları.`,
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  // Boş satırla ayrılan her blok ayrı paragraf olarak gösterilir
  const paragraphs = settings.aboutText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Reveal className="text-center">
        <p className="section-subtitle">Hikayemiz</p>
        <h1 className="section-title mt-3">{settings.aboutTitle}</h1>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-12 space-y-6 text-[15px] leading-relaxed text-bordeaux/70">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line">{p}</p>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.25} className="mt-14 border-t border-rosegold/20 pt-10 text-center">
        {settings.aboutQuote && (
          <p className="font-display text-xl italic text-rosegold-dark">
            &ldquo;{settings.aboutQuote}&rdquo;
          </p>
        )}
        <Link href="/urunler" className="btn-primary mt-8 inline-flex">
          Koleksiyonu Keşfet
        </Link>
      </Reveal>
    </div>
  );
}
