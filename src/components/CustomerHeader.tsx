"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Play" },
  { href: "/menu", label: "Menu" },
] as const;

export default function CustomerHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-300/20 bg-[#1b0e08]/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[470px] px-4 pb-3 pt-2">
        <div className="flex justify-center">
          <p className="font-serif text-[16px] tracking-[0.14em] text-amber-100">COLATTAO</p>
        </div>

        <nav aria-label="Customer navigation" className="mt-2 flex justify-center gap-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                  isActive
                    ? "border-amber-300/80 bg-amber-300/20 text-amber-50"
                    : "border-amber-200/30 bg-transparent text-amber-100/75 hover:border-amber-200/55 hover:text-amber-100"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
