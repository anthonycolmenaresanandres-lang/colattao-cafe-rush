"use client";

import { useEffect, useState } from "react";

const FEATURED_FLAVORS = [
  {
    name: "Original Matcha Lemonade",
    shortName: "Original",
    tone: "from-[#d9f0a8] via-[#f7e987] to-[#96c16a]",
    garnish: "bg-[#f3e57f]",
    alt: "Original Matcha Lemonade seasonal feature",
  },
  {
    name: "Strawberry Matcha Lemonade",
    shortName: "Strawberry",
    tone: "from-[#f7c0ad] via-[#f6e293] to-[#8eb96a]",
    garnish: "bg-[#d95347]",
    alt: "Strawberry Matcha Lemonade seasonal feature",
  },
  {
    name: "Mango Matcha Lemonade",
    shortName: "Mango",
    tone: "from-[#f6b33d] via-[#f6df82] to-[#8eb96a]",
    garnish: "bg-[#e58a24]",
    alt: "Mango Matcha Lemonade seasonal feature",
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
        <div className="relative min-h-[188px] overflow-hidden rounded-[27px] bg-[radial-gradient(circle_at_18%_18%,rgba(248,237,215,0.16),transparent_34%),linear-gradient(135deg,rgba(73,38,19,0.85),rgba(21,10,5,0.98)_60%,rgba(12,6,3,1))] px-4 py-4">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#daae4f]/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-8 h-24 w-40 rounded-full bg-[#f8edd7]/8 blur-2xl" />

          {FEATURED_FLAVORS.map((flavor, index) => {
            const isActive = index === activeIndex;
            return (
              <article
                key={flavor.name}
                aria-hidden={!isActive}
                className={`absolute inset-0 px-4 py-4 transition duration-700 ease-out ${
                  isActive
                    ? "translate-x-0 opacity-100"
                    : index < activeIndex
                      ? "-translate-x-4 opacity-0"
                      : "translate-x-4 opacity-0"
                }`}
              >
                <div className="grid h-full grid-cols-[0.92fr_1.08fr] items-center gap-3">
                  <div className="relative flex min-h-[150px] items-end justify-center">
                    <div className="absolute top-2 h-20 w-24 rounded-full bg-[#f8edd7]/10 blur-xl" />
                    <div
                      className={`relative h-[138px] w-[82px] overflow-hidden rounded-b-[30px] rounded-t-[16px] border border-[#fff4d0]/45 bg-gradient-to-b ${flavor.tone} shadow-[inset_0_12px_18px_rgba(255,255,255,0.25),inset_0_-18px_24px_rgba(47,70,20,0.22),0_18px_26px_-18px_rgba(0,0,0,0.85)] transition duration-700 ${isActive && !reducedMotion ? "scale-105" : "scale-100"}`}
                      role="img"
                      aria-label={flavor.alt}
                    >
                      <div className="absolute inset-x-2 top-3 h-3 rounded-full bg-white/45" />
                      <div className="absolute inset-x-3 top-12 h-12 rounded-full bg-[#8eae66]/45 blur-sm" />
                      <div className="absolute inset-y-2 left-3 w-3 rounded-full bg-white/24 blur-[2px]" />
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#28522f]/18" />
                    </div>
                    <div className={`absolute right-[22%] top-4 h-8 w-8 rotate-12 rounded-full ${flavor.garnish} shadow-[0_0_0_3px_rgba(248,237,215,0.18)]`} />
                    <div className="absolute bottom-0 h-2 w-28 rounded-full bg-black/35 blur-sm" />
                  </div>

                  <div className="relative">
                    <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#daae4f]/90">
                      Seasonal Window
                    </p>
                    <h2 className="mt-1 text-balance text-[24px] font-black uppercase leading-[0.92] text-[#fff1c9] drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                      {flavor.shortName}
                      <span className="block text-[19px] text-[#d6eea3]">Matcha Lemonade</span>
                    </h2>
                    <p className="mt-2 max-w-[190px] text-[12px] font-medium leading-snug text-[#f8edd7]/82">
                      Bright lemonade, ceremonial matcha, and a summer cafe finish.
                    </p>
                    <button
                      type="button"
                      onClick={viewFlavors}
                      className="mt-3 inline-flex items-center rounded-full border border-[#daae4f]/70 bg-[linear-gradient(135deg,#f8edd7,#daae4f)] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#1d1008] shadow-[0_10px_22px_-16px_rgba(218,174,79,0.95),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f8edd7]"
                    >
                      View Flavors
                    </button>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="pointer-events-none invisible grid min-h-[156px] grid-cols-[0.92fr_1.08fr] gap-3">
            <div />
            <div />
          </div>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
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
