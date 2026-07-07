/**
 * Firestore veri modeli tipleri.
 * Not: Timestamp alanları serileştirme kolaylığı için ISO string veya millis
 * olarak tutulur (Server Component → Client Component prop geçişi güvenli olsun diye).
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  imageUrl: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  /** Denormalize: /kategori/[slug] sorgusu için kategori slug'ı üründe de tutulur */
  categorySlug: string;
  brand: string;
  /** Tam TL, kuruşsuz (ör. 2800). Sıralama/filtre için number şart. */
  price: number;
  /** İndirim öncesi fiyat — üstü çizili gösterim için */
  oldPrice?: number;
  colors: string[];
  sizes: string[];
  /** Storage indirme URL'leri, sıralı — ilk görsel kart küçük resmidir */
  images: string[];
  description: string;
  fabricCare?: string;
  isNew: boolean;
  isPopular: boolean;
  /** Silme yerine gizleme — pasif ürünler vitrinde görünmez */
  isActive: boolean;
  createdAt: number; // millis
  updatedAt: number; // millis
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  order: number;
  isActive: boolean;
}

export interface LookbookItem {
  id: string;
  imageUrl: string;
  caption?: string;
  linkedProductIds?: string[];
  order: number;
  isActive: boolean;
}

export interface UserProfile {
  email: string;
  displayName?: string;
  /** Favori ürün ID'leri — arrayUnion/arrayRemove ile atomik güncellenir */
  wishlist: string[];
  createdAt: number;
}

/**
 * Ürün yorumu — yalnızca üye olan müşteriler yazabilir.
 * `name` kayıt anında maskelenmiş halde tutulur (ör. "Ayşe K."),
 * `approved` false başlar; admin onaylayınca sitede görünür.
 */
export interface Review {
  id: string;
  productId: string;
  productSlug: string;
  /** Admin panelinde hangi ürüne ait olduğu görünsün diye denormalize edilir */
  productName: string;
  userId: string;
  /** Maskelenmiş görünen ad: "İsim S." */
  name: string;
  rating: number; // 1-5
  text: string;
  approved: boolean;
  createdAt: number; // millis
}

/** Ana sayfada sıralanabilir/açılıp kapatılabilir bölümler (Hero hariç — o hep sabit ilk sıradadır) */
export type HomeSectionKey = "popular" | "lookbook" | "categories" | "new" | "testimonials";

export interface HomeSectionConfig {
  key: HomeSectionKey;
  enabled: boolean;
}

/**
 * Ana sayfa + header + footer + logo alanlarının renk teması.
 * Logo görselinin kendisi (PNG) boyanmaz — yalnızca arkasındaki plaka rengi ayarlanır.
 */
export interface SiteTheme {
  /** Ana sayfa bölümleri + header zemin rengi */
  pageBackground: string;
  /** Üst duyuru şeridi + footer + yorumlar bandı zemin rengi */
  darkSectionBackground: string;
  /** Ana sayfa başlıkları */
  headingColor: string;
  /** Koyu zeminler üzerindeki vurgu rengi (ör. Sizden Gelenler bandı) */
  accentColor: string;
  /** Açık zeminler üzerindeki vurgu rengi (ör. alt başlık etiketleri) */
  accentColorDark: string;
  logoPlateEnabled: boolean;
  logoPlateColor: string;
  footerLogoPlateEnabled: boolean;
  footerLogoPlateColor: string;
}

/**
 * Site geneli ayarlar — Firestore'daki settings/site dokümanında tutulur,
 * admin panelinden düzenlenir. Boş bırakılan alanlar için lib/site.ts'teki
 * varsayılanlar kullanılır.
 */
export interface SiteSettings {
  /** Header üstündeki duyuru şeridi metni */
  announcement: string;
  /** Görüntülenen telefon: "0533 285 36 39" */
  phoneDisplay: string;
  /** wa.me linkleri için uluslararası format: "905332853639" */
  whatsappNumber: string;
  instagramHandle: string;
  email: string;
  address: string;
  /** Hakkımızda sayfası içeriği — boş satırla ayrılan her blok bir paragraf olur */
  aboutTitle: string;
  aboutText: string;
  aboutQuote: string;
  theme: SiteTheme;
  homeSections: HomeSectionConfig[];
}
