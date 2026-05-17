import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Warsaw AI Community",
  description: "Member-shaped read of the Warsaw AI Community.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
