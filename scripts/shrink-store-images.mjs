// Shrinks store photos in Firebase Storage: every image a store document
// still references that is over the size threshold is re-encoded to a new
// `.webp` next to the original, and the store's `images` array is pointed at
// it (same order, nothing else written). Originals stay where they are until
// a later cleanup, so a store can be rolled back by swapping the paths back.
// See SPEC.md → `image-backfill`.
//
// Dry run (default — encodes in memory, writes nothing):
//   node --env-file=.env scripts/shrink-store-images.mjs --prefix mockStore
// Convert:
//   node --env-file=.env scripts/shrink-store-images.mjs --prefix mockStore --write
// One store only:
//   node --env-file=.env scripts/shrink-store-images.mjs --prefix mockStore --only <storeId>
// Roll back (points images at the originals again, deletes the converted files;
// an original already moved to backup/ is copied back first):
//   node --env-file=.env scripts/shrink-store-images.mjs --prefix mockStore --only <storeId> --rollback --write
// Clean up (moves each converted image's original to backup/<path>, so the
// store folder keeps only files in use; --rollback still works from backup/):
//   node --env-file=.env scripts/shrink-store-images.mjs --prefix mockStore --cleanup --write
//
// --prefix is both the Firestore collection and the Storage folder. It is
// required on purpose: dev and prod share one Firebase project.
//
// Settings come from constant/image.ts, which Node imports by stripping its
// types. package.json has no "type", so Node warns MODULE_TYPELESS_PACKAGE_JSON;
// it is harmless — add --disable-warning=MODULE_TYPELESS_PACKAGE_JSON to hide it.

import { randomUUID } from "node:crypto";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import sharp from "sharp";
import {
  IMAGE_MAX_EDGE,
  IMAGE_OUTPUT_EXTENSION,
  IMAGE_OUTPUT_TYPE,
  IMAGE_QUALITY,
  IMAGE_SETTINGS_TAG,
  IMAGE_SKIP_BYTES,
} from "../constant/image.ts";

const BUCKET_NAME = "bezold.appspot.com";
const PREFIXES = ["mockStore", "prodStore"];
const CONCURRENCY = 4;
const USAGE =
  "Usage: node --env-file=.env scripts/shrink-store-images.mjs --prefix <mockStore|prodStore> [--only <storeId>] [--rollback | --cleanup] [--write]";

const SKIP_REASONS = {
  missing: "object not found",
  converted: "already converted",
  small: "already within limits",
  larger: "output not smaller",
  unreadable: "could not decode",
  outside: "path outside prefix",
  removed: "removed from the store during the run",
};

function parseArgs(argv) {
  const valueOf = (flag) => {
    const index = argv.indexOf(flag);
    return index >= 0 ? argv[index + 1] : undefined;
  };
  const prefix = valueOf("--prefix");
  if (!PREFIXES.includes(prefix)) {
    console.error(`--prefix must be one of ${PREFIXES.join(", ")}.\n${USAGE}`);
    process.exit(1);
  }
  const only = valueOf("--only");
  if (argv.includes("--only") && !only) {
    console.error(`--only needs a store id.\n${USAGE}`);
    process.exit(1);
  }
  if (argv.includes("--rollback") && argv.includes("--cleanup")) {
    console.error(`Use --rollback or --cleanup, not both.\n${USAGE}`);
    process.exit(1);
  }
  return {
    prefix,
    only,
    rollback: argv.includes("--rollback"),
    cleanup: argv.includes("--cleanup"),
    write: argv.includes("--write"),
  };
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index], index);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

async function encode(buffer) {
  const pipeline = sharp(buffer).rotate().resize({
    width: IMAGE_MAX_EDGE,
    height: IMAGE_MAX_EDGE,
    fit: "inside",
    withoutEnlargement: true,
  });
  const output =
    IMAGE_OUTPUT_TYPE === "image/webp"
      ? pipeline.webp({ quality: IMAGE_QUALITY })
      : pipeline.jpeg({ quality: IMAGE_QUALITY, mozjpeg: true });
  return output.toBuffer();
}

