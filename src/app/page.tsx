import type { Metadata } from "next";
import FallExperience from "@/components/FallExperience";

export const metadata: Metadata = {
  title: { absolute: "The Fall Collection & Fall Rush | Colattao Coffee House" },
  description: "Explore Colattao's Pumpkin Pie, Caramel Apple, Campfire and Maple Pecan drinks, then play Fall Rush. Coffee and fall flavors in Virginia Beach.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Fall Collection — Colattao Coffee House",
    description: "Four fall favorites. Explore the flavors and play Fall Rush at Colattao Coffee House, Virginia Beach.",
    url: "/",
  },
};

export default function Page() {
  return <FallExperience />;
}
