import Image from "next/image";

const INGREDIENTS = [
  "Creamy churro ice cream",
  "Double shot of espresso",
  "Dust of cinnamon",
] as const;

/**
 * New-product feature banner for the Churro Affogato.
 *
 * Proportions follow the golden ratio: the photo column sits at the golden
 * section (38.2% / 61.8%), the photo cell is a golden portrait (1:1.618),
 * and the type scale steps by phi (13 -> 21 -> 34). Server-rendered — the
 * CTA is a plain anchor to the Tea & More section, so no client JS ships.
 */
export default function ChurroAffogatoBanner() {
  return (
    <section
      aria-label="New on the menu — Churro Affogato"
      className="relative z-20 overflow-hidden border-b border-[#DAAE4F]/25 bg-[linear-gradient(160deg,#211107_0%,#180c05_55%,#120802_100%)]"
    >
      {/* Gold glow anchored at the golden focal point of the panel */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_61.8%_38.2%,rgba(218,174,79,0.15),transparent_55%)]"
      />

      <div className="relative flex items-stretch">
        {/* Product photo — golden-section column, itself a 1:1.618 portrait */}
        <div className="relative w-[38.2%] shrink-0">
          <div className="relative aspect-[1000/1618] w-full">
            <Image
              src="/assets/colattao/menu/new/churro-affogato-golden.webp"
              alt="Churro Affogato — churro ice cream drowned in espresso, served in a crystal glass"
              fill
              sizes="(max-width: 470px) 38vw, 180px"
              priority
              className="object-cover"
            />
            {/* Espresso fade into the text panel */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-0 w-8 bg-[linear-gradient(90deg,transparent,#180c05)]"
            />
          </div>
        </div>

        {/* Words — 61.8% column, phi type scale */}
        <div className="flex min-w-0 flex-1 flex-col justify-center py-5 pl-2 pr-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#DAAE4F]">
            New on the menu
          </p>
          <h2
            className="brand-wordmark mt-2 text-[34px] italic leading-[1.02] text-[#F8EDD7]"
            style={{ letterSpacing: "0.01em" }}
          >
            Churro <span className="text-[#DAAE4F]">Affogato</span>
          </h2>

          {/* Stepped ingredient lines — echoes the launch story's staircase */}
          <ul className="mt-3 space-y-[8px]">
            {INGREDIENTS.map((ingredient, index) => (
              <li
                key={ingredient}
                className="flex items-center gap-2 text-[13px] font-semibold leading-snug text-[#F8EDD7]/85"
                style={{ marginLeft: `${index * 8}px` }}
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 shrink-0 rotate-45 bg-[#DAAE4F]/80"
                />
                {ingredient}
              </li>
            ))}
          </ul>

          <div className="mt-[21px]">
            <a
              href="#tea"
              className="inline-block touch-manipulation rounded-full border border-[#DAAE4F]/70 bg-[linear-gradient(135deg,#F8EDD7,#DAAE4F)] px-[21px] py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#1D1108] shadow-[0_12px_24px_-14px_rgba(218,174,79,0.95),inset_0_1px_0_rgba(255,255,255,0.5)] transition hover:-translate-y-0.5 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F8EDD7]"
            >
              Find it on the menu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
