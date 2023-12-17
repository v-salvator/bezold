/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["storage.googleapis.com"],
    minimumCacheTTL: 1500000, // * TODO: need more knowledge about this setting
  },
};

module.exports = nextConfig;
