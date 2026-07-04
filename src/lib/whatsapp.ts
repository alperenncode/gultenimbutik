import { SITE } from "./site";

/**
 * wa.me sipariş linki üreticisi.
 * Türkçe karakterler encodeURIComponent ile güvenli şekilde kodlanır.
 * Numara verilmezse lib/site.ts'teki varsayılan kullanılır; admin panelinden
 * numara değiştirilirse bileşenler ayarlardaki numarayı geçirir.
 */

/** Ürün sayfasındaki "WhatsApp'tan Sipariş Ver" butonu için ürüne özel mesaj */
export function buildProductOrderLink(opts: {
  productName: string;
  productUrl?: string;
  color?: string;
  size?: string;
  whatsappNumber?: string;
}): string {
  const lines = [
    `Merhaba, "${opts.productName}" ürününü sipariş etmek istiyorum.`,
  ];
  if (opts.color) lines.push(`Renk: ${opts.color}`);
  if (opts.size) lines.push(`Beden: ${opts.size}`);
  if (opts.productUrl) lines.push(`Ürün linki: ${opts.productUrl}`);

  const number = opts.whatsappNumber || SITE.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/** Sabit (floating) WhatsApp butonu için genel mesaj */
export function buildGeneralWhatsAppLink(whatsappNumber?: string): string {
  const message =
    "Merhaba, Gültenim Butik ürünleri hakkında bilgi almak istiyorum.";
  const number = whatsappNumber || SITE.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
