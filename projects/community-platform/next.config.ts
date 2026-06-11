import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // v0.12 Phase 4.4 (H155 backstop) — pin the vendored OG fonts into the
  // route's function bundle. The literal join(process.cwd(), "assets/og/…")
  // reads are usually traced statically, but a missed trace is a prod-only
  // 500 (dev serves from cwd) — pin explicitly, cost-free when redundant.
  outputFileTracingIncludes: {
    "/members/[slug]/opengraph-image": ["./assets/og/**"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default config;
