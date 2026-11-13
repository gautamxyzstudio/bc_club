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

  // Map search frame (public/bcnearby): the big data file and map libraries rarely change; their URLs carry ?v=
  async headers() {
    const longCache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
    return [
      { source: "/bcnearby/vendor/:path*", headers: longCache },
      { source: "/bcnearby/bcnearby-data.js", headers: longCache },
    ];
  },

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
