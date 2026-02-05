import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {

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
