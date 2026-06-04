import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    products: {
      stale: 300,       // 5 min: serve from cache without revalidation check
      revalidate: 900,  // 15 min: revalidate in background after this
      expire: 3600,     // 1 hour: force-regenerate after this
    },
    featured: {
      stale: 600,
      revalidate: 1800,
      expire: 3600,
    },
    categories: {
      stale: 600,
      revalidate: 1800,
      expire: 3600,
    },
    promo: {
      stale: 60,
      revalidate: 180,
      expire: 300,
    },
    search: {
      stale: 30,
      revalidate: 120,
      expire: 600,
    },
    static: {
      stale: 3600,        // 1 hour: serve without revalidation check
      revalidate: 86400,  // 24 hours: revalidate in background daily
      expire: 31536000,   // 1 year: force-regenerate after this
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i8qy5y6gxkdgdcv9.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
