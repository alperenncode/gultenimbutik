import QRCode from "qrcode";
import { SITE } from "@/lib/site";

/**
 * Marka renklerinde zarif QR kod — ortasında Gültenim monogramı.
 * Sunucuda SVG olarak üretilir (ek istek yok, her ekranda net görünür).
 * Hata düzeltme seviyesi H: ortadaki logo kodun okunmasını engellemez.
 *
 * tone="light": krem zemin üzerinde bordo modüller (açık alanlar için)
 * tone="dark":  bordo zemin (footer) üzerinde krem kart içinde gösterim
 */
export async function SiteQr({
  size = 120,
  url = SITE.url,
  caption,
}: {
  size?: number;
  url?: string;
  caption?: string;
}) {
  const svg = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 0,
    color: {
      dark: "#2C1A1A", // bordo modüller
      light: "#0000", // şeffaf zemin — kart rengini gösterir
    },
  });

  return (
    <div className="inline-flex flex-col items-center gap-2.5">
      <div
        className="relative rounded-xl border border-rosegold/40 bg-cream p-3 shadow-soft"
        style={{ width: size, height: size }}
      >
        <div
          aria-hidden="true"
          className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        {/* Ortadaki monogram — logo alanı */}
        <span
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2
            items-center justify-center rounded-full border border-rosegold/50 bg-cream
            font-display italic text-bordeaux shadow-soft"
          style={{
            width: Math.round(size * 0.26),
            height: Math.round(size * 0.26),
            fontSize: Math.round(size * 0.15),
          }}
        >
          G
        </span>
        <span className="sr-only">Gültenim Butik sitesine giden QR kod: {url}</span>
      </div>
      {caption && (
        <p className="max-w-[160px] text-center text-[10px] uppercase tracking-luxe text-current">
          {caption}
        </p>
      )}
    </div>
  );
}
