/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Only run this fallback if we're building for the client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Bypass optional native modules
        bufferutil: false,
        "utf-8-validate": false,
      };
    }

    return config;
  },
};
