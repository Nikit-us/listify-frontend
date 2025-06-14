
import type {NextConfig} from 'next';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
let apiHostname = '';
let apiProtocol = 'http'; // Default to http
let apiPort = ''; // Variable to store the port

if (apiBaseUrl) {
  try {
    const url = new URL(apiBaseUrl);
    apiHostname = url.hostname;
    apiProtocol = url.protocol.replace(':', ''); // Get 'http' or 'https'
    apiPort = url.port; // Extract the port
  } catch (error) {
    console.warn(`Invalid NEXT_PUBLIC_API_BASE_URL for image processing: ${apiBaseUrl}`, error);
  }
}

const remotePatternsConfig = [
  {
    protocol: 'https',
    hostname: 'placehold.co',
    port: '',
    pathname: '/**',
  },
];

if (apiHostname) {
  remotePatternsConfig.push({
    protocol: apiProtocol as 'http' | 'https',
    hostname: apiHostname,
    port: apiPort, // Use the extracted port here
    pathname: '/uploads/**', // Covers /uploads/ads/** and /uploads/avatars/**
  });
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
