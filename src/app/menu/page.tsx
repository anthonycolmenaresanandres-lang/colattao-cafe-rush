import Link from "next/link";
import { menuCategories } from "@/data/colattaoMenu";
import MenuCategorySection from "@/components/MenuCategory";

export const metadata = {
  title: "Menu · Colattao Coffee House",
  description:
    "Digital menu for Colattao Coffee House – Virginia Beach, VA",
};

export default function MenuPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-amber-50 text-amber-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-amber-950 px-4 pb-2 pt-4 text-center text-amber-50 shadow-md">
        <h1 className="text-xl font-extrabold tracking-wide">
          Colattao Coffee House
        </h1>
        <p className="mt-0.5 text-xs text-amber-200/80">
          1115 Independence Blvd, Virginia Beach, VA 23455
        </p>
        <p className="mt-0.5 text-[11px] leading-tight text-amber-300/70">
          Tue–Fri 7–4 · Sat & Sun 8–4 · Mon Closed
        </p>

        {/* ── Category nav chips ── */}
        <nav
          aria-label="Menu categories"
          className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-none"
        >
          {menuCategories.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="shrink-0 rounded-full border border-amber-700/40 bg-amber-900/60 px-3 py-1 text-[11px] font-semibold text-amber-100 transition-colors hover:bg-amber-800"
            >
              {c.title}
            </a>
          ))}
        </nav>
      </header>

      {/* ── Menu body ── */}
      <div className="flex-1 space-y-6 px-4 py-5">
        {menuCategories.map((c) => (
          <MenuCategorySection key={c.id} category={c} />
        ))}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-amber-200 bg-amber-100/60 px-4 py-4 text-center text-xs text-amber-800">
        <Link
          href="/"
          className="inline-block rounded-full bg-amber-900 px-5 py-2 text-sm font-bold text-amber-50 shadow transition-colors hover:bg-amber-800"
        >
          ☕ Play Café Rush
        </Link>
        <p className="mt-2 text-amber-600/70">
          © {new Date().getFullYear()} Colattao Coffee House
        </p>
      </footer>
    </main>
  );
}
