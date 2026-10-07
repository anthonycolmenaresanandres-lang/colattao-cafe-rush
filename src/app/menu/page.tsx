import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ColattaoGuestNoteForm from "@/components/ColattaoGuestNoteForm";
import { BRAND_LINKS, SITE_NAME, SITE_URL } from "@/config/site";
import appTheme from "@/config/theme";
import { menuCategories } from "@/data/colattaoMenu";
import styles from "./menu.module.css";

export const metadata: Metadata = {
  title: "Menu — Espresso, Matcha, Lattes & Pastries in Virginia Beach",
  description:
    "The full Colattao Coffee House menu in Virginia Beach, VA — espresso and coffee, signature Colombian lattes, matcha, teas, and fresh pastries with prices.",
  alternates: { canonical: "/menu" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/menu`,
    siteName: SITE_NAME,
    title: "Colattao Coffee House Menu — Virginia Beach, VA",
    description:
      "Browse the full Colattao Coffee House menu: espresso, signature Colombian lattes, matcha, teas, and pastries.",
    images: [{ url: "/assets/colattao/og-colattao.jpg", width: 1200, height: 630 }],
  },
};

function parsePrice(price: string | null): string | undefined {
  if (!price) return undefined;
  const match = price.match(/([0-9]+(?:\.[0-9]+)?)/);
  return match ? match[1] : undefined;
}

function buildMenuJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: "Colattao Coffee House Menu",
    url: `${SITE_URL}/menu`,
    inLanguage: "en-US",
    provider: {
      "@type": "CafeOrCoffeeShop",
      name: SITE_NAME,
      url: SITE_URL,
      sameAs: [BRAND_LINKS.website, BRAND_LINKS.instagram],
    },
    hasMenuSection: menuCategories.map((category) => ({
      "@type": "MenuSection",
      name: category.title,
      ...(category.note ? { description: category.note } : {}),
      hasMenuItem: category.items.map((item) => {
        const price = parsePrice(item.price);
        return {
          "@type": "MenuItem",
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(price
            ? {
                offers: {
                  "@type": "Offer",
                  price,
                  priceCurrency: "USD",
                },
              }
            : {}),
        };
      }),
    })),
  };
}

const SEASONAL_ART: Record<string, string> = {
  "Pumpkin Pie Latte": "/assets/colattao/collection/pumpkin-pie.webp",
  "Caramel Apple Latte": "/assets/colattao/collection/caramel-apple.webp",
  "Campfire Cappuccino or Matcha": "/assets/colattao/collection/campfire.webp",
  "Maple Pecan Latte": "/assets/colattao/collection/maple-pecan.webp",
};

const ITEM_DETAILS: Partial<Record<string, { imageSrc: string; imageAlt: string }>> = {
  "Churro Affogato": {
    imageSrc: "/assets/colattao/menu-items/churro-affogato-photo.jpg",
    imageAlt: "Churro Affogato with espresso in a crystal glass",
  },
  "Chocolate Croissant": {
    imageSrc: "/assets/colattao/menu-items/chocolate-croissant-photo.jpg",
    imageAlt: "Chocolate croissant",
  },
  "Pan de Bono": {
    imageSrc: "/assets/colattao/menu-items/pan-de-bono-photo.jpg",
    imageAlt: "Pan de Bono",
  },
  "Cheese Danish": {
    imageSrc: "/assets/colattao/menu-items/cheese-danish-photo.jpg",
    imageAlt: "Cheese Danish",
  },
  "Spinach & Feta": {
    imageSrc: "/assets/colattao/menu-items/spinach-feta-photo.jpg",
    imageAlt: "Spinach and feta pastry",
  },
  Cookies: {
    imageSrc: "/assets/colattao/menu-items/chocolate-chip-cookie-sticker.webp",
    imageAlt: "Cookies",
  },
  "Empanadas, Chicken / Beef": {
    imageSrc: "/assets/colattao/menu-items/empanada-sticker.webp",
    imageAlt: "Chicken and beef empanadas",
  },
  "Almond Croissant": {
    imageSrc: "/assets/colattao/menu-items/almond-croissant-photo.jpg",
    imageAlt: "Almond croissant",
  },
  "Waffle Breakfast": {
    imageSrc: "/assets/colattao/menu-items/waffle-breakfast-photo.jpg",
    imageAlt: "Waffle breakfast",
  },
  Cubano: {
    imageSrc: "/assets/colattao/menu-items/cubano-photo.jpg",
    imageAlt: "Cubano sandwich",
  },
  "Pesto Mozzarella": {
    imageSrc: "/assets/colattao/menu-items/pesto-mozzarella-photo.jpg",
    imageAlt: "Pesto mozzarella croissant",
  },
  Montecristo: {
    imageSrc: "/assets/colattao/menu-items/montecristo-photo.jpg",
    imageAlt: "Montecristo croissant",
  },
  "California Sandwich": {
    imageSrc: "/assets/colattao/menu-items/california-sandwich-photo.jpg",
    imageAlt: "California breakfast sandwich",
  },
  "Ham & Cheesy": {
    imageSrc: "/assets/colattao/menu-items/ham-cheesy-photo.jpg",
    imageAlt: "Ham and cheese croissant",
  },
};

const FOOTER_LINKS = {
  colattaoSite: "https://colattao.com/",
  colattaoInstagram: "https://www.instagram.com/colattao/",
  finaCalle: "https://finacalleos.com/",
};

const seasonalCategory = menuCategories.find((category) => category.id === "fall-drinks");
const standardCategories = menuCategories.filter((category) => category.id !== "fall-drinks");

export default function MenuPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildMenuJsonLd()) }}
      />

      <header className={styles.masthead}>
        <div className={styles.shell}>
          <p className={styles.location}>Virginia Beach, Virginia</p>
          <h1 className="sr-only">Colattao Coffee House menu</h1>
          <a
            href={FOOTER_LINKS.colattaoSite}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.logoLink}
            aria-label="Visit the Colattao Coffee House website"
          >
            <Image
              src={appTheme.brand.logoPath}
              alt="Colattao Coffee House"
              width={1024}
              height={341}
              className={styles.logo}
              preload
            />
          </a>
          <p className={styles.intro}>Coffee, culture and community.</p>
        </div>
      </header>

      <nav className={styles.categoryNav} aria-label="Menu categories">
        <div className={styles.navTrack}>
          {menuCategories.map((category) => (
            <a key={category.id} href={`#${category.id}`}>
              {category.title}
            </a>
          ))}
          <a href="#guest-notes">Guest notes</a>
        </div>
      </nav>

      <div className={styles.shell}>
        {seasonalCategory ? (
          <section id={seasonalCategory.id} className={styles.seasonalSection}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>The seasonal edit</p>
              <h2>{seasonalCategory.title}</h2>
              <p>{seasonalCategory.note}</p>
            </div>

            <div className={styles.seasonalGrid}>
              {seasonalCategory.items.map((item) => (
                <article key={item.name} className={styles.seasonalItem}>
                  <Image
                    src={SEASONAL_ART[item.name]}
                    alt={item.name}
                    width={960}
                    height={960}
                    sizes="(max-width: 700px) 44vw, 250px"
                    className={styles.seasonalImage}
                    loading={item.name === seasonalCategory.items[0]?.name ? "eager" : "lazy"}
                  />
                  <div>
                    <div className={styles.itemHeading}>
                      <h3>{item.name}</h3>
                      <span>{item.price ?? "Ask"}</span>
                    </div>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.originStory} aria-labelledby="origin-title">
          <Image
            src="/assets/colattao/website-concept/origin-coffee-hills.png"
            alt="Coffee trees across green mountain hills at sunrise"
            fill
            sizes="(max-width: 720px) 100vw, 1120px"
            className={styles.originImage}
          />
          <div className={styles.originShade} />
          <div className={styles.originCopy}>
            <p className={styles.eyebrow}>Colombian spirit</p>
            <h2 id="origin-title">Café, cultura y comunidad.</h2>
          </div>
        </section>

        <section id="menu" className={styles.menuCollection} aria-labelledby="menu-title">
          <div className={styles.menuHeading}>
            <p className={styles.eyebrow}>Made for your ritual</p>
            <h2 id="menu-title">The menu</h2>
          </div>

          <div className={styles.categoryGrid}>
            {standardCategories.map((category) => (
              <section key={category.id} id={category.id} className={styles.menuCategory}>
                <div className={styles.categoryHeading}>
                  <h3>{category.title}</h3>
                  {category.note ? <p>{category.note}</p> : null}
                </div>

                <div className={styles.itemList}>
                  {category.items.map((item) => {
                    const detail = ITEM_DETAILS[item.name];
                    return (
                      <article key={item.name} className={styles.menuItem}>
                        <div className={styles.itemHeading}>
                          <h4>{item.name}</h4>
                          <span>{item.price ?? "Ask"}</span>
                        </div>
                        {item.description ? <p>{item.description}</p> : null}
                        {detail ? (
                          <details className={styles.detail}>
                            <summary>View item</summary>
                            <Image
                              src={detail.imageSrc}
                              alt={detail.imageAlt}
                              width={720}
                              height={540}
                              sizes="(max-width: 720px) 88vw, 480px"
                              className={styles.detailImage}
                            />
                          </details>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className={styles.gameInvitation} aria-labelledby="game-title">
          <div>
            <p className={styles.eyebrow}>A little competition with your coffee</p>
            <h2 id="game-title">Think you know the Colattao vibe?</h2>
            <p>Catch the good stuff, dodge the bad vibes and finish the rush.</p>
          </div>
          <Link href="/" className={styles.playButton}>
            Play Fall Rush
          </Link>
        </section>

        <section id="guest-notes" className={styles.guestSection}>
          <div className={styles.guestImageWrap}>
            <Image
              src="/assets/colattao/real-go/heritage-ceramics.webp"
              alt="Blue and white Colombian ceramics displayed at Colattao"
              fill
              sizes="(max-width: 720px) 100vw, 44vw"
              className={styles.guestImage}
            />
          </div>
          <ColattaoGuestNoteForm />
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <Image
            src={appTheme.brand.logoPath}
            alt="Colattao Coffee House"
            width={1024}
            height={341}
            className={styles.footerLogo}
          />
          <div className={styles.footerLinks}>
            <a href={FOOTER_LINKS.colattaoSite} target="_blank" rel="noopener noreferrer">
              Website
            </a>
            <a href={FOOTER_LINKS.colattaoInstagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="#menu">Back to menu</a>
          </div>
          <a
            href={FOOTER_LINKS.finaCalle}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.poweredBy}
          >
            <span>Powered by</span>
            <Image
              src="/assets/colattao/ui/fina-calle-os-emblem.webp"
              alt="Fina Calle OS"
              width={460}
              height={488}
            />
          </a>
        </div>
      </footer>
    </main>
  );
}
