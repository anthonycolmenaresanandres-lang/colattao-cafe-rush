import type { Metadata } from "next";
import MenuView from "@/components/MenuView";
import { publicMenu } from "@/lib/owner/public-menu";
import { SITE_URL, SITE_NAME } from "@/config/site";

// Retry cold-cache outages; do not permanently cache the reference-menu fallback.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menu — Espresso, Matcha, Lattes & Pastries in Virginia Beach",
  description:
    "The full Colattao Coffee House menu in Virginia Beach, VA — espresso and coffee, signature Colombian lattes, matcha, teas, and fresh pastries with prices.",
  alternates: { canonical: "/menu" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/menu`,
    siteName: SITE_NAME,
    title: "Colattao Coffee House Menu — Virginia Beach, VA",
    description:
      "Browse the full Colattao Coffee House menu: espresso, signature Colombian lattes, matcha, teas, and pastries.",
    images: [{ url: "/assets/colattao/og-colattao.jpg", width: 1200, height: 630 }],
  },
};

export default async function MenuPage() {
  const { categories, warning } = await publicMenu();
  return <MenuView menuCategories={categories} warning={warning} />;
}

