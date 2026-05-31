import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type {
  ConfiguredImage,
  Cta,
  FeatureGridSection,
  ImageSplitSection,
  MenuListSection,
  Section,
  SensoryTrioSection,
  CtaBandSection,
  SiteConfig,
} from "@/config/templates/site-template";

/**
 * Deterministic renderer for a SiteConfig. Given a valid config it always
 * produces the same markup — no randomness, no per-client branching beyond
 * the data itself. The palette is injected as CSS custom properties on the
 * root so every color downstream derives from the six named roles.
 */

type PaletteVars = CSSProperties & Record<`--t-${string}`, string>;

function paletteToVars(config: SiteConfig): PaletteVars {
  const { palette } = config;
  return {
    "--t-ink": palette.ink,
    "--t-surface": palette.surface,
    "--t-parchment": palette.parchment,
    "--t-primary": palette.primary,
    "--t-secondary": palette.secondary,
    "--t-accent": palette.accent,
    "--t-heading": config.typography.heading,
    "--t-body": config.typography.body,
  };
}

function CtaButton({ cta, variant }: { cta: Cta; variant: "primary" | "secondary" }) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] transition";
  const styles =
    variant === "primary"
      ? "bg-[var(--t-primary)] text-[var(--t-surface)] hover:brightness-110"
      : "border border-[var(--t-accent)]/55 bg-[var(--t-accent)]/10 text-[var(--t-parchment)] hover:bg-[var(--t-accent)]/20";
  return (
    <Link href={cta.href} className={`${base} ${styles}`}>
      {cta.label}
    </Link>
  );
}

function Img({ image, className }: { image: ConfiguredImage; className?: string }) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      className={className}
    />
  );
}

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--t-secondary)]">{children}</p>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2
      className="mt-2 text-2xl text-[var(--t-parchment)] sm:text-3xl"
      style={{ fontFamily: "var(--t-heading)" }}
    >
      {children}
    </h2>
  );
}

