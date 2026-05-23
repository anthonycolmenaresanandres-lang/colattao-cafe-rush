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
  const shareText = "I just won my Colattao Cafe Rush pass ☕🇨🇴 Play at Colattao and try to beat me!";

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
        await navigator.share({ text: shareText });
        setShareStatus("Shared. Show your shared post or repost screen for a bonus surprise.");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setShareStatus("Text copied. Post it, tag Colattao, and show the barista.");
        return;
      }

      setShareStatus("Share unavailable on this device. Copy and post your win manually.");
    } catch {
      setShareStatus("Share canceled or unavailable. You can still post your win manually.");
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-amber-950/45 p-4">
      <section className="flash-pass-bg w-full max-w-sm rounded-3xl border border-amber-100/85 p-5 text-amber-50 shadow-2xl">
        <p className="text-center text-[11px] uppercase tracking-[0.22em]">
          {rewardConfig.shopName} Cafe Crush
        </p>
        <h2 className="mt-2 text-center text-3xl font-black leading-tight">{rewardConfig.rewardText}</h2>
        <p className="mt-1 text-center text-xs uppercase tracking-[0.14em] text-amber-100">
          {rewardConfig.location}
        </p>
        <p className="mt-3 text-center text-sm">
          Live clock: <span className="font-mono">{formatTime(clockNow)}</span>
        </p>
        <p className="text-center text-sm">
          Date: <span className="font-mono">{todayLabel}</span>
        </p>
        <p className="mt-1 text-center text-xs font-semibold uppercase tracking-[0.12em]">
          Valid today only
        </p>

        <div className="mt-4 space-y-1 rounded-xl bg-black/35 p-3 text-sm">
          <p>score: <span className="font-mono">{payload.score}</span></p>
          <p>wonAt: <span className="font-mono">{wonAtLabel}</span></p>
        </div>
        <p className="mt-3 rounded-lg bg-black/25 p-2 text-center text-xs font-semibold">
          {rewardConfig.verificationText}
        </p>

        {blocked ? (
          <p className="mt-4 rounded-lg bg-red-900/60 p-2 text-center text-sm font-semibold">
            Come back tomorrow for another discount! ({formatDuration(remainingMs)} remaining)
          </p>
        ) : claimed ? (
          <p className="mt-4 rounded-lg bg-emerald-900/60 p-2 text-center text-sm font-semibold">
            Discount claimed. Show this active screen to your barista.
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClaim}
            className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-amber-950 shadow"
          >
            Claim Discount
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-lg border border-white bg-white/15 px-3 py-2 text-sm font-bold"
          >
            Play Again
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-black/30 p-3">
          <p className="text-center text-sm font-semibold">Want a bonus reward?</p>
          <p className="mt-1 text-center text-xs text-amber-100">
            Share or repost your win and show the barista.
          </p>
          <button
            type="button"
            onClick={onShare}
            className="mt-3 w-full rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-amber-950"
          >
            Share My Win
          </button>
          <p className="mt-2 text-center text-xs font-semibold">
            Show your shared post or repost screen for a bonus surprise.
          </p>
          {shareStatus ? <p className="mt-2 text-center text-xs">{shareStatus}</p> : null}
        </div>
      </section>
    </div>
  );
}
