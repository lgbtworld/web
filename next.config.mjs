import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  onDemandEntries: {
    // Keep more pages warm in dev to reduce recompilation churn.
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 10,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'leaflet$': path.resolve('./src/server/mocks/leaflet.ts'),
        'react-leaflet$': path.resolve('./src/server/mocks/react-leaflet.tsx'),
        '@react-leaflet/core$': path.resolve('./src/server/mocks/react-leaflet-core.ts'),
      };
    } else {
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
      };
    }
    return config;
  },
};

export default nextConfig;
