import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['node:sqlite'],
  experimental: {},
};

export default nextConfig;
