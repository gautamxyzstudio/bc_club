import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.69"],

  images: {
    // Listing photos don't change: keep resized copies for 30 days instead of re-resizing every few hours
    minimumCacheTTL: 2592000,
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  reactStrictMode: false,

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.bcrealestatemarket.com",
          },
        ],
        destination: "https://bcrealestatemarket.com/:path*",
        permanent: true,
      },
      {
        source: "/market-trends",
        destination: "/market-trends/monthly-sales-reports",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
