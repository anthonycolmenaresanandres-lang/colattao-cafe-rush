"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import GameCanvas from "@/components/GameCanvas";
import VisualFlashPass from "@/components/VisualFlashPass";
import CustomerHeader from "@/components/CustomerHeader";
import { EventBus } from "@/game/events/EventBus";
import type { GameWonPayload } from "@/types/game";

// Reserved space keeps the seasonal menu link clear of falling items.
function SeasonalPromoBanner() {
  return (
    <a
      href="/menu#fall-drinks"
      aria-label="Fall Drinks — view the seasonal menu"
      className="group pointer-events-auto flex w-full items-center gap-2 overflow-hidden rounded-2xl border border-[#DAAE4F]/55 bg-[linear-gradient(135deg,#241405_0%,#170d05_100%)] px-3 py-2.5 shadow-[0_18px_38px_-18px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(248,237,215,0.1)] ring-1 ring-black/20 backdrop-blur-sm transition hover:border-[#DAAE4F]/85"
    >
      <div className="flex shrink-0 -space-x-2.5">
        {["pumpkin-pie", "caramel-apple", "campfire", "maple-pecan"].map((f) => (
          <Image
            key={f}
            src={`/assets/colattao/game/fall/${f}.webp`}
            alt=""
            width={44}
            height={44}
            unoptimized
            className="h-9 w-9 object-contain"
          />
        ))}
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="whitespace-nowrap text-[7px] font-bold uppercase tracking-[0.16em] text-[#DAAE4F]">
          Now pouring
        </p>
        <p className="truncate text-[13px] font-black tracking-tight text-[#F8EDD7]">
          Fall Drinks
        </p>
        <p className="truncate text-[10px] text-[#F8EDD7]/55">
          See all four
        </p>
      </div>
      <span className="shrink-0 pr-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#DAAE4F] transition group-hover:translate-x-0.5">
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
    <main className="mx-auto flex h-[100svh] min-h-[560px] w-full max-w-[470px] flex-col overflow-hidden bg-colattao-page text-parchment">
      <h1 className="sr-only">
        Colattao Coffee House — Fall Rush game and digital menu in Virginia Beach, VA
      </h1>
      <CustomerHeader />

      <section className="relative flex min-h-0 flex-1 flex-col px-1 pb-1 pt-1 sm:px-2" aria-label="Colattao Fall Rush">
        <GameCanvas />

        <div className="flex shrink-0 justify-center px-2 pb-[max(4px,env(safe-area-inset-bottom))] pt-1">
          <SeasonalPromoBanner />
        </div>
      </section>

      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
