
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
    globPatterns: ['**/*'], 
  },
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

const applyPlugins = (config) => {
  let updatedConfig = withPWA(config);
  
  if (process.env.NODE_ENV === 'development') {
    updatedConfig = withHydrationOverlay({
      appRootSelector: 'main',
    })(updatedConfig);
  }

  return updatedConfig;
};

module.exports = applyPlugins(nextConfig);
