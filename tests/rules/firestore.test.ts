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
