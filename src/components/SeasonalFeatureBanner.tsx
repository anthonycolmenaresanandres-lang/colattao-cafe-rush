"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const FEATURED_FLAVORS = [
  {
    name: "Original Matcha Lemonade",
    shortName: "Original",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-lemonade-original-card.webp",
    alt: "Original Matcha Lemonade in the Colattao lounge — citrus, matcha, iced drink",
  },
  {
    name: "Strawberry Matcha Lemonade",
    shortName: "Strawberry",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-lemonade-strawberry-card.webp",
    alt: "Strawberry Matcha Lemonade in the Colattao lounge — strawberry, citrus, matcha",
  },
  {
    name: "Mango Matcha Lemonade",
    shortName: "Mango",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-lemonade-mango-card.webp",
    alt: "Mango Matcha Lemonade in the Colattao cafe — mango, citrus, matcha",
  },
] as const;

const COUNT = FEATURED_FLAVORS.length;

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function SeasonalFeatureBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const swipeStartX = useRef<number | null>(null);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % COUNT);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [isPaused, reducedMotion]);

  const activeFlavor = FEATURED_FLAVORS[activeIndex];

  function goTo(index: number) {
    setActiveIndex((index + COUNT) % COUNT);
  }

  // Pointer/touch swipe: drag left → next flavor, drag right → previous.
  function onPointerDown(event: React.PointerEvent) {
    swipeStartX.current = event.clientX;
    setIsPaused(true);
  }
  function onPointerUp(event: React.PointerEvent) {
    if (swipeStartX.current !== null) {
      const dx = event.clientX - swipeStartX.current;
      if (dx < -40) goTo(activeIndex + 1);
      else if (dx > 40) goTo(activeIndex - 1);
    }
    swipeStartX.current = null;
    setIsPaused(false);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") goTo(activeIndex + 1);
    else if (event.key === "ArrowLeft") goTo(activeIndex - 1);
  }

  function viewFlavors() {
    const seasonalSection = document.getElementById("seasonal-drinks");
    const matchaDetails = document.getElementById("matcha-lemonade-flavors");
    if (matchaDetails instanceof HTMLDetailsElement) matchaDetails.open = true;
    if (seasonalSection) {
      seasonalSection.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      window.history.replaceState(null, "", "#seasonal-drinks");
    }
  }

  return (
    <section
      className="relative z-20 px-0 py-2"
      aria-label="Seasonal Matcha Lemonade feature — swipe to change flavor"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative">
        <div
          className="relative aspect-[16/9] touch-pan-y select-none overflow-hidden bg-[#150a05]"
          role="group"
          aria-roledescription="carousel"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onKeyDown={onKeyDown}
          style={{ touchAction: "pan-y" }}
        >
          {FEATURED_FLAVORS.map((flavor, index) => {
            const isActive = index === activeIndex;
            return (
              <Image
                key={flavor.name}
                src={flavor.imageSrc}
                alt={flavor.alt}
                fill
                sizes="(max-width: 470px) calc(100vw - 24px), 446px"
                priority={index === 0}
                aria-hidden={!isActive}
                draggable={false}
                className={`object-cover transition-opacity duration-700 ease-out ${
                  isActive ? "pointer-events-none opacity-100" : "pointer-events-none opacity-0"
                }`}
              />
            );
          })}

          {/* Indicator dots (top-right) */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex items-start justify-end">
            <div className="pointer-events-auto flex gap-1.5 rounded-full border border-[#f8edd7]/20 bg-[#1d1008]/45 px-2 py-1.5 backdrop-blur-[2px]">
              {FEATURED_FLAVORS.map((flavor, index) => (
                <button
                  key={flavor.name}
                  type="button"
                  aria-label={`Show ${flavor.name}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => goTo(index)}
                  className={`h-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f8edd7] ${
                    index === activeIndex ? "w-7 bg-[#f8edd7]" : "w-2 bg-[#daae4f]/45"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center">
            <button
              type="button"
              onClick={viewFlavors}
              className="pointer-events-auto rounded-full border border-[#daae4f]/70 bg-[linear-gradient(135deg,#f8edd7,#daae4f)] px-6 py-2.5 text-[12px] font-black uppercase tracking-[0.16em] text-[#1d1008] shadow-[0_12px_24px_-14px_rgba(218,174,79,0.95),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f8edd7]"
            >
              View Flavors
            </button>
          </div>

          <p className="sr-only" aria-live="polite">
            Showing {activeFlavor.name}. Swipe or use arrow keys to change flavor.
          </p>
        </div>
      </div>
    </section>
  );
}
