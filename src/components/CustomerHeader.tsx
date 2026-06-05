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
    eyebrow: "Colattao Coffee House",
    cta: "VIEW OUR MENU",
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
                className={`group relative flex min-h-[52px] flex-1 items-center justify-center overflow-hidden rounded-2xl border bg-[linear-gradient(165deg,#2a1710_0%,#1d1108_52%,#140a02_100%)] px-4 py-2 text-center transition duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8EDD7] ${
                  isActive
                    ? "border-[#DAAE4F]/85 shadow-[0_12px_30px_-16px_rgba(218,174,79,0.9),inset_0_1px_0_rgba(248,237,215,0.16)]"
                    : "border-[#DAAE4F]/55 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(248,237,215,0.12)] hover:border-[#DAAE4F]/85 hover:shadow-[0_14px_30px_-15px_rgba(218,174,79,0.85),inset_0_1px_0_rgba(248,237,215,0.16)]"
                }`}
              >
                {/* Golden-ticket side notches */}
                <span className="pointer-events-none absolute -left-1.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#1b0e08] ring-1 ring-[#DAAE4F]/35" />
                <span className="pointer-events-none absolute -right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#1b0e08] ring-1 ring-[#DAAE4F]/35" />

                {/* Gold glow — hover lift + gentle continuous breath */}
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(218,174,79,0.22),transparent_62%)] opacity-70 transition-opacity duration-200 group-hover:opacity-100" />
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_125%,rgba(218,174,79,0.2),transparent_58%)] opacity-55 motion-safe:animate-pulse" />

                {/* Inner hairline frame */}
                <span className="pointer-events-none absolute inset-[3px] rounded-xl ring-1 ring-inset ring-[#DAAE4F]/22" />

                <span className="relative flex flex-col items-center leading-none">
                  <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#DAAE4F]/80">
                    {item.eyebrow}
                  </span>
                  <span className="mt-1 bg-[linear-gradient(180deg,#F8EDD7_0%,#EAD09A_55%,#DAAE4F_100%)] bg-clip-text text-[13px] font-black uppercase tracking-[0.16em] text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.35)]">
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
