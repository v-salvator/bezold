/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Load the GA4 client from node_modules instead of bundling it. Minifying
    // it renames protobufjs' Long class, and the request encoder checks
    // `constructor.name === "Long"`, so every int64 field (e.g. `limit`)
    // fails to serialize in production builds.
    serverComponentsExternalPackages: ["@google-analytics/data"],
  },
  images: {
    // Bypass Vercel's Image Optimization (was returning 402
    // OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED once the quota was hit).
    // Images are served directly from Firebase Storage / googleapis.com.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
    minimumCacheTTL: 1500000, // * TODO: need more knowledge about this setting
  },
};

module.exports = nextConfig;
