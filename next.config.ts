import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Optimize for production build
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
