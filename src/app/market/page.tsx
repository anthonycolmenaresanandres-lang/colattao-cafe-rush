import type { Metadata } from "next";
import MarketBoard from "@/components/MarketBoard";

// Unlisted showcase: shareable by link, but not indexed and not linked in nav.
export const metadata: Metadata = {
  title: "Colattao Community Market — Project Board",
  description: "Planning board for the Colattao Community Market, a monthly community bazaar in Virginia Beach.",
  robots: { index: false, follow: false },
};

const SHELL =
  "min-h-dvh bg-[radial-gradient(circle_at_20%_10%,#2e5a7c22_0%,transparent_36%),radial-gradient(circle_at_80%_15%,#d990281f_0%,transparent_30%),linear-gradient(180deg,#120904_0%,#1b0e08_45%,#2a1208_100%)] px-4 py-8 text-[#fff3d6] sm:px-6";

export default function MarketPage() {
  return (
    <main className={SHELL}>
      <MarketBoard />
    </main>
  );
}
