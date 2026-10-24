// * shared by the browser upload resize and scripts/shrink-store-images.mjs —
// * keep erasable-only TS (no enums / path aliases) so Node can import it
export const IMAGE_MAX_EDGE = 1600;
export const IMAGE_QUALITY = 80; // 0–100; canvas.toBlob takes IMAGE_QUALITY / 100
export const IMAGE_SKIP_BYTES = 300 * 1024;
export const IMAGE_OUTPUT_TYPE: "image/webp" | "image/jpeg" = "image/webp";
export const IMAGE_OUTPUT_EXTENSION = IMAGE_OUTPUT_TYPE.split("/")[1];
// * written to each converted object, e.g. "webp-1600-q80"
export const IMAGE_SETTINGS_TAG = `${IMAGE_OUTPUT_EXTENSION}-${IMAGE_MAX_EDGE}-q${IMAGE_QUALITY}`;

// * hard limits for anything sent to Storage — keep in sync with
// * isAllowedImage() in storage.rules (SVG is left out: it can carry scripts)
export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// * digital-asset revenue screenshots (verification/): long phone screenshots
// * shrunk to 1600px blur the numbers admins need to read
export const VERIFICATION_IMAGE_MAX_EDGE = 2400;
export const VERIFICATION_IMAGE_MAX_COUNT = 10;
