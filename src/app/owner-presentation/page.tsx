import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Owner Presentation · Colattao Café Rush",
  description:
    "A premium walkthrough of the Colattao Café Rush digital ecosystem — game, menu, sticker collection, and update workflow.",
};

// ── Sticker collection (curated from Anthony's downloaded set) ──
const STICKERS: {
  src: string;
  alt: string;
  family: string;
  caption: string;
}[] = [
  {
    src: "/assets/colattao/stickers/sticker-colattao-sombrero-01.png",
    alt: "Colattao badge with sombrero vueltiao and Colombian ceramic cup",
    family: "Heritage Badge",
    caption: "Sombrero vueltiao, mountain, hibiscus, Colombian ceramic",
  },
  {
    src: "/assets/colattao/stickers/sticker-colattao-vinyl-01.png",
    alt: "Colattao Coffee House logo with vinyl record and Colombian textile",
    family: "Vinyl Lifestyle",
    caption: "Colombian textile, vinyl, banana leaf, sunburst",
  },
  {
    src: "/assets/colattao/stickers/sticker-colattao-mountain-01.png",
    alt: "Colattao mountain scene with sombrero and coffee cup",
    family: "Andean Morning",
    caption: "Sunrise over the mountains, sombrero, ceramic cup",
  },
  {
    src: "/assets/colattao/stickers/sticker-colattao-sombrero-02.png",
    alt: "Colattao circular badge with birds of paradise and ceramic plate",
    family: "Heritage Badge",
    caption: "Birds-of-paradise, hibiscus, ceramic plate frame",
  },
  {
    src: "/assets/colattao/stickers/sticker-colattao-vinyl-02.png",
    alt: "Colattao vinyl badge variant",
    family: "Vinyl Lifestyle",
    caption: "Alternate colorway · vinyl + textile",
  },
  {
    src: "/assets/colattao/stickers/sticker-heritage-mug-01.png",
    alt: "Vintage china mug with bird & floral pattern, topped with whipped cream",
    family: "Nostalgic China",
    caption: "Heritage china mug, bird & floral, dusted crema",
  },
  {
    src: "/assets/colattao/stickers/sticker-heritage-cup-01.png",
    alt: "Vintage china cup and saucer with floral pattern and whipped cream",
    family: "Nostalgic China",
    caption: "Cup & saucer, blue floral toile, cinnamon dust",
  },
  {
    src: "/assets/colattao/stickers/sticker-heritage-cup-02.png",
    alt: "Vintage china cup and saucer, second colorway",
    family: "Nostalgic China",
    caption: "Alternate colorway · cup & saucer",
  },
];

