import { readFileSync } from "node:fs";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, setLogLevel, Timestamp } from "firebase/firestore";
import { deleteObject, listAll, ref, uploadBytes } from "firebase/storage";
import type { StorageReference } from "firebase/storage";

// * every assertFails would otherwise print the SDK's PERMISSION_DENIED warning
setLogLevel("error");

// * Runs under `npm run test:rules` only: firebase emulators:exec sets
// * FIRESTORE_EMULATOR_HOST / FIREBASE_STORAGE_EMULATOR_HOST, and "demo-*"
// * project ids never reach a real Firebase project.
export const PROJECT_ID = "demo-bezold";

// * one rules file serves both environments — tests exercise both names
export const STORE_COLLECTIONS = ["mockStore", "prodStore"] as const;
export const USER_COLLECTIONS = ["mockUser", "prodUser"] as const;

export const UID = {
  member: "member",
  seller: "seller",
  otherSeller: "otherSeller",
  admin: "admin",
} as const;

export const createTestEnvironment = () =>
  initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
    storage: { rules: readFileSync("storage.rules", "utf8") },
  });

// * one context per actor in the spec's tables
export const actors = (env: RulesTestEnvironment) => ({
  anonymous: env.unauthenticatedContext(),
  member: env.authenticatedContext(UID.member),
  seller: env.authenticatedContext(UID.seller),
  otherSeller: env.authenticatedContext(UID.otherSeller),
  admin: env.authenticatedContext(UID.admin, { admin: true }),
});

// * env.clearStorage() only deletes files at the bucket root, and every store
// * photo lives under {collection}/{storeId}/ — walk the folders instead
const deleteAllFiles = async (folder: StorageReference): Promise<void> => {
  const { items, prefixes } = await listAll(folder);
  await Promise.all([
    ...items.map((item) => deleteObject(item)),
    ...prefixes.map((prefix) => deleteAllFiles(prefix)),
  ]);
};

export const resetEmulators = async (env: RulesTestEnvironment) => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    await deleteAllFiles(ref(context.storage()));
  });
};

// * a store doc shaped like what SellForm writes, already approved by default
export const storeDoc = (overrides: Record<string, unknown> = {}) => ({
  storeName: "測試咖啡店",
  city: "TAIPEI",
  district: "大安區",
  location: "復興南路一段",
  description: "測試用店家",
  price: 500000,
  priceNegotiable: false,
  category: "RESTAURANT",
  areaPing: 20,
  monthlyRent: 60000,
  equipment: "all",
  tags: [],
  currency: "TWD",
  user: UID.seller,
  images: [],
  status: "approved",
  createTime: Timestamp.now(),
  updateTime: Timestamp.now(),
  ...overrides,
});

export const userDoc = (overrides: Record<string, unknown> = {}) => ({
  userName: "測試賣家",
  phone: "0912345678",
  email: "seller@example.com",
  lineId: "seller-line",
  threadsId: "",
  remark: "",
  hasBuyerProfile: false,
  fromBuyerClub: false,
  createTime: Timestamp.now(),
  updateTime: Timestamp.now(),
  ...overrides,
});

// * writes test data with rules off, the way the Admin SDK would
export const seed = async (
  env: RulesTestEnvironment,
  path: string,
  data: Record<string, unknown>,
) => {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), path), data);
  });
};

export const seedFile = async (
  env: RulesTestEnvironment,
  path: string,
  contentType = "image/webp",
) => {
  await env.withSecurityRulesDisabled(async (context) => {
    await uploadBytes(ref(context.storage(), path), new Uint8Array(16), {
      contentType,
    });
  });
};
