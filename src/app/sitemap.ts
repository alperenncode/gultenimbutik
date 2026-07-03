import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getAllActiveProducts, getCategories } from "@/lib/data";

// Sitemap günde bir yeniden oluşturulur
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    getAllActiveProducts(),
    getCategories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "daily", priority: 1 },
    { url: `${SITE.url}/urunler`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE.url}/hakkimizda`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/iletisim`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE.url}/kategori/${cat.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/urun/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
