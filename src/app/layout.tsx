import type { Metadata, Viewport } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import { SITE } from "@/lib/site";
import { PwaRegister } from "@/components/ui/PwaRegister";
import { SecurityGuard } from "@/components/ui/SecurityGuard";
import "./globals.css";

// preload: false — tarayıcı yalnızca gerçekten kullanılan font dosyalarını
// indirir; "preload edilen kaynak kullanılmadı" konsol uyarılarını önler
// (display: "swap" sayesinde yazılar font inene kadar sistem fontuyla görünür)
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline} | Premium Tesettür Giyim`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "tesettür giyim",
    "tesettür elbise",
    "tesettür takım",
    "Selvi Çetin",
    "İnvee",
    "Erzurum butik",
    "Gültenim Butik",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2C1A1A",
  width: "device-width",
  initialScale: 1,
  // Sayfanın parmakla küçültülüp "yarım" kalmasını önler —
  // görsel büyütme ihtiyacı galeri içindeki tam ekran görüntüleyiciyle karşılanır
  maximumScale: 1,
  userScalable: false,
  // iOS çentik/home çubuğu güvenli alanları (env(safe-area-inset-*)) için gerekli
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${poppins.variable} ${playfair.variable}`}>
      <body>
        {children}
        <PwaRegister />
        <SecurityGuard />
      </body>
    </html>
  );
}
