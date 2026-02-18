import type { NextConfig } from "next";

/**
 * Backend origin used by the /api rewrite proxy.
 *
 * Priority (highest → lowest):
 *  1. BACKEND_URL  — server-only env var set in Vercel dashboard (recommended)
 *  2. Hardcoded EC2 production IP — ensures Vercel works even if the env var
 *     is not yet configured (safe default for this project)
 *
 * For local development override with BACKEND_URL=http://localhost:8000 in
 * your .env.local file.
 *
 * ⚠️  Never use a NEXT_PUBLIC_ prefix here — the destination must NOT be
 *     exposed to the browser. The proxy runs server-side on Vercel's infra,
 *     so server→EC2 HTTP traffic is not subject to mixed-content policy.
 */
const BACKEND_URL =
  process.env.BACKEND_URL?.replace(/\/+$/, "") ||
  "http://54.84.227.171:8000";

const nextConfig: NextConfig = {
  // "standalone" is for self-hosted Docker deployments only.
  // On Vercel this setting interferes with serverless route handlers (API proxy).
  // Keep it only when NOT running on Vercel.
  ...(process.env.VERCEL ? {} : {
    output: "standalone",
    outputFileTracingRoot: __dirname,
  }),
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
