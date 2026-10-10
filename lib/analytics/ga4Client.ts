// Server-only GA4 Data API client. Reuses the Firebase Admin service account,
// which has Viewer access on the GA4 property.
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { serverServiceAccountConfig } from "@/firebase/configs";

let client: BetaAnalyticsDataClient | null = null;

export const getGa4Client = () => {
  client ??= new BetaAnalyticsDataClient({
    credentials: {
      client_email: serverServiceAccountConfig.client_email,
      // Env files store the PEM with literal "\n" sequences.
      private_key: serverServiceAccountConfig.private_key?.replace(
        /\\n/g,
        "\n",
      ),
    },
    // HTTP/1.1 REST instead of gRPC: no long-lived socket in serverless
    // functions, and nothing gRPC-specific for Next to bundle.
    fallback: true,
  });
  return client;
};
