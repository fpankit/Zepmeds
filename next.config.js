
/** @type {import('next').NextConfig} */
const {
  withHydrationOverlay,
} = require('@builder.io/react-hydration-overlay/next');

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "out",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    // THE FIX: This ensures all generated files (pages, chunks, etc.) are pre-cached.
    // Since we use `output: 'export'`, this will include all HTML pages.
    // The globPatterns ensures everything in the output directory is included.
    globPatterns: ['**/*'], 
  },
  // THE FIX: Include all files in the output directory in the precache manifest.
  // This is the key to making all pages available offline from the start.
  precacheManifest: {
    globPatterns: ["**/*"],
  },
});


const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-with, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = withHydrationOverlay({
    /**
     * Optional: `appRootSelector` specifies the root element of your app.
     * If not provided, it defaults to `main`.
     * You can use this mechanism to limit the scope of the hydration overlay
     * to a specific part of your application.
     */
    appRootSelector: 'main',
  })(withPWA(nextConfig));
    
