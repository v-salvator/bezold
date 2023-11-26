import {
  initializeApp,
  cert,
  ServiceAccount,
  getApps,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { serverServiceAccountConfig } from "./configs";

const createdApps = getApps();

const app =
  createdApps.length === 0
    ? initializeApp(
        {
          credential: cert(serverServiceAccountConfig as ServiceAccount),
        },
        "bezold server"
      )
    : createdApps[0];

export const db = getFirestore(app);
