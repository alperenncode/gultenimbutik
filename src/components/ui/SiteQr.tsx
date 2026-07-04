import QRCode from "qrcode";
import Image from "next/image";
import { SITE } from "@/lib/site";

/**
 * Marka renklerinde zarif QR kod — ortasında Gültenim Boutique logosu.
 * Sunucuda SVG olarak üretilir (ek istek yok, her ekranda net görünür).
 * Hata düzeltme seviyesi H: ortadaki logo şeridi kodun okunmasını engellemez.
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
        {/* Ortadaki logo şeridi */}
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            overflow-hidden rounded-[4px] shadow-soft"
          style={{ width: Math.round(size * 0.42) }}
        >
          <Image
            src="/logo-plaka.png"
            alt=""
            width={1200}
            height={302}
            className="h-auto w-full"
          />
        </span>
        <span className="sr-only">Gültenim Butik sitesine giden QR kod: {url}</span>
      </div>
      {caption && (
        <p className="max-w-[170px] text-center text-[10px] uppercase tracking-luxe text-current">
          {caption}
        </p>
      )}
    </div>
  );
}