function FeatureGrid({ section }: { section: FeatureGridSection }) {
  return (
    <section className="px-5 py-9">
      {section.eyebrow ? <SectionEyebrow>{section.eyebrow}</SectionEyebrow> : null}
      <SectionTitle>{section.title}</SectionTitle>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {section.items.map((item) => (
          <article
            key={item.title}
            className="overflow-hidden rounded-2xl border border-[var(--t-accent)]/20 bg-[var(--t-parchment)]/5"
          >
            <Img image={item.image} className="h-40 w-full object-cover" />
            <div className="p-4">
              <h3 className="text-[15px] font-semibold text-[var(--t-parchment)]">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--t-parchment)]/75">
                {item.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ImageSplit({ section }: { section: ImageSplitSection }) {
  const imageFirst = section.imageSide === "left";
  return (
    <section className="px-5 py-9">
      <div
        className={`flex flex-col gap-5 sm:items-center ${
          imageFirst ? "sm:flex-row" : "sm:flex-row-reverse"
        }`}
      >
        <div className="sm:w-1/2">
          <Img
            image={section.image}
            className="w-full rounded-2xl border border-[var(--t-accent)]/20 object-cover"
          />
        </div>
        <div className="sm:w-1/2">
          {section.eyebrow ? <SectionEyebrow>{section.eyebrow}</SectionEyebrow> : null}
          <SectionTitle>{section.title}</SectionTitle>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--t-parchment)]/80">
            {section.text}
          </p>
        </div>
      </div>
    </section>
  );
}

function MenuList({ section }: { section: MenuListSection }) {
  return (
    <section className="px-5 py-9">
      {section.eyebrow ? <SectionEyebrow>{section.eyebrow}</SectionEyebrow> : null}
      <SectionTitle>{section.title}</SectionTitle>
      <div className="mt-6 space-y-7">
        {section.categories.map((cat) => (
          <div key={cat.name}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--t-accent)]">
              {cat.name}
            </h3>
            <ul className="mt-3 space-y-3">
              {cat.items.map((item) => (
                <li key={item.name} className="flex items-baseline gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[var(--t-parchment)]">
                      {item.name}
                      {item.dietary?.length ? (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.14em] text-[var(--t-secondary)]">
                          {item.dietary.join(" · ")}
                        </span>
                      ) : null}
                    </p>
                    {item.note ? (
                      <p className="text-[12px] leading-snug text-[var(--t-parchment)]/65">
                        {item.note}
                      </p>
                    ) : null}
                  </div>
                  <span className="mx-2 flex-1 translate-y-[-3px] border-b border-dotted border-[var(--t-parchment)]/25" />
                  <span className="text-[14px] font-semibold text-[var(--t-parchment)]/90">
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function SensoryTrio({ section }: { section: SensoryTrioSection }) {
  return (
    <section className="px-5 py-9">
      {section.eyebrow ? <SectionEyebrow>{section.eyebrow}</SectionEyebrow> : null}
      <SectionTitle>{section.title}</SectionTitle>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {section.cards.map((card) => (
          <article
            key={card.title}
            className="rounded-2xl border border-[var(--t-accent)]/20 bg-[var(--t-ink)]/40 p-5"
          >
            <h3 className="text-[14px] font-semibold text-[var(--t-accent)]">{card.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--t-parchment)]/75">
              {card.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function CtaBand({ section }: { section: CtaBandSection }) {
  return (
    <section className="px-5 py-9">
      <div className="rounded-3xl border border-[var(--t-accent)]/30 bg-[var(--t-primary)]/10 p-7 text-center">
        {section.eyebrow ? <SectionEyebrow>{section.eyebrow}</SectionEyebrow> : null}
        <h2
          className="mt-2 text-2xl text-[var(--t-parchment)]"
          style={{ fontFamily: "var(--t-heading)" }}
        >
          {section.title}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-[var(--t-parchment)]/80">
          {section.text}
        </p>
        <div className="mt-5">
          <CtaButton cta={section.cta} variant="primary" />
        </div>
      </div>
    </section>
  );
}

function renderSection(section: Section, index: number) {
  switch (section.type) {
    case "feature-grid":
      return <FeatureGrid key={index} section={section} />;
    case "image-split":
      return <ImageSplit key={index} section={section} />;
    case "menu-list":
      return <MenuList key={index} section={section} />;
    case "sensory-trio":
      return <SensoryTrio key={index} section={section} />;
    case "cta-band":
      return <CtaBand key={index} section={section} />;
  }
}

export default function SiteTemplate({ config }: { config: SiteConfig }) {
  const { brand, hero, sections, footer } = config;

  return (
    <main
      style={{ ...paletteToVars(config), fontFamily: "var(--t-body)" }}
      className="mx-auto flex min-h-dvh w-full max-w-[560px] flex-col bg-[var(--t-surface)] text-[var(--t-parchment)]"
    >
      {/* ── Hero ───────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <Image
          src={hero.background.src}
          alt={hero.background.alt}
          width={hero.background.width}
          height={hero.background.height}
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--t-ink)]/55 via-[var(--t-ink)]/65 to-[var(--t-surface)]" />
        <div className="relative px-6 pb-10 pt-14 text-center">
          {/* Hero title is ALWAYS the wordmark image — bespoke AI lettering. */}
          <Img
            image={brand.wordmark}
            className="mx-auto h-auto w-[78%] max-w-[360px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
          />
          <p className="mt-4 text-[12px] uppercase tracking-[0.28em] text-[var(--t-accent)]">
            {brand.tagline}
          </p>
          {hero.headline ? (
            <h1
              className="mx-auto mt-4 max-w-md text-xl leading-snug text-[var(--t-parchment)] sm:text-2xl"
              style={{ fontFamily: "var(--t-heading)" }}
            >
              {hero.headline}
            </h1>
          ) : null}
          {hero.subhead ? (
            <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-[var(--t-parchment)]/80">
              {hero.subhead}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <CtaButton cta={hero.primaryCta} variant="primary" />
            <CtaButton cta={hero.secondaryCta} variant="secondary" />
          </div>
        </div>
      </header>

      {/* ── Sections ───────────────────────────────────────── */}
      {sections.map((section, index) => renderSection(section, index))}

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-[var(--t-accent)]/20 px-5 pb-10 pt-8">
        {brand.logo ? (
          <Img image={brand.logo} className="mb-5 h-auto w-[120px] opacity-90" />
        ) : null}
        <div className="grid gap-5 sm:grid-cols-2">
          {footer.locations.map((loc) => (
            <div key={loc.label}>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--t-accent)]">
                {loc.label}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--t-parchment)]/80">
                {loc.address}
              </p>
              {loc.hours ? (
                <p className="mt-1 text-[12px] text-[var(--t-parchment)]/60">{loc.hours}</p>
              ) : null}
            </div>
          ))}
        </div>
        {footer.socials?.length ? (
          <nav className="mt-6 flex flex-wrap gap-4">
            {footer.socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[var(--t-secondary)] hover:text-[var(--t-accent)]"
              >
                {s.label}
              </Link>
            ))}
          </nav>
        ) : null}
        {footer.finePrint ? (
          <p className="mt-7 text-[10px] uppercase tracking-[0.22em] text-[var(--t-parchment)]/40">
            {footer.finePrint}
          </p>
        ) : null}
      </footer>
    </main>
  );
}
