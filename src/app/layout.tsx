import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Doxie Dynasty - The Ultimate Dachshund Card Game',
  description: 'Build your ultimate pack of wiener dogs in this fast-paced, family-friendly card game. 10% of profits support dachshund rescue organizations.',
  keywords: 'dachshund, card game, doxie, wiener dog, family game, rescue',
  openGraph: {
    title: 'Doxie Dynasty - The Ultimate Dachshund Card Game',
    description: 'Build your ultimate pack of wiener dogs in this fast-paced, family-friendly card game.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
