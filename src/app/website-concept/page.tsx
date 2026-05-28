import Image from "next/image";
import Link from "next/link";
import appTheme from "@/config/theme";

const IMG = "/assets/colattao/website-concept";

const conceptCards = [
  {
    title: "Story",
    text: "A cinematic origin story with Colombian coffee roots, founder voice, and neighborhood identity.",
    image: `${IMG}/origin-coffee-hills.png`,
    alt: "A coffee grower harvesting ripe cherries at sunrise over the misty Colombian highlands",
  },
  {
    title: "Menu",
    text: "A fast, beautiful mobile menu with seasonal highlights and easy owner-controlled updates.",
    image: `${IMG}/signature-drink.png`,
    alt: "A tall iced signature latte with cinnamon-dusted cold foam in warm natural light",
  },
  {
    title: "Cafe Rush",
    text: "An interactive mini-game that turns a normal scan into a memorable brand moment.",
    image: `${IMG}/digital-ecosystem.png`,
    alt: "Colattao digital ecosystem on a cafe table: the Cafe Rush game, QR menu sign, stickers, and a latte",
  },
  {
    title: "Stickers and Merch",
    text: "Digital-to-physical brand assets that carry the personality beyond the counter.",
    image: `${IMG}/cultural-still-life.png`,
    alt: "A Colombian still life: ceramic cup of coffee beside a woven mochila and sombrero vueltiao with coffee cherries",
  },
  {
    title: "Events and Reservations",
    text: "A cleaner flow for tastings, community nights, and future booking touchpoints.",
    image: `${IMG}/community-cafe.png`,
    alt: "Friends laughing together over coffee at a warm, plant-filled Colattao cafe table",
  },
  {
    title: "Owner Update Workflow",
    text: "Simple content updates without touching complex systems or waiting on long dev cycles.",
    image: `${IMG}/pastry-showcase.png`,
    alt: "A flaky croissant with chocolate beside a latte-art cappuccino on a sunlit marble table",
  },
  {
    title: "Feedback and Community",
    text: "Privacy-first customer feedback loops that help shape the in-store experience.",
    image: `${IMG}/barista-craft.png`,
    alt: "A barista pouring delicate latte art into a handmade ceramic cup",
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

const sensoryCards = [
  {
    title: "Steam",
    text: "The first curl of steam off a fresh pour — that quiet promise of warmth before the first sip.",
  },
  {
    title: "Warm bread",
    text: "The smell of pastries just out of the oven, buttery and golden, pulling you toward the counter.",
  },
  {
    title: "Colombian soul",
    text: "Single-origin roots, woven texture, and music that feels like a Sunday morning back home.",
  },
];

const orderFirst = [
  {
    title: "Signature coffee",
    text: "Start with the house craft — espresso poured with care into handmade ceramic.",
    image: `${IMG}/barista-craft.png`,
    alt: "A barista finishing a rosetta of latte art in a ceramic cup",
  },
  {
    title: "Iced specialty",
    text: "For warm afternoons, a cold, layered specialty drink with silky foam on top.",
    image: `${IMG}/signature-drink.png`,
    alt: "A tall iced specialty latte with cinnamon-dusted cold foam",
  },
  {
    title: "Pastry pairing",
    text: "Pair it with something fresh from the case — flaky, golden, and made to share.",
    image: `${IMG}/pastry-showcase.png`,
    alt: "A flaky croissant beside a latte-art cappuccino on a sunlit marble table",
  },
  {
    title: "Seasonal pick",
    text: "Ask what's new — a rotating seasonal drink that captures the moment.",
    image: `${IMG}/cultural-still-life.png`,
    alt: "A ceramic cup of coffee in a warm Colombian still life with coffee cherries",
  },
];

// Espresso-dust / gold glow divider used between sections.
function GlowDivider() {
  return (
    <div className="my-10 flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#f5c46b]/60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[#f5c46b]/70" />
      <span className="h-px w-24 bg-gradient-to-r from-[#f5c46b]/60 via-[#2e5a7c]/50 to-[#f5c46b]/60" />
      <span className="h-1.5 w-1.5 rotate-45 bg-[#2e5a7c]/70" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#f5c46b]/60" />
    </div>
  );
}

// Subtle woven-pattern inspired top border for feature cards.
const wovenBorder =
  "before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-[repeating-linear-gradient(135deg,#9c6b1f_0px,#9c6b1f_6px,#e9c988_6px,#e9c988_12px,#2e5a7c_12px,#2e5a7c_18px)] before:opacity-70";

export default function WebsiteConceptPage() {
  return (
    <main className="relative min-h-screen bg-[radial-gradient(circle_at_top,#2e5a7c_0%,#1b0e08_45%,#120905_100%)] text-[#f5e9d0]">
      {/* ── Page-wide warm Colattao texture layer (subtle, behind content) ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src={`${IMG}/background-texture-colattao.png`}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover opacity-[0.18]"
        />
        {/* espresso mask keeps text readable over the texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(46,90,124,0.35)_0%,rgba(27,14,8,0.82)_45%,rgba(18,9,5,0.94)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section className="overflow-hidden rounded-3xl border border-[#f5e9d0]/20 bg-[#1b0e08]/60 shadow-2xl shadow-black/30 backdrop-blur-sm">
          {/* Hero banner — strongest wide interior image */}
          <div className="relative h-56 w-full sm:h-80 lg:h-[26rem]">
            <Image
              src={`${IMG}/hero-interior.png`}
              alt="Warm boho Colattao coffee house interior with an espresso bar, blue-and-white ceramics, and an ocean view through a tall window"
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b0e08] via-[#1b0e08]/35 to-transparent" />
          </div>

          <div className="p-6 sm:p-10">
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
              href="/owner-presentation"
              className="rounded-full border border-[#f5e9d0]/40 bg-[#2a1208] px-6 py-3 text-center font-semibold text-[#f5e9d0] transition hover:bg-[#4b2412]"
            >
              Open Owner Presentation
            </Link>
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
          </div>
        </section>

        <GlowDivider />

        {/* ── First, make them feel it ── */}
        <section className="rounded-3xl border border-[#f5e9d0]/15 bg-[#1b0e08]/55 p-6 sm:p-8">
          <h2 className="text-center font-serif text-2xl text-[#fff3d6] sm:text-4xl">
            First, make them feel it.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[#f5e9d0]/90">
            The future Colattao website should not only show coffee. It should make people feel the
            steam, the pastry, the music, the ceramic cup, and the reason to come in today.
          </p>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {sensoryCards.map((card) => (
              <article
                key={card.title}
                className={`relative overflow-hidden rounded-2xl border border-[#f5c46b]/25 bg-[#2a1208]/55 p-5 ${wovenBorder}`}
              >
                <h3 className="font-serif text-xl text-[#fff3d6]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#f5e9d0]/85">{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <GlowDivider />

        <section className="grid items-center gap-6 rounded-3xl border border-[#f5e9d0]/15 bg-[#1b0e08]/50 p-6 sm:p-8 lg:grid-cols-[1.618fr_1fr]">
          <div>
            <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Current website opportunity</h2>
            <p className="mt-4 text-[#f5e9d0]/90">
              The current website already covers the basics: menu, story, reservations, and hiring.
              The opportunity now is to evolve from a static site into a living brand ecosystem that
              keeps guests engaged before, during, and after each visit.
            </p>
          </div>
          <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-[#f5c46b]/20 sm:h-56">
            <Image
              src={`${IMG}/pastry-showcase.png`}
              alt="A warm pastry-and-coffee moment: a flaky croissant beside a latte-art cappuccino in golden light"
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover"
            />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Future homepage concept</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {conceptCards.map((card) => (
              <article
                key={card.title}
                className="overflow-hidden rounded-2xl border border-[#f5c46b]/25 bg-[linear-gradient(135deg,#fff3d6_0%,#f5e9d0_100%)] text-[#2a1208] shadow-lg"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-xl">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4b2412]">{card.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid items-center gap-6 rounded-3xl border border-[#f5e9d0]/15 bg-[#1b0e08]/55 p-6 sm:p-8 lg:grid-cols-[1fr_1.618fr]">
          <div className="relative order-last h-52 w-full overflow-hidden rounded-2xl border border-[#2e5a7c]/40 lg:order-first lg:h-64">
            <Image
              src={`${IMG}/digital-ecosystem.png`}
              alt="The Colattao digital ecosystem laid out on a cafe table: the Cafe Rush game on a phone, a QR menu display, branded stickers, and a fresh latte"
              fill
              sizes="(max-width: 1024px) 100vw, 620px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Why this beats a normal coffee site</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {advantages.map((item) => (
                <li key={item} className="rounded-xl border border-[#f5c46b]/20 bg-[#2a1208]/65 px-4 py-3 text-[#f5e9d0]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <GlowDivider />

        {/* ── What to order first ── */}
        <section className="rounded-3xl border border-[#f5e9d0]/15 bg-[#1b0e08]/50 p-6 sm:p-8">
          <h2 className="text-center font-serif text-2xl text-[#fff3d6] sm:text-3xl">
            What to order first
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#f5e9d0]/85">
            A few warm places to start — ask the team for the day&apos;s details.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {orderFirst.map((card) => (
              <article
                key={card.title}
                className="overflow-hidden rounded-2xl border border-[#f5c46b]/25 bg-[#2a1208]/55 shadow-lg"
              >
                <div className="relative h-36 w-full">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg text-[#fff3d6]">{card.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#f5e9d0]/80">{card.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href="/menu"
              className="rounded-full border border-[#f5c46b]/60 bg-[#f5c46b] px-6 py-3 text-center font-semibold text-[#2a1208] transition hover:bg-[#ffe1a0]"
            >
              View Live Menu
            </Link>
          </div>
        </section>

        <GlowDivider />

        {/* ── What the customer should do next ── */}
        <section className="rounded-3xl border border-[#2e5a7c]/40 bg-[#1b0e08]/55 p-6 sm:p-8">
          <h2 className="text-center font-serif text-2xl text-[#fff3d6] sm:text-3xl">
            What the customer should do next
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <article className={`relative overflow-hidden rounded-2xl border border-[#f5c46b]/25 bg-[#2a1208]/55 p-5 ${wovenBorder}`}>
              <h3 className="font-serif text-xl text-[#fff3d6]">View the menu</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f5e9d0]/85">
                See what&apos;s pouring today and find your next favorite before you reach the counter.
              </p>
              <Link
                href="/menu"
                className="mt-4 inline-block rounded-full border border-[#f5c46b]/60 bg-[#f5c46b] px-5 py-2.5 text-sm font-semibold text-[#2a1208] transition hover:bg-[#ffe1a0]"
              >
                View Live Menu
              </Link>
            </article>

            <article className={`relative overflow-hidden rounded-2xl border border-[#f5c46b]/25 bg-[#2a1208]/55 p-5 ${wovenBorder}`}>
              <h3 className="font-serif text-xl text-[#fff3d6]">Play Café Rush</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f5e9d0]/85">
                Turn the wait into a moment — a quick, playful catch game with the Colattao spirit.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-full border border-[#f5e9d0]/40 bg-[#1b0e08]/70 px-5 py-2.5 text-sm font-semibold text-[#f5e9d0] transition hover:bg-[#2a1208]"
              >
                Play Café Rush
              </Link>
            </article>

            <article className={`relative overflow-hidden rounded-2xl border border-[#f5c46b]/25 bg-[#2a1208]/55 p-5 ${wovenBorder}`}>
              <h3 className="font-serif text-xl text-[#fff3d6]">Visit the café</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f5e9d0]/85">
                Pull up a chair in the boho-warm space, surrounded by local artwork and good company.
              </p>
            </article>

            <article className={`relative overflow-hidden rounded-2xl border border-[#f5c46b]/25 bg-[#2a1208]/55 p-5 ${wovenBorder}`}>
              <h3 className="font-serif text-xl text-[#fff3d6]">Share the brand</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#f5e9d0]/85">
                Loved it? Share a sticker, a story, or a photo and bring a friend into the Colattao circle.
              </p>
              <Link
                href="/owner-presentation"
                className="mt-4 inline-block rounded-full border border-[#f5e9d0]/40 bg-[#2a1208] px-5 py-2.5 text-sm font-semibold text-[#f5e9d0] transition hover:bg-[#4b2412]"
              >
                Open Owner Presentation
              </Link>
            </article>
          </div>
        </section>

        <GlowDivider />

        <section className="grid items-center gap-6 rounded-3xl border border-[#2e5a7c]/40 bg-[linear-gradient(145deg,#1b0e08_0%,#2a1208_60%,#2e5a7c_100%)] p-6 sm:p-8 lg:grid-cols-[1.618fr_1fr]">
          <div>
            <h2 className="font-serif text-2xl text-[#fff3d6] sm:text-3xl">Visual direction</h2>
            <p className="mt-4 text-[#f5e9d0]/90">
              Colombian heritage with ceramic blue, espresso depth, and parchment warmth. Sombrero
              vueltiao and mochila-inspired patterning can frame sections subtly, while nostalgic-but-modern
              typography keeps the tone premium. Dedicated photography zones can elevate drinks, food, and
              people-centered storytelling.
            </p>
          </div>
          <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-[#f5c46b]/25 sm:h-72">
            <Image
              src={`${IMG}/cultural-still-life.png`}
              alt="A Colombian cultural still life: a ceramic cup of black coffee beside a woven mochila and sombrero vueltiao with fresh coffee cherries"
              fill
              sizes="(max-width: 1024px) 100vw, 400px"
              className="object-cover"
            />
          </div>
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

        <footer className="mt-8 overflow-hidden rounded-3xl border border-[#f5c46b]/30 bg-[#120905]/75">
          <div className="grid grid-cols-2 gap-px bg-[#f5c46b]/15">
            <div className="relative h-40 w-full sm:h-52">
              <Image
                src={`${IMG}/barista-craft.png`}
                alt="A barista pouring a rosetta of latte art into a handmade ceramic cup"
                fill
                sizes="(max-width: 640px) 50vw, 576px"
                className="object-cover"
              />
            </div>
            <div className="relative h-40 w-full sm:h-52">
              <Image
                src={`${IMG}/community-cafe.png`}
                alt="Friends gathered and laughing over coffee in a warm, sunlit Colattao cafe"
                fill
                sizes="(max-width: 640px) 50vw, 576px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="p-6">
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
              Play Café Rush
            </Link>
          </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
