"use client";

import { useEffect, useRef, useState } from "react";
import { FALL_ACTION, FALL_UI, type FallUiState } from "@/game/events/fallUi";

export default function GameCanvas() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const [ui, setUi] = useState<FallUiState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    let observer: ResizeObserver | undefined;
    const applyPause = () => {
      const game = gameRef.current;
      if (!game?.scene.keys.DemoScene) return;
      if (document.hidden || pausedRef.current) game.scene.pause("DemoScene");
      else if (game.scene.isPaused("DemoScene")) game.scene.resume("DemoScene");
    };
    const onUi = (state: FallUiState) => {
      if (!mounted) return;
      setUi(state);
      if (state.phase === "start") { pausedRef.current = false; setPaused(false); }
      applyPause();
    };
    document.addEventListener("visibilitychange", applyPause);

    const mountGame = async () => {
      if (!hostRef.current || gameRef.current) {
        return;
      }

      const [Phaser] = await Promise.all([import("phaser"), document.fonts.ready]);
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
        callbacks: { preBoot: (instance) => { instance.events.on(FALL_UI, onUi); } },
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          parent: "game-container",
          width: "100%",
          height: "100%",
        },
      });

      gameRef.current = game;
      observer = new ResizeObserver(() => game.scale.refresh());
      observer.observe(hostRef.current);
    };

    void mountGame().catch(() => { if (mounted) setFailed(true); });

    return () => {
      mounted = false;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", applyPause);
      gameRef.current?.events.off(FALL_UI, onUi);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  const togglePause = () => {
    const game = gameRef.current;
    if (!game || ui?.phase !== "playing") return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    if (pausedRef.current) game.scene.pause("DemoScene");
    else game.scene.resume("DemoScene");
  };

  return (
    <div className="game-shell relative flex min-h-0 w-full max-w-[460px] flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <div
        id="game-container"
        ref={hostRef}
        className="mx-auto h-full min-h-0 w-full overflow-hidden rounded-[20px]"
        style={{ background: "#1B0E08" }}
        tabIndex={0}
        role="region"
        aria-label="Fall Rush. Tap falling drinks for ten points; avoid chain coffee. Enter activates the screen button."
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault(); gameRef.current?.events.emit(FALL_ACTION);
          }
        }}
        />
        {!ui && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[#E7CEAC]" role="status">
          {failed ? "The game could not load. Refresh to try again." : "Preparing your fall favorites…"}
        </div>}
        {paused && <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[20px] bg-black/65 font-serif text-3xl text-[#F5E9D0]">Rush paused</div>}
      </div>
      <div className="flex h-11 shrink-0 items-center justify-between px-3 text-[10px] tracking-wide text-[#D9BE99]">
        <span>{ui?.phase === "playing" ? "TAP DRINKS  +10" : "FOUR FALL FAVORITES"}</span>
        <button type="button" className="min-h-11 min-w-16 px-2 text-xs underline decoration-[#9B6C43] underline-offset-4 disabled:opacity-40"
          onClick={togglePause} disabled={ui?.phase !== "playing"} aria-pressed={paused}>
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
    </div>
  );
}
