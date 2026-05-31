import type { SiteConfig } from "./site-template";

/**
 * Colattao Go — demo instance of the white-label template.
 *
 * This is pure DATA: exactly the kind of config an agentic AI would fill
 * from a new café's logo, photos, palette, and rules. Nothing here is
 * layout — SiteTemplate renders it deterministically.
 *
 * Hero wordmark: placeholder using the existing Colattao logo. Drop a real
 * "Colattao Go" lettering PNG into brand.wordmark.src (with its true width/
 * height) to change the headline typography — no code change required.
 */

const CONCEPT = "/assets/colattao/website-concept";

export const colattaoGoConfig: SiteConfig = {
  brand: {
    slug: "colattao-go",
    displayName: "Colattao Go",
    tagline: "From Colombia, with warmth",
    wordmark: {
      // PLACEHOLDER — swap for bespoke "Colattao Go" AI lettering.
      src: "/assets/colattao/logo/colattao-logo.png",
      width: 1024,
      height: 341,
      alt: "Colattao Go",
    },
    logo: {
      src: "/assets/colattao/logo/colattao-logo.png",
      width: 1024,
      height: 341,
      alt: "Colattao Go logo",
    },
  },

  palette: {
    ink: "#150A05",
    surface: "#1B0E08",
    parchment: "#F5E9D0",
    primary: "#D99028",
    secondary: "#5887AB",
    accent: "#D4A24C",
  },

  typography: {
    heading: '"Playfair Display", Georgia, "Times New Roman", serif',
    body: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  },

  hero: {
    background: {
      src: `${CONCEPT}/hero-interior.png`,
      width: 1672,
      height: 941,
      alt: "Warm, plant-filled Colattao café interior at golden hour",
    },
    headline: "Colombian coffee, grab-and-go warmth.",
    subhead:
      "Single-origin espresso, fresh pastries, and a café that feels like a Sunday morning back home — built for the line out the door.",
    primaryCta: { label: "Ver menú", href: "#menu" },
    secondaryCta: { label: "Jugar Café Rush", href: "/" },
  },

  sections: [
    {
      type: "sensory-trio",
      eyebrow: "The first sip",
      title: "What Colattao Go feels like",
      cards: [
        {
          title: "Steam",
          text: "The first curl of steam off a fresh pour — that quiet promise of warmth before the first sip.",
        },
        {
          title: "Warm bread",
          text: "Pastries just out of the oven, buttery and golden, pulling you toward the counter.",
        },
        {
          title: "Colombian soul",
          text: "Single-origin roots, woven texture, and music that feels like home.",
        },
      ],
    },
    {
      type: "image-split",
      eyebrow: "Our origin",
      title: "Grown in the Colombian highlands",
      text: "Every cup traces back to misty hillsides and hands that harvest by sunrise. We roast for balance — bright, smooth, and never bitter — so the fast cup still tastes like craft.",
      image: {
        src: `${CONCEPT}/origin-coffee-hills.png`,
        width: 1672,
        height: 941,
        alt: "A coffee grower harvesting ripe cherries at sunrise over the misty Colombian highlands",
      },
      imageSide: "left",
    },
    {
      type: "menu-list",
      eyebrow: "Order first",
      title: "Menu",
      categories: [
        {
          name: "Espresso & coffee",
          items: [
            { name: "Cafecito", price: "$3.25", note: "House single-origin espresso, double shot." },
            { name: "Cortado", price: "$4.00", note: "Equal parts espresso and steamed milk." },
            { name: "Signature iced latte", price: "$5.75", note: "Cinnamon-dusted cold foam." },
            { name: "Cold brew", price: "$4.50", dietary: ["vegan", "dairy-free"] },
          ],
        },
        {
          name: "Pastries & bites",
          items: [
            { name: "Butter croissant", price: "$3.75", note: "Flaky, baked fresh each morning." },
            { name: "Pistachio tres leches", price: "$6.25" },
            { name: "Cheesecake slice", price: "$5.50", dietary: ["vegetarian"] },
          ],
        },
      ],
    },
    {
      type: "feature-grid",
      eyebrow: "More than coffee",
      title: "The Colattao Go experience",
      items: [
        {
          title: "Signature drinks",
          text: "Seasonal craft pours you won't find at the chain on the corner.",
          image: {
            src: `${CONCEPT}/signature-drink.png`,
            width: 1122,
            height: 1402,
            alt: "A tall iced signature latte with cinnamon-dusted cold foam in warm natural light",
          },
        },
        {
          title: "Fresh pastries",
          text: "Buttery, golden, and gone by mid-morning. Get there early.",
          image: {
            src: `${CONCEPT}/pastry-showcase.png`,
            width: 1122,
            height: 1402,
            alt: "A flaky croissant with chocolate beside a latte-art cappuccino on a sunlit marble table",
          },
        },
        {
          title: "Barista craft",
          text: "Latte art and pour-overs made by people who care about the cup.",
          image: {
            src: `${CONCEPT}/barista-craft.png`,
            width: 1122,
            height: 1402,
            alt: "A barista pouring delicate latte art into a handmade ceramic cup",
          },
        },
        {
          title: "Community café",
          text: "A warm, plant-filled room built for catching up over coffee.",
          image: {
            src: `${CONCEPT}/community-cafe.png`,
            width: 1672,
            height: 941,
            alt: "Friends laughing together over coffee at a warm, plant-filled Colattao café table",
          },
        },
      ],
    },
    {
      type: "cta-band",
      eyebrow: "Scan. Sip. Go.",
      title: "Skip the wait",
      text: "Scan at the counter, play a quick round of Café Rush while we pull your shot, and grab it warm on your way out.",
      cta: { label: "Jugar Café Rush", href: "/" },
    },
  ],

  footer: {
    locations: [
      {
        label: "Hilltop",
        address: "Virginia Beach, VA",
        hours: "Mon–Sun · 7am–7pm",
      },
      {
        label: "Town Center",
        address: "Virginia Beach, VA",
        hours: "Mon–Sun · 7am–8pm",
      },
    ],
    socials: [{ label: "Instagram", href: "#" }],
    finePrint: "Colattao Go · Demo concept · Internal R&D",
  },
};

export default colattaoGoConfig;
