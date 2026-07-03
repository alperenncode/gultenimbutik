/**
 * Site geneli sabitler — iletişim bilgileri ve marka kimliği tek yerden yönetilir.
 */
export const SITE = {
  name: "Gültenim Butik",
  tagline: "Zarafetin Adresi",
  description:
    "Gültenim Butik — Selvi Çetin ve İnvee koleksiyonlarıyla premium tesettür giyim. Elbise, takım, tunik, dış giyim ve triko modelleri. Sipariş için WhatsApp: 0534 070 07 80",
  url: "https://www.gultenimbutik.com.tr",

  /** WhatsApp sipariş hattı — uluslararası formatta, wa.me linklerinde kullanılır */
  whatsappNumber: "905340700780",
  /** Görüntülenen telefon formatı */
  phoneDisplay: "0534 070 07 80",

  instagramHandle: "gultenim_boutique",
  instagramUrl: "https://www.instagram.com/gultenim_boutique",

  email: "info@gultenimbutik.com.tr",
  address:
    "Ömer Nasuhi Bilmen Mah. Korgeneral Zekai Aksakallı Cad. Yakutiye / Erzurum",

  brands: ["Selvi Çetin", "İnvee"] as const,
} as const;

/** Fiyatı Türk Lirası formatında gösterir: 2800 → "2.800 ₺" */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("tr-TR")} ₺`;
}
