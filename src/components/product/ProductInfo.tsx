"use client";

/**
 * Ürün bilgi paneli — fiyat, renk/beden seçimi, WhatsApp sipariş butonu,
 * Instagram paylaşım, favori, açıklama akordeonları.
 * Seçilen renk/beden WhatsApp mesajına otomatik eklenir.
 */
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Instagram, ChevronDown, Check, Images } from "lucide-react";
import { formatPrice } from "@/lib/site";
import { buildProductOrderLink } from "@/lib/whatsapp";
import type { Product } from "@/types";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { useWishlist } from "@/context/WishlistContext";
import { SizeChart } from "./SizeChart";
import { ColorOptionsModal } from "./ColorOptionsModal";

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
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const colorImages = product.colorImages ?? {};
  const outOfStockColors = product.outOfStockColors ?? [];
  const outOfStockSizes = product.outOfStockSizes ?? [];
  const colorOptions = product.colors.map((c) => ({
    name: c,
    imageUrl: colorImages[c] ?? "",
    outOfStock: outOfStockColors.includes(c),
  }));
  const hasColorPhotos = colorOptions.some((c) => c.imageUrl);
  const { isInWishlist, toggle } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const settings = useSiteSettings();

  // WhatsApp mesajına giden ürün linki, ziyaretçinin O AN baktığı adresten
  // alınır — böylece site hangi alan adında yayındaysa link hep doğru olur
  const [liveUrl, setLiveUrl] = useState(productUrl);
  useEffect(() => {
    setLiveUrl(window.location.origin + window.location.pathname);
  }, []);

  const whatsappLink = buildProductOrderLink({
    productName: product.name,
    productUrl: liveUrl,
    color,
    size,
    whatsappNumber: settings.whatsappNumber,
  });

  /** Instagram'da Paylaş: mobilde yerel paylaşım menüsü, masaüstünde link kopyalanıp profil açılır */
  async function shareToInstagram() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product.name, url: liveUrl });
        return;
      } catch {
        /* kullanıcı iptal etti — sorun değil */
      }
    }
    try {
      await navigator.clipboard.writeText(liveUrl);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      /* pano erişimi yok */
    }
    window.open(settings.instagramUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col">
      {/* Marka + isim + fiyat */}
      <p className="text-[11px] uppercase tracking-luxe text-rosegold-dark">{product.brand}</p>
      <h1 className="mt-2 break-words font-display text-3xl leading-tight text-bordeaux md:text-4xl">
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
      {colorOptions.length > 0 && (
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="input-label mb-0">
              Renk {color && <span className="text-rosegold-dark normal-case">— {color}</span>}
            </p>
            {hasColorPhotos && (
              <button
                type="button"
                onClick={() => setColorModalOpen(true)}
                className="flex items-center gap-1 text-xs text-rosegold-dark underline underline-offset-2"
              >
                <Images size={13} /> Tüm Renkleri Gör
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) =>
              c.imageUrl ? (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => !c.outOfStock && setColor(color === c.name ? undefined : c.name)}
                  disabled={c.outOfStock}
                  title={c.outOfStock ? `${c.name} — tükendi` : c.name}
                  className={`relative h-16 w-12 shrink-0 overflow-hidden transition-all duration-200 ${
                    c.outOfStock ? "cursor-not-allowed" : ""
                  } ${
                    color === c.name
                      ? "ring-2 ring-bordeaux ring-offset-2 ring-offset-cream"
                      : "opacity-90 hover:opacity-100"
                  }`}
                >
                  <Image src={c.imageUrl} alt={c.name} fill sizes="48px" className={`object-cover ${c.outOfStock ? "opacity-45" : ""}`} />
                  {c.outOfStock && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top right, transparent calc(50% - 1px), rgba(44,26,26,0.75) 50%, transparent calc(50% + 1px))",
                      }}
                    />
                  )}
                </button>
              ) : (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => !c.outOfStock && setColor(color === c.name ? undefined : c.name)}
                  disabled={c.outOfStock}
                  className={`border px-4 py-2 text-sm transition-all duration-200 ${
                    c.outOfStock
                      ? "cursor-not-allowed border-bordeaux/10 text-bordeaux/35 line-through"
                      : color === c.name
                        ? "border-bordeaux bg-bordeaux text-cream"
                        : "border-bordeaux/20 text-bordeaux/75 hover:border-rosegold-dark"
                  }`}
                >
                  {c.name}
                </button>
              )
            )}
          </div>

          {colorModalOpen && (
            <ColorOptionsModal
              colors={colorOptions.filter((c) => c.imageUrl)}
              onSelect={(name) => {
                setColor(name);
                setColorModalOpen(false);
              }}
              onClose={() => setColorModalOpen(false)}
              zoomIndex={zoomIndex}
              onZoom={setZoomIndex}
              onCloseZoom={() => setZoomIndex(null)}
            />
          )}
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
            {product.sizes.map((s) => {
              const outOfStock = outOfStockSizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => !outOfStock && setSize(size === s ? undefined : s)}
                  disabled={outOfStock}
                  title={outOfStock ? `${s} — tükendi` : undefined}
                  className={`min-w-[52px] border px-3 py-2 text-sm transition-all duration-200 ${
                    outOfStock
                      ? "cursor-not-allowed border-bordeaux/10 text-bordeaux/35 line-through"
                      : size === s
                        ? "border-bordeaux bg-bordeaux text-cream"
                        : "border-bordeaux/20 text-bordeaux/75 hover:border-rosegold-dark"
                  }`}
                >
                  {s}
                </button>
              );
            })}
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
        {settings.phoneDisplay} — mesajınıza ürün bilgileri otomatik eklenir
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
          {`Siparişleriniz WhatsApp (${settings.phoneDisplay}) veya Instagram (@${settings.instagramHandle}) üzerinden alınır.\n\nBeğendiğiniz ürünün linkini göndermeniz yeterli — renk ve beden seçiminizde size yardımcı oluruz. Türkiye'nin her yerine güvenli gönderim yapılır.`}
        </Accordion>
      </div>
    </div>
  );
}
