import type { Metadata } from "next";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import befreeConfig from "@/config/templates/befree";
import type {
  MenuListSection,
  SensoryTrioSection,
  CtaBandSection,
  MenuItem,
} from "@/config/templates/site-template";

// Prospect preview — unlisted (not indexed, not in nav/sitemap).
export const metadata: Metadata = {
  title: "Be Free Craft Ice Cream — Menu (Draft Preview)",
  description:
    "Draft digital-menu preview for Be Free Craft Ice Cream, Virginia Beach.",
  robots: { index: false, follow: false },
};

const A = "/assets/befree";

// Categories whose intentionally price-less rows are priced "by scoop"
// (you pick the flavor, you pay by scoop size). Everything else price-less
// reads "ask" at the counter. Never an empty price column.
const BY_SCOOP_CATEGORIES = new Set(["Signature Flavors", "Vegan / Non-Dairy"]);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const HONOR_STATS = [
  "Navy SEAL founded",
  "Berkey Creamery trained",
  "Supports Gold Star families",
];

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

function PriceCell({ item, categoryName }: { item: MenuItem; categoryName: string }) {
  if (item.price && item.price.trim() !== "") {
    return <span className="bf-price shrink-0 pt-[1px]">{item.price}</span>;
  }
  const label = BY_SCOOP_CATEGORIES.has(categoryName) ? "By scoop" : "Ask";
  return <span className="bf-tag-byscoop mt-[2px] shrink-0">{label}</span>;
}

