import { db } from "@/firebase/server";
import { Store } from "@/types";
import { getImagesByPath } from "./image";
import { getUserById } from "./user";
import { COLLECTIONS } from "./constants";

const COLLECTION = COLLECTIONS.STORE;

// Store related

export const getStores = async () => {
  const storesRef = db.collection(COLLECTION);
  const snapshot = await storesRef.get();

  const stores: Store[] = []; // TODO: modify the type here
  snapshot.forEach((doc) => {
    const storeData = doc.data();
    const store = {
      id: doc.id,
      ...storeData,
      createTime: storeData.createTime.toDate(),
      updateTime: storeData.updateTime.toDate(),
    } as Store;
    stores.push(store);
  });

  // * transforming image path to visible url
  for (let storeData of stores) {
    const hasImage = storeData?.images?.length > 0;
    let images: string[] = [];
    // * get images here
    if (hasImage) {
      images = await getImagesByPath(storeData.images);
      storeData.images = images;
    }
  }

  return stores;
};

export const getStoreById = async (storeId: string) => {
  const storeRef = db.collection(COLLECTION).doc(storeId);
  const doc = await storeRef.get();
  if (!doc.exists) {
    return null;
  } else {
    const storeData = doc.data();
    // TODO: might not get all images, only get the first one
    const images = await getImagesByPath(storeData!.images);

    let userData = undefined;
    if (storeData?.user) {
      userData = await getUserById(storeData!.user);
    }

    const store = {
      id: doc.id,
      ...storeData,
      createTime: storeData!.createTime.toDate(),
      updateTime: storeData!.updateTime.toDate(),
      images: images,
      userInfo: userData,
    } as Store;
    console.log("🚀 ~ getStoreById ~ store:", store);
    return store;
  }
};

// TODO: create store
