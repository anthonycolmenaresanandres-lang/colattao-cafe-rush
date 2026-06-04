// ─── Client: Colattao Coffee House ─────────────────────────────────────────
// One file per client. Everything client-specific lives here so the shared
// app core stays identical across the whole fleet. To onboard a new client,
// `scripts/new-client.ts` copies this shape into src/clients/<slug>/.

import type { ClientSite } from "@/config/client-types";

const colattao: ClientSite = {
  slug: "colattao",

  // Canonical production URL. Defaults here; NEXT_PUBLIC_SITE_URL overrides at
  // deploy time when the AMMA-owned domain is connected in Vercel.
  defaultSiteUrl: "https://colattao-cafe-rush.vercel.app",

  name: "Colattao Coffee House",
  tagline: "Digital Menu & Café Rush",

  locality: "Virginia Beach",
  region: "VA",
  country: "US",

  // Public brand profiles — used as schema.org sameAs to tie the menu to the
  // real entity. These are links, not owned-domain claims.
  brandLinks: {
    website: "https://colattao.com/",
    instagram: "https://www.instagram.com/colattao/",
  },

  // Paste the Google Search Console "HTML tag" verification code here (the
  // content value only). Leave empty until the domain is connected. When set,
  // the layout emits <meta name="google-site-verification" ...> automatically.
  googleSiteVerification: "",
};

export default colattao;
