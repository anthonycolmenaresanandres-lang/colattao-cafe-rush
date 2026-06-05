"use client";

import { useEffect, useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import VisualFlashPass from "@/components/VisualFlashPass";
import CustomerHeader from "@/components/CustomerHeader";
import { EventBus } from "@/game/events/EventBus";
import type { GameWonPayload } from "@/types/game";

// Static premium banner pinned to the bottom — promotes the new seasonal menu.
function SeasonalPromoBanner() {
  return (
    <a
      href="/menu#seasonal-drinks"
      aria-label="New seasonal Matcha Lemonade — view flavors"
      className="group mx-2 mb-2 mt-1 flex shrink-0 items-center gap-3 overflow-hidden rounded-2xl border border-[#DAAE4F]/45 bg-[linear-gradient(135deg,#241405_0%,#170d05_100%)] px-3 py-2.5 shadow-[0_14px_30px_-22px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(248,237,215,0.08)] transition hover:border-[#DAAE4F]/80"
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

      <style>{`@keyframes crRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}`}</style>
      <section className="flex min-h-0 flex-1 flex-col items-center justify-start px-2 pb-1 pt-1.5">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#DAAE4F]/40 shadow-[0_18px_44px_-26px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(248,237,215,0.08)] motion-safe:[animation:crRise_.6s_ease-out_both]">
          <span className="pointer-events-none absolute inset-0 z-10 rounded-2xl ring-1 ring-inset ring-[#DAAE4F]/15" />
          <span className="pointer-events-none absolute inset-x-6 top-0 z-10 h-px bg-[linear-gradient(90deg,transparent,rgba(218,174,79,0.6),transparent)]" />
          <GameCanvas />
        </div>
      </section>

      <SeasonalPromoBanner />

      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
