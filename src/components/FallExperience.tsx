"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import FallCollection from "@/components/FallCollection";
import VisualFlashPass from "@/components/VisualFlashPass";
import { EventBus } from "@/game/events/EventBus";
import type { GameWonPayload } from "@/types/game";

const GameCanvas = dynamic(() => import("@/components/GameCanvas"), {
  ssr: false,
  loading: () => <div className="flex flex-1 items-center justify-center text-sm text-parchment" role="status">Preparing your fall favorites…</div>,
});

export default function Home() {
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [lastWin, setLastWin] = useState<GameWonPayload | null>(null);

  useEffect(() => {
    if (!playing) return;
    return EventBus.on("GAME_WON", setLastWin);
  }, [playing]);

  const start = () => {
    setLastWin(null);
    setHasPlayed(true);
    setPlaying(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const back = () => {
    setPlaying(false);
    setLastWin(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (!playing) return <FallCollection onPlay={start} selected={selected} onSelect={setSelected} focusPlay={hasPlayed} />;

  return (
    <main className="mx-auto flex h-[100svh] min-h-[560px] w-full max-w-[470px] flex-col bg-colattao-page text-parchment">
      <h1 className="sr-only">Colattao Fall Rush</h1>
      <nav className="flex h-14 shrink-0 items-center justify-between border-b border-parchment/15 px-5 text-xs" aria-label="Game navigation">
        <button type="button" onClick={back} className="min-h-11 cursor-pointer px-2 focus-visible:outline-2 focus-visible:outline-gold">← The flavors</button>
        <span className="font-display text-base">Fall Rush</span>
        <a href="/menu#fall-drinks" className="flex min-h-11 items-center px-2 underline underline-offset-4">Menu ↗</a>
      </nav>
      <section className="relative flex min-h-0 flex-1 flex-col px-1 pt-2 pb-[max(4px,env(safe-area-inset-bottom))] sm:px-2" aria-label="Colattao Fall Rush">
        <GameCanvas autoStart />
      </section>
      {lastWin ? <VisualFlashPass payload={lastWin} onPlayAgain={() => { setLastWin(null); EventBus.emit("RESTART_GAME", undefined); }} /> : null}
    </main>
  );
}
