import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://54.84.227.171:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
