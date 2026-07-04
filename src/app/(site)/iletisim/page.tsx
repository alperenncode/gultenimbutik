import type { Metadata } from "next";
import { Instagram, Phone, Mail, MapPin, Clock } from "lucide-react";
import { SITE, instagramUrlOf } from "@/lib/site";
import { getSiteSettings } from "@/lib/data";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import { Reveal } from "@/components/ui/Reveal";
import { SiteQr } from "@/components/ui/SiteQr";

// İletişim bilgileri admin panelindeki "Site Ayarları" sayfasından düzenlenir
export const revalidate = 600;

export const metadata: Metadata = {
  title: "İletişim",
  description: `${SITE.name} iletişim — WhatsApp, Instagram ve e-posta ile bize ulaşın.`,
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  const items = [
    {
      icon: Phone,
      title: "WhatsApp Sipariş Hattı",
      line: settings.phoneDisplay,
      href: buildGeneralWhatsAppLink(settings.whatsappNumber),
      note: "En hızlı yanıt — ürün linkini gönderin, gerisini biz halledelim.",
    },
    {
      icon: Instagram,
      title: "Instagram",
      line: `@${settings.instagramHandle}`,
      href: instagramUrlOf(settings.instagramHandle),
      note: "Yeni gelenleri ilk burada paylaşıyoruz. DM'den sipariş verebilirsiniz.",
    },
    {
      icon: Mail,
      title: "E-posta",
      line: settings.email,
      href: `mailto:${settings.email}`,
      note: "Kurumsal talepler ve iş birlikleri için.",
    },
    {
      icon: MapPin,
      title: "Mağazamız",
      line: settings.address,
      href: undefined,
      note: "Erzurum'daysanız bekleriz — ürünleri yerinde görüp deneyebilirsiniz.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <Reveal className="text-center">
        <p className="section-subtitle">Bize Ulaşın</p>
        <h1 className="section-title mt-3">İletişim</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-bordeaux/55">
          Sorunuz mu var? Beden mi kararsız kaldınız? Bir mesaj uzağınızdayız.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.08}>
            <div className="h-full border border-rosegold/20 bg-cream-light p-7 transition-shadow
              duration-300 hover:shadow-card">
              <item.icon size={22} className="text-rosegold-dark" strokeWidth={1.6} />
              <h2 className="mt-4 text-sm font-medium uppercase tracking-wider text-bordeaux">
                {item.title}
              </h2>
              {item.href ? (
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="mt-1.5 block font-display text-lg text-bordeaux
                    hover:text-rosegold-dark transition-colors"
                >
                  {item.line}
                </a>
              ) : (
                <p className="mt-1.5 font-display text-lg text-bordeaux">{item.line}</p>
              )}
              <p className="mt-3 text-xs leading-relaxed text-bordeaux/50">{item.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Zarif QR — siteyi telefonla açmak/paylaşmak için */}
      <Reveal delay={0.25} className="mt-14 flex flex-col items-center gap-3 text-center">
        <p className="section-subtitle">Siteyi Paylaşın</p>
        <div className="text-bordeaux/50">
          <SiteQr size={148} caption="Kamerayla okutun — Gültenim Butik açılır" />
        </div>
      </Reveal>

      <Reveal delay={0.3} className="mt-10 flex items-center justify-center gap-2 text-xs text-bordeaux/45">
        <Clock size={14} />
        Mesajlarınıza genellikle aynı gün içinde dönüş yapıyoruz.
      </Reveal>
    </div>
  );
}
