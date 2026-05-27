"use client";

import Image from "next/image";
import type { GameWonPayload } from "@/types/game";

type VisualFlashPassProps = {
  payload: GameWonPayload;
  onPlayAgain: () => void;
};

/**
 * Post-win completion card.
 *
 * Visible UI is intentionally minimal for now — Colattao plans to
 * configure rewards / promos / share mechanics later. The underlying
 * helper modules (`rewardConfig`, `rewardCooldown`) are preserved on
 * disk so we can re-enable the claim / share / cooldown flow without
 * rewriting it.
 *
 * `payload` is accepted to keep the React/Phaser bridge contract intact;
 * we surface the score so the player feels acknowledged.
 */
export default function VisualFlashPass({ payload, onPlayAgain }: VisualFlashPassProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
      <section className="coffee-card w-full max-w-sm px-6 pb-7 pt-8 text-center">
        {/* ── Brand mark — prominent, primary brand voice ──── */}
        <Image
          src="/assets/colattao/logo/colattao-logo.png"
          alt="Colattao"
          width={260}
          height={104}
          priority
          className="mx-auto h-auto w-[200px] select-none drop-shadow-[0_2px_4px_rgba(75,36,18,0.18)]"
        />

        <p className="brand-eyebrow mt-4 text-[var(--col-gold-deep)]">
          Café Rush · Round Complete
        </p>

        {/* ── Headline ──────────────────────────────────────── */}
        <h2
          className="brand-wordmark mt-2 text-[30px] leading-tight text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.04em" }}
        >
          Pass Earned
        </h2>

        <div className="ceramic-rule mx-auto my-4 w-3/4" />

        {/* ── Subtext ───────────────────────────────────────── */}
        <p className="text-[13px] leading-snug text-[var(--col-espresso-3)]/85">
          Thanks for playing. Rewards and promos will be updated by Colattao.
        </p>

        {/* ── Score acknowledgement ─────────────────────────── */}
        <div className="mt-4 inline-flex items-baseline gap-2 rounded-full border border-[var(--col-gold-deep)]/30 bg-white/55 px-4 py-1.5">
          <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--col-espresso-3)]/75">
            Score
          </span>
          <span className="font-mono text-base font-bold text-[var(--col-espresso)]">
            {payload.score}
          </span>
        </div>

        {/* ── Single action ─────────────────────────────────── */}
        <button
          type="button"
          onClick={onPlayAgain}
          className="btn-gold mt-6 w-full rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-[0.18em]"
        >
          Play Again
        </button>
      </section>
    </div>
  );
}
