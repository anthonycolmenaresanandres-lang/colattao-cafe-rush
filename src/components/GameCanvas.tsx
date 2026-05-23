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
        parent: hostRef.current,
        width: 360,
        height: 640,
        backgroundColor: "#fef3c7",
        scene: [BootScene, DemoScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
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
    <div className="w-full max-w-[380px] rounded-2xl border-2 border-amber-900/30 bg-amber-50 p-2 shadow-lg">
      <div ref={hostRef} className="mx-auto aspect-[9/16] w-full overflow-hidden rounded-xl" />
    </div>
  );
}
