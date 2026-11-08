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
  where,
} from "firebase/firestore";
import { db } from "@/firebase/client";

import { STORE_STATUS } from "@/types";
import type { Store, StoreDoc, StoreStatus } from "@/types";
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
      // * only when present — an undefined key would break a later updateDoc
      ...(storeData?.approvedTime && {
        approvedTime: storeData.approvedTime.toDate(),
      }),
      ...(storeData?.soldTime && { soldTime: storeData.soldTime.toDate() }),
    } as Store;
  },
};

export const createStoreDoc = async (store: Store) => {
  const collectionRef = collection(db, COLLECTION).withConverter(
    storeConverter,
  );
  const storeRef = await addDoc(collectionRef, store);
  return storeRef;
};

export const getStores = async () => {
  const collectionRef = collection(db, COLLECTION).withConverter(
    storeConverter,
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
  editedStore: Partial<Store>,
) => {
  const docRef = doc(db, COLLECTION, storeId);
  await updateDoc(docRef, {
    ...editedStore,
    updateTime: serverTimestamp(),
  });
};

export const updateStoreStatus = async (
  storeId: Store["id"],
  status: StoreStatus,
) => {
  const docRef = doc(db, COLLECTION, storeId);
  await updateDoc(docRef, { status, updateTime: serverTimestamp() });
};

// * admin status change. The first approval also records approvedTime, which
// * the follow-up email counts from; re-approving keeps the original. Returns
// * whether approvedTime was stamped.
export const updateStoreStatusAsAdmin = async (
  store: Pick<Store, "id" | "approvedTime">,
  status: StoreStatus,
) => {
  const stampApproval = status === STORE_STATUS.APPROVED && !store.approvedTime;
  const docRef = doc(db, COLLECTION, store.id);
  await updateDoc(docRef, {
    status,
    updateTime: serverTimestamp(),
    ...(stampApproval && { approvedTime: serverTimestamp() }),
  });
  return stampApproval;
};

export const getStoresByUserId = async (userId: string) => {
  const collectionRef = collection(db, COLLECTION).withConverter(
    storeConverter,
  );
  const collectionQuery = query(
    collectionRef,
    where("user", "==", userId),
    orderBy("createTime", "desc"),
  );
  const querySnapshot = await getDocs(collectionQuery);
  const stores: Store[] = [];
  querySnapshot.forEach((docSnap) => {
    stores.push(docSnap.data());
  });
  return stores;
};
