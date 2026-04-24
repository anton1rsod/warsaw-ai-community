import type { ReactNode } from "react";

export const metadata = {
  title: "GBrain",
  description: "Warsaw AI Community knowledge bot"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
