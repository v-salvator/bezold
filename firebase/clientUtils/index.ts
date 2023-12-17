import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { Store } from "@/types";

const COLLECTION = "mockStore";

export const createStoreDoc = async (store: Store) => {
  const storeRef = await addDoc(collection(db, "mockStore"), {
    storeName: store.storeName,
    description: store.description,
    location: store.location,
    createTime: serverTimestamp(),
    updateTime: serverTimestamp(),
    tags: [store.tags],
    price: store.price,
    currency: "TWD",
    // * might need  to add user name etc.....
  });
};

export const getStores = async () => {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  const stores: Store[] = []; // TODO: modify the type here
  querySnapshot.forEach((doc) => {
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
