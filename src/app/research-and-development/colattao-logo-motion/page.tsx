import type { Metadata } from "next";
import ColattaoButterflyLogoMotion from "@/components/ColattaoButterflyLogoMotion";

export const metadata: Metadata = {
  title: "Colattao Logo Motion · Review",
  description: "Private review route for the Colattao butterfly-particle logo motion.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function ColattaoLogoMotionPreviewPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_50%_0%,#4a210d_0%,#1b0e08_35%,#0d0503_100%)] px-4 py-8 text-[#fff3d6] sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#daae4f]">
            Review only · Not live on the menu
          </p>
          <h1 className="mt-4 font-serif text-3xl leading-tight sm:text-5xl">
            Colattao in motion
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#f4deba]/78 sm:text-base">
            Golden butterfly-shaped pixels gather into the existing Colattao wordmark,
            hold it precisely, and release back into motion.
          </p>
        </header>

        <section className="mt-8 sm:mt-10" aria-label="Colattao animated logo preview">
          <ColattaoButterflyLogoMotion />
        </section>

        <p className="mx-auto mt-7 max-w-xl text-center text-[11px] leading-relaxed tracking-[0.08em] text-[#f4deba]/56">
          The current fireplace and owners image remains unchanged. This isolated route is
          for visual approval before any menu hero replacement.
        </p>
      </div>
    </main>
  );
}
