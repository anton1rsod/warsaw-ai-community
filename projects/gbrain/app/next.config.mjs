/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  experimental: {
    // Required so that data/_index/index.json + manifest.json are bundled
    // into the serverless function. Next.js's output tracing follows the
    // import graph; it does NOT follow runtime fs.readFileSync calls.
    // Without this, /api/telegram/webhook reads ENOENT on every cold start.
    // See spec §3.7.
    outputFileTracingIncludes: {
      "/api/telegram/webhook": ["./data/_index/**"],
      // Time-boxed debug route (Task 14.1 → 14.2). Needs its own trace
      // entry — outputFileTracingIncludes is per-route. Without it, the
      // verification endpoint would falsely report 503 even when the
      // webhook bundle has the index.
      "/api/debug/index-presence": ["./data/_index/**"]
    }
  }
};
export default nextConfig;
