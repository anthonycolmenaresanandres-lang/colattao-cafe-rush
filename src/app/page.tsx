"use client";

import { useEffect, useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import VisualFlashPass from "@/components/VisualFlashPass";
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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center gap-4 bg-amber-100 px-4 py-5 text-amber-950">
      <h1 className="text-center text-2xl font-semibold">Colattao Cafe Crush</h1>
      <GameCanvas />
      <section className="w-full rounded-xl border border-amber-900/20 bg-amber-50 p-3 text-sm">
        <h2 className="mb-2 text-base font-semibold">Latest GAME_WON payload</h2>
        <p className="break-all font-mono">
          {lastWin ? JSON.stringify(lastWin) : "No GAME_WON event yet. Tap the Phaser button."}
        </p>
      </section>
      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
