import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@heroui/react',
    '@heroui/system',
    '@heroui/theme',
    '@react-aria/visually-hidden'
  ],
  experimental: {
    optimizePackageImports: ['@heroui/react'],
  },
};

export default nextConfig;
