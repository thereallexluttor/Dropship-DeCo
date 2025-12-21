/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-leaflet'],
  images: {
    // Cache transformed images for ~31 days to reduce transformations and cache writes
    minimumCacheTTL: 2678400,

    // Reduce formats to a single target to minimize number of transformations
    formats: ['image/webp'],

    // Restrict remote images to Supabase storage for this project
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ecwotusxxggwogzuzoup.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/images/**',
      },
    ],

    // Allowlist local asset patterns to limit unnecessary transformations
    // Include specific assets and root-level image patterns
    localPatterns: [
      { pathname: '/brands/**' },
      { pathname: '/icons/**' },
      { pathname: '/navidad/**' },
      { pathname: '/cap*.png' },
      { pathname: '/unisantander.png' },
      { pathname: '/unisantander_footer.png' },
      { pathname: '/footer_*.png' },
      { pathname: '/*.png' },
      { pathname: '/*.jpg' },
      { pathname: '/*.jpeg' },
      { pathname: '/*.webp' },
    ],

    // Limit quality options (lower quality => smaller files and fewer cache events)
    qualities: [60, 75, 90],

    // Tailor sizes to your audience to reduce transform permutations
    deviceSizes: [360, 640, 768, 1024, 1280],
    imageSizes: [16, 32, 40, 48],
  },
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