// * download + encode one referenced image; decides whether it gets converted
async function inspectImage(bucket, prefix, imagePath) {
  if (!imagePath.startsWith(`${prefix}/`))
    return { imagePath, status: "outside", bytes: 0 };

  const file = bucket.file(imagePath);
  const [exists] = await file.exists();
  if (!exists) return { imagePath, status: "missing", bytes: 0 };

  const [metadata] = await file.getMetadata();
  const bytes = Number(metadata.size);
  if (metadata.metadata?.sourcePath)
    return { imagePath, status: "converted", bytes };

  const [buffer] = await file.download();
  let width;
  let height;
  try {
    ({ width, height } = await sharp(buffer).metadata());
  } catch {
    return { imagePath, status: "unreadable", bytes };
  }
  if (Math.max(width, height) <= IMAGE_MAX_EDGE && bytes <= IMAGE_SKIP_BYTES)
    return { imagePath, status: "small", bytes };

  let output;
  try {
    output = await encode(buffer);
  } catch {
    return { imagePath, status: "unreadable", bytes };
  }
  if (output.length >= bytes) return { imagePath, status: "larger", bytes };

  return {
    imagePath,
    status: "convert",
    bytes,
    output,
    outputBytes: output.length,
  };
}

// * `<dir>/<name>.webp`, or `<name>-2.webp`… when that name is already used
// * by an object or by another image converted in this run
async function pickTargetPath(bucket, imagePath, reservedPaths) {
  const directory = path.posix.dirname(imagePath);
  const name = path.posix.basename(imagePath, path.posix.extname(imagePath));
  for (let attempt = 1; ; attempt++) {
    const suffix = attempt === 1 ? "" : `-${attempt}`;
    const candidate = `${directory}/${name}${suffix}.${IMAGE_OUTPUT_EXTENSION}`;
    if (reservedPaths.has(candidate)) continue;
    const [exists] = await bucket.file(candidate).exists();
    if (exists) continue;
    reservedPaths.add(candidate);
    return candidate;
  }
}

async function planStore(bucket, prefix, storeDoc) {
  const images = storeDoc.data().images ?? [];
  const inspected = await mapWithConcurrency(images, CONCURRENCY, (imagePath) =>
    inspectImage(bucket, prefix, imagePath),
  );
  const reservedPaths = new Set(images);
  for (const image of inspected) {
    if (image.status === "convert")
      image.targetPath = await pickTargetPath(
        bucket,
        image.imagePath,
        reservedPaths,
      );
  }
  return inspected;
}

async function deleteFiles(bucket, paths) {
  await Promise.all(
    paths.map((filePath) =>
      bucket.file(filePath).delete({ ignoreNotFound: true }),
    ),
  );
}

// * upload the new files (never over an existing object), then swap the
// * paths in one transaction — only `images` is written, order kept, so
// * `updateTime` (sold-list order, 「更新」date) stays as it was
async function convertStore(db, bucket, storeRef, images) {
  const toConvert = images.filter((image) => image.status === "convert");
  if (toConvert.length === 0) return;

  const uploadErrors = await mapWithConcurrency(
    toConvert,
    CONCURRENCY,
    async (image) => {
      try {
        await bucket.file(image.targetPath).save(image.output, {
          resumable: false,
          contentType: IMAGE_OUTPUT_TYPE,
          preconditionOpts: { ifGenerationMatch: 0 },
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: randomUUID(),
              sourcePath: image.imagePath,
              shrunk: IMAGE_SETTINGS_TAG,
              originalBytes: String(image.bytes),
            },
          },
        });
        return null;
      } catch (error) {
        return error;
      }
    },
  );
  const uploadedPaths = toConvert
    .filter((_, index) => !uploadErrors[index])
    .map((image) => image.targetPath);
  const uploadError = uploadErrors.find(Boolean);
  if (uploadError) {
    await deleteFiles(bucket, uploadedPaths);
    throw uploadError;
  }

  const replacements = new Map(
    toConvert.map((image) => [image.imagePath, image.targetPath]),
  );
  let removedPaths = [];
  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(storeRef);
      const currentImages = snapshot.data()?.images ?? [];
      removedPaths = toConvert
        .filter((image) => !currentImages.includes(image.imagePath))
        .map((image) => image.imagePath);
      transaction.update(storeRef, {
        images: currentImages.map(
          (imagePath) => replacements.get(imagePath) ?? imagePath,
        ),
      });
    });
  } catch (error) {
    await deleteFiles(bucket, uploadedPaths);
    throw error;
  }

  // * the seller deleted these while we encoded — drop their new files
  for (const image of toConvert) {
    if (removedPaths.includes(image.imagePath)) image.status = "removed";
  }
  await deleteFiles(
    bucket,
    removedPaths.map((imagePath) => replacements.get(imagePath)),
  );
  await verifyStore(
    bucket,
    storeRef,
    toConvert.filter((image) => image.status === "convert"),
  );
}

