import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

// Tells crawlers what they may index. Customer-facing pages are open; internal
// owner/admin and API routes are excluded.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/owner-command-center",
        "/owner-presentation",
        "/request-update",
        "/market/ops",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
