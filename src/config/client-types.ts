// Shared contract every client config must satisfy. Keeping this in one place
// means the scaffold script and the resolver agree on the exact shape.

export interface ClientBrandLinks {
  website: string;
  instagram: string;
}

export interface ClientSite {
  /** URL-safe identifier, also the folder name under src/clients/ */
  slug: string;
  /** Canonical production URL; overridden by NEXT_PUBLIC_SITE_URL at deploy time */
  defaultSiteUrl: string;
  name: string;
  tagline: string;
  locality: string;
  region: string;
  country: string;
  brandLinks: ClientBrandLinks;
  /** Google Search Console "HTML tag" content value; empty until domain is live */
  googleSiteVerification: string;
}
