import { after, before, beforeEach, describe, it } from "node:test";
import { assertFails } from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { getMetadata, ref, uploadBytes } from "firebase/storage";
import {
  actors,
  createTestEnvironment,
  resetEmulators,
  STORE_COLLECTIONS,
} from "./helpers.ts";

let env: RulesTestEnvironment;

// * a few bytes are enough — rules check contentType and size, not pixels
const imageBytes = new Uint8Array([0x52, 0x49, 0x46, 0x46]);

before(async () => {
  env = await createTestEnvironment();
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await resetEmulators(env);
});

describe("anonymous", () => {
  for (const collection of STORE_COLLECTIONS) {
    it(`cannot upload to ${collection}`, async () => {
      const { anonymous } = actors(env);
      await assertFails(
        uploadBytes(
          ref(anonymous.storage(), `${collection}/store1/photo.webp`),
          imageBytes,
          { contentType: "image/webp" },
        ),
      );
    });

    it(`cannot read from ${collection}`, async () => {
      await env.withSecurityRulesDisabled(async (context) => {
        await uploadBytes(
          ref(context.storage(), `${collection}/store1/photo.webp`),
          imageBytes,
          { contentType: "image/webp" },
        );
      });
      const { anonymous } = actors(env);
      await assertFails(
        getMetadata(
          ref(anonymous.storage(), `${collection}/store1/photo.webp`),
        ),
      );
    });
  }
});
