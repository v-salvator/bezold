/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
    minimumCacheTTL: 1500000, // * TODO: need more knowledge about this setting
  },
};

module.exports = nextConfig;
