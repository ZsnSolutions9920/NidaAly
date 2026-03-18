import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.nidaaly.com",
      },
    ],
  },
  // Multi-region subdomain support
  // In production, configure DNS:
  // pk.nidaaly.com -> Pakistan (PKR)
  // ae.nidaaly.com -> UAE (AED)
  // us.nidaaly.com -> USA (USD)
  async headers() {
    return [
      {
        source: "/api/webhooks/:path*",
        headers: [
          { key: "Content-Type", value: "application/json" },
        ],
      },
    ];
  },
};

export default nextConfig;
