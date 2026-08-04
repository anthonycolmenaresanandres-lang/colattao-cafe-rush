import Image from "next/image";

/**
 * New-product feature banner for the Churro Affogato.
 * Image-led: the only words are the NEW badge and the product name; the
 * Penalty Rush churro character (existing approved game asset) presents the
 * drink. The whole banner is a single anchor to the item in Tea & More,
 * so it ships no client JS.
 */
export default function ChurroAffogatoBanner() {
  return (
    <section aria-label="New on the menu — Churro Affogato" className="relative z-20">
      <a
        href="#tea"
        aria-label="New — Churro Affogato. Find it on the menu."
        className="group relative block touch-manipulation overflow-hidden border-b border-[#DAAE4F]/25 bg-[#150a05] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#F8EDD7]"
      >
        <div className="relative aspect-[16/10]">
          <Image
            src="/assets/colattao/menu/new/churro-affogato-wide.webp"
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 470px) 100vw, 470px"
            priority
            className="object-cover"
          />

          {/* Legibility gradient behind the title */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(180deg,transparent,rgba(18,8,2,0.42)_55%,rgba(18,8,2,0.82))]"
          />

          {/* Penalty Rush churro character presenting the drink */}
          <Image
            src="/assets/colattao/penalty/select-churro-v1.webp"
            alt=""
            aria-hidden="true"
            width={432}
            height={640}
            sizes="(max-width: 470px) 34vw, 160px"
            className="absolute -right-1 bottom-0 z-10 h-[88%] w-auto select-none object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)] transition-transform duration-300 group-hover:-translate-y-1"
          />

          {/* NEW — high contrast */}
          <span className="absolute left-3 top-3 z-10 rounded-full bg-[#F8EDD7] px-3.5 py-1.5 text-[12px] font-black uppercase tracking-[0.24em] text-[#1B0E08] shadow-[0_10px_20px_-10px_rgba(0,0,0,0.9),0_0_0_1px_rgba(27,14,8,0.35)]">
            New
          </span>

          {/* Product name — the only other words on the banner */}
          <h2
            className="brand-wordmark absolute bottom-4 left-4 z-10 max-w-[62%] text-[32px] italic leading-[1.02] text-[#F8EDD7] [text-shadow:0_2px_14px_rgba(0,0,0,0.85)]"
            style={{ letterSpacing: "0.01em" }}
          >
            Churro <span className="text-[#DAAE4F]">Affogato</span>
          </h2>
        </div>
      </a>
    </section>
  );
}
