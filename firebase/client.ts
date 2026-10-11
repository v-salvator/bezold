import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import {
  initializeAnalytics,
  isSupported,
  logEvent,
  type Analytics,
} from "firebase/analytics";
import { clientConfig } from "./configs";

const app = initializeApp(clientConfig, "bezold client");

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Analytics touches window/document/indexedDB synchronously, so it must not run
// during SSR/build. Initialize it lazily and only in a supported browser.
let analytics: Analytics | null = null;
export const getAnalyticsClient = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;
  if (analytics) return analytics;
  if (!(await isSupported())) return null;
  // AnalyticsTracker sends every page_view itself (and skips /admin), so turn
  // off gtag's automatic page_view on init — otherwise the landing page counts twice.
  analytics = initializeAnalytics(app, { config: { send_page_view: false } });
  return analytics;
};

// Fire a custom analytics event; safely no-ops on the server / unsupported browsers.
export const trackEvent = async (
  name: string,
  params?: Record<string, unknown>,
): Promise<void> => {
  const client = await getAnalyticsClient();
  if (!client) return;
  logEvent(client, name, params);
};
