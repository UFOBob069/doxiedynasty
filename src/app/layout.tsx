import type { Metadata } from "next";
import { headers } from "next/headers";
import { Bitter, Montserrat } from "next/font/google";
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

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: "Doxie Dynasty | Make Sets. Be the Top Dog.",
    description:
      "Build sets, unleash quirks, and rule game night in Doxie Dynasty—the fast, joyful card game for dachshund lovers.",
    icons: {
      icon: "/cards/card-back.webp",
      shortcut: "/cards/card-back.webp",
    },
    openGraph: {
      title: "Doxie Dynasty Card Game",
      description: "Make sets. Build your dynasty. Be the top dog.",
      images: [{ url: `${origin}/og.png`, width: 1677, height: 943, alt: "Friends playing Doxie Dynasty" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Doxie Dynasty Card Game",
      description: "Make sets. Build your dynasty. Be the top dog.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
