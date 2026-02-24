import type { NextConfig } from "next";

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
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  // NOTE: No rewrites needed here.
  // app/api/[...path]/route.ts is a catch-all Route Handler that proxies all
  // /api/* requests to the backend server-side (reads BACKEND_URL at request
  // time, never exposes it to the browser, no mixed-content issues).
};

export default nextConfig;
