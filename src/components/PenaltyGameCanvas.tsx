"use client";

import { useEffect, useRef } from "react";

/**
 * Isolated mount for the Penalty Shootout beta: an internal R&D harness so the
 * title can be visually QA'd without editing the protected GameCanvas.tsx.
 */
export default function PenaltyGameCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;

    const mountGame = async () => {
      if (!hostRef.current || gameRef.current) return;

      const Phaser = await import("phaser");
      const { getCatalogGame } = await import("@/game/catalog");
      const scenes = await getCatalogGame("penalty-shootout").loadScenes();
      if (!mounted || !hostRef.current || gameRef.current) return;

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "penalty-game-container",
        width: "100%",
        height: "100%",
        backgroundColor: "#120a04",
        scene: scenes,
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          parent: "penalty-game-container",
          width: "100%",
          height: "100%",
        },
      });

      gameRef.current = game;
    };

    void mountGame();

    return () => {
      mounted = false;
      const game = gameRef.current as { destroy?: (removeCanvas?: boolean) => void } | null;
      game?.destroy?.(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="flex min-h-[520px] w-full max-w-[460px] flex-1">
      <div
        id="penalty-game-container"
        ref={hostRef}
        className="mx-auto h-full min-h-[520px] w-full overflow-hidden rounded-[20px] border border-[#DAAE4F]/35 shadow-2xl shadow-black/35"
        style={{ background: "#120a04" }}
      />
    </div>
  );
}
