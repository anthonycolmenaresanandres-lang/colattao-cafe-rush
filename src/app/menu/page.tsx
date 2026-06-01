import Image from "next/image";
import Link from "next/link";
import { menuCategories } from "@/data/colattaoMenu";
import appTheme from "@/config/theme";

export const metadata = {
  title: "Menu - Colattao Coffee House",
  description: "Digital menu for Colattao Coffee House - Virginia Beach, VA",
};

// Owner update request mailto
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

// Decorative game-asset accents per category
const CATEGORY_ACCENTS: Record<string, { src: string; alt: string } | undefined> = {
  espresso: { src: "/assets/colattao/items/coffee-cup.png", alt: "Coffee cup" },
  matcha: { src: "/assets/colattao/items/matcha-iced.png", alt: "Iced matcha" },
  tea: { src: "/assets/colattao/items/matcha-iced.png", alt: "Iced drink" },
  cocina: { src: "/assets/colattao/items/croissant.png", alt: "Pastry" },
  pastries: { src: "/assets/colattao/items/croissant.png", alt: "Croissant" },
};

// Subtle El Dorado parchment textures layered *inside* each category card
// (very low opacity) — not standalone banners. Text/prices stay dominant.
const CATEGORY_TEXTURES: Record<string, string> = {
  espresso: "/assets/colattao/menu/menu-eldorado-01.png",
  pastries: "/assets/colattao/menu/menu-eldorado-02.png",
};
const DEFAULT_CATEGORY_TEXTURE = "/assets/colattao/menu/menu-eldorado-04.png";

type ItemDetail = {
  flavorNotes?: string;
  hotIced?: string;
  milkOptions?: string;
  pairingSuggestion?: string;
  cashierNote?: string;
};

const ITEM_DETAILS: Record<string, ItemDetail> = {
  // "House Brew": {
  //   flavorNotes: "Owner to confirm",
  //   hotIced: "Owner to confirm",
  //   milkOptions: "Owner to confirm",
  //   pairingSuggestion: "Owner to confirm",
  //   cashierNote: "Owner to confirm",
  // },
};

