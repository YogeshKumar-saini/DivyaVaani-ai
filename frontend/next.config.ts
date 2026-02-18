import type { NextConfig } from "next";

/**
 * Backend origin used by the /api rewrite proxy.
 *
 * Set BACKEND_URL in:
 *  - frontend/.env.local  for local development  (e.g. http://localhost:8000)
 *  - Vercel dashboard → Environment Variables   for production
 *
 * ⚠️  Never use a NEXT_PUBLIC_ prefix — the destination must NOT be exposed
 *     to the browser. The proxy runs server-side so HTTP→backend traffic is
 *     not subject to the browser's mixed-content policy.
 */
const BACKEND_URL = (process.env.BACKEND_URL ?? '').replace(/\/+$/, '');
if (!BACKEND_URL) {
  console.error(
    '[next.config.ts] BACKEND_URL is not set. ' +
    'Add it to frontend/.env.local or the Vercel dashboard.'
  );
}

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
