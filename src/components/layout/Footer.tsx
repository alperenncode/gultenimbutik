import Link from "next/link";
import Image from "next/image";
import { Instagram, Phone, Mail, MapPin, MessageCircle, ExternalLink, AtSign } from "lucide-react";
import { SITE, DEFAULT_SETTINGS, instagramUrlOf } from "@/lib/site";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import type { Category, SiteSettings } from "@/types";

export function Footer({
  categories,
  settings = DEFAULT_SETTINGS,
}: {
  categories: Category[];
  settings?: SiteSettings;
}) {
  const instagramUrl = instagramUrlOf(settings.instagramHandle);
  const whatsappLink = buildGeneralWhatsAppLink(settings.whatsappNumber);
  const theme = settings.theme;

  return (
    <footer style={{ backgroundColor: theme.darkSectionBackground }} className="text-cream/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-12">
          {/* Marka */}
          <div>
            <span
              style={
                theme.footerLogoPlateEnabled
                  ? { backgroundColor: theme.footerLogoPlateColor }
                  : undefined
              }
              className={`mb-5 inline-flex ${theme.footerLogoPlateEnabled ? "rounded-lg px-4 py-2" : ""}`}
            >
              <Image
                src="/logo-plaka.png"
                alt="Gültenim Boutique"
                width={1200}
                height={302}
                className="h-16 w-auto rounded-[3px]"
              />
            </span>
            <p className="text-sm leading-relaxed text-cream/60">
              Selvi Çetin ve İnvee koleksiyonlarıyla zarafeti buluşturan premium
              tesettür giyim. Siparişleriniz WhatsApp ve Instagram üzerinden
              özenle alınır.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center border border-cream/20
                  text-cream/70 transition-all duration-300 hover:border-rosegold hover:text-rosegold"
              >
                <Instagram size={17} strokeWidth={1.5} />
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-10 w-10 items-center justify-center border border-cream/20
                  text-cream/70 transition-all duration-300 hover:border-rosegold hover:text-rosegold"
              >
                <Phone size={17} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Koleksiyon / Kurumsal / İletişim — mobilde de yan yana 3 sütun */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 lg:col-span-3 lg:grid-cols-3 lg:gap-12">
            {/* Koleksiyon */}
            <div>
              <p className="text-[10px] uppercase tracking-luxe text-rosegold mb-4 sm:text-xs sm:mb-5">
                Koleksiyon
              </p>
              <ul className="space-y-2 text-[11px] leading-snug sm:space-y-3 sm:text-sm">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/kategori/${cat.slug}`}
                      className="text-cream/60 transition-colors hover:text-rosegold"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/urunler" className="text-cream/60 transition-colors hover:text-rosegold">
                    Tüm Ürünler
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kurumsal — gizlilik ve güvenlik en üstte */}
            <div>
              <p className="text-[10px] uppercase tracking-luxe text-rosegold mb-4 sm:text-xs sm:mb-5">
                Kurumsal
              </p>
              <ul className="space-y-2 text-[11px] leading-snug sm:space-y-3 sm:text-sm">
                <li>
                  <Link href="/gizlilik-politikasi" className="text-cream/60 transition-colors hover:text-rosegold">
                    Gizlilik Politikası (KVKK)
                  </Link>
                </li>
                <li>
                  <Link href="/kullanim-kosullari" className="text-cream/60 transition-colors hover:text-rosegold">
                    Kullanım Koşulları
                  </Link>
                </li>
                <li>
                  <Link href="/cerez-politikasi" className="text-cream/60 transition-colors hover:text-rosegold">
                    Çerez Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/hakkimizda" className="text-cream/60 transition-colors hover:text-rosegold">
                    Hakkımızda
                  </Link>
                </li>
                <li>
                  <Link href="/iletisim" className="text-cream/60 transition-colors hover:text-rosegold">
                    İletişim
                  </Link>
                </li>
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <p className="text-[10px] uppercase tracking-luxe text-rosegold mb-4 sm:text-xs sm:mb-5">
                İletişim
              </p>
              <ul className="space-y-3 text-[11px] leading-snug text-cream/60 sm:space-y-4 sm:text-sm">
                <li className="flex gap-1.5 sm:gap-3">
                  <Phone size={13} className="mt-0.5 shrink-0 text-rosegold sm:hidden" />
                  <Phone size={16} className="mt-0.5 hidden shrink-0 text-rosegold sm:block" />
                  <a
                    href={`tel:+${settings.whatsappNumber}`}
                    className="break-words hover:text-rosegold transition-colors"
                  >
                    {settings.phoneDisplay}
                  </a>
                </li>
                <li className="flex gap-1.5 sm:gap-3">
                  <Mail size={13} className="mt-0.5 shrink-0 text-rosegold sm:hidden" />
                  <Mail size={16} className="mt-0.5 hidden shrink-0 text-rosegold sm:block" />
                  <a href={`mailto:${settings.email}`} className="break-all hover:text-rosegold transition-colors">
                    {settings.email}
                  </a>
                </li>
                <li className="flex gap-1.5 sm:gap-3">
                  <MapPin size={13} className="mt-0.5 shrink-0 text-rosegold sm:hidden" />
                  <MapPin size={16} className="mt-0.5 hidden shrink-0 text-rosegold sm:block" />
                  <span className="break-words">{settings.address}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/10 pt-8 flex flex-col md:flex-row
          items-center justify-between gap-4 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.</p>
          <p className="tracking-wide">
            Siparişler yalnızca WhatsApp ve Instagram üzerinden alınmaktadır.
          </p>
        </div>

        {/* Hizmet sağlayıcı bilgileri — 6563 sayılı Elektronik Ticaretin Düzenlenmesi
            Hakkında Kanun uyarınca zorunlu künye bilgileri */}
        <p className="mt-3 text-center text-[11px] leading-relaxed text-cream/35 md:text-xs">
          Gültenim Boutique — {SITE.address} — Vergi Dairesi: Kazım Karabekir
          Vergi Dairesi — Vergi No: 2250484900
        </p>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-cream/35 md:text-xs">
          Sipariş, teslimat ve iade süreçleri tamamen WhatsApp destek hattımız
          üzerinden onaylanarak yürütülür. (İade süresi kullanılmamış ürünler
          için 14 gündür — detaylar için{" "}
          <Link href="/kullanim-kosullari" className="underline underline-offset-2 hover:text-cream/60">
            Kullanım Koşulları
          </Link>
          .)
        </p>

        {/* Geliştirici imzası — mobilde sol altta alt alta, geniş ekranda ortada tek satır.
            Linkler altı çizili + ok ikonlu: tıklanabilir olduğu ilk bakışta anlaşılır */}
        <div className="mt-6 flex flex-col items-start gap-2 text-[11px] text-cream/40
          md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-x-3 md:gap-y-1">
          <span>
            Geliştirici &amp; Tasarım:{" "}
            <a
              href="https://alperenucmm.web.app"
              target="_blank"
              rel="noopener"
              className="underline underline-offset-2 hover:text-cream/70"
            >
              Alperen Uçum
            </a>
          </span>
          <span aria-hidden="true" className="hidden md:inline text-cream/25">·</span>
          <a
            href="https://www.instagram.com/alperenucm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-rosegold/80 underline
              decoration-rosegold/40 underline-offset-4 transition-colors
              hover:text-rosegold hover:decoration-rosegold"
          >
            <Instagram size={12} /> alperenucm
            <ExternalLink size={10} className="opacity-70" />
          </a>
          <span aria-hidden="true" className="hidden md:inline text-cream/25">·</span>
          <a
            href="https://wa.me/905388525320"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-rosegold/80 underline
              decoration-rosegold/40 underline-offset-4 transition-colors
              hover:text-rosegold hover:decoration-rosegold"
          >
            <MessageCircle size={12} /> WhatsApp: 0538 852 53 20
            <ExternalLink size={10} className="opacity-70" />
          </a>
          <span aria-hidden="true" className="hidden md:inline text-cream/25">·</span>
          <a
            href="mailto:alperenucm@gmail.com"
            className="inline-flex items-center gap-1.5 text-rosegold/80 underline
              decoration-rosegold/40 underline-offset-4 transition-colors
              hover:text-rosegold hover:decoration-rosegold"
          >
            <AtSign size={12} /> alperenucm@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
