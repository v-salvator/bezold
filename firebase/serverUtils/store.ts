import { db } from "@/firebase/server";
import { Store, STORE_CATEGORY } from "@/types";
import { getImagesByPath } from "./image";
import { getUserById } from "./user";
import { COLLECTIONS } from "./constants";

const COLLECTION = COLLECTIONS.STORE;

// Store related

export const getStores = async (searchObj: Record<string, string>) => {
  const storesRef = db.collection(COLLECTION);

  // * default search object to reduce the firestore compound index
  const defaultSearchObj = {
    category: "all",
    amountMin: "0",
    amountMax: "99999",
  };
  const mergedSearchObj = { ...defaultSearchObj, ...searchObj };

  const storesWithQueryRef = Object.entries(mergedSearchObj).reduce(
    (ref, [searchObjKey, searchValue]) => {
      switch (searchObjKey) {
        case "city":
          return ref.where("city", "==", searchValue);
        // case "district":
        //   if (searchValue === "all") return ref.where("district", "in", []);
        //   return ref.where("district", "==", searchValue);
        case "tag":
          if (searchValue === "all") return ref;
          return ref.where("tags", "array-contains", searchValue);
        case "amountMin":
          return ref.where("price", ">=", parseInt(searchValue) * 10000);
        case "amountMax":
          return ref.where("price", "<=", parseInt(searchValue) * 10000);
        case "category":
          if (searchValue === "all")
            return ref.where("category", "in", Object.values(STORE_CATEGORY));
          return ref.where("category", "==", searchValue);
        default:
          return ref;
      }
    },
    storesRef as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>
  );
  const snapshot = await storesWithQueryRef.orderBy("updateTime", "desc").get();

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
