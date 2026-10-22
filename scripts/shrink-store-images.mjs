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
//
// --prefix is both the Firestore collection and the Storage folder. It is
// required on purpose: dev and prod share one Firebase project.
//
// Settings come from constant/image.ts, which Node imports by stripping its
// types. package.json has no "type", so Node warns MODULE_TYPELESS_PACKAGE_JSON;
// it is harmless — add --disable-warning=MODULE_TYPELESS_PACKAGE_JSON to hide it.

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
  IMAGE_SKIP_BYTES,
} from "../constant/image.ts";

const BUCKET_NAME = "bezold.appspot.com";
const PREFIXES = ["mockStore", "prodStore"];
const CONCURRENCY = 4;
const USAGE =
  "Usage: node --env-file=.env scripts/shrink-store-images.mjs --prefix <mockStore|prodStore> [--only <storeId>] [--write]";

const SKIP_REASONS = {
  missing: "object not found",
  converted: "already converted",
  small: "already within limits",
  larger: "output not smaller",
  unreadable: "could not decode",
  outside: "path outside prefix",
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
  return { prefix, only, write: argv.includes("--write") };
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
    contentType: metadata.contentType,
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
      `  convert  ${image.imagePath} (${megabytes(image.bytes)}) → ${image.targetPath} (${megabytes(image.output.length)})`,
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
      sum + (image.status === "convert" ? image.output.length : image.bytes),
    0,
  );
  const outputSizes = converted.map((image) => image.output.length);

  console.log(
    `\n${write ? "Converted" : "Would convert"}: ${converted.length}`,
  );
  for (const [status, reason] of Object.entries(SKIP_REASONS)) {
    const count = allImages.filter((image) => image.status === status).length;
    if (count > 0) console.log(`Skipped (${reason}): ${count}`);
  }
  console.log(`Failed: ${failures}`);
  console.log(
    `Referenced images: ${megabytes(beforeBytes)} → ${megabytes(afterBytes)}`,
  );
  if (converted.length > 0)
    console.log(
      `New files: p95 ${megabytes(percentile(outputSizes, 0.95))}, max ${megabytes(Math.max(...outputSizes))}`,
    );
}

async function main() {
  const { prefix, only, write } = parseArgs(process.argv.slice(2));

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
    allImages.push(...images);
  }

  printSummary(allImages, { write, failures });
  process.exit(failures > 0 ? 1 : 0);
}

await main();