export default function MenuPage() {
  return (
    <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-[470px] flex-col overflow-hidden bg-colattao-page text-[var(--col-parchment)]">
      <header className="sticky top-0 z-30 px-4 pb-3 pt-3">
        <nav className="mx-auto w-full max-w-[430px]">
          <Link
            href="/"
            className="block w-full"
            aria-label="Play Colattao Café Rush"
          >
            <Image
              src="/assets/colattao/ui/play-colattao-cafe-rush-banner.webp"
              alt="Play Colattao Café Rush"
              width={2172}
              height={724}
              priority
              className="h-auto w-full"
            />
          </Link>
        </nav>
      </header>
      <div className="pointer-events-none absolute inset-0 z-0">
        <Image
          src="/assets/colattao/menu/menu-eldorado-04.png"
          alt=""
          aria-hidden="true"
          fill
          sizes="470px"
          className="object-cover opacity-[0.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b0e08]/25 via-transparent to-[#1b0e08]/30" />
      </div>

      <section className="relative z-10 overflow-hidden pb-6 pt-6">
        <div className="pointer-events-none absolute inset-0">
          <Image
            src="/assets/colattao/website-concept/real-lounge-fireplace-wide.png"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 470px) 100vw, 470px"
            className="object-cover object-[center_40%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,6,4,0.24)_0%,rgba(14,6,4,0.54)_52%,rgba(14,6,4,0.72)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(212,162,76,0.16),transparent_62%)]" />
        </div>

        <div className="relative z-10 px-5 pb-6 pt-10 text-center">
          <Image
            src={appTheme.brand.logoPath}
            alt={appTheme.brand.displayName}
            width={430}
            height={176}
            priority
            className="mx-auto h-auto w-[300px] max-w-full select-none drop-shadow-[0_0_28px_rgba(212,162,76,0.28)]"
          />
        </div>
      </section>

      <section className="relative z-10 -mt-2 px-3 pb-2">
        <nav
          aria-label="Menu categories"
          className="flex gap-2 overflow-x-auto px-2 pb-2 pt-1"
          style={{ scrollbarWidth: "none" }}
        >
          {menuCategories.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="shrink-0 rounded-full border border-[#d2b27a]/72 bg-[#2a150d]/62 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-[#ffe7b8] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.85)] transition-colors hover:bg-[#3a1d12]/66"
            >
              {c.title}
            </a>
          ))}
        </nav>
      </section>

      <div className="relative z-10 flex-1 space-y-5 px-4 py-2">
        <section className="px-2 py-1 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-amber-200/80">
            FROM COLOMBIA, WITH WARMTH.
          </p>
          <p className="mt-2 text-[13px] text-amber-100/90">Ask what came out fresh today.</p>
          <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-[#b5cce7]">STAY A LITTLE LONGER.</p>
          <p className="mt-3 text-[11px] leading-relaxed text-amber-100/78">
            Milk options available: whole, almond, oat, and more.
            <br />
            Please ask the cashier if you have a preference or allergy.
          </p>
        </section>

        {/* Deep-link target so /menu#menu (e.g. from the R&D lab) lands on the categories. */}
        <div id="menu" aria-hidden="true" className="scroll-mt-32" />

        {menuCategories.map((category) => {
          const accent = CATEGORY_ACCENTS[category.id];
          const texture = CATEGORY_TEXTURES[category.id] ?? DEFAULT_CATEGORY_TEXTURE;
          return (
            <section
              key={category.id}
              id={category.id}
              className="menu-card relative scroll-mt-32 overflow-hidden rounded-3xl border border-[#d2b27a]/55 px-5 pb-5 pt-5 shadow-[0_14px_30px_-18px_rgba(27,14,8,0.55)] ring-1 ring-[#fff3d6]/35"
            >
              {/* El Dorado board image is now clearly visible as the card surface. */}
              <div className="pointer-events-none absolute inset-0 z-0">
                <Image
                  src={texture}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 470px) 100vw, 430px"
                  className="object-cover opacity-[0.32]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,237,215,0.55)_0%,rgba(248,237,215,0.38)_100%)]" />
                <div className="absolute inset-0 ring-1 ring-inset ring-[#4b2412]/16" />
              </div>

              <div className="relative z-10 text-center">
                <p
                  className="text-[10px] uppercase text-[var(--col-gold-deep)]"
                  style={{ letterSpacing: "0.32em" }}
                >
                  Menu
                </p>
                {accent && (
                  <Image
                    src={accent.src}
                    alt={accent.alt}
                    width={44}
                    height={44}
                    className="mx-auto mt-1 h-11 w-11 select-none object-contain drop-shadow"
                    priority={false}
                  />
                )}
                <h2
                  className="brand-wordmark mt-1 text-[22px] text-[var(--col-espresso)]"
                  style={{ letterSpacing: "0.04em" }}
                >
                  {category.title}
                </h2>
                <div className="ceramic-rule mx-auto mt-2 w-2/3" />
                {category.note && (
                  <p className="mt-2 text-[11px] italic text-[var(--col-espresso-3)]/75">
                    {category.note}
                  </p>
                )}
              </div>

              <ul className="relative z-10 mt-4 space-y-3">
                {category.items.map((item) => (
                  <li key={item.name} className="flex items-start gap-2 text-[var(--col-espresso)]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline">
                        <span
                          className="font-semibold leading-tight"
                          style={{ textShadow: "0 1px 1px rgba(255,245,224,0.28)" }}
                        >
                          {item.name}
                          {item.needsConfirmation && (
                            <span
                              aria-label="Needs confirmation"
                              title="Item details may vary - please ask staff"
                              className="ml-1.5 align-[0.05em] text-[9px] uppercase tracking-[0.18em] text-[var(--col-terracotta-2)]"
                            >
                              • verify
                            </span>
                          )}
                        </span>
                        <span className="dotted-rule" />
                      </div>
                      {item.description && (
                        <p className="mt-0.5 text-[12px] font-medium leading-snug text-[var(--col-espresso-3)]/90">
                          {item.description}
                        </p>
                      )}
                      {ITEM_DETAILS[item.name] && (
                        <details className="mt-1.5 group">
                          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--col-espresso-3)]/75 transition-colors hover:text-[var(--col-espresso-2)]">
                            Details
                            <span className="text-[9px] transition-transform group-open:rotate-180">▾</span>
                          </summary>
                          <div className="mt-1.5 rounded-xl border border-[#d2b27a]/45 bg-[#f8edd7]/70 px-2.5 py-2 text-[11px] leading-relaxed text-[var(--col-espresso-3)] shadow-[0_8px_16px_-14px_rgba(27,14,8,0.45)]">
                            {ITEM_DETAILS[item.name].flavorNotes && (
                              <p>
                                <span className="font-semibold text-[var(--col-espresso)]">Flavor notes: </span>
                                {ITEM_DETAILS[item.name].flavorNotes}
                              </p>
                            )}
                            {ITEM_DETAILS[item.name].hotIced && (
                              <p>
                                <span className="font-semibold text-[var(--col-espresso)]">Hot/Iced: </span>
                                {ITEM_DETAILS[item.name].hotIced}
                              </p>
                            )}
                            {ITEM_DETAILS[item.name].milkOptions && (
                              <p>
                                <span className="font-semibold text-[var(--col-espresso)]">Milk options: </span>
                                {ITEM_DETAILS[item.name].milkOptions}
                              </p>
                            )}
                            {ITEM_DETAILS[item.name].pairingSuggestion && (
                              <p>
                                <span className="font-semibold text-[var(--col-espresso)]">Pairing: </span>
                                {ITEM_DETAILS[item.name].pairingSuggestion}
                              </p>
                            )}
                            {ITEM_DETAILS[item.name].cashierNote && (
                              <p>
                                <span className="font-semibold text-[var(--col-espresso)]">Cashier note: </span>
                                {ITEM_DETAILS[item.name].cashierNote}
                              </p>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                    <span
                      className="shrink-0 pt-[1px] font-mono text-sm font-bold tracking-tight text-[var(--col-gold-deep)]"
                      style={{ textShadow: "0 1px 1px rgba(255,245,224,0.25)" }}
                    >
                      {item.price ?? "ask"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <footer className="px-5 pb-7 pt-3 text-center">
        <div className="mx-auto w-full max-w-[430px]">
          <Image
            src="/assets/colattao/ui/colattao-fina-calle-footer-banner.webp"
            alt=""
            aria-hidden="true"
            width={2872}
            height={547}
            className="h-auto w-full"
          />
          <p className="sr-only">
            Colattao. Copyright 2026 Colattao Coffee House. Fina Calle OS. a.c.s.
          </p>
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
        <Link
          href="/request-update"
          className="mt-2 block text-[10px] tracking-[0.16em] text-amber-200/40 underline decoration-amber-200/25 underline-offset-[3px] transition-colors hover:text-amber-200/70"
        >
          Try update request form
        </Link>
        <Link
          href="/website-concept"
          className="mt-2 block text-[10px] tracking-[0.16em] text-amber-200/35 underline decoration-amber-200/20 underline-offset-[3px] transition-colors hover:text-amber-200/60"
        >
          View website concept
        </Link>
      </footer>
    </main>
  );
}


