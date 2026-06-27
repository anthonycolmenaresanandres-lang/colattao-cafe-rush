import type { Metadata } from "next";
import CustomerHeader from "@/components/CustomerHeader";
import PenaltyGameCanvas from "@/components/PenaltyGameCanvas";

export const metadata: Metadata = {
  title: "Colattao Penalty Rush — Penalty Shootout Game",
  description:
    "Step up to the spot at Colattao Coffee House. Pick your corner, beat the keeper, score 3 of 5. Just for fun — play while your drink is made.",
  openGraph: {
    title: "Colattao Penalty Rush",
    description: "Pick your corner, beat the keeper, score 3 of 5.",
    type: "website",
  },
};

export default function PenaltyRushPage() {
  return (
    <>
      <CustomerHeader />
      <main className="flex min-h-dvh flex-col items-center justify-start gap-4 bg-[#120a04] px-3 py-4 text-[#F8EDD7] sm:px-4 sm:py-5">
        <header className="w-full max-w-[460px] text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#DAAE4F]">
            Colattao Coffee House
          </p>
          <h1 className="mt-1 text-xl font-bold">Penalty Rush</h1>
          <p className="mx-auto mt-1 max-w-[340px] text-xs leading-5 text-[#F8EDD7]/70">
            Pick your corner, beat the keeper, score 3 of 5. Just for fun.
          </p>
        </header>
        <div className="flex h-[78dvh] min-h-[520px] w-full max-w-[460px] flex-col">
          <PenaltyGameCanvas />
        </div>
      </main>
    </>
  );
}
