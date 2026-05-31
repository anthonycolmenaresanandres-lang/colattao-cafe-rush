import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import appTheme from "@/config/theme";
import RepIntakeGate from "@/components/RepIntakeGate";

export const metadata = {
  title: "Get started · Colattao Café Rush",
  description: "Internal sales rep tool.",
  // Hidden from customers: never indexed, never followed by search engines.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function GetStartedPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-colattao-page text-[var(--col-parchment)]">
      <header className="px-6 pb-4 pt-7 text-center">
        <Image
          src={appTheme.brand.logoPath}
          alt={appTheme.brand.displayName}
          width={220}
          height={88}
          priority
          className="mx-auto h-auto w-[150px] select-none drop-shadow-[0_0_18px_rgba(212,162,76,0.20)]"
        />
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-300/55" />
          <span className="text-[10px] uppercase tracking-[0.32em] text-amber-200/80">
            New café signup
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-300/55" />
        </div>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-snug text-amber-100/85">
          Bring a café onto Café Rush — digital menu, QR ordering, and the branded game.
        </p>
        <p className="mx-auto mt-1 max-w-md text-[11px] italic leading-snug text-amber-200/65">
          Collect what you can now. Only café name + a contact are required — Anthony follows up on
          anything missing.
        </p>
      </header>

      <section className="px-4 py-5">
        <Suspense
          fallback={
            <div className="menu-card px-6 py-10 text-center text-[13px] text-[var(--col-espresso-3)]/80">
              Loading intake…
            </div>
          }
        >
          <RepIntakeGate />
        </Suspense>
      </section>

      <footer className="px-5 pb-9 pt-2 text-center">
        <div className="ceramic-rule mx-auto mb-5 w-2/3" />
        <p className="brand-eyebrow text-amber-200/70">See it live</p>
        <nav aria-label="Demo pages" className="mt-3 flex flex-wrap justify-center gap-2.5">
          <Link
            href="/menu"
            className="btn-ceramic inline-block rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            Sample menu
          </Link>
          <Link
            href="/"
            className="btn-gold inline-block rounded-full px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em]"
          >
            Play the game
          </Link>
          <Link
            href="/owner-presentation"
            className="btn-ghost inline-block rounded-full border border-amber-300/40 bg-white/5 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100"
          >
            Pitch deck
          </Link>
        </nav>
        <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-amber-200/45">
          © {new Date().getFullYear()} Colattao Café Rush
        </p>
      </footer>
    </main>
  );
}
