import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // In dev, skip the server-side optimizer so the browser loads remote
    // images directly — avoids optimizer timeouts on slow connections.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      // Seed halls use Unsplash images; admins can add other hosts as needed.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
