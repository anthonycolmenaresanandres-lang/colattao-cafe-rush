"use client";

import { useEffect, useRef } from "react";

export default function GameCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<unknown>(null);

  useEffect(() => {
    let mounted = true;

    const mountGame = async () => {
      if (!hostRef.current || gameRef.current) {
        return;
      }

      const Phaser = await import("phaser");
      const { BootScene } = await import("@/game/scenes/BootScene");
      const { DemoScene } = await import("@/game/scenes/DemoScene");
      if (!mounted || !hostRef.current || gameRef.current) {
        return;
      }

      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: "game-container",
        width: "100%",
        height: "100%",
        backgroundColor: "#1B0E08",
        scene: [BootScene, DemoScene],
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          parent: "game-container",
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
    <div className="game-shell flex min-h-0 w-full max-w-[460px] flex-1">
      <div
        id="game-container"
        ref={hostRef}
        className="mx-auto h-full min-h-0 w-full overflow-hidden rounded-[20px]"
        style={{ background: "#1B0E08" }}
      />
    </div>
  );
}
