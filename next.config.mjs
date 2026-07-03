/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
