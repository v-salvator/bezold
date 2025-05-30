import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/client";

import type { Store, StoreDoc } from "@/types";
import { COLLECTIONS } from "@/firebase/constants";

const COLLECTION = COLLECTIONS.STORE;

const storeConverter = {
  // * try to figure out how to use toFirestore, dosn't seem to work maybe seems only work on setDoc not upateDoc
  // * doc link: https://firebase.google.com/docs/reference/js/firestore_.firestoredataconverter
  toFirestore: (store: Store) => {
    return {
      ...store,
      updateTime: serverTimestamp(),
      createTime: store.createTime
        ? Timestamp.fromDate(store.createTime)
        : serverTimestamp(),
    };
  },
  fromFirestore: (storeSnaphot: any) => {
    const storeData = storeSnaphot.data() as StoreDoc;
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
  const collectionRef = collection(db, COLLECTION).withConverter(
    storeConverter
  );
  const storeRef = await addDoc(collectionRef, store);
  return storeRef;
};

export const getStores = async () => {
  const collectionRef = collection(db, COLLECTION).withConverter(
    storeConverter
  );
  const collectionQuery = query(collectionRef, orderBy("createTime", "desc"));
  const querySnapshot = await getDocs(collectionQuery);
  const stores: Store[] = []; // TODO: modify the type here

  querySnapshot.forEach((docSnap) => {
    const store = docSnap.data();
    stores.push(store);
  });
  return stores;
};

export const getStoreById = async (storeId: Store["id"]) => {
  const docRef = doc(db, COLLECTION, storeId).withConverter(storeConverter);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const store = docSnap.data();
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
