/** @type {import('next').NextConfig} */
const nextConfig = {
  // Sunucu imzasını gizle
  poweredByHeader: false,

  images: {
    remotePatterns: [
      // Vercel Blob görselleri (ürün/kategori/lookbook)
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Firebase Storage (ileride kullanılırsa)
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      // Mevcut siteden geçiş döneminde kullanılabilecek görseller
      { protocol: "https", hostname: "www.gultenimbutik.com.tr" },
      { protocol: "https", hostname: "gultenimbutik.com.tr" },
    ],
  },

  // Temel güvenlik başlıkları — tüm sayfalara uygulanır
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Sitenin başka sitelerde iframe içine alınmasını engeller (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Tarayıcının içerik türünü tahmin etmesini engeller
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Dış sitelere yalnızca alan adı bilgisi sızar, tam URL sızmaz
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Kullanılmayan tarayıcı yeteneklerini kapat
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
