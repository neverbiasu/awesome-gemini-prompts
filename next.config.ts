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
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'preview.redd.it' },
      { protocol: 'https', hostname: 'i.redd.it' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'user-images.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
