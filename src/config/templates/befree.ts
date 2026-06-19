import type { SiteConfig } from "./site-template";

/**
 * Be Free Craft Ice Cream — prospect preview (Virginia Beach).
 *
 * Pure DATA filled from the client's menu boards, logo, and in-store art.
 * SiteTemplate renders it deterministically. Brand language mirrors their
 * real chalkboards: matte black, cream hand-lettering, gold.
 *
 * Assets: real BE FREE brush wordmark + the gold "Bone Frog & Samurai" mural
 * (by Jess Kaban). Food/lifestyle photos to be added once the client supplies
 * them. Prices transcribed from in-store boards — owner to verify before go-live.
 */

const A = "/assets/befree";

export const befreeConfig: SiteConfig = {
  brand: {
    slug: "be-free",
    displayName: "Be Free Craft Ice Cream",
    tagline: "Real Ingredients · No Apologies",
    wordmark: { src: `${A}/be-free-logo.jpg`, width: 360, height: 357, alt: "Be Free" },
    logo: { src: `${A}/be-free-logo.jpg`, width: 360, height: 357, alt: "Be Free Craft Ice Cream" },
  },

  palette: {
    ink: "#0A0A08",
    surface: "#14130E",
    parchment: "#F1E7CF",
    primary: "#C7A23E",
    secondary: "#B08D57",
    accent: "#E2BB52",
  },

  typography: {
    heading: '"Oswald", "Bebas Neue", Impact, "Arial Narrow", system-ui, sans-serif',
    body: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  },

  hero: {
    background: {
      src: `${A}/samurai-art.jpg`,
      width: 720,
      height: 960,
      alt: "The gold Bone Frog & Samurai mural on the Be Free café wall",
    },
    headline: "Veteran-crafted small-batch ice cream.",
    subhead:
      "Hand-crafted scoops & gelato, chef-made pastries, and craft espresso in Virginia Beach. Real ingredients, no shortcuts.",
    primaryCta: { label: "See the menu", href: "#menu" },
    secondaryCta: { label: "Our story", href: "#story" },
  },

  sections: [
    {
      type: "sensory-trio",
      eyebrow: "Who we are",
      title: "Crafted with gratitude",
      cards: [
        {
          title: "Veteran-crafted",
          text: "Founded by a Navy SEAL, trained at Penn State's Berkey Creamery. Discipline you can taste in every batch.",
        },
        {
          title: "Real ingredients",
          text: "Small-batch, whole-dairy ice cream and gelato — plus vegan and non-dairy. No apologies, no shortcuts.",
        },
        {
          title: "Made to be shared",
          text: "Every sale supports Gold Star families through the Kyle Milliken Foundation.",
        },
      ],
    },
    {
      type: "menu-list",
      eyebrow: "Order at the counter",
      title: "The Menu",
      categories: [
        {
          name: "Craft Scoops",
          items: [
            { name: "Single scoop", price: "$5.95" },
            { name: "Double scoop", price: "$7.95" },
            { name: "Triple scoop", price: "$9.95" },
            { name: "Vegan / non-dairy scoop", price: "+$1", dietary: ["vegan", "dairy-free"] },
            { name: "Housemade waffle cone", price: "$1.50" },
            { name: "Waffle cone", price: "$1.00" },
            { name: "Cake cone", price: "Free" },
          ],
        },
        {
          name: "Signature Flavors",
          items: [
            { name: "Vanilla Valhalla", price: "" },
            { name: "Dark Matter", price: "", note: "Dutch dark chocolate" },
            { name: "Milli Mint Cookie Chip", price: "" },
            { name: "Strawberry Sabre", price: "" },
            { name: "Reese's Reloaded", price: "" },
            { name: "Banana Stracciatella", price: "" },
            { name: "Pointman Pistachio", price: "" },
            { name: "Sea Salt Assault", price: "", note: "Sea salt with pralined pecans" },
            { name: "Confetti Cake Pop", price: "" },
            { name: "Cookie Commandough", price: "" },
            { name: "Be Free Espresso Brownie Chip", price: "" },
            { name: "Blackout Cherry Chip", price: "" },
          ],
        },
        {
          name: "Vegan / Non-Dairy",
          items: [
            { name: "Coconut Creme", price: "", dietary: ["vegan", "dairy-free"] },
            { name: "Sorbet Special", price: "", dietary: ["vegan", "dairy-free"] },
            { name: "Vanilla Valhalla", price: "", dietary: ["vegan", "dairy-free"] },
            { name: "Dark Matter", price: "", dietary: ["vegan", "dairy-free"] },
          ],
        },
        {
          name: "Floats & Affogato",
          items: [
            { name: "Float — root beer or cold brew", price: "$9" },
            { name: "Affogato — double espresso over ice cream", price: "" },
          ],
        },
        {
          name: "Toppings & Sauces",
          items: [
            {
              name: "Toppings",
              price: "",
              note: "Jimmies, cookie crumble, brown sugar pecans, crushed waffle cone, Reese's cup, mini M&M, chocolate chips, whip cream",
            },
            {
              name: "Sauces",
              price: "",
              note: "Caramel, chocolate, white chocolate, peanut butter, strawberry, raspberry",
            },
          ],
        },
        {
          name: "Coffee",
          items: [
            { name: "Brewed coffee", price: "$4.95 / $5.50" },
            { name: "Café au lait", price: "$4.75 / $5.75" },
            { name: "Americano", price: "$5.00 / $5.75" },
            { name: "Cortado", price: "$5.00" },
            { name: "Cappuccino", price: "$6.25 / $7.25" },
            { name: "Latte", price: "$6.25 / $7.25" },
            { name: "Draft cold brew", price: "$6.50 / $7.25" },
            { name: "Shaken espresso", price: "$7.00 / $8.25" },
            { name: "Mocha", price: "$7.00 / $8.00" },
          ],
        },
        {
          name: "Craft Drinks",
          items: [
            { name: "Chai", price: "$6 / $7" },
            { name: "Matcha", price: "$6 / $7" },
            { name: "Sorbet refresher", price: "" },
            {
              name: "Add a flavor",
              price: "",
              note: "1883 syrups: vanilla, caramel, hazelnut, toffee, white/dark chocolate, raspberry, toasted marshmallow, lavender, coconut, brown sugar, chocolate cookie · sugar-free vanilla & hazelnut",
            },
          ],
        },
        {
          name: "Be Free Signature Lattes",
          items: [
            { name: "Maple Sea Salt", price: "" },
            { name: "Pistachio", price: "" },
            { name: "Ask for this week's specials", price: "" },
          ],
        },
        {
          name: "Bakery",
          items: [
            {
              name: "Laminated croissants",
              price: "",
              note: "Classic butter · chocolate · ham & cheddar · cream cheese · bacon-egg-cheese · sweet & savory specials",
            },
            {
              name: "Brioche donuts (weekends)",
              price: "",
              note: "Honey-dipped, baker's choice & donut holes",
            },
            {
              name: "Pastry Town",
              price: "",
              note: "Cinnamon buns, fudgy brownies, cookies, scones, oatmeal cream pies, quiche, bars & more",
            },
            { name: "Pastry boxes", price: "", note: "Box of 6 · box of 12 · mini pastries" },
            { name: "Ice cream sandwich", price: "", note: "Built on a fresh-baked pastry" },
          ],
        },
      ],
    },
    {
      type: "cta-band",
      eyebrow: "Built with courage",
      title: "Find us in Virginia Beach",
      text: "Pull up to the counter for a scoop, a pastry, and a craft espresso — or grab a pint to take home.",
      cta: { label: "Get directions", href: "https://maps.google.com/?q=Be+Free+Craft+Ice+Cream+2336+Elson+Green+Ave+Virginia+Beach" },
    },
  ],

  footer: {
    locations: [
      {
        label: "Be Free Café",
        address: "2336 Elson Green Ave #107, Virginia Beach, VA 23456 · (757) 301-2578",
        hours: "Mon–Thu 7a–8p · Fri 7a–9p · Sat–Sun 8a–8p",
      },
    ],
    socials: [
      { label: "Instagram", href: "https://www.instagram.com/befreecrafticecream/" },
      { label: "Website", href: "https://befreeicecream.com/" },
    ],
    finePrint:
      "Be Free Craft Ice Cream · Veteran owned · Virginia Beach, VA · Wall art: Bone Frog & Samurai by Jess Kaban · Draft preview by Fina Calle",
  },
};

export default befreeConfig;
