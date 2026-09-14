/** @type {import('next').NextConfig} */
const nextConfig = {
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