async function verifyStore(bucket, storeRef, convertedImages) {
  const currentImages = (await storeRef.get()).data()?.images ?? [];
  for (const image of convertedImages) {
    const [metadata] = await bucket.file(image.targetPath).getMetadata();
    const problems = [
      !currentImages.includes(image.targetPath) && "path not in store",
      metadata.contentType !== IMAGE_OUTPUT_TYPE &&
        `contentType ${metadata.contentType}`,
      !metadata.metadata?.firebaseStorageDownloadTokens && "no download token",
    ].filter(Boolean);
    if (problems.length > 0)
      throw new Error(`${image.targetPath}: ${problems.join(", ")}`);
  }
}

// * for every converted image the store references: where its original is now
async function planRollback(bucket, storeDoc) {
  const images = storeDoc.data().images ?? [];
  const plans = await mapWithConcurrency(
    images,
    CONCURRENCY,
    async (imagePath) => {
      const [exists] = await bucket.file(imagePath).exists();
      if (!exists) return null;
      const [metadata] = await bucket.file(imagePath).getMetadata();
      const sourcePath = metadata.metadata?.sourcePath;
      if (!sourcePath) return null;

      const [sourceExists] = await bucket.file(sourcePath).exists();
      if (sourceExists) return { imagePath, sourcePath, backupPath: null };
      const backupPath = `backup/${sourcePath}`;
      const [backupExists] = await bucket.file(backupPath).exists();
      if (backupExists) return { imagePath, sourcePath, backupPath };
      return { imagePath, sourcePath, error: "original not found" };
    },
  );
  return plans.filter(Boolean);
}

async function rollbackStore(db, bucket, storeRef, plans) {
  const unrestorable = plans.find((plan) => plan.error);
  if (unrestorable)
    throw new Error(`${unrestorable.sourcePath}: ${unrestorable.error}`);

  // * copying keeps the original's metadata, so its download token comes back
  await Promise.all(
    plans
      .filter((plan) => plan.backupPath)
      .map((plan) =>
        bucket.file(plan.backupPath).copy(bucket.file(plan.sourcePath), {
          preconditionOpts: { ifGenerationMatch: 0 },
        }),
      ),
  );

  const originals = new Map(
    plans.map((plan) => [plan.imagePath, plan.sourcePath]),
  );
  let swappedPaths = [];
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(storeRef);
    const currentImages = snapshot.data()?.images ?? [];
    swappedPaths = currentImages.filter((imagePath) =>
      originals.has(imagePath),
    );
    transaction.update(storeRef, {
      images: currentImages.map(
        (imagePath) => originals.get(imagePath) ?? imagePath,
      ),
    });
  });
  await deleteFiles(bucket, swappedPaths);
}

async function runRollback({ db, bucket, storeDocs, write }) {
  let restored = 0;
  let fromBackup = 0;
  let failures = 0;
  for (const storeDoc of storeDocs) {
    let plans;
    try {
      plans = await planRollback(bucket, storeDoc);
    } catch (error) {
      failures++;
      console.log(`${storeDoc.id}\n  FAILED   ${error.message}`);
      continue;
    }
    if (plans.length === 0) continue;
    console.log(storeDoc.id);
    for (const plan of plans)
      console.log(
        plan.error
          ? `  cannot   ${plan.imagePath} — ${plan.sourcePath}: ${plan.error}`
          : `  restore  ${plan.imagePath} → ${plan.sourcePath}${plan.backupPath ? " (from backup)" : ""}`,
      );
    if (!write) continue;
    try {
      await rollbackStore(db, bucket, storeDoc.ref, plans);
      restored += plans.length;
      fromBackup += plans.filter((plan) => plan.backupPath).length;
    } catch (error) {
      failures++;
      console.log(`  FAILED   ${error.message}`);
    }
  }
  console.log(
    write
      ? `\nRestored: ${restored} (${fromBackup} copied back from backup/)`
      : "\nDry run — nothing restored.",
  );
  console.log(`Failed stores: ${failures}`);
  return failures;
}

