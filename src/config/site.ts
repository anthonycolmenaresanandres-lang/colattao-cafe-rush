// Central site identity used for SEO metadata, canonical URLs, sitemap, and
// structured data. Override the base URL with NEXT_PUBLIC_SITE_URL when the
// site moves to a custom domain — every SEO surface reads from here.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://colattao-cafe-rush.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Colattao Coffee House";
export const SITE_TAGLINE = "Digital Menu & Café Rush";
export const SITE_LOCALITY = "Virginia Beach";
export const SITE_REGION = "VA";
export const SITE_COUNTRY = "US";

// Verified brand profiles (used as schema.org sameAs to tie this menu to the
// real Colattao entity). These are public links, not owned-domain claims.
export const BRAND_LINKS = {
  website: "https://colattao.com/",
  instagram: "https://www.instagram.com/colattao/",
} as const;
