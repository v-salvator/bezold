import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/my-listings",
        "/login",
        "/signup",
        "/verify-email",
        // * one-time token links from the follow-up email
        "/listing-check",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