export default function OwnerPresentationPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[470px] flex-col bg-colattao-page text-[var(--col-parchment)]">
      {/* ──────────────────────────────────────────────────────
          HERO
          ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-6 pt-8 text-center">
        <p className="brand-eyebrow text-amber-200/70">
          For the Owner · {new Date().getFullYear()}
        </p>
        <Image
          src="/assets/colattao/logo/colattao-logo.png"
          alt="Colattao"
          width={260}
          height={104}
          priority
          className="mx-auto mt-2 h-auto w-[200px] select-none drop-shadow-[0_0_24px_rgba(212,162,76,0.22)]"
        />
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-300/55" />
          <span className="text-[10px] uppercase tracking-[0.32em] text-amber-200/80">
            The Digital Ecosystem
          </span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-300/55" />
        </div>

        <p className="mt-4 px-2 text-[13px] leading-snug text-amber-100/85">
          A premium, mobile-first home for Colattao Coffee House — built around
          one game, one digital menu, and one consistent brand voice.
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/"
            className="btn-gold inline-block rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em]"
          >
            Play Café Rush
          </Link>
          <Link
            href="/menu"
            className="btn-ceramic inline-block rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.18em]"
          >
            See Menu
          </Link>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────
          WHAT IS LIVE NOW
          ────────────────────────────────────────────────────── */}
      <SectionBlock
        eyebrow="01"
        title="What's live now"
        body={
          <ul className="mt-4 space-y-3 text-left text-[13px] leading-snug text-[var(--col-espresso-3)]">
            <Bullet label="Café Rush game">
              Three-level mobile catch game. Warm-up · Rush Hour · Colattao
              Lovers Only. Earns a "Pass Earned" card on completion.
            </Bullet>
            <Bullet label="Digital menu (/menu)">
              Full categorized menu with prices and seasonal drinks. Built for
              QR-code scanning while customers wait in line.
            </Bullet>
            <Bullet label="Premium brand system">
              Espresso, parchment, terracotta, gold, ceramic-blue palette;
              Playfair Display + Inter typography; mochila pattern accents.
            </Bullet>
            <Bullet label="Owner update link">
              One-tap email request from the menu footer goes straight to
              Anthony with a pre-filled template.
            </Bullet>
          </ul>
        }
      />

      {/* ──────────────────────────────────────────────────────
          STICKER COLLECTION
          ────────────────────────────────────────────────────── */}
      <section className="px-4 pt-7">
        <div className="px-2 text-center">
          <p
            className="text-[10px] text-[var(--col-gold-soft)]"
            style={{ letterSpacing: "0.32em" }}
          >
            02 · COLLECTION
          </p>
          <h2
            className="brand-wordmark mt-1 text-[22px] text-amber-50"
            style={{ letterSpacing: "0.04em" }}
          >
            Sticker Studies
          </h2>
          <div className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-amber-300/55 to-transparent" />
          <p className="mt-3 text-[12px] leading-snug text-amber-100/75">
            Three families: Heritage Badge, Vinyl Lifestyle, Nostalgic China.
            All grounded in Colombian coffee culture.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {STICKERS.map((s) => (
            <figure
              key={s.src}
              className="menu-card flex flex-col items-center px-3 pb-3 pt-3"
            >
              <div className="flex h-32 w-full items-center justify-center">
                <Image
                  src={s.src}
                  alt={s.alt}
                  width={240}
                  height={240}
                  className="max-h-32 w-auto select-none object-contain drop-shadow"
                />
              </div>
              <figcaption className="mt-2 text-center">
                <p
                  className="text-[9px] uppercase text-[var(--col-gold-deep)]"
                  style={{ letterSpacing: "0.22em" }}
                >
                  {s.family}
                </p>
                <p className="mt-0.5 text-[10px] leading-tight text-[var(--col-espresso-3)]/80">
                  {s.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mx-auto mt-4 max-w-xs text-center text-[11px] italic text-amber-100/60">
          Use as physical stickers, cup wraps, takeout-bag seals, or in-store
          signage.
        </p>
      </section>

      {/* ──────────────────────────────────────────────────────
          HOW THIS HELPS COLATTAO
          ────────────────────────────────────────────────────── */}
      <SectionBlock
        eyebrow="03"
        title="How this helps Colattao"
        body={
          <ul className="mt-4 space-y-3 text-left text-[13px] leading-snug text-[var(--col-espresso-3)]">
            <Bullet label="Builds the line, not just sales">
              The QR menu and game turn waiting customers into engaged ones.
              Repeat scans, shared screenshots, and conversations at the bar.
            </Bullet>
            <Bullet label="Owns the brand">
              Stickers, palette, and typography travel across cups, walls, and
              social — recognizable as Colattao before the logo is even read.
            </Bullet>
            <Bullet label="Free to operate">
              Hosted on Vercel free tier, statically generated, no database to
              run, no API costs, no monthly fee.
            </Bullet>
            <Bullet label="Always accurate">
              The menu page is the source of truth. Updates take Anthony a
              few minutes and go live worldwide automatically.
            </Bullet>
          </ul>
        }
      />

      {/* ──────────────────────────────────────────────────────
          OWNER UPDATE WORKFLOW
          ────────────────────────────────────────────────────── */}
      <SectionBlock
        eyebrow="04"
        title="Owner update workflow"
        body={
          <ol className="mt-4 space-y-3 text-left text-[13px] leading-snug text-[var(--col-espresso-3)]">
            <NumberedStep n={1} label="You send a note">
              Email, text, or tap "Need a menu update?" in the menu footer. Use
              plain language — no special format required.
            </NumberedStep>
            <NumberedStep n={2} label="Anthony reviews">
              Confirms scope, drafts the change, and routes it through Codex.
            </NumberedStep>
            <NumberedStep n={3} label="Codex edits, builds, pushes">
              Files updated, TypeScript & Tailwind verified, change committed
              with a clear message.
            </NumberedStep>
            <NumberedStep n={4} label="Vercel auto-deploys">
              Roughly 1–3 minutes. No manual step. Live URL stays the same.
            </NumberedStep>
            <NumberedStep n={5} label="You see it live">
              Anthony confirms with a short "it's live" message and the URL.
            </NumberedStep>
          </ol>
        }
      />

      {/* ──────────────────────────────────────────────────────
          NEXT STEPS
          ────────────────────────────────────────────────────── */}
      <SectionBlock
        eyebrow="05"
        title="Next steps"
        body={
          <ul className="mt-4 space-y-3 text-left text-[13px] leading-snug text-[var(--col-espresso-3)]">
            <Bullet label="Print test the sticker set">
              Choose 2–3 sticker designs. Order a small batch for cups and bags.
            </Bullet>
            <Bullet label="Place QR signage in-store">
              Use the QR menu sign to drive scans during line wait time.
            </Bullet>
            <Bullet label="Decide on a reward">
              Bring back a "Pass Earned" discount when you're ready (5% off,
              free cookie, etc.) — the framework is already in place.
            </Bullet>
            <Bullet label="Seasonal updates">
              Send Anthony your spring / summer / fall menus and we'll keep the
              digital menu in sync.
            </Bullet>
          </ul>
        }
      />

      {/* ──────────────────────────────────────────────────────
          FOOTER CTA
          ────────────────────────────────────────────────────── */}
      <footer className="px-5 pb-10 pt-8 text-center">
        <div className="ceramic-rule mx-auto mb-6 w-2/3" />
        <p className="brand-eyebrow text-amber-200/70">Try it now</p>
        <div className="mt-3 flex flex-col items-center gap-3">
          <Link
            href="/"
            className="btn-gold inline-block w-56 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
          >
            ☕ Play Café Rush
          </Link>
          <Link
            href="/menu"
            className="btn-ceramic inline-block w-56 rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
          >
            See the Menu
          </Link>
        </div>
        <p className="mt-6 text-[10px] uppercase tracking-[0.28em] text-amber-200/45">
          © {new Date().getFullYear()} Colattao Coffee House
        </p>
      </footer>
    </main>
  );
}

// ── helpers ─────────────────────────────────────────────────
function SectionBlock({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <section className="px-4 pt-7">
      <div className="menu-card px-5 pb-5 pt-5">
        <div className="text-center">
          <p
            className="text-[10px] uppercase text-[var(--col-gold-deep)]"
            style={{ letterSpacing: "0.32em" }}
          >
            {eyebrow}
          </p>
          <h2
            className="brand-wordmark mt-1 text-[22px] text-[var(--col-espresso)]"
            style={{ letterSpacing: "0.04em" }}
          >
            {title}
          </h2>
          <div className="ceramic-rule mx-auto mt-2 w-2/3" />
        </div>
        {body}
      </div>
    </section>
  );
}

function Bullet({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-2">
      <span
        aria-hidden="true"
        className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--col-gold-deep)]"
      />
      <div>
        <span className="font-semibold text-[var(--col-espresso)]">
          {label}.
        </span>{" "}
        <span className="text-[var(--col-espresso-3)]/85">{children}</span>
      </div>
    </li>
  );
}

function NumberedStep({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--col-gold-deep)]/40 bg-white/50 font-mono text-[11px] font-bold text-[var(--col-espresso)]"
      >
        {n}
      </span>
      <div>
        <span className="font-semibold text-[var(--col-espresso)]">
          {label}.
        </span>{" "}
        <span className="text-[var(--col-espresso-3)]/85">{children}</span>
      </div>
    </li>
  );
}
