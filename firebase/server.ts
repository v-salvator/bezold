import {
  initializeApp,
  cert,
  ServiceAccount,
  getApps,
} from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { serverServiceAccountConfig } from "./configs";

const createdApps = getApps();

const app =
  createdApps.length === 0
    ? initializeApp(
        {
          credential: cert(serverServiceAccountConfig as ServiceAccount),
          storageBucket: "bezold.appspot.com",
        },
        "bezold server"
      )
    : createdApps[0];

export const db = getFirestore(app);
export const bucket = getStorage(app).bucket();
