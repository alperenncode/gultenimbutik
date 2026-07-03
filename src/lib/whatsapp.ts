import { SITE } from "./site";

/**
 * wa.me sipariş linki üreticisi.
 * Türkçe karakterler encodeURIComponent ile güvenli şekilde kodlanır.
 */

/** Ürün sayfasındaki "WhatsApp'tan Sipariş Ver" butonu için ürüne özel mesaj */
export function buildProductOrderLink(opts: {
  productName: string;
  productUrl?: string;
  color?: string;
  size?: string;
}): string {
  const lines = [
    `Merhaba, "${opts.productName}" ürününü sipariş etmek istiyorum.`,
  ];
  if (opts.color) lines.push(`Renk: ${opts.color}`);
  if (opts.size) lines.push(`Beden: ${opts.size}`);
  if (opts.productUrl) lines.push(`Ürün linki: ${opts.productUrl}`);

  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
}

/** Sabit (floating) WhatsApp butonu için genel mesaj */
export function buildGeneralWhatsAppLink(): string {
  const message =
    "Merhaba, Gültenim Butik ürünleri hakkında bilgi almak istiyorum.";
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
