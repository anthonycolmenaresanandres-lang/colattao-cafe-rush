"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Play",
    imageSrc: "/assets/colattao/ui/play-colattao-cafe-rush-banner.webp",
    imageAlt: "Play Colattao Cafe Rush",
  },
  {
    href: "/menu",
    label: "Menu",
    imageSrc: "/assets/colattao/ui/view-our-menu-banner.webp",
    imageAlt: "View Our Menu",
  },
] as const;

export default function CustomerHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-300/20 bg-[#1b0e08]/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[470px] px-4 pb-3 pt-2">
        <div className="flex justify-center">
          <p className="font-serif text-[16px] tracking-[0.14em] text-amber-100">COLATTAO</p>
        </div>

        <nav aria-label="Customer navigation" className="mt-2 flex justify-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl p-0.5 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4bf6d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b0e08] ${
                  isActive
                    ? "ring-1 ring-[#e4bf6d]/75"
                    : "ring-1 ring-transparent hover:ring-[#e4bf6d]/45"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.imageAlt}
              >
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  width={2172}
                  height={514}
                  className="h-auto w-[46vw] min-w-[136px] max-w-[170px]"
                />
                <span className="sr-only">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
