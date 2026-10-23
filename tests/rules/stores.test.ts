import { after, before, beforeEach, describe, it } from "node:test";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import {
  actors,
  createTestEnvironment,
  resetEmulators,
  seed,
  storeDoc,
  STORE_COLLECTIONS,
  UID,
} from "./helpers.ts";

let env: RulesTestEnvironment;

before(async () => {
  env = await createTestEnvironment();
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await resetEmulators(env);
});

// * exactly what SellForm hands createStoreDoc (after storeConverter): the raw
// * form strings are spread in first, so empty optional fields stay as ""
const sellFormPayload = (overrides: Record<string, unknown> = {}) => ({
  storeName: "新刊登咖啡店",
  city: "TAIPEI",
  district: "信義區",
  location: "松仁路",
  description: "賣家刊登",
  price: 300000,
  priceNegotiable: true,
  category: "RESTAURANT",
  areaPing: "",
  monthlyRent: 45000,
  equipment: "partial",
  tags: [],
  currency: "TWD",
  user: UID.seller,
  images: [],
  status: "pending",
  createTime: serverTimestamp(),
  updateTime: serverTimestamp(),
  ...overrides,
});

for (const collectionName of STORE_COLLECTIONS) {
  const storePath = `${collectionName}/store1`;

  describe(`${collectionName} read`, () => {
    it("the owner can get their store", async () => {
      await seed(env, storePath, storeDoc());
      const { seller } = actors(env);
      await assertSucceeds(getDoc(doc(seller.firestore(), storePath)));
    });

    // * getStoresByUserId on /my-listings
    it("the owner can run the my-listings query", async () => {
      await seed(env, storePath, storeDoc());
      await seed(env, `${collectionName}/store2`, storeDoc({ status: "sold" }));
      const { seller } = actors(env);
      await assertSucceeds(
        getDocs(
          query(
            collection(seller.firestore(), collectionName),
            where("user", "==", UID.seller),
            orderBy("createTime", "desc"),
          ),
        ),
      );
    });

    it("another seller cannot get the store", async () => {
      await seed(env, storePath, storeDoc());
      const { otherSeller } = actors(env);
      await assertFails(getDoc(doc(otherSeller.firestore(), storePath)));
    });

    it("another seller cannot query someone else's stores", async () => {
      await seed(env, storePath, storeDoc());
      const { otherSeller } = actors(env);
      await assertFails(
        getDocs(
          query(
            collection(otherSeller.firestore(), collectionName),
            where("user", "==", UID.seller),
          ),
        ),
      );
    });

    it("a signed-in user cannot list every store", async () => {
      await seed(env, storePath, storeDoc());
      const { seller } = actors(env);
      await assertFails(
        getDocs(collection(seller.firestore(), collectionName)),
      );
    });

    // * admin store list / drafts / analytics → getStores()
    it("an admin can get and list every store", async () => {
      await seed(env, storePath, storeDoc());
      await seed(
        env,
        `${collectionName}/draft1`,
        storeDoc({ status: "draft" }),
      );
      const adminDb = actors(env).admin.firestore();
      await assertSucceeds(getDoc(doc(adminDb, storePath)));
      await assertSucceeds(
        getDocs(
          query(
            collection(adminDb, collectionName),
            orderBy("createTime", "desc"),
          ),
        ),
      );
    });
  });

  describe(`${collectionName} create`, () => {
    it("a seller can submit the /sell form", async () => {
      const { seller } = actors(env);
      await assertSucceeds(
        addDoc(
          collection(seller.firestore(), collectionName),
          sellFormPayload(),
        ),
      );
    });

    it("a seller can submit with every optional field filled", async () => {
      const { seller } = actors(env);
      await assertSucceeds(
        addDoc(
          collection(seller.firestore(), collectionName),
          sellFormPayload({ areaPing: 25, equipment: "all" }),
        ),
      );
    });

    const deniedPayloads: [string, Record<string, unknown>][] = [
      ["an approved listing", { status: "approved" }],
      ["a draft", { status: "draft" }],
      ["admin tags", { tags: ["RECOMMENDED"] }],
      ["pre-filled images", { images: [`${collectionName}/x/1.webp`] }],
      ["someone else as the owner", { user: UID.otherSeller }],
      ["no owner", { user: null }],
      ["an extra field", { featured: true }],
      [
        "a backdated createTime",
        { createTime: Timestamp.fromDate(new Date("2020-01-01")) },
      ],
    ];
    for (const [label, overrides] of deniedPayloads) {
      it(`a seller cannot create ${label}`, async () => {
        const { seller } = actors(env);
        await assertFails(
          addDoc(
            collection(seller.firestore(), collectionName),
            sellFormPayload(overrides),
          ),
        );
      });
    }

    it("an anonymous visitor cannot create a store", async () => {
      const { anonymous } = actors(env);
      await assertFails(
        addDoc(
          collection(anonymous.firestore(), collectionName),
          sellFormPayload({ user: null }),
        ),
      );
    });

    // * admin StoreBaseForm → createStoreDoc, any status/tags
    it("an admin can create any store", async () => {
      const { admin } = actors(env);
      await assertSucceeds(
        addDoc(collection(admin.firestore(), collectionName), {
          ...sellFormPayload({ user: "bossUserDocId" }),
          status: "approved",
          tags: ["RECOMMENDED"],
        }),
      );
    });
  });

  describe(`${collectionName} delete`, () => {
    it("the owner cannot delete their store", async () => {
      await seed(env, storePath, storeDoc());
      const { seller } = actors(env);
      await assertFails(deleteDoc(doc(seller.firestore(), storePath)));
    });

    it("an admin can delete a store", async () => {
      await seed(env, storePath, storeDoc());
      const { admin } = actors(env);
      await assertSucceeds(deleteDoc(doc(admin.firestore(), storePath)));
    });
  });
}
