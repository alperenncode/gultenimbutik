import Link from "next/link";
import { Instagram, Phone, Mail, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";
import { buildGeneralWhatsAppLink } from "@/lib/whatsapp";
import type { Category } from "@/types";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="bg-bordeaux text-cream/80">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Marka */}
          <div>
            <p className="font-display text-2xl text-cream">Gültenim</p>
            <p className="text-[10px] uppercase tracking-luxe text-rosegold mt-1 mb-5">Butik</p>
            <p className="text-sm leading-relaxed text-cream/60">
              Selvi Çetin ve İnvee koleksiyonlarıyla zarafeti buluşturan premium
              tesettür giyim. Siparişleriniz WhatsApp ve Instagram üzerinden
              özenle alınır.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={SITE.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center border border-cream/20
                  text-cream/70 transition-all duration-300 hover:border-rosegold hover:text-rosegold"
              >
                <Instagram size={17} strokeWidth={1.5} />
              </a>
              <a
                href={buildGeneralWhatsAppLink()}
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

          {/* Koleksiyon */}
          <div>
            <p className="text-xs uppercase tracking-luxe text-rosegold mb-5">Koleksiyon</p>
            <ul className="space-y-3 text-sm">
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

          {/* Kurumsal */}
          <div>
            <p className="text-xs uppercase tracking-luxe text-rosegold mb-5">Kurumsal</p>
            <ul className="space-y-3 text-sm">
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
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <p className="text-xs uppercase tracking-luxe text-rosegold mb-5">İletişim</p>
            <ul className="space-y-4 text-sm text-cream/60">
              <li className="flex gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-rosegold" />
                <a href={`tel:+9${SITE.whatsappNumber.slice(1)}`} className="hover:text-rosegold transition-colors">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-rosegold" />
                <a href={`mailto:${SITE.email}`} className="hover:text-rosegold transition-colors">
                  {SITE.email}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-rosegold" />
                <span>{SITE.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/10 pt-8 flex flex-col md:flex-row
          items-center justify-between gap-4 text-xs text-cream/40">
          <p>© {new Date().getFullYear()} {SITE.name}. Tüm hakları saklıdır.</p>
          <p className="tracking-wide">
            Siparişler yalnızca WhatsApp ve Instagram üzerinden alınmaktadır.
          </p>
        </div>
      </div>
    </footer>
  );
}
