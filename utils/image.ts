import {
  IMAGE_MAX_EDGE,
  IMAGE_OUTPUT_TYPE,
  IMAGE_QUALITY,
  IMAGE_SKIP_BYTES,
} from "@/constant/image";

// * animations and vector art would be flattened into one raster frame
const PASSTHROUGH_TYPES = ["image/gif", "image/svg+xml"];
const FALLBACK_TYPE = "image/jpeg";

const canvasToBlob = (canvas: HTMLCanvasElement, type: string) =>
  new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, IMAGE_QUALITY / 100),
  );

const splitFileName = (fileName: string) => {
  const extensionIndex = fileName.lastIndexOf(".");
  if (extensionIndex <= 0) return { baseName: fileName, extension: "" };
  return {
    baseName: fileName.slice(0, extensionIndex),
    extension: fileName.slice(extensionIndex),
  };
};

// * shrink a photo before it reaches Storage (longest edge ≤ IMAGE_MAX_EDGE,
// * WebP). Any failure returns the original file so a seller is never
// * blocked from uploading.
export const resizeImageFile = async (file: File): Promise<File> => {
  if (PASSTHROUGH_TYPES.includes(file.type)) return file;

  try {
    // * applies EXIF orientation, so portrait phone photos stay upright
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const longestEdge = Math.max(bitmap.width, bitmap.height);
    if (longestEdge <= IMAGE_MAX_EDGE && file.size <= IMAGE_SKIP_BYTES) {
      bitmap.close();
      return file;
    }

    const scale = Math.min(1, IMAGE_MAX_EDGE / longestEdge);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    let blob = await canvasToBlob(canvas, IMAGE_OUTPUT_TYPE);
    // * browsers that can't encode WebP (older Safari) hand back a PNG instead
    if (blob?.type !== IMAGE_OUTPUT_TYPE) {
      // * JPEG has no alpha — paint white behind transparent pixels
      context.globalCompositeOperation = "destination-over";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      blob = await canvasToBlob(canvas, FALLBACK_TYPE);
    }
    if (!blob || !blob.type.startsWith("image/") || blob.size >= file.size)
      return file;

    const { baseName } = splitFileName(file.name);
    return new File([blob], `${baseName}.${blob.type.split("/")[1]}`, {
      type: blob.type,
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
};

// * a short random suffix keeps Storage paths unique: after resizing,
// * IMG_1.jpg and IMG_1.png would both become IMG_1.webp, and arrayUnion
// * would silently keep only one of them
export const toUniqueFileName = (fileName: string) => {
  const { baseName, extension } = splitFileName(fileName);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${baseName}-${suffix}${extension}`;
};
