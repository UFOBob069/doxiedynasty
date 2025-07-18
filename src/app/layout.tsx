import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";

export const metadata: Metadata = {
  title: "AgentMoneyTracker: Real Estate Agent Commission, Expense & Cap Tracking",
  description: "Track your real estate commissions, expenses, caps, and tax estimates in one place. Built for agents. Fast, easy, and mobile-friendly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Header />
        <div className="min-h-[80vh]">
          {children}
        </div>
      </body>
    </html>
  );
}
