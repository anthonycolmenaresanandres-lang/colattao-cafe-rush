"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameWonPayload } from "@/types/game";
import { rewardConfig } from "@/config/rewardConfig";
import { claimReward, getCooldownStatus } from "@/utils/rewardCooldown";

type VisualFlashPassProps = {
  payload: GameWonPayload;
  onPlayAgain: () => void;
};

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

export default function VisualFlashPass({ payload, onPlayAgain }: VisualFlashPassProps) {
  const [clockNow, setClockNow] = useState(() => Date.now());
  const [remainingMs, setRemainingMs] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [randomSeed] = useState(() => Math.floor(Math.random() * 10000));

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      setClockNow(now);
      const status = getCooldownStatus(now);
      setBlocked(status.blocked);
      setRemainingMs(status.remainingMs);
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const wonAtLabel = useMemo(() => formatTime(payload.wonAt), [payload.wonAt]);
  const todayLabel = useMemo(
    () =>
      new Date(clockNow).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [clockNow],
  );

  const winCode = useMemo(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const datePart = `${mm}${dd}`;

    const mix = payload.wonAt + payload.score * 97 + randomSeed * 31 + now.getFullYear();
    const codePart = String(Math.abs(mix % 10000)).padStart(4, "0");

    return `COL-${datePart}-${codePart}`;
  }, [payload.score, payload.wonAt, randomSeed]);

  const shareText = `I just won Colattao Café Rush ☕🇨🇴 Win Code: ${winCode}. Play here: https://colattao-cafe-rush.vercel.app/`;

  const onClaim = () => {
    const status = getCooldownStatus();
    if (status.blocked) {
      setBlocked(true);
      setRemainingMs(status.remainingMs);
      return;
    }

    const nextStatus = claimReward();
    setClaimed(true);
    setBlocked(nextStatus.blocked);
    setRemainingMs(nextStatus.remainingMs);
  };

  const onShare = async () => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: "Colattao Café Rush",
          text: shareText,
          url: "https://colattao-cafe-rush.vercel.app/",
        });
        setShareStatus("Shared. Show the post to your barista for a small surprise.");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareStatus("Copied. Post it, tag Colattao, and show the barista.");
        return;
      }

      setShareStatus("Share unavailable here — copy your win manually.");
    } catch {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(shareText);
          setShareStatus("Copied. Post it, tag Colattao, and show the barista.");
          return;
        } catch {
          setShareStatus("Share canceled. You can still post your win manually.");
          return;
        }
      }

      setShareStatus("Share canceled. You can still post your win manually.");
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
      <section className="coffee-card w-full max-w-sm px-6 pb-6 pt-7">
        {/* ── Header ─────────────────────────────────────────── */}
        <p className="brand-eyebrow text-center text-[var(--col-gold-deep)]">
          {rewardConfig.shopName} · Café Rush
        </p>
        <h2
          className="brand-wordmark mt-1 text-center text-3xl text-[var(--col-espresso)]"
          style={{ letterSpacing: "0.02em" }}
        >
          {rewardConfig.rewardText}
        </h2>
        <p className="mt-1 text-center text-[11px] uppercase tracking-[0.22em] text-[var(--col-espresso-3)]/75">
          {rewardConfig.location}
        </p>

        <div className="ceramic-rule mx-auto my-4 w-3/4" />

        {/* ── Live verification ─────────────────────────────── */}
        <div className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--col-espresso-3)]/70">
            Verified live
          </p>
          <p className="font-mono text-sm text-[var(--col-espresso)]">
            {formatTime(clockNow)} · {todayLabel}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--col-terracotta)]">
            Valid today only
          </p>
        </div>

        {/* ── Receipt-style data block ──────────────────────── */}
        <div className="mt-4 rounded-xl border border-[var(--col-gold-deep)]/25 bg-white/55 px-4 py-3 text-[13px]">
          <div className="flex justify-between">
            <span className="text-[var(--col-espresso-3)]/75">Score</span>
            <span className="font-mono text-[var(--col-espresso)]">{payload.score}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-[var(--col-espresso-3)]/75">Earned</span>
            <span className="font-mono text-[var(--col-espresso)]">{wonAtLabel}</span>
          </div>
          <div className="gold-rule my-2" />
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--col-espresso-3)]/70">
              Win Code
            </span>
            <span className="font-mono text-base font-bold tracking-[0.08em] text-[var(--col-espresso)]">
              {winCode}
            </span>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] italic text-[var(--col-espresso-3)]/75">
          {rewardConfig.verificationText}
        </p>

        {/* ── Status ─────────────────────────────────────────── */}
        {blocked ? (
          <p className="mt-4 rounded-lg border border-[var(--col-terracotta)]/30 bg-[var(--col-terracotta)]/10 px-3 py-2 text-center text-xs font-semibold text-[var(--col-terracotta-2)]">
            Come back tomorrow for another reward · {formatDuration(remainingMs)} remaining
          </p>
        ) : claimed ? (
          <p className="mt-4 rounded-lg border border-emerald-700/30 bg-emerald-700/10 px-3 py-2 text-center text-xs font-semibold text-emerald-800">
            Claimed · show this active screen to your barista
          </p>
        ) : null}

        {/* ── Primary actions ───────────────────────────────── */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClaim}
            className="btn-gold rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-[0.12em]"
          >
            Claim
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-ghost rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-[0.12em]"
          >
            Play Again
          </button>
        </div>

        {/* ── Share / bonus ─────────────────────────────────── */}
        <div className="mt-5 rounded-xl border border-[var(--col-ceramic)]/25 bg-[var(--col-ceramic)]/8 px-4 py-3">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--col-ceramic)]">
            Bonus surprise
          </p>
          <p className="mt-1 text-center text-[11px] leading-snug text-[var(--col-espresso-3)]/80">
            Share your win and show the barista for a small extra.
          </p>
          <button
            type="button"
            onClick={onShare}
            className="btn-ceramic mt-3 w-full rounded-xl px-3 py-2.5 text-sm font-bold uppercase tracking-[0.12em]"
          >
            Share My Win
          </button>
          {shareStatus ? (
            <p className="mt-2 text-center text-[11px] text-[var(--col-espresso-3)]/80">
              {shareStatus}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
