/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Firebase Storage görselleri
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      // Mevcut siteden geçiş döneminde kullanılabilecek görseller
      { protocol: "https", hostname: "www.gultenimbutik.com.tr" },
      { protocol: "https", hostname: "gultenimbutik.com.tr" },
    ],
  },
};

export default nextConfig;
