import type { NextConfig } from 'next';

/** Dev-only proxy target for `/backend/*` → local Express `/api/*`. Override if your server uses another port. */
const backendRewriteTarget =
  process.env.BACKEND_REWRITE_TARGET?.replace(/\/$/, '') ||
  'http://localhost:5000/api';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return [];
    }
    return [
      {
        source: '/backend/:path*',
        destination: `${backendRewriteTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
