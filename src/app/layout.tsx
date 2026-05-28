import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Colattao Café Rush",
  description:
    "A premium mobile café game from Colattao Coffee House — Virginia Beach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-colattao-page">
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
