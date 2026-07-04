/**
 * Site geneli sabitler — iletişim bilgileri ve marka kimliği tek yerden yönetilir.
 */
export const SITE = {
  name: "Gültenim Butik",
  tagline: "Zarafetin Adresi",
  description:
    "Gültenim Butik — Selvi Çetin ve İnvee koleksiyonlarıyla premium tesettür giyim. Elbise, takım, tunik, dış giyim ve triko modelleri. Sipariş için WhatsApp: 0533 285 36 39",
  // DİKKAT: Şu an canlı site Vercel adresinde. gultenimbutik.com.tr alan adı
  // bu projeye bağlandığında burayı "https://www.gultenimbutik.com.tr" yapın.
  // (WhatsApp sipariş linkleri, paylaşım önizlemeleri, site haritası ve QR kod
  // hep bu adresi kullanır — eski adres eski siteye gidiyordu.)
  url: "https://gultenimbutik.vercel.app",

  /** WhatsApp sipariş hattı — uluslararası formatta, wa.me linklerinde kullanılır */
  whatsappNumber: "905332853639",
  /** Görüntülenen telefon formatı */
  phoneDisplay: "0533 285 36 39",

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

import type { SiteSettings } from "@/types";

/**
 * Site ayarlarının varsayılanları — Firestore'daki settings/site dokümanı
 * boşsa/eksikse bunlar kullanılır. Admin panelindeki "Site Ayarları"
 * sayfası bu değerlerin üzerine yazar.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  announcement: `Tüm Türkiye'ye gönderim — Sipariş için WhatsApp: ${SITE.phoneDisplay}`,
  phoneDisplay: SITE.phoneDisplay,
  whatsappNumber: SITE.whatsappNumber,
  instagramHandle: SITE.instagramHandle,
  email: SITE.email,
  address: SITE.address,
  aboutTitle: "Gültenim Butik",
  aboutText: [
    "Gültenim Butik, tesettür giyimde zarafeti ve kaliteyi bir araya getirme hayaliyle Erzurum'da doğdu. Bugün Selvi Çetin ve İnvee koleksiyonlarıyla Türkiye'nin dört bir yanındaki müşterilerimize ulaşıyoruz.",
    'Her parçayı tek tek, özenle seçiyoruz. Vitrinimizde gördüğünüz her elbise, takım ve dış giyim modeli; kumaşı, dikişi ve duruşuyla titizlikle incelenmiş, "kendimiz giyer miydik?" sorusunu geçmiş üründür.',
    "Alışveriş deneyimimiz de kendimize has: sepet yok, karmaşık ödeme adımları yok. Beğendiğiniz ürünü WhatsApp'tan tek mesajla sorarsınız; rengi, bedeni, kombin önerisiyle birlikte size özel ilgileniriz. Çünkü bize göre alışveriş bir işlem değil, bir sohbettir.",
  ].join("\n\n"),
  aboutQuote: "Zarafet, detaylarda gizlidir.",
};

/**
 * Firestore'dan gelen ham ayar verisini varsayılanlarla birleştirir.
 * Boş string bırakılan alanlar varsayılana döner (yanlışlıkla silinen
 * bir alan siteyi bilgisiz bırakmasın diye).
 */
export function mergeSettings(data: Record<string, unknown> | undefined | null): SiteSettings {
  const merged = { ...DEFAULT_SETTINGS };
  if (data) {
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
      const v = data[key];
      if (typeof v === "string" && v.trim() !== "") merged[key] = v;
    }
  }
  return merged;
}

/** Instagram profil linki — handle'dan üretilir */
export function instagramUrlOf(handle: string): string {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}`;
}
