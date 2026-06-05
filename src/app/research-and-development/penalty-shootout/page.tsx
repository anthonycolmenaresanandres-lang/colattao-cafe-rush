import type { Metadata } from "next";
import PenaltyGameCanvas from "@/components/PenaltyGameCanvas";

export const metadata: Metadata = {
  title: "Penalty Shootout - R&D beta",
  description: "Internal beta harness.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function PenaltyShootoutPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-start gap-4 bg-[#120a04] px-3 py-4 text-[#F8EDD7] sm:px-4 sm:py-5">
      <header className="w-full max-w-[460px] text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#DAAE4F]">
          Colattao R&D Beta
        </p>
        <h1 className="mt-1 text-xl font-bold">Penalty Shootout</h1>
        <p className="mx-auto mt-1 max-w-[340px] text-xs leading-5 text-[#F8EDD7]/70">
          Tap a goal zone, beat the keeper, avoid the red edges, and score 3 of 5.
        </p>
      </header>
      <div className="flex h-[78dvh] min-h-[520px] w-full max-w-[460px] flex-col">
        <PenaltyGameCanvas />
      </div>
    </main>
  );
}
