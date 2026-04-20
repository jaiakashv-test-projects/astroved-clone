import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "phplexus.astroved.com",
      },
    ],
  },
};

export default nextConfig;
