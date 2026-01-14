import type { NextConfig } from "next";
// @ts-expect-error - El paquete puede no tener tipos TypeScript perfectos
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // Deshabilitar PWA en desarrollo para evitar problemas de recarga y caché
  disable: process.env.NODE_ENV === "development",
  // Estrategias de caché
  register: true,
  skipWaiting: true,
  // Opciones para evitar conflictos con App Router y Server Actions
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

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

export default withPWA(nextConfig);
