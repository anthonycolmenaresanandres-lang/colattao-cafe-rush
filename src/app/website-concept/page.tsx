import Image from "next/image";
import Link from "next/link";
import appTheme from "@/config/theme";

const conceptCards = [
  {
    title: "Story",
    text: "A cinematic origin story with Colombian coffee roots, founder voice, and neighborhood identity.",
  },
  {
    title: "Menu",
    text: "A fast, beautiful mobile menu with seasonal highlights and easy owner-controlled updates.",
  },
  {
    title: "Cafe Rush",
    text: "An interactive mini-game that turns a normal scan into a memorable brand moment.",
  },
  {
    title: "Stickers and Merch",
    text: "Digital-to-physical brand assets that carry the personality beyond the counter.",
  },
  {
    title: "Events and Reservations",
    text: "A cleaner flow for tastings, community nights, and future booking touchpoints.",
  },
  {
    title: "Owner Update Workflow",
    text: "Simple content updates without touching complex systems or waiting on long dev cycles.",
  },
  {
    title: "Feedback and Community",
    text: "Privacy-first customer feedback loops that help shape the in-store experience.",
  },
];

const advantages = [
  "Interactive game experience",
  "QR-driven digital menu flow",
  "Shareable brand assets for social and in-store",
  "Spanish/English cultural depth",
  "Privacy-first feedback approach",
  "Anonymous analytics visibility",
  "Faster owner updates",
];

const nextSteps = [
  "Choose the homepage direction",
  "Confirm final menu structure",
  "Add professional photography",
  "Decide sticker and merch rollout",
  "Connect domain or subdomain",
  "Choose whether this replaces or complements the current website",
];

export default function WebsiteConceptPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2e5a7c_0%,#1b0e08_45%,#120905_100%)] text-[#f5e9d0]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="rounded-3xl border border-[#f5e9d0]/20 bg-[#1b0e08]/60 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-10">
          <div className="mx-auto w-full max-w-[280px]">
            <Image
              src={appTheme.brand.logoPath}
              alt={`${appTheme.brand.displayName} logo`}
              width={1024}
              height={341}
              className="h-auto w-full"
              priority
            />
          </div>
          <h1 className="mt-6 text-center font-serif text-3xl leading-tight text-[#fff3d6] sm:text-5xl">
            A Colombian Coffee House, Reimagined Digitally
          </h1>
          <p className="mt-3 text-center text-base text-[#f5c46b] sm:text-lg">
            Una experiencia digital con sabor, cultura y alma.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/menu"
              className="rounded-full border border-[#f5c46b]/60 bg-[#f5c46b] px-6 py-3 text-center font-semibold text-[#2a1208] transition hover:bg-[#ffe1a0]"
            >
              View Live Menu
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[#f5e9d0]/40 bg-[#1b0e08]/70 px-6 py-3 text-center font-semibold text-[#f5e9d0] transition hover:bg-[#2a1208]"
            >
              Play Cafe Rush
            </Link>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#f5e9d0]/15 bg-[#1b0e08]/50 p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Current website opportunity</h2>
          <p className="mt-4 text-[#f5e9d0]/90">
            The current website already covers the basics: menu, story, reservations, and hiring.
            The opportunity now is to evolve from a static site into a living brand ecosystem that
            keeps guests engaged before, during, and after each visit.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Future homepage concept</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {conceptCards.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-[#f5c46b]/25 bg-[linear-gradient(135deg,#fff3d6_0%,#f5e9d0_100%)] p-5 text-[#2a1208] shadow-lg"
              >
                <h3 className="font-serif text-xl">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4b2412]">{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#f5e9d0]/15 bg-[#1b0e08]/55 p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Why this beats a normal coffee site</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {advantages.map((item) => (
              <li key={item} className="rounded-xl border border-[#f5c46b]/20 bg-[#2a1208]/65 px-4 py-3 text-[#f5e9d0]">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-3xl border border-[#2e5a7c]/40 bg-[linear-gradient(145deg,#1b0e08_0%,#2a1208_60%,#2e5a7c_100%)] p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Visual direction</h2>
          <p className="mt-4 text-[#f5e9d0]/90">
            Colombian heritage with ceramic blue, espresso depth, and parchment warmth. Sombrero
            vueltiao and mochila-inspired patterning can frame sections subtly, while nostalgic-but-modern
            typography keeps the tone premium. Dedicated photography zones can elevate drinks, food, and
            people-centered storytelling.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-[#f5e9d0]/15 bg-[#1b0e08]/55 p-6 sm:p-8">
          <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Next steps</h2>
          <ol className="mt-4 space-y-2 text-[#f5e9d0]/95">
            {nextSteps.map((step, index) => (
              <li key={step}>
                {index + 1}. {step}
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-8 rounded-3xl border border-[#f5c46b]/30 bg-[#120905]/75 p-6">
          <p className="text-center text-sm text-[#f5e9d0]/90">
            Concept preview for a premium Colattao digital presence.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/owner-presentation"
              className="rounded-full border border-[#f5e9d0]/40 bg-[#2a1208] px-5 py-3 text-center text-sm font-semibold text-[#f5e9d0] transition hover:bg-[#4b2412]"
            >
              Open Owner Presentation
            </Link>
            <Link
              href="/menu"
              className="rounded-full border border-[#f5e9d0]/40 bg-[#2a1208] px-5 py-3 text-center text-sm font-semibold text-[#f5e9d0] transition hover:bg-[#4b2412]"
            >
              Open Digital Menu
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[#f5e9d0]/40 bg-[#2a1208] px-5 py-3 text-center text-sm font-semibold text-[#f5e9d0] transition hover:bg-[#4b2412]"
            >
              Open Game
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
