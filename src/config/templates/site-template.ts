/**
 * Site Template — the consistency contract for the white-label café site.
 *
 * This file defines the SHAPE an agentic AI must fill, plus the hard rules
 * that guarantee a consistent, on-brand result every time. The AI produces
 * DATA that conforms to these types — it never writes layout or JSX. A
 * single deterministic renderer (components/template/SiteTemplate.tsx)
 * turns any valid SiteConfig into a finished site.
 *
 * Rule of thumb: if a value isn't expressible here, it isn't allowed on the
 * page. That constraint is the whole point — it's what makes the output
 * predictable across clients.
 */

// ─── Shared primitives ─────────────────────────────────────────────────

/** Every image is required to carry intrinsic dimensions (no layout shift)
 *  and alt text (accessibility is non-negotiable in the contract). */
export interface ConfiguredImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface Cta {
  label: string;
  href: string;
}

// ─── Brand ──────────────────────────────────────────────────────────────

export interface BrandBlock {
  /** Internal slug (lowercase, kebab). e.g. "colattao-go". */
  slug: string;
  /** User-facing name. e.g. "Colattao Go". */
  displayName: string;
  /** One short line under the wordmark. Keep under ~60 chars. */
  tagline: string;
  /**
   * The hero title is ALWAYS this image — bespoke AI lettering, never a web
   * font. This is the deliberate "code can't reproduce this" seam: swapping
   * the file changes the headline typography with zero code changes.
   */
  wordmark: ConfiguredImage;
  /** Optional small mark used in the footer. */
  logo?: ConfiguredImage;
}

// ─── Palette ──────────────────────────────────────────────────────────────

/**
 * Exactly six named roles. Every color on the page derives from these via
 * CSS custom properties set on the page root — no ad-hoc hex values in the
 * renderer. Keeping the palette to fixed roles is what keeps two different
 * clients visually coherent with the same template.
 */
export interface Palette {
  /** Darkest brand color — deep backgrounds, primary text on light. */
  ink: string;
  /** Page background base. */
  surface: string;
  /** Light card / panel surface. */
  parchment: string;
  /** Primary accent — main CTA, key highlights. */
  primary: string;
  /** Secondary accent — supporting buttons, links. */
  secondary: string;
  /** Glow / foil accent — hairlines, soft light, gold. */
  accent: string;
}

export interface Typography {
  /** UI heading font stack (section titles). Hero title is the wordmark image. */
  heading: string;
  /** Body / UI font stack. */
  body: string;
}

// ─── Hero (standard, always present) ───────────────────────────────────

export interface Hero {
  background: ConfiguredImage;
  /** Supporting line shown under the wordmark (optional). */
  headline?: string;
  subhead?: string;
  /** The standard two-button layout. Both buttons are always rendered. */
  primaryCta: Cta;
  secondaryCta: Cta;
}

// ─── Sections (fixed enum of typed variants) ───────────────────────────

export type SectionType =
  | "feature-grid"
  | "image-split"
  | "menu-list"
  | "sensory-trio"
  | "cta-band";

interface SectionBase {
  type: SectionType;
  /** Short eyebrow label above the section title. */
  eyebrow?: string;
  title: string;
}

export interface FeatureGridSection extends SectionBase {
  type: "feature-grid";
  items: { title: string; text: string; image: ConfiguredImage }[];
}

export interface ImageSplitSection extends SectionBase {
  type: "image-split";
  text: string;
  image: ConfiguredImage;
  /** Image side on wide layouts. Defaults to "right". */
  imageSide?: "left" | "right";
}

export interface MenuListSection extends SectionBase {
  type: "menu-list";
  categories: MenuCategory[];
}

export interface SensoryTrioSection extends SectionBase {
  type: "sensory-trio";
  cards: { title: string; text: string }[];
}

export interface CtaBandSection extends SectionBase {
  type: "cta-band";
  text: string;
  cta: Cta;
}

export type Section =
  | FeatureGridSection
  | ImageSplitSection
  | MenuListSection
  | SensoryTrioSection
  | CtaBandSection;

// ─── Menu ───────────────────────────────────────────────────────────────

export type Dietary = "vegan" | "vegetarian" | "gluten-free" | "dairy-free";

export interface MenuItem {
  name: string;
  price: string;
  note?: string;
  dietary?: Dietary[];
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

// ─── Footer ─────────────────────────────────────────────────────────────

export interface SiteLocation {
  label: string;
  address: string;
  hours?: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface Footer {
  locations: SiteLocation[];
  socials?: SocialLink[];
  /** Small print shown at the very bottom. */
  finePrint?: string;
}

// ─── The full config ────────────────────────────────────────────────────

export interface SiteConfig {
  brand: BrandBlock;
  palette: Palette;
  typography: Typography;
  hero: Hero;
  sections: Section[];
  footer: Footer;
}

// ─── Consistency rules (verifiable constants) ──────────────────────────

/**
 * These are the hard rules the renderer and any generator must honor. They
 * exist so "consistent" is measurable, not a matter of taste.
 */
export const TEMPLATE_RULES = {
  /** Mobile-first content column. Matches the rest of the app. */
  maxContentWidth: 560,
  /** The hero title is always an image, never live text. */
  heroTitleIsImage: true,
  /** The hero always renders exactly two CTA buttons. */
  heroButtonCount: 2,
  /** Palette is limited to these six roles — nothing else. */
  paletteRoles: ["ink", "surface", "parchment", "primary", "secondary", "accent"] as const,
  /** Sections may only be one of these types. */
  allowedSectionTypes: [
    "feature-grid",
    "image-split",
    "menu-list",
    "sensory-trio",
    "cta-band",
  ] as const,
  /** Every image must declare width, height, and non-empty alt text. */
  imagesRequireDimensionsAndAlt: true,
  /** Target widths that must render with no horizontal overflow. */
  responsiveWidths: [320, 390, 430, 560] as const,
} as const;
