import type { Metadata } from "next";
import SiteTemplate from "@/components/template/SiteTemplate";
import befreeConfig from "@/config/templates/befree";

// Prospect preview — unlisted (not indexed, not in nav/sitemap).
export const metadata: Metadata = {
  title: "Be Free Craft Ice Cream — Menu (Draft Preview)",
  description: "Draft digital-menu preview for Be Free Craft Ice Cream, Virginia Beach.",
  robots: { index: false, follow: false },
};

export default function BeFreePage() {
  return <SiteTemplate config={befreeConfig} />;
}