function ItemRow({ item, categoryName }: { item: MenuItem; categoryName: string }) {
  const note = item.note?.trim();
  const longNote = !!note && note.length > 64;
  return (
    <li className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline">
          <span className="font-semibold leading-tight text-[#F2ECDE]">
            {item.name}
            {item.dietary?.map((d) => (
              <span key={d} className="bf-diet-chip">
                {d}
              </span>
            ))}
          </span>
          <span className="bf-dotted-rule" />
        </div>
        {note && !longNote && (
          <p className="mt-0.5 text-[12px] leading-snug text-[#F2ECDE]/70">{note}</p>
        )}
        {longNote && (
          <details className="group mt-1.5">
            <summary className="bf-summary inline-flex items-center gap-1 rounded-full border border-[#E7C463]/40 bg-[#0C1226] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E7C463]/85 transition-colors hover:text-[#E7C463]">
              Show the list
              <span aria-hidden="true" className="text-[9px] transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <p className="mt-1.5 rounded-xl border border-[#E7C463]/20 bg-[#0C1226] px-3 py-2 text-[12px] leading-snug text-[#F2ECDE]/80">
              {note}
            </p>
          </details>
        )}
      </div>
      <PriceCell item={item} categoryName={categoryName} />
    </li>
  );
}

const BOARDS = [
  {
    src: `${A}/board-icecream.jpg`,
    cap: "Ice cream board",
    alt: "Be Free in-store ice-cream chalkboard, hand-lettered in cream and gold",
  },
  {
    src: `${A}/board-coffee.jpg`,
    cap: "Coffee board",
    alt: "Be Free in-store coffee chalkboard, hand-lettered in cream and gold",
  },
  {
    src: `${A}/board-pastry.jpg`,
    cap: "Pastry board",
    alt: "Be Free in-store pastry chalkboard, hand-lettered in cream and gold",
  },
];

// Holographic collector stickers (AI-crafted, transparent PNGs). The Eagle
// leads as the full-width feature; the rest fall into a 2×2.
const STICKERS = [
  {
    src: `${A}/sticker-eagle.png`,
    name: "Freedom Eagle",
    line: "Land of the free, home of the scoop.",
    feature: true,
  },
  { src: `${A}/sticker-bonefrog.png`, name: "The Bone Frog", line: "Veteran-crafted honor." },
  { src: `${A}/sticker-liberty.png`, name: "Liberty Scoop", line: "Real ingredients, no apologies." },
  { src: `${A}/sticker-samurai.png`, name: "Samurai Scoop", line: "Discipline you can taste." },
  { src: `${A}/sticker-alien.png`, name: "The Alien-Cone", line: "The original holo classic." },
];

export default function BeFreePage() {
  const { sections, footer } = befreeConfig;
  const sensory = sections.find(
    (s): s is SensoryTrioSection => s.type === "sensory-trio",
  );
  const menu = sections.find((s): s is MenuListSection => s.type === "menu-list");
  const ctaBand = sections.find((s): s is CtaBandSection => s.type === "cta-band");
  const categories = menu?.categories ?? [];
  const location = footer.locations[0];
  const instagram = footer.socials?.find((s) => /instagram/i.test(s.label));
  const website = footer.socials?.find((s) => /website|site/i.test(s.label));

  return (
    <main className="bf-page relative isolate mx-auto flex min-h-dvh w-full max-w-[470px] flex-col text-[#F2ECDE]">
      {/* ── Sticky enlist header ─────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[linear-gradient(180deg,#0C1226_0%,#080B18_100%)] px-3 py-2 shadow-[0_12px_28px_-18px_rgba(0,0,0,0.9)]">
        <div className="mx-auto flex w-full max-w-[470px] items-center justify-between gap-3">
          <Image
            src={`${A}/be-free-logo.png`}
            alt="Be Free Craft Ice Cream"
            width={2000}
            height={1893}
            priority
            className="h-auto w-[108px] select-none drop-shadow-[0_0_18px_rgba(231,196,99,0.28)]"
          />
          <Link href="#menu" className="bf-seal-cta">
            See the menu
          </Link>
        </div>
        <div className="bf-foil-rule mt-2" />
      </header>

      {/* ── Hero — the BE FREE holographic banner crest ──────── */}
      <section className="relative isolate overflow-hidden">
        <h1 className="sr-only">
          Be Free Craft Ice Cream — veteran-crafted small-batch ice cream, coffee
          &amp; bakery in Virginia Beach, VA
        </h1>
        <Image
          src={`${A}/hero-banner.png`}
          alt="Be Free — a gold and holographic crest with a samurai war-mask and a bald eagle holding a soft-serve cone"
          width={1672}
          height={941}
          priority
          className="h-auto w-full select-none"
        />
        <div className="bg-[linear-gradient(180deg,rgba(8,11,24,0)_0%,#0C1226_92%)] px-5 pb-9 pt-4 text-center">
          <p className="bf-eyebrow">Real Ingredients · No Apologies</p>
          <h2 className="bf-wordmark mt-2 text-[20px] leading-tight">
            Veteran-crafted small-batch ice cream
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="#menu" className="bf-seal-cta">
              See the menu
            </Link>
            <Link
              href="#story"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#F2ECDE]/30 bg-[#F2ECDE]/5 px-6 text-[12px] font-bold uppercase tracking-[0.12em] text-[#F2ECDE] transition hover:border-[#E7C463]/60 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F2ECDE]"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* ── Honor band — frogman founder, America-first ──────── */}
      <section id="story" className="scroll-mt-24 px-4 pt-6">
        <div className="bf-card bf-foil-edge relative overflow-hidden text-center">
          <div className="bf-chalk-dust" />
          <div className="bf-holo-sheen" />
          <div className="relative z-10 px-5 pb-6 pt-6">
            {/* The frogman crest — Navy SEAL bone-frog with its gold-star halo */}
            <Image
              src={`${A}/sticker-bonefrog.png`}
              alt="The Be Free bone-frog — a Navy SEAL frogman crest with a gold-star halo"
              width={1254}
              height={1254}
              className="mx-auto h-auto w-[118px] select-none drop-shadow-[0_8px_18px_rgba(0,0,0,0.5)]"
            />
            <p className="bf-eyebrow mt-1">Frogman founded · America first</p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
              {HONOR_STATS.map((stat, i) => (
                <Fragment key={stat}>
                  <span className="bf-wordmark text-[12px] uppercase tracking-[0.16em]">
                    {stat}
                  </span>
                  {i < HONOR_STATS.length - 1 && (
                    <span aria-hidden="true" className="text-[10px] text-[#E7C463]">
                      ★
                    </span>
                  )}
                </Fragment>
              ))}
            </div>

            {/* Red · white · blue star divider */}
            <div
              className="mx-auto mt-4 flex max-w-[200px] items-center justify-center gap-2"
              aria-hidden="true"
            >
              <span className="bf-foil-rule flex-1" />
              <span className="text-[11px] text-[#C8463C]">★</span>
              <span className="text-[11px] text-[#F2ECDE]">★</span>
              <span className="text-[11px] text-[#5B7BB0]">★</span>
              <span className="bf-foil-rule flex-1" />
            </div>

            {sensory && (
              <p className="mx-auto mt-4 max-w-sm text-[13px] leading-relaxed text-[#F2ECDE]/80">
                Founded by a Navy SEAL, trained at Penn State&apos;s Berkey Creamery.
                Every scoop supports Gold Star families through the Kyle Milliken
                Foundation.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Collapsible "open the boards" index ──────────────── */}
      <div className="px-4 pt-6">
        <div id="menu" aria-hidden="true" className="scroll-mt-24" />
        <details className="bf-slate group overflow-hidden">
          <summary className="bf-summary flex min-h-[48px] items-center justify-between gap-3 px-4 py-3">
            <span className="flex flex-col text-left">
              <span className="bf-eyebrow">Browse</span>
              <span className="bf-wordmark mt-0.5 text-[15px]">Jump to a board</span>
            </span>
            <span
              aria-hidden="true"
              className="grid h-8 w-8 place-items-center rounded-full border border-[#E7C463]/45 text-[13px] text-[#E7C463] transition-transform duration-300 group-open:rotate-180"
            >
              ▾
            </span>
          </summary>
          <nav
            aria-label="Menu boards"
            className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]"
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-1 gap-2 border-t border-[#E7C463]/15 px-3 pb-3 pt-2 min-[380px]:grid-cols-2">
                {categories.map((c) => (
                  <a
                    key={c.name}
                    href={`#${slugify(c.name)}`}
                    className="bf-seal-chip justify-center"
                  >
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </details>
      </div>

      {/* ── The deck: 9 category boards (each on its own board art) ─ */}
      <div className="space-y-4 px-4 pt-4">
        {categories.map((category, i) => {
          const slug = slugify(category.name);
          const isFlavors = category.name === "Signature Flavors";
          const num = String(i + 1).padStart(2, "0");
          const boardSrc = `${A}/menu-board-bg.png`;
          return (
            <section
              key={slug}
              id={slug}
              aria-labelledby={`${slug}-title`}
              className={`bf-card scroll-mt-24 ${isFlavors ? "bf-foil-edge" : ""}`}
            >
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <Image
                  src={boardSrc}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="470px"
                  className="object-cover object-top opacity-[0.35]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,11,24,0.48)_0%,rgba(8,11,24,0.62)_100%)]" />
              </div>
              <div className="bf-chalk-dust" />
              <div className="bf-holo-sheen" />
              {isFlavors && (
                <div className="pointer-events-none absolute right-2 top-2 z-20 w-[88px] text-center">
                  <Image
                    src={`${A}/sticker-alien.png`}
                    alt="Holographic Alien-cone collector sticker"
                    width={1254}
                    height={1254}
                    className="h-auto w-[88px] rotate-[8deg] drop-shadow-[0_8px_14px_rgba(0,0,0,0.55)]"
                  />
                  <span className="mt-1 block text-[8px] uppercase tracking-[0.14em] text-[#F2ECDE]/55">
                    Collector sticker · in store
                  </span>
                </div>
              )}
              <div className="relative z-10 px-5 pb-5 pt-5">
                <div className="text-center">
                  <p className="bf-eyebrow">No. {num} / Board</p>
                  <h2 id={`${slug}-title`} className="bf-wordmark mt-3 text-[22px]">
                    {category.name}
                  </h2>
                  <div className="bf-chalk-rule mx-auto mt-2 w-2/3" />
                </div>
                <ul className="mt-4 space-y-3">
                  {category.items.map((item) => (
                    <ItemRow
                      key={item.name}
                      item={item}
                      categoryName={category.name}
                    />
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>

      {/* ── The Collection — holographic collector stickers ──── */}
      <section id="collection" className="scroll-mt-24 px-4 pt-4">
        <div className="bf-card">
          <div className="bf-chalk-dust" />
          <div className="bf-holo-sheen" />
          <div className="relative z-10 px-5 pb-6 pt-5">
            <div className="text-center">
              <p className="bf-eyebrow">Collect the boards</p>
              <h2 className="bf-wordmark mt-2 text-[22px]">The Collection</h2>
              <div className="bf-chalk-rule mx-auto mt-2 w-2/3" />
              <p className="mx-auto mt-2 max-w-sm text-[12px] italic leading-snug text-[#F2ECDE]/65">
                Holographic collector stickers — find them in store.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {STICKERS.map((s) => (
                <figure
                  key={s.src}
                  className={`bf-slate bf-foil-edge relative overflow-hidden rounded-2xl p-3 text-center ${
                    s.feature ? "col-span-2" : ""
                  }`}
                >
                  <div className="bf-holo-sheen" />
                  <div className="relative z-10">
                    <Image
                      src={s.src}
                      alt={`${s.name} — Be Free holographic collector sticker`}
                      width={1254}
                      height={1254}
                      className={`mx-auto h-auto w-full ${s.feature ? "max-w-[240px]" : "max-w-[150px]"}`}
                    />
                    <figcaption className="bf-wordmark mt-2 text-[14px]">{s.name}</figcaption>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#F2ECDE]/65">{s.line}</p>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── "Straight from the boards" proof card ────────────── */}
      <div className="px-4 pt-4">
        <section id="boards" className="bf-card scroll-mt-24">
          <div className="bf-chalk-dust" />
          <div className="relative z-10 px-5 pb-5 pt-5">
            <div className="text-center">
              <p className="bf-eyebrow">The Real Thing</p>
              <h2 className="bf-wordmark mt-2 text-[22px]">Straight from the boards</h2>
              <div className="bf-chalk-rule mx-auto mt-2 w-2/3" />
              <p className="mx-auto mt-2 max-w-sm text-[12px] italic leading-snug text-[#F2ECDE]/65">
                Hand-lettered in cream and gold, in the shop on Elson Green Ave.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {BOARDS.map((b) => (
                <figure key={b.src}>
                  <div className="bf-frame bf-foil-edge">
                    <Image src={b.src} alt={b.alt} width={810} height={1080} className="h-auto w-full" />
                  </div>
                  <figcaption className="mt-1.5 text-center text-[10px] uppercase tracking-[0.16em] text-[#F2ECDE]/55">
                    {b.cap}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Find-us CTA band ─────────────────────────────────── */}
      {ctaBand && (
        <div className="px-4 pt-4">
          <section className="bf-card">
            <div className="bf-chalk-dust" />
            <div className="relative z-10 px-6 pb-7 pt-7 text-center">
              <p className="bf-eyebrow">Pull up to the counter</p>
              <h2 className="bf-wordmark mt-2 text-[22px]">{ctaBand.title}</h2>
              <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[#F2ECDE]/80">
                {ctaBand.text}
              </p>
              <div className="mt-5">
                <a
                  href={ctaBand.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bf-seal-cta"
                >
                  {ctaBand.cta.label}
                </a>
              </div>
              <p className="mx-auto mt-4 max-w-xs text-[11px] leading-relaxed text-[#F2ECDE]/60">
                Every scoop supports Gold Star families · Kyle Milliken Foundation.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* ── Crafted signature footer ─────────────────────────── */}
      <footer className="mt-10 px-4 pb-12 pt-2">
        <p className="sr-only">
          Be Free Craft Ice Cream. Follow on Instagram. Powered by Fina Calle.
        </p>
        <div className="mx-auto flex max-w-[260px] items-center gap-3">
          <span className="bf-foil-rule flex-1" />
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rotate-45 border border-[#C8463C]/70"
          />
          <span className="bf-foil-rule flex-1" />
        </div>

        <div className="mt-8 flex flex-col items-center text-center">
          {website && (
            <a
              href={website.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit the Be Free Craft Ice Cream website"
              className="bf-link rounded-2xl transition hover:opacity-90"
            >
              <Image
                src={`${A}/be-free-logo.png`}
                alt="Be Free Craft Ice Cream"
                width={2000}
                height={1893}
                className="h-auto w-[230px] select-none drop-shadow-[0_0_28px_rgba(231,196,99,0.3)]"
              />
            </a>
          )}

          {instagram && (
            <>
              <a
                href={instagram.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Be Free Craft Ice Cream on Instagram"
                className="bf-seal-chip mt-7"
              >
                <InstagramGlyph />
                <span>Follow on Instagram</span>
              </a>
              <p className="mt-3 text-[11px] tracking-[0.18em] text-[#F2ECDE]/55">
                @befreecrafticecream
              </p>
            </>
          )}

          {location && (
            <div className="mt-8 max-w-xs">
              <p className="text-[13px] leading-relaxed text-[#F2ECDE]/75">
                {location.address}
              </p>
              {location.hours && (
                <p className="mt-1 text-[12px] text-[#F2ECDE]/55">{location.hours}</p>
              )}
            </div>
          )}

          <p className="mt-6 max-w-xs text-[10px] leading-relaxed text-[#F2ECDE]/45">
            Wall art: Bone Frog &amp; Samurai by Jess Kaban · Every scoop supports
            Gold Star families via the Kyle Milliken Foundation.
          </p>

          <a
            href="https://amma-fina-calle.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Powered by Fina Calle"
            className="bf-link mt-9 flex flex-col items-center gap-2"
          >
            <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-[#E7C463]/70">
              Powered by
            </span>
            <Image
              src="/assets/colattao/ui/fina-calle-os-emblem.webp"
              alt="Fina Calle OS"
              width={460}
              height={488}
              className="h-auto w-[112px] select-none opacity-80 drop-shadow-[0_0_14px_rgba(231,196,99,0.16)]"
            />
          </a>
        </div>
      </footer>
    </main>
  );
}
