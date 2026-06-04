"use client";

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
    <main className="mx-auto flex h-[100svh] min-h-[100svh] w-full max-w-[470px] flex-col overflow-hidden bg-colattao-page text-parchment">
      <h1 className="sr-only">
        Colattao Coffee House — Café Rush game and digital menu in Virginia Beach, VA
      </h1>
      <CustomerHeader />

      <section className="flex min-h-0 flex-1 flex-col items-center justify-start px-1 pb-1 pt-1 sm:px-2">
        <GameCanvas />
      </section>

      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
