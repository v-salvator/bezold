import { after, before, beforeEach, describe, it } from "node:test";
import { assertFails } from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  actors,
  createTestEnvironment,
  resetEmulators,
  seed,
  storeDoc,
  STORE_COLLECTIONS,
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

describe("anything not matched by a rule", () => {
  it("denies anonymous reads of an unknown collection", async () => {
    await seed(env, "somethingElse/doc1", { value: 1 });
    const { anonymous } = actors(env);
    await assertFails(getDoc(doc(anonymous.firestore(), "somethingElse/doc1")));
  });

  it("denies admin writes to an unknown collection", async () => {
    const { admin } = actors(env);
    await assertFails(
      setDoc(doc(admin.firestore(), "somethingElse/doc1"), { value: 1 }),
    );
  });
});

describe("anonymous", () => {
  for (const collection of STORE_COLLECTIONS) {
    it(`cannot read ${collection}`, async () => {
      await seed(env, `${collection}/store1`, storeDoc());
      const { anonymous } = actors(env);
      await assertFails(
        getDoc(doc(anonymous.firestore(), `${collection}/store1`)),
      );
    });
  }

  for (const collection of USER_COLLECTIONS) {
    it(`cannot read ${collection}`, async () => {
      await seed(env, `${collection}/${UID.seller}`, userDoc());
      const { anonymous } = actors(env);
      await assertFails(
        getDoc(doc(anonymous.firestore(), `${collection}/${UID.seller}`)),
      );
    });
  }
});

// * inquiries go through the Admin SDK only (/api/stores/[id]/inquiry and
// * /api/admin/inquiries) — no client role may touch them, admins included
for (const collectionName of ["mockInquiry", "prodInquiry"]) {
  describe(`${collectionName} — client access`, () => {
    const inquiryPath = `${collectionName}/store1_${UID.member}`;
    const inquiryDoc = {
      storeId: "store1",
      storeName: "Shop",
      buyerUid: UID.member,
      buyerName: "Buyer",
      buyerEmail: "buyer@example.com",
      buyerPhone: "0900",
      message: "",
      status: "new",
    };

    for (const actorName of ["member", "seller", "admin"] as const) {
      it(`${actorName} cannot read or write`, async () => {
        await seed(env, inquiryPath, inquiryDoc);
        const firestore = actors(env)[actorName].firestore();
        await assertFails(getDoc(doc(firestore, inquiryPath)));
        await assertFails(
          setDoc(doc(firestore, `${collectionName}/store1_${actorName}`), {
            ...inquiryDoc,
            buyerUid: actorName,
          }),
        );
      });
    }
  });
}

// * listing follow-up state and 頂讓回饋 go through the Admin SDK only (cron,
// * /api/listing-check, /api/sold-feedback, /api/admin/*) — no client role,
// * admins included, may touch them
const adminSdkOnlyCollections: [string, Record<string, unknown>][] = [
  [
    "FollowUp",
    {
      storeId: "store1",
      sentCount: 1,
      lastSentTime: null,
      lastAnswer: null,
      lastAnswerTime: null,
      paused: false,
      tokenHash: "abc",
      tokenExpireTime: null,
      tokenUsed: false,
      lastError: "",
    },
  ],
  [
    "SoldFeedback",
    {
      storeId: "store1",
      storeName: "Shop",
      listedPrice: 450000,
      listedPriceNegotiable: false,
      soldVia: "follow-up-email",
      soldDuration: "1_to_3m",
      buyerSource: "bezold",
      finalPrice: 400000,
      satisfaction: 5,
      comment: "",
    },
  ],
];

for (const [suffix, sampleDoc] of adminSdkOnlyCollections) {
  for (const collectionName of [`mock${suffix}`, `prod${suffix}`]) {
    describe(`${collectionName} — client access`, () => {
      const docPath = `${collectionName}/store1`;

      for (const actorName of ["member", "seller", "admin"] as const) {
        it(`${actorName} cannot read or write`, async () => {
          await seed(env, docPath, sampleDoc);
          const firestore = actors(env)[actorName].firestore();
          await assertFails(getDoc(doc(firestore, docPath)));
          await assertFails(setDoc(doc(firestore, docPath), sampleDoc));
          await assertFails(
            setDoc(doc(firestore, `${collectionName}/store2`), sampleDoc),
          );
        });
      }
    });
  }
}
