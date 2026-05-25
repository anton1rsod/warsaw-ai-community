import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Inter, JetBrains_Mono } from "next/font/google";
import { RootShell } from "@/app/components/RootShell";
import "./globals.css";

// Fraunces is a variable font — weight: "variable" + axes for personality control
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Geist (Vercel) — the brand wordmark family. v0.7 brand v1.2 wire-in: used for
// the Header nav + /handbook masthead headline so live text matches the Geist
// lockup (brand.md §10 chrome exception). Other display surfaces stay Fraunces.
const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Subploters",
  description: "Where Subploters learn, ship, and find each other.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Subploters",
    description: "Where Subploters learn, ship, and find each other.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" className={`${fraunces.variable} ${geist.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen flex flex-col">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
