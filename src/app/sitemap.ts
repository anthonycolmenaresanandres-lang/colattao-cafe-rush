import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

// Public, indexable pages. The menu is the highest-value page for "colattao menu".
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/menu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/get-started`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
