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

const COLLECTION = COLLECTIONS.STORE;

export const uploadStoreImageByFile = async (
  storeId: Store["id"],
  file: File
) => {
  const storageRef = ref(storage, `${COLLECTION}/${storeId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
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
  imagePath: Store["images"][number]
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
