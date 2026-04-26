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
      "/api/telegram/webhook": ["./data/_index/**"]
    }
  }
};
export default nextConfig;
