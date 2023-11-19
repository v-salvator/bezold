import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { serverServiceAccountConfig } from "./configs";

initializeApp({
  credential: cert(serverServiceAccountConfig as ServiceAccount),
});

export const db = getFirestore();
