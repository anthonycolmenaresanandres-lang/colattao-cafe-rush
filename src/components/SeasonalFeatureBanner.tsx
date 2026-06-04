"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const FEATURED_FLAVORS = [
  {
    name: "Original Matcha Lemonade",
    shortName: "Original",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-lemonade-original-banner.png",
    alt: "Original Matcha Lemonade poster with Colattao logo, citrus, matcha, and iced drink",
  },
  {
    name: "Strawberry Matcha Lemonade",
    shortName: "Strawberry",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-banner.png",
    alt: "Strawberry Matcha Lemonade poster with Colattao logo, strawberry, citrus, matcha, and iced drink",
  },
  {
    name: "Mango Matcha Lemonade",
    shortName: "Mango",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-lemonade-mango-banner.png",
    alt: "Mango Matcha Lemonade poster with Colattao logo, mango, citrus, matcha, and iced drink",
  },
] as const;

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function SeasonalFeatureBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % FEATURED_FLAVORS.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, [isPaused, reducedMotion]);

  const activeFlavor = FEATURED_FLAVORS[activeIndex];

  function viewFlavors() {
    const seasonalSection = document.getElementById("seasonal-drinks");
    const matchaDetails = document.getElementById("matcha-lemonade-flavors");

    if (matchaDetails instanceof HTMLDetailsElement) {
      matchaDetails.open = true;
    }

    if (seasonalSection) {
      seasonalSection.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
      window.history.replaceState(null, "", "#seasonal-drinks");
    }
  }

  return (
    <section
      className="relative z-20 px-3 py-3"
      aria-label="Seasonal Matcha Lemonade feature"
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onPointerDown={() => setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative overflow-hidden rounded-[28px] border border-[#d9b36a]/70 bg-[linear-gradient(145deg,#1d1008_0%,#2b170d_48%,#110905_100%)] p-[1px] shadow-[0_18px_34px_-24px_rgba(0,0,0,0.95),0_0_28px_-20px_rgba(218,174,79,0.9)]">
        <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-[#fff2c9]/20 motion-safe:animate-pulse" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,239,184,0.8),transparent)]" />
        <div className="relative aspect-[16/9] overflow-hidden rounded-[27px] bg-[radial-gradient(circle_at_18%_18%,rgba(248,237,215,0.16),transparent_34%),linear-gradient(135deg,rgba(73,38,19,0.85),rgba(21,10,5,0.98)_60%,rgba(12,6,3,1))]">
          {FEATURED_FLAVORS.map((flavor, index) => {
            const isActive = index === activeIndex;
            return (
              <article
                key={flavor.name}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition duration-700 ease-out ${
                  isActive
                    ? "pointer-events-auto translate-x-0 opacity-100"
                    : index < activeIndex
                      ? "pointer-events-none -translate-x-4 opacity-0"
                      : "pointer-events-none translate-x-4 opacity-0"
                }`}
              >
                <Image
                  src={flavor.imageSrc}
                  alt={flavor.alt}
                  fill
                  sizes="(max-width: 470px) calc(100vw - 24px), 446px"
                  priority={index === 0}
                  className={`object-cover transition duration-1000 ease-out ${
                    isActive && !reducedMotion ? "scale-[1.035]" : "scale-100"
                  }`}
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(16,8,4,0.02)_0%,rgba(16,8,4,0.06)_48%,rgba(16,8,4,0.58)_100%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,245,220,0.18),transparent_38%)]" />
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                  <div className="min-w-0 rounded-2xl border border-[#f8edd7]/22 bg-[#1d1008]/62 px-3 py-2 text-[#f8edd7] shadow-[0_10px_22px_-18px_rgba(0,0,0,0.95)] backdrop-blur-[2px]">
                    <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#daae4f]">
                      Seasonal Window
                    </p>
                    <p className="mt-0.5 truncate text-[12px] font-black uppercase tracking-[0.12em]">
                      {flavor.shortName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={viewFlavors}
                    className="shrink-0 rounded-full border border-[#daae4f]/70 bg-[linear-gradient(135deg,#f8edd7,#daae4f)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#1d1008] shadow-[0_10px_22px_-16px_rgba(218,174,79,0.95),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f8edd7]"
                  >
                    View Flavors
                  </button>
                </div>
              </article>
            );
          })}

          <div className="absolute right-3 top-3 z-10 flex gap-1.5 rounded-full border border-[#f8edd7]/20 bg-[#1d1008]/40 px-2 py-1.5 backdrop-blur-[2px]">
            {FEATURED_FLAVORS.map((flavor, index) => (
              <button
                key={flavor.name}
                type="button"
                aria-label={`Show ${flavor.name}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f8edd7] ${
                  index === activeIndex ? "w-7 bg-[#f8edd7]" : "w-2 bg-[#daae4f]/45"
                }`}
              />
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            Showing {activeFlavor.name}.
          </p>
        </div>
      </div>
    </section>
  );
}
