import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SpendLens — Free AI Spend Audit",
  description: "Find out if your team is overspending on AI tools. Free audit in 2 minutes.",
  openGraph: {
    title: "SpendLens — Free AI Spend Audit",
    description: "Find out if your team is overspending on AI tools. Free audit in 2 minutes.",
    siteName: "SpendLens",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — Free AI Spend Audit",
    description: "Find out if your team is overspending on AI tools.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}