"use client";

import { useEffect, useState } from "react";
import { FAVORITES_UPDATED_EVENT, STORAGE_KEY } from "@/components/MenuLikeButton";

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

export default function MenuFavoritesSummary() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const refresh = () => setFavorites(readFavorites());
    refresh();

    window.addEventListener(FAVORITES_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const count = favorites.length;

  // ── Empty state ──
  if (count === 0) {
    return (
      <section className="menu-card px-5 pb-4 pt-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--col-gold-deep)]">
          Saved items
        </h3>
        <p className="mt-2 text-[12px] text-[var(--col-espresso-3)]/80">
          Tap Save beside any item to remember it.
        </p>
      </section>
    );
  }

  // ── Counter-focused state ──
  return (
    <section className="menu-card px-5 pb-4 pt-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--col-gold-deep)]">
          {count} saved {count === 1 ? "item" : "items"}
        </span>
        <span
          aria-hidden="true"
          className="text-[11px] font-semibold text-[var(--col-espresso-3)]/70"
        >
          {expanded ? "Hide ▲" : "Show ▼"}
        </span>
      </button>

      {expanded ? (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            {favorites.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#d99028]/45 bg-[#fff3d6] px-3 py-1 text-[11px] font-medium text-[#4b2412]"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-[var(--col-espresso-3)]/75">
            Show this at the counter.
          </p>
        </>
      ) : null}
    </section>
  );
}

