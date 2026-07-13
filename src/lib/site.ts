/**
 * Site geneli sabitler — iletişim bilgileri ve marka kimliği tek yerden yönetilir.
 */
export const SITE = {
  name: "Gültenim Butik",
  tagline: "Zarafetin Adresi",
  description:
    "Gültenim Butik — Selvi Çetin ve İnvee koleksiyonlarıyla premium tesettür giyim. Elbise, takım, tunik, dış giyim ve triko modelleri. Sipariş için WhatsApp: 0533 285 36 39",
  // gultenimbutik.com.tr alan adı Vercel'e bağlandı (2026-07-07) — WhatsApp
  // sipariş linkleri, paylaşım önizlemeleri, site haritası ve QR kod hep bu
  // adresi kullanır. Eski gultenimbutik.vercel.app adresi bu adrese
  // otomatik yönlendiriliyor (Vercel domain redirect), o yüzden eski
  // paylaşılan linkler/QR kod da bozulmadan çalışmaya devam ediyor.
  url: "https://gultenimbutik.com.tr",

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

import type { HomeSectionConfig, HomeSectionKey, SiteSettings, SiteTheme } from "@/types";

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
  theme: {
    pageBackground: "#F5F0EB",
    darkSectionBackground: "#2C1A1A",
    headingColor: "#2C1A1A",
    accentColor: "#D4AF88",
    accentColorDark: "#B8935F",
    logoPlateEnabled: false,
    logoPlateColor: "#F5F0EB",
    footerLogoPlateEnabled: false,
    footerLogoPlateColor: "#2C1A1A",
    heroMedallionGradientStart: "#E5CBAD",
    heroMedallionGradientMid: "#EDE5DC",
    heroMedallionGradientEnd: "#D4AF88",
    heroMedallionRingColor: "#D4AF88",
  },
  homeSections: [
    { key: "products", enabled: true },
    { key: "popular", enabled: true },
    { key: "lookbook", enabled: true },
    { key: "categories", enabled: true },
    { key: "new", enabled: true },
    { key: "testimonials", enabled: true },
  ],
};

const HOME_SECTION_KEYS: HomeSectionKey[] = [
  "products",
  "popular",
  "lookbook",
  "categories",
  "new",
  "testimonials",
];

function isHexColor(v: unknown): v is string {
  return typeof v === "string" && /^#[0-9a-fA-F]{3,8}$/.test(v.trim());
}

function mergeTheme(data: unknown): SiteTheme {
  const merged = { ...DEFAULT_SETTINGS.theme };
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const key of Object.keys(merged) as (keyof SiteTheme)[]) {
      const v = d[key];
      if (typeof merged[key] === "boolean" && typeof v === "boolean") {
        (merged[key] as boolean) = v;
      } else if (typeof merged[key] === "string" && isHexColor(v)) {
        (merged[key] as string) = v.trim();
      }
    }
  }
  return merged;
}

function mergeHomeSections(data: unknown): HomeSectionConfig[] {
  if (!Array.isArray(data)) return DEFAULT_SETTINGS.homeSections;

  const seen = new Set<HomeSectionKey>();
  const cleaned: HomeSectionConfig[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const key = (item as Record<string, unknown>).key;
    const enabled = (item as Record<string, unknown>).enabled;
    if (typeof key !== "string" || !HOME_SECTION_KEYS.includes(key as HomeSectionKey)) continue;
    if (seen.has(key as HomeSectionKey)) continue;
    seen.add(key as HomeSectionKey);
    cleaned.push({ key: key as HomeSectionKey, enabled: typeof enabled === "boolean" ? enabled : true });
  }
  // Eksik kalan (ör. sonradan eklenen yeni) bölümler başa, açık halde eklenir —
  // admin panelinde fark edilsin diye; isterse ok butonlarıyla aşağı taşıyabilir
  const missing: HomeSectionConfig[] = HOME_SECTION_KEYS.filter((key) => !seen.has(key)).map((key) => ({
    key,
    enabled: true,
  }));
  const result = [...missing, ...cleaned];
  return result.length > 0 ? result : DEFAULT_SETTINGS.homeSections;
}

/**
 * Firestore'dan gelen ham ayar verisini varsayılanlarla birleştirir.
 * Boş string bırakılan alanlar varsayılana döner (yanlışlıkla silinen
 * bir alan siteyi bilgisiz bırakmasın diye).
 */
export function mergeSettings(data: Record<string, unknown> | undefined | null): SiteSettings {
  const merged = { ...DEFAULT_SETTINGS };
  if (data) {
    for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
      if (key === "theme" || key === "homeSections") continue;
      const v = data[key];
      if (typeof v === "string" && v.trim() !== "") merged[key] = v;
    }
  }
  merged.theme = mergeTheme(data?.theme);
  merged.homeSections = mergeHomeSections(data?.homeSections);
  return merged;
}

/** Instagram profil linki — handle'dan üretilir */
export function instagramUrlOf(handle: string): string {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}`;
}
