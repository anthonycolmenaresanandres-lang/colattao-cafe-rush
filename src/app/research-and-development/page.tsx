import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "R&D Lab · Colattao Café Rush",
  description: "Internal research and development lab.",
  // Internal only: never indexed, never followed by search engines.
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

type ExperimentStatus = "Testing live" | "Drafting" | "Validated" | "Parked";

type Experiment = {
  id: string;
  title: string;
  hypothesis: string;
  rule: string;
  outcome: string;
  status: ExperimentStatus;
  render?: () => React.ReactNode;
};

const STATUS_STYLES: Record<ExperimentStatus, string> = {
  "Testing live": "border-[#92aecd66] bg-[#2e5a7c33] text-[#dbe7f3]",
  Drafting: "border-[#f5c46b55] bg-[#fff3d61a] text-[#fff3d6]",
  Validated: "border-[#8fce9b55] bg-[#2e7c4233] text-[#d6f3dd]",
  Parked: "border-[#f5c46b30] bg-[#120904]/65 text-[#f4deba]",
};

const EXPERIMENTS: Experiment[] = [
  {
    id: "01",
    title: "Tap to Explore — branded PNG button",
    hypothesis:
      "A single AI-generated, on-brand PNG button reads as more premium than a CSS button and still works as a real, accessible link on every phone width.",
    rule:
      "The button image renders full-bleed up to 560px, keeps its native aspect ratio (no stretch / no crop), stays centered, and is a keyboard-focusable link that lands on the live menu.",
    outcome:
      "Tapping navigates to /menu#menu and the categories sit just below the sticky header. Verified at 320 / 390 / 430 / 560px — ratio 3.00, centered, no horizontal overflow.",
    status: "Testing live",
    render: () => (
      <Link
        href="/menu#menu"
        aria-label="Tap to explore the Colattao menu"
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f5c46b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1b0e08]"
      >
        <Image
          src="/assets/colattao/rnd/tap-to-explore.png"
          alt="Tap to explore"
          width={2172}
          height={724}
          className="tapExploreButton"
        />
      </Link>
    ),
  },
  {
    id: "02",
    title: "Config-not-code site generation",
    hypothesis:
      "An agentic AI can take a new café's logo, photos, color scheme, and rules, then fill a structured config — and a deterministic template renders a consistent, on-brand site from it.",
    rule:
      "AI produces data (palette, menu, copy), never layout code. Same template + same config = same result every time. API usage stays low but high-impact.",
    outcome:
      "A new café goes from raw brand inputs to a working menu + two-button QR landing with zero hand-written per-client code.",
    status: "Drafting",
  },
];

export default function ResearchAndDevelopmentPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_10%,#2e5a7c22_0%,transparent_36%),radial-gradient(circle_at_80%_15%,#d990281f_0%,transparent_30%),linear-gradient(180deg,#120904_0%,#1b0e08_45%,#2a1208_100%)] px-4 py-8 text-[#fff3d6] sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-7">
        <section className="rounded-3xl border border-[#f5c46b33] bg-[#1b0e08]/75 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)] backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#92aecd]">Internal · R&amp;D Lab</p>
          <h1 className="mt-3 font-serif text-3xl text-[#fff3d6] sm:text-4xl">
            Research &amp; Development
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[#f4deba]/85 sm:text-base">
            A private lab to develop new ideas and test them live before they reach a café. Every
            experiment is framed as a hypothesis, a rule with a verifiable outcome, and a current
            status — so what works here can be turned into a repeatable, on-brand build.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="rounded-full border border-[#f5c46b66] bg-[#d99028] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2a1208] transition hover:bg-[#f5c46b]"
            >
              Ver menú live
            </Link>
            <Link
              href="/owner-command-center"
              className="rounded-full border border-[#92aecd66] bg-[#2e5a7c33] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#dbe7f3] transition hover:bg-[#2e5a7c55]"
            >
              Volver al centro de control
            </Link>
          </div>
          <p className="mt-3 text-[11px] text-[#f4deba]/55">
            Herramienta interna. No es visible para los clientes.
          </p>
        </section>

        <section className="space-y-5">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">
            Experimentos
          </h2>

          {EXPERIMENTS.map((exp) => (
            <article
              key={exp.id}
              className="rounded-3xl border border-[#f5c46b2f] bg-[#fff3d610] p-6 shadow-[0_14px_35px_-24px_rgba(0,0,0,0.9)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#92aecd]">
                  Experimento {exp.id}
                </p>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${STATUS_STYLES[exp.status]}`}
                >
                  {exp.status}
                </span>
              </div>
              <h3 className="mt-2 font-serif text-xl text-[#fff3d6] sm:text-2xl">{exp.title}</h3>

              <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-[#f5c46b]">Hipótesis</dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-[#f4deba]/90">
                    {exp.hypothesis}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-[#f5c46b]">
                    Regla / criterio
                  </dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-[#f4deba]/90">{exp.rule}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-[#f5c46b]">
                    Resultado verificable
                  </dt>
                  <dd className="mt-1 text-[13px] leading-relaxed text-[#f4deba]/90">
                    {exp.outcome}
                  </dd>
                </div>
              </dl>

              {exp.render ? (
                <div className="mt-6">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-[#f5c46b55] to-transparent" />
                  <p className="mt-4 mb-3 text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">
                    Prueba en vivo
                  </p>
                  {exp.render()}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
