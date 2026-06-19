import type { Metadata } from "next";
import { Inter, Playfair_Display, Cinzel } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import {
  SITE_URL,
  SITE_NAME,
  SITE_LOCALITY,
  SITE_REGION,
  SITE_COUNTRY,
  BRAND_LINKS,
  GOOGLE_SITE_VERIFICATION,
} from "@/config/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

// Engraved Roman capitals — the stoic, sovereign display face for the
// Be Free Craft Ice Cream prospect site (monument/coinage gravitas).
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Colattao Coffee House — Menu & Café Rush | Virginia Beach, VA",
    template: "%s | Colattao Coffee House",
  },
  description:
    "Colattao Coffee House in Virginia Beach, VA — browse the full digital menu of espresso, matcha, signature lattes, and pastries, then play Café Rush to unlock rewards.",
  applicationName: SITE_NAME,
  keywords: [
    "Colattao",
    "Colattao Coffee House",
    "Colattao menu",
    "Colattao Virginia Beach",
    "Colattao coffee",
    "Colattao cafe",
    "Colattao Café Rush",
    "Virginia Beach coffee shop",
    "Colombian coffee Virginia Beach",
    "espresso Virginia Beach",
    "matcha Virginia Beach",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    title: "Colattao Coffee House — Menu & Café Rush | Virginia Beach, VA",
    description:
      "Browse Colattao Coffee House's full digital menu — espresso, matcha, signature lattes, and pastries in Virginia Beach, VA.",
    images: [
      {
        url: "/assets/colattao/og-colattao.jpg",
        width: 1200,
        height: 630,
        alt: "Colattao Coffee House — Digital Menu, Virginia Beach, VA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colattao Coffee House — Menu & Café Rush",
    description:
      "Browse Colattao Coffee House's full digital menu in Virginia Beach, VA.",
    images: ["/assets/colattao/og-colattao.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Emitted only when a verification code is set in the active client config.
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
};

// Site-wide structured data: ties this digital menu to the real Colattao brand
// (via sameAs) so Google can connect it to the coffee house entity.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: SITE_NAME,
  description:
    "Colombian-rooted coffee house in Virginia Beach serving espresso, matcha, signature lattes, and fresh pastries.",
  url: SITE_URL,
  image: `${SITE_URL}/assets/colattao/og-colattao.jpg`,
  servesCuisine: ["Coffee", "Espresso", "Matcha", "Pastries", "Colombian"],
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE_LOCALITY,
    addressRegion: SITE_REGION,
    addressCountry: SITE_COUNTRY,
  },
  hasMenu: `${SITE_URL}/menu`,
  sameAs: [BRAND_LINKS.website, BRAND_LINKS.instagram],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-colattao-page">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        {/*
          Vercel Web Analytics.
          No personal customer data is collected by this app. Vercel Web
          Analytics may provide anonymized traffic insights without cookies.
        */}
        <Analytics />
      </body>
    </html>
  );
}

