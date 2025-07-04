
import type {NextConfig} from 'next';

// Безопасно использовать process.env, так как next.config.js выполняется в среде Node.js
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const apiUrl = new URL(apiBaseUrl);

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: apiUrl.protocol.replace(':', ''), // 'http' или 'https'
        hostname: apiUrl.hostname, // домен вашего API, например 'listify-app.site' или 'localhost'
        port: apiUrl.port || '', // порт, например '8080' или пустая строка
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
