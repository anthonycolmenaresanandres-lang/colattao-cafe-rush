import Image from "next/image";
import Link from "next/link";
import { menuCategories } from "@/data/colattaoMenu";
import MenuCategorySection from "@/components/MenuCategory";
import FeedbackBox from "@/components/FeedbackBox";

export const metadata = {
  title: "Menu · Colattao Coffee House",
  description:
    "Digital menu for Colattao Coffee House – Virginia Beach, VA",
};

// ── Owner update request mailto ────────────────────────────
// See OWNER_UPDATE_PROCESS.md for the full workflow.
const OWNER_UPDATE_EMAIL = "anthonycolmenares92@gmail.com";
const OWNER_UPDATE_SUBJECT = "Colattao Update Request";
const OWNER_UPDATE_BODY = [
  "Hello Anthony,",
  "",
  "Request type:",
  "Menu / Price / Product / Photo / Game / Promo",
  "",
  "What needs to change:",
  "",
  "Current item or section:",
  "",
  "New text, price, or detail:",
  "",
  "Priority:",
  "Low / Normal / Urgent",
  "",
  "Notes:",
  "",
].join("\n");

const OWNER_UPDATE_MAILTO = `mailto:${OWNER_UPDATE_EMAIL}?subject=${encodeURIComponent(
  OWNER_UPDATE_SUBJECT,
)}&body=${encodeURIComponent(OWNER_UPDATE_BODY)}`;

// ── Decorative game-asset accents per category ──
const CATEGORY_ACCENTS: Record<string, { src: string; alt: string } | undefined> = {
  espresso: { src: "/assets/colattao/items/coffee-cup.png", alt: "Coffee cup" },
  favorites: { src: "/assets/colattao/items/coffee-cup.png", alt: "Coffee cup" },
  matcha: { src: "/assets/colattao/items/matcha-iced.png", alt: "Iced matcha" },
  tea: { src: "/assets/colattao/items/matcha-iced.png", alt: "Iced drink" },
  cocina: { src: "/assets/colattao/items/croissant.png", alt: "Pastry" },
  spring: { src: "/assets/colattao/items/coffee-cup.png", alt: "Coffee cup" },
  pastries: { src: "/assets/colattao/items/croissant.png", alt: "Croissant" },
};

export default function MenuPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-colattao-page text-[var(--col-parchment)]">
      {/* ──────────────────────────────────────────────────────
          Header — premium brand band, sticky on scroll
          ────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 px-5 pb-4 pt-5 text-center"
        style={{
          background:
            "linear-gradient(180deg, #1B0E08 0%, #1B0E08 70%, rgba(27,14,8,0.92) 100%)",
          boxShadow: "0 16px 30px -18px rgba(0,0,0,0.75)",
        }}
      >
        {/* Prominent Colattao logo */}
        <Image
          src="/assets/colattao/logo/colattao-logo.png"
          alt="Colattao Coffee House"
          width={180}
          height={70}
          priority
          className="mx-auto h-auto w-[150px] select-none drop-shadow-[0_0_18px_rgba(212,162,76,0.20)]"
        />

        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300/55" />
          <span className="text-[10px] uppercase tracking-[0.32em] text-amber-200/80">
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
          <MenuCategorySection
            key={c.id}
            category={c}
            accentImage={CATEGORY_ACCENTS[c.id]}
          />
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────
          Footer
          ────────────────────────────────────────────────────── */}
      <footer className="px-5 pb-7 pt-3 text-center">
        <div className="mb-5 text-left">
          <FeedbackBox pageSource="menu" variant="light" />
        </div>

        <Link
          href="/"
          className="btn-gold inline-block rounded-full px-6 py-3 text-sm font-bold uppercase tracking-[0.18em]"
        >
          ☕ Play Café Rush
        </Link>
        <p className="mt-4 text-[10px] uppercase tracking-[0.28em] text-amber-200/45">
          © {new Date().getFullYear()} Colattao Coffee House
        </p>
        <a
          href={OWNER_UPDATE_MAILTO}
          className="mt-2 inline-block text-[10px] tracking-[0.18em] text-amber-200/40 underline decoration-amber-200/25 underline-offset-[3px] transition-colors hover:text-amber-200/75"
        >
          Need a menu update?
        </a>
      </footer>
    </main>
  );
}
