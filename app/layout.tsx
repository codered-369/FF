import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "TruthBoard - Public Accountability Platform",
  description: "Bringing internet accountability to light. Search the database or share evidence to warn others about toxic behavior, scams, and harassment.",
  openGraph: {
    title: "TruthBoard - Public Accountability Platform",
    description: "Bringing internet accountability to light. Search the database or share evidence to warn others.",
    url: "https://expose-lac-two.vercel.app",
    siteName: "TruthBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TruthBoard - Public Accountability Platform",
    description: "Bringing internet accountability to light. Search the database or share evidence to warn others.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable}`}>
        {children}
      </body>
    </html>
  );
}
