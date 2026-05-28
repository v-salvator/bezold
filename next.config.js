/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["storage.googleapis.com", "firebasestorage.googleapis.com"],
    minimumCacheTTL: 1500000, // * TODO: need more knowledge about this setting
  },
  async redirects() {
    return [
      { source: "/new", destination: "/", permanent: true },
      { source: "/new/:path*", destination: "/:path*", permanent: true },
      { source: "/about", destination: "/", permanent: true },
      { source: "/learn", destination: "/store-guide", permanent: true },
      { source: "/how", destination: "/sell", permanent: true },
    ];
  },
};

module.exports = nextConfig;
