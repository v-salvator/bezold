import type { MetadataRoute } from "next";
import { db } from "@/firebase/server";
import { COLLECTIONS } from "@/firebase/constants";
import { STORE_STATUS } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!;

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

const route = (
  path: string,
  changeFrequency: ChangeFrequency,
  priority: number,
): MetadataRoute.Sitemap[number] => ({
  url: `${BASE_URL}${path}`,
  changeFrequency,
  priority,
});

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  route("/", "daily", 1),
  route("/store-list", "daily", 0.9),
  route("/sell", "weekly", 0.8),
  route("/faq", "monthly", 0.5),
  route("/store-guide", "monthly", 0.5),
  route("/privacy", "yearly", 0.3),
  route("/terms", "yearly", 0.3),
  route("/login", "yearly", 0.2),
  route("/signup", "yearly", 0.2),
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const snapshot = await db
    .collection(COLLECTIONS.STORE)
    .where("status", "==", STORE_STATUS.APPROVED)
    .get();

  const storeRoutes: MetadataRoute.Sitemap = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      url: `${BASE_URL}/store/${doc.id}`,
      lastModified: data.updateTime?.toDate?.() ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  return [...STATIC_ROUTES, ...storeRoutes];
}
