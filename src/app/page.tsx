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
    <main className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col items-center justify-center bg-gradient-to-b from-amber-100 via-amber-50 to-orange-100 px-1 py-1 text-amber-950 sm:px-2 sm:py-2">
      <GameCanvas />
      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
