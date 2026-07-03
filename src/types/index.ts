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
