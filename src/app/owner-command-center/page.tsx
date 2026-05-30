import Link from "next/link";

export const metadata = {
  title: "Colattao Command Center",
  description: "Static owner command-center concept for Colattao digital ecosystem.",
};

const ACTIVE_MODULES = [
  "Café Rush Game",
  "Digital Menu",
  "Website Concept",
  "Stickers / QR Campaign",
  "Menu Highlights",
  "Favorite Hearts",
  "Feedback Inbox",
];

const OWNER_MISSIONS = [
  "Confirm official milk options",
  "Revisar productos destacados del mes.",
  "Review sticker designs",
  "Approve website direction",
  "Decide Square ordering path",
  "Test Instagram bio link",
];

const LOCKED_MODULES = [
  "Square ordering",
  "Instagram ordering",
  "Loyalty rewards",
  "Monthly report",
];

export default function OwnerCommandCenterPage() {
  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_20%_10%,#2e5a7c22_0%,transparent_36%),radial-gradient(circle_at_80%_15%,#d990281f_0%,transparent_30%),linear-gradient(180deg,#120904_0%,#1b0e08_45%,#2a1208_100%)] px-4 py-8 text-[#fff3d6] sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-7">
        <section className="rounded-3xl border border-[#f5c46b33] bg-[#1b0e08]/75 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)] backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#92aecd]">Mission Control</p>
          <h1 className="mt-3 font-serif text-3xl text-[#fff3d6] sm:text-4xl">Colattao Command Center</h1>
          <p className="mt-3 max-w-3xl text-sm text-[#f4deba]/85 sm:text-base">
            A game-style owner interface for managing the digital ecosystem. El menú digital ahora combina textura visual, imágenes por categoría, opciones de leche y una experiencia más premium sin perder claridad para ordenar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="rounded-full border border-[#f5c46b66] bg-[#d99028] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#2a1208] transition hover:bg-[#f5c46b]"
            >
              View Menu
            </Link>
            <Link
              href="/website-concept"
              className="rounded-full border border-[#92aecd66] bg-[#2e5a7c33] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#dbe7f3] transition hover:bg-[#2e5a7c55]"
            >
              Open Website Concept
            </Link>
            <Link
              href="/owner-presentation"
              className="rounded-full border border-[#f5c46b55] bg-[#fff3d61a] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#fff3d6] transition hover:bg-[#fff3d629]"
            >
              Open Owner Presentation
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">Active Modules</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVE_MODULES.map((module) => (
              <article
                key={module}
                className="rounded-2xl border border-[#f5c46b2f] bg-[#fff3d610] p-4 shadow-[0_14px_35px_-24px_rgba(0,0,0,0.9)]"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#92aecd]">Module Online</p>
                <p className="mt-2 text-sm font-semibold text-[#fff3d6]">{module}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">Owner Missions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {OWNER_MISSIONS.map((mission, index) => (
              <article
                key={mission}
                className="rounded-2xl border border-[#92aecd38] bg-[#2e5a7c18] p-4 shadow-[0_14px_35px_-24px_rgba(0,0,0,0.9)]"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#f5c46b]">Quest {index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-[#fff3d6]">{mission}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#f5c46b30] bg-[#fff3d60f] p-6">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">Analytics Preview</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#f5c46b2a] bg-[#1b0e08]/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">Menu visits</p>
              <p className="mt-2 text-sm font-semibold text-[#fff3d6]">Demo</p>
            </div>
            <div className="rounded-2xl border border-[#f5c46b2a] bg-[#1b0e08]/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">Favorite taps</p>
              <p className="mt-2 text-sm font-semibold text-[#fff3d6]">Demo</p>
            </div>
            <div className="rounded-2xl border border-[#f5c46b2a] bg-[#1b0e08]/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">Top item</p>
              <p className="mt-2 text-sm font-semibold text-[#fff3d6]">Demo</p>
            </div>
            <div className="rounded-2xl border border-[#f5c46b2a] bg-[#1b0e08]/55 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#92aecd]">QR scans</p>
              <p className="mt-2 text-sm font-semibold text-[#fff3d6]">Demo</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-[#f4deba]/80">
            Demo interface. Real analytics require production traffic and approved tracking access.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold uppercase tracking-[0.18em] text-[#f5c46b]">Locked Future Modules</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LOCKED_MODULES.map((module) => (
              <article
                key={module}
                className="rounded-2xl border border-dashed border-[#f5c46b38] bg-[#120904]/65 p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#d99028]">Locked</p>
                <p className="mt-2 text-sm font-semibold text-[#f4deba]">{module}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#f5c46b33] bg-[#1b0e08]/75 p-6 text-center">
          <p className="text-sm text-[#fff3d6] sm:text-base">
            This is how the owner side could feel: simple, visual, and upgradeable.
          </p>
        </section>
      </div>
    </main>
  );
}
