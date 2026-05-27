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
    <main className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-colattao-page text-[var(--col-parchment)]">
      {/* ──────────────────────────────────────────────────────
          Header — premium brand band, sticky on scroll
          ────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 px-5 pb-4 pt-6 text-center"
        style={{
          background:
            "linear-gradient(180deg, #1B0E08 0%, #1B0E08 70%, rgba(27,14,8,0.92) 100%)",
          boxShadow: "0 16px 30px -18px rgba(0,0,0,0.75)",
        }}
      >
        <p className="brand-eyebrow text-amber-200/70">
          Coffee House · Virginia Beach
        </p>
        <h1
          className="brand-wordmark mt-1 text-[26px] text-[var(--col-parchment-2)]"
          style={{ textShadow: "0 0 24px rgba(212,162,76,0.18)" }}
        >
          Colattao
        </h1>
        <div className="mt-1.5 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300/55" />
          <span className="text-[10px] uppercase tracking-[0.32em] text-amber-200/75">
            Digital Menu
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300/55" />
        </div>

        {/* address & hours */}
        <p className="mt-3 text-[11px] text-amber-100/65">
          1115 Independence Blvd, Virginia Beach, VA 23455
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-200/55">
          Tue–Fri 7–4 · Sat & Sun 8–4 · Mon Closed
        </p>

        {/* category chips */}
        <nav
          aria-label="Menu categories"
          className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {menuCategories.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="menu-chip shrink-0">
              {c.title}
            </a>
          ))}
        </nav>
      </header>

      {/* ──────────────────────────────────────────────────────
          Menu body — parchment cards on espresso shell
          ────────────────────────────────────────────────────── */}
      <div className="flex-1 space-y-5 px-4 py-6">
        {menuCategories.map((c) => (
          <MenuCategorySection key={c.id} category={c} />
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────
          Footer
          ────────────────────────────────────────────────────── */}
      <footer className="px-5 pb-7 pt-3 text-center">
        <Link
          href="/"
          className="btn-gold inline-block rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.18em]"
        >
          ☕ Play Café Rush
        </Link>
        <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-amber-200/45">
          © {new Date().getFullYear()} Colattao Coffee House
        </p>
      </footer>
    </main>
  );
}
