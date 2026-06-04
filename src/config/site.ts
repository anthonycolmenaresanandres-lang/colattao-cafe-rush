// Active-client resolver. Reads the CLIENT env var to pick which client config
// is live for this deployment, then re-exports the flat SEO constants the rest
// of the app already imports. Default client is colattao, so existing behavior
// is unchanged. Onboarding a new client = add it to CLIENTS + set CLIENT env.

import type { ClientSite } from "@/config/client-types";
import colattao from "@/clients/colattao/site.config";

const CLIENTS: Record<string, ClientSite> = {
  colattao,
};

const activeSlug = process.env.CLIENT ?? "colattao";
const active: ClientSite = CLIENTS[activeSlug] ?? colattao;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? active.defaultSiteUrl
).replace(/\/$/, "");

export const SITE_NAME = active.name;
export const SITE_TAGLINE = active.tagline;
export const SITE_LOCALITY = active.locality;
export const SITE_REGION = active.region;
export const SITE_COUNTRY = active.country;
export const BRAND_LINKS = active.brandLinks;

// Empty string when the domain isn't connected yet — the layout omits the tag.
export const GOOGLE_SITE_VERIFICATION = active.googleSiteVerification;
