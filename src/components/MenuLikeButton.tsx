"use client";

import { useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";

type Props = {
  itemName: string;
};

const STORAGE_KEY = "colattao_favorites";

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
  } catch {
    // Intentionally swallow local-only persistence errors.
  }
}

export default function MenuLikeButton({ itemName }: Props) {
  const [liked, setLiked] = useState(false);
  const [popping, setPopping] = useState(false);
  const ariaLabel = useMemo(
    () => (liked ? `Remove favorite for ${itemName}` : `Favorite ${itemName}`),
    [liked, itemName],
  );

  useEffect(() => {
    const favorites = readFavorites();
    setLiked(favorites.includes(itemName));
  }, [itemName]);

  function onToggle() {
    const favorites = readFavorites();
    const alreadyLiked = favorites.includes(itemName);
    const next = alreadyLiked
      ? favorites.filter((name) => name !== itemName)
      : [...favorites, itemName];

    writeFavorites(next);
    setLiked(!alreadyLiked);
    setPopping(true);
    setTimeout(() => setPopping(false), 160);

    if (!alreadyLiked) {
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
      aria-label={ariaLabel}
      title={liked ? "Favorited" : "Add to favorites"}
      className={[
        "ml-2 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        "border border-amber-200/25 bg-[#1b0e08]/20 text-sm transition duration-150",
        liked ? "text-[#f5c46b]" : "text-amber-100/45 hover:text-amber-100/75",
        popping ? "scale-110" : "scale-100",
      ].join(" ")}
    >
      <span aria-hidden="true">{liked ? "♥" : "♡"}</span>
    </button>
  );
}

