import { db } from "@/firebase/server";
import { Store } from "@/types";

const COLLECTION = "mockStore";

export const getStores = async () => {
  const storesRef = db.collection(COLLECTION);
  const snapshot = await storesRef.get();
  const stores: Store[] = []; // * TODO: modify the type here
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
  return stores;
};

export const getStoreById = async (storeId: string) => {
  const storeRef = db.collection(COLLECTION).doc(storeId);
  const doc = await storeRef.get();
  if (!doc.exists) {
    return null;
  } else {
    const storeData = doc.data();
    const store = {
      id: doc.id,
      ...storeData,
      createTime: storeData!.createTime.toDate(),
      updateTime: storeData!.updateTime.toDate(),
    } as Store;
    return store;
  }
};
