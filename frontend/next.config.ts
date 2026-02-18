import type { NextConfig } from "next";

/**
 * Backend origin used by the /api rewrite proxy.
 *
 * Set BACKEND_URL as a **server-only** environment variable in Vercel
 * (no NEXT_PUBLIC_ prefix) so it is never exposed to the browser.
 *
 * Example Vercel env var:
 *   BACKEND_URL = http://54.84.227.171:8000
 *
 * For local development the default falls back to localhost:8000.
 */
const BACKEND_URL =
  process.env.BACKEND_URL?.replace(/\/+$/, "") ||
  "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        // Every request the browser sends to /api/* is transparently
        // proxied server-side to the backend. Because the proxy runs on
        // Vercel's servers (not in the browser), there is no mixed-content
        // issue even when the backend speaks plain HTTP.
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
