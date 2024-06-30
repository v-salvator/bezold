import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/client";

import type { Store, StoreDoc } from "@/types";

const COLLECTION = "mockStore";

const storeDecorator = (storeSnaphot: any) => {
  const storeData = storeSnaphot.data() as StoreDoc;
  return {
    id: storeSnaphot.id,
    ...storeData,
    createTime: storeData?.createTime.toDate(),
    updateTime: storeData?.updateTime.toDate(),
  } as Store;
};

// * try to figure out how to use it Firestore data converter
const storeConverter = {
  toFirestore: (store: Store) => {
    return {
      ...store,
      updateTime: serverTimestamp(),
      createTime: Timestamp.fromDate(store.createTime),
    };
  },
  fromFirestore: (storeSnaphot: any) => {
    const storeData = storeSnaphot.data() as StoreDoc;
    console.log("🚀 ~ storeData:", storeData);
    return {
      ...storeData,
      // * addons
      id: storeSnaphot.id,
      createTime: storeData?.createTime.toDate(),
      updateTime: storeData?.updateTime.toDate(),
    } as Store;
  },
};

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

  querySnapshot.forEach((docSnap) => {
    const store = storeDecorator(docSnap);
    stores.push(store);
  });
  return stores;
};

export const getStoreById = async (storeId: Store["id"]) => {
  const docRef = doc(db, COLLECTION, storeId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const store = storeDecorator(docSnap);
    return store;
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
    return undefined;
  }
};

export const editStoreById = async (
  storeId: Store["id"],
  editedStore: Partial<Store>
) => {
  const docRef = doc(db, COLLECTION, storeId);
  const docSnap = await updateDoc(docRef, {
    ...editedStore,
    updateTime: serverTimestamp(),
  });
};
