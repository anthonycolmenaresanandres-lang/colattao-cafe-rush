"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import VisualFlashPass from "@/components/VisualFlashPass";
import CustomerHeader from "@/components/CustomerHeader";
import { EventBus } from "@/game/events/EventBus";
import type { GameWonPayload } from "@/types/game";

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
    <main className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-colattao-page text-parchment">
      <CustomerHeader />

      <section className="flex flex-1 flex-col items-center justify-start px-2 pb-2 pt-2 sm:px-3">
        <GameCanvas />

        <nav
          aria-label="Colattao pages"
          className="mt-3 flex w-full max-w-[460px] justify-center gap-2.5 px-2"
        >
          <Link
            href="/menu"
            className="btn-ceramic inline-block rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            View Menu
          </Link>
          <Link
            href="/owner-presentation"
            className="btn-ghost inline-block rounded-full border border-amber-300/40 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100"
          >
            View Presentation
          </Link>
          <Link
            href="/website-concept"
            className="btn-ghost inline-block rounded-full border border-amber-300/40 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100"
          >
            View Website
          </Link>
        </nav>

      </section>

      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
