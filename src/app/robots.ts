import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Yönetim ve kişisel sayfalar aranmaz
        disallow: ["/admin", "/hesabim", "/giris", "/kayit"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
