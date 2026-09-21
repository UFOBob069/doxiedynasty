import type { Metadata } from "next";
import { Bitter, Montserrat } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Bitter({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const body = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Doxie Dynasty Card Game | A Dachshund Game for Game Night",
  description:
    "Meet Doxie Dynasty, a fast 90-card dachshund game for 2–6 players. Build matching packs, play clever quirks, and become the top dog in 20–30 minutes.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/cards/card-back.webp",
    shortcut: "/cards/card-back.webp",
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
  openGraph: {
    title: "Doxie Dynasty Card Game",
    description:
      "A fast, joyful set-collection card game for dachshund lovers, families, and game-night packs.",
    images: [{ url: "/og.png", width: 1677, height: 943, alt: "Friends playing Doxie Dynasty" }],
    locale: "en_US",
    siteName: "Doxie Dynasty",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Doxie Dynasty Card Game",
    description: "Make sets. Build your dynasty. Be the top dog.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
