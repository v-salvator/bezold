import { storage, db } from "@/firebase/client";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import {
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  arrayRemove,
} from "firebase/firestore";
import { Store } from "@/types";
import { COLLECTIONS } from "@/firebase/constants";
import { VERIFICATION_IMAGE_MAX_EDGE } from "@/constant/image";
import {
  assertUploadableImage,
  resizeImageFile,
  toUniqueFileName,
} from "@/utils/image";

const COLLECTION = COLLECTIONS.STORE;

export const uploadStoreImageByFile = async (
  storeId: Store["id"],
  file: File,
) => {
  // * shrink in the browser first — originals are what visitors download
  const resizedFile = await resizeImageFile(file);
  // * throws before any Storage call — callers check isImageUploadLimitError
  assertUploadableImage(resizedFile);
  const storageRef = ref(
    storage,
    `${COLLECTION}/${storeId}/${toUniqueFileName(resizedFile.name)}`,
  );
  const snapshot = await uploadBytes(
    storageRef,
    resizedFile,
    resizedFile.type ? { contentType: resizedFile.type } : undefined,
  );
  // * after upload image update images path to store doc
  const docRef = doc(db, COLLECTION, storeId);
  await updateDoc(docRef, {
    images: arrayUnion(snapshot.metadata.fullPath),
    updateTime: serverTimestamp(),
  });
  return snapshot;
};

export const delateStoreImage = async (
  storeId: Store["id"],
  imagePath: Store["images"][number],
) => {
  const imageRef = ref(storage, `${imagePath}`);
  const snapshot = await deleteObject(imageRef);
  // * after delete image remove image path from store doc
  const docRef = doc(db, COLLECTION, storeId);
  await updateDoc(docRef, {
    images: arrayRemove(imagePath),
    updateTime: serverTimestamp(),
  });
  return snapshot;
};

// * digital-asset revenue screenshots — kept apart from `images` in their own
// * field and Storage folder (storage.rules: admin + owner only), so no public
// * page ever resolves them
export const uploadVerificationImageByFile = async (
  storeId: Store["id"],
  file: File,
) => {
  const resizedFile = await resizeImageFile(file, {
    maxEdge: VERIFICATION_IMAGE_MAX_EDGE,
  });
  // * throws before any Storage call — callers check isImageUploadLimitError
  assertUploadableImage(resizedFile);
  const storageRef = ref(
    storage,
    `${COLLECTION}/${storeId}/verification/${toUniqueFileName(resizedFile.name)}`,
  );
  const snapshot = await uploadBytes(
    storageRef,
    resizedFile,
    resizedFile.type ? { contentType: resizedFile.type } : undefined,
  );
  const docRef = doc(db, COLLECTION, storeId);
  await updateDoc(docRef, {
    verificationImages: arrayUnion(snapshot.metadata.fullPath),
    updateTime: serverTimestamp(),
  });
  return snapshot;
};

export const deleteVerificationImage = async (
  storeId: Store["id"],
  imagePath: string,
) => {
  await deleteObject(ref(storage, imagePath));
  const docRef = doc(db, COLLECTION, storeId);
  await updateDoc(docRef, {
    verificationImages: arrayRemove(imagePath),
    updateTime: serverTimestamp(),
  });
};

export const getImagesByPath = async (imagesPath: string[]) => {
  if (!imagesPath || imagesPath.length === 0) return [];
  const imagePathPromises = imagesPath.map((imagePath) => {
    return getImageByPath(imagePath);
  });
  const imagesUrl = await Promise.all(imagePathPromises);

  return imagesUrl;
};

export const getImageByPath = async (imagePath: string) => {
  const imageRef = ref(storage, imagePath);
  let imageUrl = "no-image";
  try {
    imageUrl = await getDownloadURL(imageRef);
  } catch (err) {
    console.log("🚀 ~ getImageByPath ~ err", err);
  }
  return imageUrl;
};
