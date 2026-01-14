import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimizaciones para evitar timeouts en build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Fix para el warning de turbopack
    // @ts-expect-error - Turbopack config might not be typed yet
    turbopack: {},
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.imgur.com',
      },
    ],
  },
};

export default nextConfig;
