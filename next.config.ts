
import type {NextConfig} from 'next';

// Base remote patterns that are always included
const remotePatternsConfig = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'https', // Assuming listify-app.site is over HTTPS
    hostname: 'listify-app.site',
    port: '', // Default port for https
    pathname: '/uploads/**', // From the error: /uploads/ads/...
  },
];

// Attempt to add hostname from environment variable if it's set and different
const apiBaseUrlFromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
if (apiBaseUrlFromEnv) {
  try {
    const envUrl = new URL(apiBaseUrlFromEnv);
    // Add if the hostname is different from what's already hardcoded
    if (envUrl.hostname && envUrl.hostname !== 'listify-app.site') {
      remotePatternsConfig.push({
        protocol: envUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: envUrl.hostname,
        port: envUrl.port || '', // Use explicit port if present in URL
        pathname: '/uploads/**', // Assuming a consistent path for uploads
      });
    }
  } catch (error) {
    console.warn(`Invalid NEXT_PUBLIC_API_BASE_URL ("${apiBaseUrlFromEnv}") for image processing in next.config.ts:`, error);
  }
}

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: remotePatternsConfig,
  },
};

export default nextConfig;
