"use client";

/**
 * Ürün bilgi paneli — fiyat, renk/beden seçimi, WhatsApp sipariş butonu,
 * Instagram paylaşım, favori, açıklama akordeonları.
 * Seçilen renk/beden WhatsApp mesajına otomatik eklenir.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Instagram, ChevronDown, Check, Share2 } from "lucide-react";
import { SITE, formatPrice } from "@/lib/site";
import { buildProductOrderLink } from "@/lib/whatsapp";
import type { Product } from "@/types";
import { useWishlist } from "@/context/WishlistContext";
import { SizeChart } from "./SizeChart";

function Accordion({ title, children, defaultOpen = false }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-rosegold/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left text-sm
          font-medium uppercase tracking-wider text-bordeaux"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          size={16}
          className={`text-rosegold-dark transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="pb-5 text-sm leading-relaxed text-bordeaux/65 whitespace-pre-line">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function ProductInfo({ product, productUrl }: { product: Product; productUrl: string }) {
  const [color, setColor] = useState<string | undefined>();
  const [size, setSize] = useState<string | undefined>();
  const [shared, setShared] = useState(false);
  const { isInWishlist, toggle } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const whatsappLink = buildProductOrderLink({
    productName: product.name,
    productUrl,
    color,
    size,
  });

  /** Instagram'da Paylaş: mobilde yerel paylaşım menüsü, masaüstünde link kopyalanıp profil açılır */
  async function shareToInstagram() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product.name, url: productUrl });
        return;
      } catch {
        /* kullanıcı iptal etti — sorun değil */
      }
    }
    try {
      await navigator.clipboard.writeText(productUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      /* pano erişimi yok */
    }
    window.open(SITE.instagramUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col">
      {/* Marka + isim + fiyat */}
      <p className="text-[11px] uppercase tracking-luxe text-rosegold-dark">{product.brand}</p>
      <h1 className="mt-2 font-display text-3xl leading-tight text-bordeaux md:text-4xl">
        {product.name}
      </h1>

      <div className="mt-4 flex items-baseline gap-3">
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="text-lg text-bordeaux/40 line-through">
            {formatPrice(product.oldPrice)}
          </span>
        )}
        <span className="text-2xl font-medium text-bordeaux">{formatPrice(product.price)}</span>
      </div>

      <div className="my-6 h-px bg-gradient-to-r from-rosegold/50 to-transparent" />

      {/* Renk seçimi */}
      {product.colors.length > 0 && (
        <div className="mb-6">
          <p className="input-label">
            Renk {color && <span className="text-rosegold-dark normal-case">— {color}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(color === c ? undefined : c)}
                className={`border px-4 py-2 text-sm transition-all duration-200 ${
                  color === c
                    ? "border-bordeaux bg-bordeaux text-cream"
                    : "border-bordeaux/20 text-bordeaux/75 hover:border-rosegold-dark"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Beden seçimi */}
      {product.sizes.length > 0 && (
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="input-label mb-0">
              Beden {size && <span className="text-rosegold-dark normal-case">— {size}</span>}
            </p>
            <SizeChart />
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(size === s ? undefined : s)}
                className={`min-w-[52px] border px-3 py-2 text-sm transition-all duration-200 ${
                  size === s
                    ? "border-bordeaux bg-bordeaux text-cream"
                    : "border-bordeaux/20 text-bordeaux/75 hover:border-rosegold-dark"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* WhatsApp sipariş — ana aksiyon */}
      <motion.a
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-2 inline-flex items-center justify-center gap-3 overflow-hidden
          bg-[#25D366] px-8 py-4 text-[15px] font-semibold uppercase tracking-wider
          text-white shadow-card transition-shadow hover:shadow-lifted"
      >
        <MessageCircle size={21} />
        WhatsApp&apos;tan Sipariş Ver
      </motion.a>
      <p className="mt-2.5 text-center text-xs text-bordeaux/50">
        {SITE.phoneDisplay} — mesajınıza ürün bilgileri otomatik eklenir
      </p>

      {/* İkincil aksiyonlar */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={shareToInstagram}
          className="inline-flex items-center justify-center gap-2 border border-bordeaux/20
            px-4 py-3 text-xs uppercase tracking-wider text-bordeaux transition-all
            duration-300 hover:border-rosegold-dark hover:text-rosegold-dark"
        >
          {shared ? <Check size={15} /> : <Instagram size={15} />}
          {shared ? "Link Kopyalandı" : "Instagram'da Paylaş"}
        </button>
        <button
          onClick={() => toggle(product.id)}
          className={`inline-flex items-center justify-center gap-2 border px-4 py-3 text-xs
            uppercase tracking-wider transition-all duration-300 ${
              inWishlist
                ? "border-rosegold-dark bg-rosegold-dark text-white"
                : "border-bordeaux/20 text-bordeaux hover:border-rosegold-dark hover:text-rosegold-dark"
            }`}
        >
          <Heart size={15} fill={inWishlist ? "currentColor" : "none"} />
          {inWishlist ? "Favorilerde" : "Favorilere Ekle"}
        </button>
      </div>

      {/* Açıklama akordeonları */}
      <div className="mt-8">
        <Accordion title="Ürün Açıklaması" defaultOpen>
          {product.description || "Bu ürün için detaylı açıklama yakında eklenecektir."}
        </Accordion>
        {product.fabricCare && (
          <Accordion title="Kumaş & Bakım">{product.fabricCare}</Accordion>
        )}
        <Accordion title="Sipariş & Teslimat">
          {`Siparişleriniz WhatsApp (${SITE.phoneDisplay}) veya Instagram (@${SITE.instagramHandle}) üzerinden alınır.\n\nBeğendiğiniz ürünün linkini göndermeniz yeterli — renk ve beden seçiminizde size yardımcı oluruz. Türkiye'nin her yerine güvenli gönderim yapılır.`}
        </Accordion>
      </div>
    </div>
  );
}
