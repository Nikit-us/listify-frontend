
import type {NextConfig} from 'next';

const remotePatternsConfig = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
    port: '',
    pathname: '/**',
  },
  {
    protocol: 'http',
    hostname: 'listify-app.site',
    port: '',
    pathname: '/uploads/**',
  },
];

const apiBaseUrlFromEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
if (apiBaseUrlFromEnv) {
  try {
    const envUrl = new URL(apiBaseUrlFromEnv);
    if (envUrl.hostname && envUrl.hostname !== 'listify-app.site') {
      remotePatternsConfig.push({
        protocol: envUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: envUrl.hostname,
        port: envUrl.port || '',
        pathname: '/uploads/**',
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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://listify-app.site/api/:path*',
      },
    ]
  },
};

export default nextConfig;
