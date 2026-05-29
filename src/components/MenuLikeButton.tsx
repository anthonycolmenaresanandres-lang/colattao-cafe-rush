"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";

type Props = {
  itemName: string;
};

export const STORAGE_KEY = "colattao_favorites";
export const FAVORITES_UPDATED_EVENT = "colattao:favorites-updated";

function readFavorites(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function writeFavorites(next: string[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT));
  } catch {
    // Intentionally swallow local-only persistence errors.
  }
}

export default function MenuLikeButton({ itemName }: Props) {
  const [saved, setSaved] = useState(false);
  const [popping, setPopping] = useState(false);
  const ariaLabel = useMemo(
    () => (saved ? `Saved item: ${itemName}` : `Save item: ${itemName}`),
    [saved, itemName],
  );

  useEffect(() => {
    const favorites = readFavorites();
    setSaved(favorites.includes(itemName));
  }, [itemName]);

  function onToggle() {
    const favorites = readFavorites();
    const alreadySaved = favorites.includes(itemName);
    const next = alreadySaved
      ? favorites.filter((name) => name !== itemName)
      : [...favorites, itemName];

    writeFavorites(next);
    setSaved(!alreadySaved);
    setPopping(true);
    setTimeout(() => setPopping(false), 160);

    // Track only when newly saved (never on unsave).
    if (!alreadySaved) {
      try {
        track("Menu_Item_Liked", { item: itemName });
      } catch {
        // Never block UI on analytics issues.
      }
    }
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={saved}
      aria-label={ariaLabel}
      title={saved ? "Saved item" : "Save item"}
      className={[
        "ml-2 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1",
        "border text-[11px] font-semibold uppercase tracking-[0.12em] transition duration-150",
        saved
          ? "border-[#d99028]/55 bg-[#f5c46b] text-[#4b2412]"
          : "border-amber-200/35 bg-[#1b0e08]/30 text-amber-100/75 hover:text-amber-100/95",
        popping ? "scale-105" : "scale-100",
      ].join(" ")}
    >
      <span aria-hidden="true" className="text-[12px] leading-none">
        {saved ? "♥" : "♡"}
      </span>
      <span className="leading-none">{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
