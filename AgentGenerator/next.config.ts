import type { NextConfig } from 'next';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  basePath,
  output: 'standalone',
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
