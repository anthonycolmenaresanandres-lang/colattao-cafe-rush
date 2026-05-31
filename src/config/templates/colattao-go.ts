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

const REAL = "/assets/colattao/real-go";

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
      src: `${REAL}/hero-brand-lounge.webp`,
      width: 1122,
      height: 1402,
      alt: "A latte in a blue floral cup beside pistachio tres leches under the Colattao Coffee House sign",
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
      eyebrow: "Our space",
      title: "A room full of stories",
      text: "Hand-painted blue-and-white ceramics, warm brick, and little details everywhere you look. We built a space that feels like a Colombian home — somewhere to slow down, even on a grab-and-go morning.",
      image: {
        src: `${REAL}/heritage-ceramics.webp`,
        width: 1122,
        height: 1402,
        alt: "A shelf of hand-painted blue-and-white ceramics with a Colattao Coffee House plate",
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
          title: "Signature coffee",
          text: "House lattes with art in every cup, paired with something sweet.",
          image: {
            src: `${REAL}/coffee-pairing.webp`,
            width: 1122,
            height: 1402,
            alt: "A latte with leaf latte art in a blue floral cup beside a spiced cake slice",
          },
        },
        {
          title: "Pistachio tres leches",
          text: "Our signature soaked cake, pistachio-crusted and milk-rich.",
          image: {
            src: `${REAL}/pistachio-tres-leches.webp`,
            width: 1122,
            height: 1402,
            alt: "A slice of pistachio tres leches cake on a gold-rimmed plate",
          },
        },
        {
          title: "Raspberry cheesecake",
          text: "Creamy and gold-rimmed, finished with fresh raspberries and mint.",
          image: {
            src: `${REAL}/raspberry-cheesecake.webp`,
            width: 1122,
            height: 1402,
            alt: "A raspberry cheesecake topped with berries and mint on a gold-rimmed plate",
          },
        },
        {
          title: "The lounge",
          text: "Fireside seating and chandeliers — room to linger over coffee.",
          image: {
            src: `${REAL}/lounge-fireside.webp`,
            width: 1122,
            height: 1402,
            alt: "Guests gathered around a fireplace under a chandelier in the Colattao lounge",
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
