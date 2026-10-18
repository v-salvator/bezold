// Read-only check before switching store images to Firebase download URLs:
// counts Storage objects under the store collection prefix that have no
// firebaseStorageDownloadTokens (those keep falling back to signed URLs).
// Only lists objects — the listing already carries each object's metadata —
// and never writes.
//
//   node --env-file=.env scripts/check-download-tokens.mjs
//
// The prefix follows NEXT_PUBLIC_ENV_VERSION the same way firebase/constants.ts
// does: "dev" → mockStore/, anything else → prodStore/.

import { cert, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const SAMPLE_LIMIT = 10;
const BUCKET_NAME = "bezold.appspot.com";

const collection =
  process.env.NEXT_PUBLIC_ENV_VERSION === "dev" ? "mockStore" : "prodStore";

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_SERVER_PROJECT_ID,
    clientEmail: process.env.FIREBASE_SERVER_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_SERVER_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  storageBucket: BUCKET_NAME,
});

const [files] = await getStorage()
  .bucket()
  .getFiles({ prefix: `${collection}/` });
const objects = files.filter((file) => !file.name.endsWith("/"));
const missingToken = objects.filter(
  (file) => !file.metadata?.metadata?.firebaseStorageDownloadTokens,
);

const ratio = objects.length === 0 ? 0 : missingToken.length / objects.length;
console.log(`Prefix:            ${collection}/`);
console.log(`Objects:           ${objects.length}`);
console.log(
  `Without token:     ${missingToken.length} (${(ratio * 100).toFixed(1)}%)`,
);
for (const file of missingToken.slice(0, SAMPLE_LIMIT))
  console.log(`  ${file.name}`);
process.exit(0);
