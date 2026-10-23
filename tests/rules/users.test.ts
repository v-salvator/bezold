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
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import {
  actors,
  createTestEnvironment,
  resetEmulators,
  seed,
  UID,
  userDoc,
  USER_COLLECTIONS,
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

for (const collectionName of USER_COLLECTIONS) {
  const sellerPath = `${collectionName}/${UID.seller}`;

  describe(`${collectionName} — the user themself`, () => {
    it("can read their own doc", async () => {
      await seed(env, sellerPath, userDoc());
      const { seller } = actors(env);
      await assertSucceeds(getDoc(doc(seller.firestore(), sellerPath)));
    });

    // * lib/auth/signup.ts
    it("can create their own doc at signup", async () => {
      const { seller } = actors(env);
      await assertSucceeds(
        setDoc(doc(seller.firestore(), sellerPath), {
          userName: "新會員",
          phone: "",
          email: "new@example.com",
          lineId: "",
          buyerProfile: {
            category: "RESTAURANT",
            city: "TAIPEI",
            budgetKey: "1",
          },
          hasBuyerProfile: true,
          fromBuyerClub: true,
          createTime: serverTimestamp(),
          updateTime: serverTimestamp(),
        }),
      );
    });

    // * editUserById, doc exists (SellForm / EditListingForm contact section)
    it("can update their contact fields", async () => {
      await seed(env, sellerPath, userDoc());
      const { seller } = actors(env);
      await assertSucceeds(
        updateDoc(doc(seller.firestore(), sellerPath), {
          userName: "改名賣家",
          phone: "0987654321",
          email: "seller@example.com",
          lineId: "new-line",
          threadsId: "new.threads",
          remark: "平日晚上聯絡",
          updateTime: serverTimestamp(),
        }),
      );
    });

    // * editUserById upsert: Auth-console accounts have no user doc yet
    it("can upsert their doc when it doesn't exist yet", async () => {
      const { seller } = actors(env);
      await assertSucceeds(
        setDoc(doc(seller.firestore(), sellerPath), {
          userName: "主控台帳號",
          phone: "0912345678",
          email: "console@example.com",
          lineId: "",
          threadsId: "",
          remark: "",
          createTime: serverTimestamp(),
          updateTime: serverTimestamp(),
        }),
      );
    });

    // * lib/user/buyerProfile.ts writeBuyerProfile
    it("can write their buyer profile", async () => {
      await seed(env, sellerPath, userDoc());
      const { seller } = actors(env);
      await assertSucceeds(
        updateDoc(doc(seller.firestore(), sellerPath), {
          buyerProfile: {
            category: "CLOTHING",
            city: "TAICHUNG",
            budgetKey: "2",
          },
          hasBuyerProfile: true,
          updateTime: serverTimestamp(),
        }),
      );
    });

    it("cannot change createTime", async () => {
      await seed(env, sellerPath, userDoc());
      const { seller } = actors(env);
      await assertFails(
        updateDoc(doc(seller.firestore(), sellerPath), {
          createTime: Timestamp.fromDate(new Date("2020-01-01")),
          updateTime: serverTimestamp(),
        }),
      );
    });

    it("cannot delete their doc", async () => {
      await seed(env, sellerPath, userDoc());
      const { seller } = actors(env);
      await assertFails(deleteDoc(doc(seller.firestore(), sellerPath)));
    });
  });

  describe(`${collectionName} — other signed-in users`, () => {
    it("cannot read someone else's contact info", async () => {
      await seed(env, sellerPath, userDoc());
      const { member } = actors(env);
      await assertFails(getDoc(doc(member.firestore(), sellerPath)));
    });

    it("cannot list the user collection", async () => {
      await seed(env, sellerPath, userDoc());
      const { member } = actors(env);
      await assertFails(
        getDocs(collection(member.firestore(), collectionName)),
      );
    });

    it("cannot create a doc under someone else's uid", async () => {
      const { member } = actors(env);
      await assertFails(setDoc(doc(member.firestore(), sellerPath), userDoc()));
    });

    it("cannot create a doc with a random id", async () => {
      const { member } = actors(env);
      await assertFails(
        addDoc(collection(member.firestore(), collectionName), userDoc()),
      );
    });

    it("cannot update someone else's doc", async () => {
      await seed(env, sellerPath, userDoc());
      const { member } = actors(env);
      await assertFails(
        updateDoc(doc(member.firestore(), sellerPath), { phone: "0900000000" }),
      );
    });
  });

  describe(`${collectionName} — admin`, () => {
    it("can read and list any user", async () => {
      await seed(env, sellerPath, userDoc());
      // * one Firestore instance per context — a second .firestore() call throws
      const adminDb = actors(env).admin.firestore();
      await assertSucceeds(getDoc(doc(adminDb, sellerPath)));
      await assertSucceeds(getDocs(collection(adminDb, collectionName)));
    });

    // * admin StoreBaseForm → createUserDoc (addDoc, random id)
    it("can create a boss user doc with a random id", async () => {
      const { admin } = actors(env);
      await assertSucceeds(
        addDoc(collection(admin.firestore(), collectionName), {
          ...userDoc(),
          createTime: serverTimestamp(),
          updateTime: serverTimestamp(),
        }),
      );
    });

    // * admin /store/edit/[id]/boss → editUserById on the seller's doc
    it("can update any user", async () => {
      await seed(env, sellerPath, userDoc());
      const { admin } = actors(env);
      await assertSucceeds(
        updateDoc(doc(admin.firestore(), sellerPath), {
          remark: "管理員備註",
          updateTime: serverTimestamp(),
        }),
      );
    });

    it("cannot delete a user doc", async () => {
      await seed(env, sellerPath, userDoc());
      const { admin } = actors(env);
      await assertFails(deleteDoc(doc(admin.firestore(), sellerPath)));
    });
  });
}
