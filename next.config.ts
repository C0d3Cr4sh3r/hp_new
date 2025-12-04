import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'hp-new-vert.vercel.app',
        pathname: '/api/placeholder/**',
      },
    ],
  },
}

export default nextConfig;
