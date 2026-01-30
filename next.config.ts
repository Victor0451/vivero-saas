import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Fix para el warning de turbopack
    // @ts-expect-error - Turbopack config might not be typed yet
    turbopack: {},
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      'recharts',
      'lodash',
      'ramda'
    ],
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
