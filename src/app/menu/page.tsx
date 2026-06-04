import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { menuCategories } from "@/data/colattaoMenu";
import appTheme from "@/config/theme";
import ColattaoGuestNoteForm from "@/components/ColattaoGuestNoteForm";
import SeasonalFeatureBanner from "@/components/SeasonalFeatureBanner";
import { SITE_URL, SITE_NAME, BRAND_LINKS } from "@/config/site";

export const metadata: Metadata = {
  title: "Menu — Espresso, Matcha, Lattes & Pastries in Virginia Beach",
  description:
    "The full Colattao Coffee House menu in Virginia Beach, VA — espresso and coffee, signature Colombian lattes, matcha, teas, and fresh pastries with prices.",
  alternates: { canonical: "/menu" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/menu`,
    siteName: SITE_NAME,
    title: "Colattao Coffee House Menu — Virginia Beach, VA",
    description:
      "Browse the full Colattao Coffee House menu: espresso, signature Colombian lattes, matcha, teas, and pastries.",
    images: [{ url: "/assets/colattao/og-colattao.jpg", width: 1200, height: 630 }],
  },
};

// schema.org Menu built from the real menu data so Google can read every
// section and item (improves eligibility for rich "colattao menu" results).
function parsePrice(price: string | null): string | undefined {
  if (!price) return undefined;
  const match = price.match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? match[1] : undefined;
}

function buildMenuJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Colattao Coffee House Menu",
    url: `${SITE_URL}/menu`,
    inLanguage: "en-US",
    provider: {
      "@type": "CafeOrCoffeeShop",
      name: SITE_NAME,
      url: SITE_URL,
      sameAs: [BRAND_LINKS.website, BRAND_LINKS.instagram],
    },
    hasMenuSection: menuCategories.map((category) => ({
      "@type": "MenuSection",
      name: category.title,
      ...(category.note ? { description: category.note } : {}),
      hasMenuItem: category.items.map((item) => {
        const price = parsePrice(item.price);
        return {
          "@type": "MenuItem",
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(price
            ? {
                offers: {
                  "@type": "Offer",
                  price,
                  priceCurrency: "USD",
                },
              }
            : {}),
        };
      }),
    })),
  };
}

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

const FOOTER_LINKS = {
  colattaoSite: "https://colattao.com/",
  colattaoInstagram: "https://www.instagram.com/colattao/",
  finaCalle: "https://amma-fina-calle.vercel.app/",
  finaCalleInstagram: "https://www.instagram.com/fina_calle/",
};

type ItemDetail = {
  imageSrc: string;
  imageAlt: string;
};

const ITEM_DETAILS: Record<string, ItemDetail> = {
  "Chocolate Croissant": {
    imageSrc: "/assets/colattao/menu-items/chocolate-croissant-sticker.webp",
    imageAlt: "Chocolate Croissant",
  },
  "Pan de Bono": {
    imageSrc: "/assets/colattao/menu-items/pan-de-bono-sticker.webp",
    imageAlt: "Pan de Bono",
  },
  Cookies: {
    imageSrc: "/assets/colattao/menu-items/chocolate-chip-cookie-sticker.webp",
    imageAlt: "Cookies",
  },
  "Empanadas, Chicken / Beef": {
    imageSrc: "/assets/colattao/menu-items/empanada-sticker.webp",
    imageAlt: "Empanadas, Chicken / Beef",
  },
  "Almond Croissant": {
    imageSrc: "/assets/colattao/menu-items/almond-croissant-sticker.webp",
    imageAlt: "Almond Croissant",
  },
};

const COLLAPSIBLE_DESCRIPTION_ITEMS = new Set([
  "California Sandwich",
  "Cubano",
  "Chicken Apricot",
  "Montecristo",
  "Pesto Mozzarella",
]);

const MATCHA_LEMONADE_FLAVORS = [
  {
    name: "Original",
    description: "Bright lemonade and smooth matcha.",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-original-thumb.png",
    imageAlt: "Original Matcha Lemonade",
  },
  {
    name: "Strawberry",
    description: "Fresh berry sweetness with a matcha finish.",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-strawberry-thumb.png",
    imageAlt: "Strawberry Matcha Lemonade",
  },
  {
    name: "Mango",
    description: "Tropical mango layered with citrus and matcha.",
    imageSrc: "/assets/colattao/menu/seasonal/matcha-mango-thumb.png",
    imageAlt: "Mango Matcha Lemonade",
  },
] as const;

function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BottomSignature() {
  return (
    <section className="mt-10 px-4 pb-12">
      <p className="sr-only">
        Colattao. Follow us on Instagram. Powered by Fina Calle.
      </p>

      {/* Centered premium vertical footer — Colattao hero, Fina Calle secondary. No card. */}
      <div className="mx-auto flex max-w-[260px] items-center gap-3">
        <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4))]" />
        <span className="h-1.5 w-1.5 rotate-45 border border-white/55" />
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(255,255,255,0.4),transparent)]" />
      </div>

      <div className="mt-8 flex flex-col items-center text-center">
        {/* Colattao logo — hero, centered, largest */}
        <a
          href={FOOTER_LINKS.colattaoSite}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Colattao Coffee House website"
          className="rounded-2xl transition hover:opacity-90 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Image
            src={appTheme.brand.logoPath}
            alt="Colattao Coffee House"
            width={1024}
            height={341}
            className="h-auto w-[232px] max-w-full select-none brightness-0 invert drop-shadow-[0_0_24px_rgba(255,255,255,0.18)]"
          />
        </a>

        {/* Colattao Instagram CTA — centered */}
        <a
          href={FOOTER_LINKS.colattaoInstagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Colattao Coffee House on Instagram"
          className="group mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/42 bg-white/[0.06] px-5 py-2.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition duration-200 hover:-translate-y-0.5 hover:border-white/72 hover:bg-white/[0.1] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="text-white/82 transition-colors group-hover:text-white">
            <InstagramGlyph />
          </span>
          <span className="text-[11px] font-black uppercase tracking-[0.16em]">
            Follow us on Instagram
          </span>
        </a>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.18em] text-white/60">
          @colattao
        </p>

        {/* Powered by Fina Calle — secondary, smaller, centered */}
        <a
          href={FOOTER_LINKS.finaCalle}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Powered by Fina Calle"
          className="group mt-10 flex flex-col items-center gap-2 rounded-2xl px-3 py-1.5 transition hover:opacity-90 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-white/45">
            Powered by
          </span>
          <Image
            src="/assets/colattao/ui/fina-calle-os-emblem.webp"
            alt="Fina Calle OS"
            width={460}
            height={488}
            className="h-auto w-[112px] max-w-full select-none brightness-0 invert opacity-70 drop-shadow-[0_0_14px_rgba(255,255,255,0.1)] transition-opacity group-hover:opacity-90"
          />
        </a>

        {/* Fina Calle Instagram — subtle line below */}
        <a
          href={FOOTER_LINKS.finaCalleInstagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Fina Calle on Instagram"
          className="group mt-4 inline-flex items-center gap-1.5 text-white/45 transition hover:text-white/75 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <InstagramGlyph />
          <span className="text-[9px] font-semibold uppercase tracking-[0.18em]">Fina Calle</span>
          <span className="text-[9px] font-medium tracking-[0.06em]">@fina_calle</span>
        </a>
      </div>
    </section>
  );
}

export default function MenuPage() {
  return (
    <main className="relative isolate mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-colattao-page text-[var(--col-parchment)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildMenuJsonLd()) }}
      />
      <h1 className="sr-only">
        Colattao Coffee House Menu — Espresso, Matcha, Lattes &amp; Pastries in Virginia Beach, VA
      </h1>
      <header className="sticky top-0 z-50 border-b border-[#DAAE4F]/25 bg-[linear-gradient(180deg,#211107_0%,#1D1108_72%,#140A02_100%)] px-3 py-2 shadow-[0_12px_28px_-18px_rgba(0,0,0,0.9)]">
        <nav className="mx-auto w-full max-w-[360px]">
          <Link
            href="/"
            className="group relative flex min-h-12 w-full items-center justify-center overflow-hidden rounded-full border border-[#DAAE4F]/75 bg-[linear-gradient(135deg,rgba(218,174,79,0.98)_0%,rgba(248,237,215,0.92)_48%,rgba(218,174,79,0.96)_100%)] px-4 py-2 text-center text-[#1D1108] shadow-[0_10px_26px_-16px_rgba(218,174,79,0.95),inset_0_1px_0_rgba(255,255,255,0.48),inset_0_-2px_0_rgba(29,17,8,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-15px_rgba(218,174,79,1),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-2px_0_rgba(29,17,8,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8EDD7]"
            aria-label="Play Colattao Rush"
          >
            <span className="pointer-events-none absolute inset-y-1 left-1 w-3 rounded-l-full border-l border-[#1D1108]/18" />
            <span className="pointer-events-none absolute inset-y-1 right-1 w-3 rounded-r-full border-r border-[#1D1108]/18" />
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.52),transparent_28%),linear-gradient(90deg,transparent_0%,rgba(29,17,8,0.08)_48%,transparent_58%)] opacity-70 transition-opacity group-hover:opacity-90" />
            <span className="relative flex flex-col items-center leading-none">
              <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#5a330e]/80">
                Tap to play
              </span>
              <span className="mt-1 text-[15px] font-black uppercase tracking-[0.18em] text-[#1D1108]">
                PLAY COLATTAO RUSH
              </span>
            </span>
          </Link>
        </nav>
      </header>
      <SeasonalFeatureBanner />
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

      <section className="relative z-10 px-4 pt-4">
        <Image
          src="/assets/colattao/menu/seasonal/featured-seasonal-plates-banner.png"
          alt="Featured Seasonal Plates: Waffle Breakfast and Tuna Salad Sandwich"
          width={1672}
          height={941}
          sizes="(max-width: 470px) calc(100vw - 32px), 438px"
          className="h-auto w-full rounded-[22px] shadow-[0_18px_36px_-22px_rgba(0,0,0,0.82),0_0_0_1px_rgba(218,174,79,0.24)]"
        />
      </section>

      <div className="relative z-10 flex-1 space-y-4 px-4 py-2">
        {/* Deep-link target so /menu#menu (e.g. from the R&D lab) lands on the categories. */}
        <div id="menu" aria-hidden="true" className="scroll-mt-32" />
        <section className="mx-1 -mt-1 pb-1">
          <div className="pointer-events-none h-4 bg-gradient-to-b from-[#1b0e08]/0 to-[#1b0e08]/28" />
          <nav
            aria-label="Menu categories"
            className="mt-1 flex gap-2 overflow-x-auto px-1 pb-2 pt-1"
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
                        category.id === "seasonal-drinks" && item.name === "Matcha Lemonade" ? (
                          <details
                            id="matcha-lemonade-flavors"
                            className="group mt-1.5 rounded-2xl border border-[#d2b27a]/45 bg-[#f8edd7]/42 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.36)]"
                          >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--col-espresso-3)]/85 transition-colors hover:text-[var(--col-espresso-2)]">
                              <span>View Matcha Lemonade flavors</span>
                              <span className="text-[10px] transition-transform group-open:rotate-180">▾</span>
                            </summary>
                            <p className="mt-1.5 text-[12px] font-medium leading-snug text-[var(--col-espresso-3)]/90">
                              {item.description}
                            </p>
                            <ul className="mt-2 space-y-1.5">
                              {MATCHA_LEMONADE_FLAVORS.map((flavor) => (
                                <li
                                  key={flavor.name}
                                  className="flex items-center gap-3 rounded-xl border border-[#d2b27a]/35 bg-[#fff6df]/56 px-2.5 py-2 text-[var(--col-espresso)] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]"
                                >
                                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f8edd7]/58 ring-1 ring-[#d2b27a]/30">
                                    <Image
                                      src={flavor.imageSrc}
                                      alt={flavor.imageAlt}
                                      width={72}
                                      height={72}
                                      sizes="64px"
                                      className="h-14 w-14 object-contain drop-shadow-[0_5px_7px_rgba(75,36,18,0.18)]"
                                    />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-[12px] font-bold leading-tight text-[var(--col-espresso)]">
                                      {flavor.name}
                                    </span>
                                    <span className="mt-0.5 block text-[11px] font-medium leading-snug text-[var(--col-espresso-3)]/86">
                                      {flavor.description}
                                    </span>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : COLLAPSIBLE_DESCRIPTION_ITEMS.has(item.name) ? (
                          <details className="group mt-1.5">
                            <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-[#d2b27a]/45 bg-[#f8edd7]/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--col-espresso-3)]/80 transition-colors hover:bg-[#f8edd7]/65 hover:text-[var(--col-espresso-2)]">
                              Details
                              <span className="text-[9px] transition-transform group-open:rotate-180">▾</span>
                            </summary>
                            <p className="mt-1.5 rounded-xl border border-[#d2b27a]/35 bg-[#f8edd7]/40 px-3 py-2 text-[12px] font-medium leading-snug text-[var(--col-espresso-3)]/90">
                              {item.description}
                            </p>
                          </details>
                        ) : (
                          <p className="mt-0.5 text-[12px] font-medium leading-snug text-[var(--col-espresso-3)]/90">
                            {item.description}
                          </p>
                        )
                      )}
                      {ITEM_DETAILS[item.name] && (
                        <details className="mt-1.5 group">
                          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--col-espresso-3)]/75 transition-colors hover:text-[var(--col-espresso-2)]">
                            View item
                            <span className="text-[9px] transition-transform group-open:rotate-180">▾</span>
                          </summary>
                          <div className="mt-1.5 max-w-[220px] overflow-hidden rounded-xl border border-[#d2b27a]/45 bg-[#f8edd7]/55 p-1.5 shadow-[0_8px_16px_-14px_rgba(27,14,8,0.45)]">
                            <Image
                              src={ITEM_DETAILS[item.name].imageSrc}
                              alt={ITEM_DETAILS[item.name].imageAlt}
                              width={900}
                              height={900}
                              className="h-auto w-full rounded-lg object-contain"
                            />
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

        <ColattaoGuestNoteForm />
      </div>

      <BottomSignature />
    </main>
  );
}