// * for every converted image the store references: is its original still
// * next to it (to move), already in backup/ (done), or gone from both
async function planCleanup(bucket, storeDoc) {
  const images = storeDoc.data().images ?? [];
  const plans = await mapWithConcurrency(
    images,
    CONCURRENCY,
    async (imagePath) => {
      const [exists] = await bucket.file(imagePath).exists();
      if (!exists) return null;
      const [metadata] = await bucket.file(imagePath).getMetadata();
      const sourcePath = metadata.metadata?.sourcePath;
      if (!sourcePath) return null;

      const backupPath = `backup/${sourcePath}`;
      const [[sourceExists], [backupExists]] = await Promise.all([
        bucket.file(sourcePath).exists(),
        bucket.file(backupPath).exists(),
      ]);
      if (!sourceExists)
        return backupExists
          ? { sourcePath, backupPath, status: "done" }
          : { sourcePath, backupPath, status: "lost" };
      const [sourceMetadata] = await bucket.file(sourcePath).getMetadata();
      return {
        sourcePath,
        backupPath,
        backupExists,
        status: "move",
        bytes: Number(sourceMetadata.size),
        generation: sourceMetadata.generation,
        md5Hash: sourceMetadata.md5Hash,
      };
    },
  );
  return plans.filter(Boolean);
}

// * copy to backup/ (never over an existing object), check the copy matches,
// * then delete the original only if it hasn't changed since we looked
async function moveToBackup(bucket, plan) {
  if (!plan.backupExists)
    await bucket.file(plan.sourcePath).copy(bucket.file(plan.backupPath), {
      preconditionOpts: { ifGenerationMatch: 0 },
    });
  const [backupMetadata] = await bucket.file(plan.backupPath).getMetadata();
  if (backupMetadata.md5Hash !== plan.md5Hash)
    throw new Error(`${plan.backupPath} does not match ${plan.sourcePath}`);
  await bucket
    .file(plan.sourcePath)
    .delete({ ifGenerationMatch: plan.generation });
}

async function runCleanup({ bucket, storeDocs, write }) {
  let moved = 0;
  let movedBytes = 0;
  let alreadyDone = 0;
  let failures = 0;
  for (const storeDoc of storeDocs) {
    let plans;
    try {
      plans = await planCleanup(bucket, storeDoc);
    } catch (error) {
      failures++;
      console.log(`${storeDoc.id}\n  FAILED   ${error.message}`);
      continue;
    }
    alreadyDone += plans.filter((plan) => plan.status === "done").length;
    const pending = plans.filter((plan) => plan.status !== "done");
    if (pending.length === 0) continue;
    console.log(storeDoc.id);
    for (const plan of pending) {
      if (plan.status === "lost") {
        failures++;
        console.log(
          `  cannot   ${plan.sourcePath} — not in place and not in backup/`,
        );
        continue;
      }
      console.log(
        `  move     ${plan.sourcePath} (${megabytes(plan.bytes)}) → ${plan.backupPath}`,
      );
      if (!write) continue;
      try {
        await moveToBackup(bucket, plan);
        moved++;
        movedBytes += plan.bytes;
      } catch (error) {
        failures++;
        console.log(`  FAILED   ${error.message}`);
      }
    }
  }
  console.log(
    write
      ? `\nMoved to backup/: ${moved} (${megabytes(movedBytes)})`
      : "\nDry run — nothing moved.",
  );
  console.log(`Already in backup/: ${alreadyDone}`);
  console.log(`Failed: ${failures}`);
  return failures;
}

