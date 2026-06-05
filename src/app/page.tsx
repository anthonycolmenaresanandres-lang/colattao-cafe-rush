"use client";

import { useEffect, useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import VisualFlashPass from "@/components/VisualFlashPass";
import CustomerHeader from "@/components/CustomerHeader";
import { EventBus } from "@/game/events/EventBus";
import type { GameWonPayload } from "@/types/game";

// Premium promo banner that floats over the top of the game like a website ad.
function SeasonalPromoBanner() {
  return (
    <a
      href="/menu#seasonal-drinks"
      aria-label="New seasonal Matcha Lemonade — view flavors"
      className="group pointer-events-auto flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-[#DAAE4F]/55 bg-[linear-gradient(135deg,#241405_0%,#170d05_100%)] px-3 py-2.5 shadow-[0_18px_38px_-18px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(248,237,215,0.1)] ring-1 ring-black/20 backdrop-blur-sm transition hover:border-[#DAAE4F]/85"
    >
      <div className="flex shrink-0 -space-x-3">
        {["original", "strawberry", "mango"].map((f) => (
          <img
            key={f}
            src={`/assets/colattao/game/stickers/${f}-sticker.png`}
            alt=""
            className="h-11 w-11 rounded-full ring-2 ring-[#1a0f06]"
          />
        ))}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#DAAE4F]">
          New · Seasonal
        </p>
        <p className="truncate text-[13px] font-black tracking-tight text-[#F8EDD7]">
          Matcha Lemonade
        </p>
        <p className="truncate text-[10px] text-[#F8EDD7]/55">
          Strawberry · Mango · Original
        </p>
      </div>
      <span className="shrink-0 pr-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#DAAE4F] transition group-hover:translate-x-0.5">
        View →
      </span>
    </a>
  );
}

export default function Home() {
  const [lastWin, setLastWin] = useState<GameWonPayload | null>(null);
  const [showReward, setShowReward] = useState(false);

  const handlePlayAgain = () => {
    setShowReward(false);
    setLastWin(null);
    EventBus.emit("RESTART_GAME", undefined);
  };

  useEffect(() => {
    const unsubscribe = EventBus.on("GAME_WON", (payload) => {
      setLastWin(payload);
      setShowReward(true);
    });

    return unsubscribe;
  }, []);

  return (
    <main className="mx-auto flex h-[100svh] min-h-[100svh] w-full max-w-[470px] flex-col overflow-hidden bg-colattao-page text-parchment">
      <h1 className="sr-only">
        Colattao Coffee House — Café Rush game and digital menu in Virginia Beach, VA
      </h1>
      <CustomerHeader />

      <section className="relative flex min-h-0 flex-1 flex-col px-1 pb-1 pt-1 sm:px-2">
        <GameCanvas />

        {/* Promo banner pinned to the bottom of the game, like a website ad bar. */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-2">
          <SeasonalPromoBanner />
        </div>
      </section>

      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
