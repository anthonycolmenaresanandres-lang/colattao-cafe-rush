"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  /** Small eyebrow line above the main label (HUD style). */
  eyebrow: string;
  /** Main CTA text shown on the button. */
  cta: string;
  ariaLabel: string;
};

const navItems: readonly NavItem[] = [
  {
    href: "/",
    label: "Play",
    eyebrow: "Café Arcade",
    cta: "PLAY COLATTAO RUSH",
    ariaLabel: "Play Colattao Rush",
  },
  {
    href: "/menu",
    label: "Menu",
    eyebrow: "Hungry?",
    cta: "TASTE IT",
    ariaLabel: "View our menu",
  },
] as const;

export default function CustomerHeader() {
  const pathname = usePathname();

  // On the game homepage the Play button is redundant — visitor is already there.
  // Hide it so the only CTA is View Our Menu.
  const visibleItems = navItems.filter(
    (item) => !(pathname === "/" && item.href === "/"),
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DAAE4F]/20 bg-[#1b0e08]/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[470px] px-4 pb-3 pt-2.5">
        <nav aria-label="Customer navigation" className="flex justify-center gap-2.5">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.ariaLabel}
                className="group relative flex min-h-[52px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[#DAAE4F]/75 bg-[linear-gradient(135deg,rgba(218,174,79,0.98)_0%,rgba(248,237,215,0.94)_48%,rgba(218,174,79,0.96)_100%)] px-4 py-2 text-center shadow-[0_10px_26px_-16px_rgba(218,174,79,0.95),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-2px_0_rgba(29,17,8,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-15px_rgba(218,174,79,1)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8EDD7]"
              >
                {/* Golden-ticket side notches */}
                <span className="pointer-events-none absolute -left-1.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#1b0e08]" />
                <span className="pointer-events-none absolute -right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#1b0e08]" />

                {/* White shine */}
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(255,255,255,0.55),transparent_45%)] opacity-80" />

                {/* Inner dark hairline */}
                <span className="pointer-events-none absolute inset-[3px] rounded-xl ring-1 ring-inset ring-[#1D1108]/18" />

                <span className="relative flex flex-col items-center leading-none">
                  <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#5a330e]/80">
                    {item.eyebrow}
                  </span>
                  <span className="mt-1 text-[13px] font-black uppercase tracking-[0.16em] text-[#1D1108]">
                    {item.cta}
                  </span>
                </span>
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
