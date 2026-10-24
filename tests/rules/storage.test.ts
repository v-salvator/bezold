import { after, before, beforeEach, describe, it } from "node:test";
import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import type { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  actors,
  createTestEnvironment,
  resetEmulators,
  seed,
  seedFile,
  storeDoc,
  STORE_COLLECTIONS,
} from "./helpers.ts";

let env: RulesTestEnvironment;

// * a few bytes are enough — rules check contentType and size, not pixels
const imageBytes = new Uint8Array(16);
const FIVE_MB = 5 * 1024 * 1024;

before(async () => {
  env = await createTestEnvironment();
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await resetEmulators(env);
});

for (const collectionName of STORE_COLLECTIONS) {
  const storePath = `${collectionName}/store1`;
  const newPhoto = `${collectionName}/store1/photo-a1b2c3.webp`;
  const existingPhoto = `${collectionName}/store1/photo-old.webp`;

  describe(`${collectionName} storage — owner`, () => {
    for (const status of ["pending", "approved", "rejected"]) {
      it(`can upload, read and delete on a ${status} listing`, async () => {
        await seed(env, storePath, storeDoc({ status }));
        await seedFile(env, existingPhoto);
        const sellerStorage = actors(env).seller.storage();
        await assertSucceeds(
          uploadBytes(ref(sellerStorage, newPhoto), imageBytes, {
            contentType: "image/webp",
          }),
        );
        // * getImageByPath → getDownloadURL needs read access
        await assertSucceeds(getDownloadURL(ref(sellerStorage, newPhoto)));
        await assertSucceeds(deleteObject(ref(sellerStorage, existingPhoto)));
      });
    }

    for (const contentType of ["image/jpeg", "image/png", "image/gif"]) {
      it(`can upload ${contentType}`, async () => {
        await seed(env, storePath, storeDoc());
        const { seller } = actors(env);
        await assertSucceeds(
          uploadBytes(ref(seller.storage(), newPhoto), imageBytes, {
            contentType,
          }),
        );
      });
    }

    it("can upload a file just under 5 MB", async () => {
      await seed(env, storePath, storeDoc());
      const { seller } = actors(env);
      await assertSucceeds(
        uploadBytes(
          ref(seller.storage(), newPhoto),
          new Uint8Array(FIVE_MB - 1),
          {
            contentType: "image/png",
          },
        ),
      );
    });

    it("cannot upload a 5 MB file", async () => {
      await seed(env, storePath, storeDoc());
      const { seller } = actors(env);
      await assertFails(
        uploadBytes(ref(seller.storage(), newPhoto), new Uint8Array(FIVE_MB), {
          contentType: "image/png",
        }),
      );
    });

    for (const contentType of [
      "image/svg+xml",
      "image/heic",
      "text/html",
      "application/octet-stream",
    ]) {
      it(`cannot upload ${contentType}`, async () => {
        await seed(env, storePath, storeDoc());
        const { seller } = actors(env);
        await assertFails(
          uploadBytes(ref(seller.storage(), newPhoto), imageBytes, {
            contentType,
          }),
        );
      });
    }

    it("cannot overwrite an existing file", async () => {
      await seed(env, storePath, storeDoc());
      await seedFile(env, existingPhoto);
      const { seller } = actors(env);
      await assertFails(
        uploadBytes(ref(seller.storage(), existingPhoto), imageBytes, {
          contentType: "image/webp",
        }),
      );
    });

    for (const status of ["draft", "sold"]) {
      it(`can read but not change photos on a ${status} listing`, async () => {
        await seed(env, storePath, storeDoc({ status }));
        await seedFile(env, existingPhoto);
        const sellerStorage = actors(env).seller.storage();
        await assertSucceeds(getMetadata(ref(sellerStorage, existingPhoto)));
        await assertFails(
          uploadBytes(ref(sellerStorage, newPhoto), imageBytes, {
            contentType: "image/webp",
          }),
        );
        await assertFails(deleteObject(ref(sellerStorage, existingPhoto)));
      });
    }

    it("cannot upload to a store that doesn't exist", async () => {
      const { seller } = actors(env);
      await assertFails(
        uploadBytes(ref(seller.storage(), newPhoto), imageBytes, {
          contentType: "image/webp",
        }),
      );
    });
  });

  describe(`${collectionName} storage — others`, () => {
    it("another seller cannot upload, read or delete", async () => {
      await seed(env, storePath, storeDoc());
      await seedFile(env, existingPhoto);
      const otherStorage = actors(env).otherSeller.storage();
      await assertFails(
        uploadBytes(ref(otherStorage, newPhoto), imageBytes, {
          contentType: "image/webp",
        }),
      );
      await assertFails(getMetadata(ref(otherStorage, existingPhoto)));
      await assertFails(deleteObject(ref(otherStorage, existingPhoto)));
    });

    it("an anonymous visitor cannot upload or read", async () => {
      await seed(env, storePath, storeDoc());
      await seedFile(env, existingPhoto);
      const anonymousStorage = actors(env).anonymous.storage();
      await assertFails(
        uploadBytes(ref(anonymousStorage, newPhoto), imageBytes, {
          contentType: "image/webp",
        }),
      );
      await assertFails(getMetadata(ref(anonymousStorage, existingPhoto)));
    });

    // * admin /store/edit/[id]/image, StoreDetailDrawer
    it("an admin can upload, read and delete on any listing", async () => {
      await seed(env, storePath, storeDoc({ status: "draft" }));
      await seedFile(env, existingPhoto);
      const adminStorage = actors(env).admin.storage();
      await assertSucceeds(
        uploadBytes(ref(adminStorage, newPhoto), imageBytes, {
          contentType: "image/webp",
        }),
      );
      await assertSucceeds(getDownloadURL(ref(adminStorage, existingPhoto)));
      await assertSucceeds(deleteObject(ref(adminStorage, existingPhoto)));
    });

    it("an admin is held to the same type and size limits", async () => {
      await seed(env, storePath, storeDoc());
      const adminStorage = actors(env).admin.storage();
      await assertFails(
        uploadBytes(ref(adminStorage, newPhoto), new Uint8Array(FIVE_MB), {
          contentType: "image/png",
        }),
      );
      await assertFails(
        uploadBytes(ref(adminStorage, newPhoto), imageBytes, {
          contentType: "image/svg+xml",
        }),
      );
    });
  });
}

describe("paths outside store photos", () => {
  // * shrink-store-images backups — Admin SDK only
  it("nobody can read or write backup/", async () => {
    await seedFile(env, "backup/prodStore/store1/1.png", "image/png");
    const adminStorage = actors(env).admin.storage();
    await assertFails(
      getMetadata(ref(adminStorage, "backup/prodStore/store1/1.png")),
    );
    await assertFails(
      uploadBytes(
        ref(adminStorage, "backup/prodStore/store1/2.png"),
        imageBytes,
        {
          contentType: "image/png",
        },
      ),
    );
  });

  it("an unknown top-level folder is closed", async () => {
    await seed(env, "otherStore/store1", storeDoc());
    const { seller } = actors(env);
    await assertFails(
      uploadBytes(
        ref(seller.storage(), "otherStore/store1/a.webp"),
        imageBytes,
        {
          contentType: "image/webp",
        },
      ),
    );
  });

  it("nested paths under a store are closed", async () => {
    await seed(env, "prodStore/store1", storeDoc());
    const { seller } = actors(env);
    await assertFails(
      uploadBytes(
        ref(seller.storage(), "prodStore/store1/nested/a.webp"),
        imageBytes,
        {
          contentType: "image/webp",
        },
      ),
    );
  });
});
