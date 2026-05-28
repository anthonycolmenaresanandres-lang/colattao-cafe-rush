"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import VisualFlashPass from "@/components/VisualFlashPass";
import FeedbackBox from "@/components/FeedbackBox";
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
      {/* ───────────────────────────────────────────────────────
          Golden-ratio shell
          Top brand zone ≈ 38.2 % · Game zone ≈ 61.8 %
          ─────────────────────────────────────────────────────── */}
      <header className="flex basis-[38.2%] flex-col items-center justify-end px-6 pb-3 pt-6 text-center">
        <p className="brand-eyebrow text-amber-100/70">
          Coffee House · Virginia Beach
        </p>
        <h1 className="sr-only">Colattao Café Rush</h1>
        <Image
          src="/assets/colattao/logo/colattao-logo.png"
          alt="Colattao"
          width={260}
          height={104}
          priority
          className="mx-auto mt-2 h-auto w-[200px] select-none drop-shadow-[0_0_24px_rgba(212,162,76,0.22)] sm:w-[220px]"
        />
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-300/55" />
          <span className="text-[10px] uppercase tracking-[0.32em] text-amber-200/70">
            Café Rush
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-300/55" />
        </div>
      </header>

      <section className="flex basis-[61.8%] flex-col items-center justify-start px-2 pb-2 sm:px-3">
        <GameCanvas />

        {/* ── Page-level navigation (outside the Phaser canvas) ── */}
        <nav
          aria-label="Páginas Colattao"
          className="mt-3 flex w-full max-w-[460px] justify-center gap-2.5 px-2"
        >
          <Link
            href="/menu"
            className="btn-ceramic inline-block rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            Ver menú
          </Link>
          <Link
            href="/owner-presentation"
            className="btn-ghost inline-block rounded-full border border-amber-300/40 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100"
          >
            Ver presentación
          </Link>
        </nav>

        <div className="mt-4 w-full max-w-[460px] px-2">
          <FeedbackBox pageSource="game" variant="dark" />
        </div>
      </section>

      {showReward && lastWin ? (
        <VisualFlashPass payload={lastWin} onPlayAgain={handlePlayAgain} />
      ) : null}
    </main>
  );
}
