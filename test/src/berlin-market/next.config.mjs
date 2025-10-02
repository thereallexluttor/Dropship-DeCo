/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-leaflet'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      dns: false,
      tls: false,
      fs: false,
      request: false,
    };
    return config;
  },
};

export default nextConfig;