const megabytes = (bytes) => `${(bytes / 1e6).toFixed(2)} MB`;

function percentile(values, fraction) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[
    Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1)
  ];
}

function printImage(image) {
  if (image.status === "convert") {
    console.log(
      `  convert  ${image.imagePath} (${megabytes(image.bytes)}) → ${image.targetPath} (${megabytes(image.outputBytes)})`,
    );
  } else {
    console.log(
      `  skip     ${image.imagePath} — ${SKIP_REASONS[image.status]}`,
    );
  }
}

function printSummary(allImages, { write, failures }) {
  const converted = allImages.filter((image) => image.status === "convert");
  const beforeBytes = allImages.reduce((sum, image) => sum + image.bytes, 0);
  const afterBytes = allImages.reduce(
    (sum, image) =>
      sum + (image.status === "convert" ? image.outputBytes : image.bytes),
    0,
  );
  const outputSizes = converted.map((image) => image.outputBytes);

  console.log(
    `\n${write ? "Converted" : "Would convert"}: ${converted.length}`,
  );
  for (const [status, reason] of Object.entries(SKIP_REASONS)) {
    const count = allImages.filter((image) => image.status === status).length;
    if (count > 0) console.log(`Skipped (${reason}): ${count}`);
  }
  console.log(`Failed stores: ${failures}`);
  console.log(
    `Referenced images: ${megabytes(beforeBytes)} → ${megabytes(afterBytes)}`,
  );
  if (converted.length > 0)
    console.log(
      `New files: p95 ${megabytes(percentile(outputSizes, 0.95))}, max ${megabytes(Math.max(...outputSizes))}`,
    );
}

async function main() {
  const { prefix, only, rollback, cleanup, write } = parseArgs(
    process.argv.slice(2),
  );

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_SERVER_PROJECT_ID,
      clientEmail: process.env.FIREBASE_SERVER_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_SERVER_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n",
      ),
    }),
    storageBucket: BUCKET_NAME,
  });
  const db = getFirestore();
  const bucket = getStorage().bucket();
  const collection = db.collection(prefix);

  let storeDocs;
  if (only) {
    const storeDoc = await collection.doc(only).get();
    if (!storeDoc.exists) {
      console.error(`No store ${only} in ${prefix}.`);
      process.exit(1);
    }
    storeDocs = [storeDoc];
  } else {
    storeDocs = (await collection.get()).docs;
  }

  if (cleanup) {
    console.log(
      `${write ? "WRITE" : "DRY RUN"} · CLEANUP · ${prefix} · ${storeDocs.length} store(s)\n`,
    );
    const failures = await runCleanup({ bucket, storeDocs, write });
    process.exit(failures > 0 ? 1 : 0);
  }

  if (rollback) {
    console.log(
      `${write ? "WRITE" : "DRY RUN"} · ROLLBACK · ${prefix} · ${storeDocs.length} store(s)\n`,
    );
    const failures = await runRollback({ db, bucket, storeDocs, write });
    process.exit(failures > 0 ? 1 : 0);
  }

  console.log(
    `${write ? "WRITE" : "DRY RUN"} · ${prefix} · ${storeDocs.length} store(s) · ${IMAGE_OUTPUT_TYPE} ≤${IMAGE_MAX_EDGE}px q${IMAGE_QUALITY}\n`,
  );

  const allImages = [];
  let failures = 0;
  for (const storeDoc of storeDocs) {
    if ((storeDoc.data().images ?? []).length === 0) continue;
    console.log(storeDoc.id);
    let images;
    try {
      images = await planStore(bucket, prefix, storeDoc);
    } catch (error) {
      failures++;
      console.log(`  FAILED   ${error.message}`);
      continue;
    }
    images.forEach(printImage);
    if (write) {
      try {
        await convertStore(db, bucket, storeDoc.ref, images);
      } catch (error) {
        failures++;
        console.log(`  FAILED   ${error.message}`);
        for (const image of images)
          if (image.status === "convert") image.status = "failed";
      }
    }
    for (const image of images) delete image.output;
    allImages.push(...images);
  }

  printSummary(allImages, { write, failures });
  process.exit(failures > 0 ? 1 : 0);
}

await main();
