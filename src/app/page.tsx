import type { Metadata } from "next";
import FallExperience from "@/components/FallExperience";

export const metadata: Metadata = {
  title: { absolute: "Play Fall Rush | Colattao Coffee House" },
  description: "Play Colattao Fall Rush: tap the falling drinks and explore Pumpkin Pie, Caramel Apple, Campfire and Maple Pecan. Your fall favorites in Virginia Beach.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Fall Rush — Colattao Coffee House",
    description: "Four fall drinks. One delicious challenge. Tap the falling drinks and play Fall Rush at Colattao Coffee House, Virginia Beach.",
    url: "/",
  },
};

export default function Page() {
  return <FallExperience />;
}
