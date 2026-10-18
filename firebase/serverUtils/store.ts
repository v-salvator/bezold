import { db } from "@/firebase/server";
import {
  Store,
  STORE_CATEGORY,
  STORE_STATUS,
  STORE_TAG,
  type StoreStatus,
} from "@/types";
import { getImagesByPath } from "./image";
import { getUserById } from "./user";
import { COLLECTIONS } from "@/firebase/constants";

const COLLECTION = COLLECTIONS.STORE;

// * shared shape mapping — Firestore Timestamps → Date, doc id folded in.
const mapDocsToStores = (
  snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
): Store[] =>
  snapshot.docs.map((doc) => {
    const storeData = doc.data();
    return {
      id: doc.id,
      ...storeData,
      createTime: storeData.createTime.toDate(),
      updateTime: storeData.updateTime.toDate(),
    } as Store;
  });

// * resolve raw Storage paths to visible download URLs, mutating in place.
// * coverOnly: list cards only show images[0], so skip resolving (and
// * serializing) the rest — store.images becomes [coverUrl]
const resolveStoreImages = async (
  stores: Store[],
  { coverOnly = false }: { coverOnly?: boolean } = {},
): Promise<Store[]> => {
  await Promise.all(
    stores.map(async (store) => {
      if (store?.images?.length > 0) {
        const imagePaths = coverOnly ? store.images.slice(0, 1) : store.images;
        store.images = await getImagesByPath(imagePaths);
      }
    }),
  );
  return stores;
};

// Store related

interface GetStoresOptions {
  // * public pages pass the statuses they may show; admin passes nothing
  statuses?: StoreStatus[];
  // * public lists only need the cover image
  coverOnly?: boolean;
}

export const getStores = async (
  searchObj: Record<string, string>,
  { statuses, coverOnly }: GetStoresOptions = {},
) => {
  const storesRef = db.collection(COLLECTION);

  // * default search object to reduce the firestore compound index
  const defaultSearchObj = {
    category: "all",
    amountMin: 0,
  };
  const mergedSearchObj = { ...defaultSearchObj, ...searchObj };

  const storesWithQueryRef = Object.entries(mergedSearchObj).reduce(
    (ref, [searchObjKey, searchValue]) => {
      switch (searchObjKey) {
        case "city": {
          // * multi-select — "city" is a comma-separated list of city names.
          // * `in` reuses the same composite index as `==` (Taiwan has ~22
          // * cities, well under Firestore's 30-value `in` limit).
          const cityList = String(searchValue).split(",").filter(Boolean);
          if (cityList.length === 0) return ref;
          return ref.where("city", "in", cityList);
        }
        // case "district":
        //   if (searchValue === "all") return ref.where("district", "in", []);
        //   return ref.where("district", "==", searchValue);
        case "tag":
          if (searchValue === "all") return ref;
          return ref.where("tags", "array-contains", searchValue);
        case "amountMin":
          return ref.where(
            "price",
            ">=",
            parseInt(searchValue as string) * 10000,
          );
        case "amountMax":
          if (searchValue === "Infinity") return ref;
          return ref.where(
            "price",
            "<=",
            parseInt(searchValue as string) * 10000,
          );
        case "category":
          if (searchValue === "all")
            return ref.where("category", "in", Object.values(STORE_CATEGORY));
          return ref.where("category", "==", searchValue);
        default:
          return ref;
      }
    },
    storesRef as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>,
  );
  const snapshot = await storesWithQueryRef.orderBy("createTime", "desc").get();

  // * filter in memory — an extra `where` would need a new composite index —
  // * and before signing images, so hidden stores cost nothing
  const stores = mapDocsToStores(snapshot).filter(
    (store) => !statuses || (!!store.status && statuses.includes(store.status)),
  );
  return resolveStoreImages(stores, { coverOnly });
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
    return store;
  }
};

export const getHighlightedStores = async () => {
  const storesRef = db.collection(COLLECTION);

  const snapshot = await storesRef
    .where("tags", "array-contains", STORE_TAG.RECOMMENDED)
    .orderBy("createTime", "desc")
    .get();

  // * limit to 9 approved stores — filter before slicing so unapproved
  // * stores don't eat into the displayed count
  const approvedStores = mapDocsToStores(snapshot)
    .filter((store) => store.status === STORE_STATUS.APPROVED)
    .slice(0, 9);

  return resolveStoreImages(approvedStores, { coverOnly: true });
};

export const getEmergencyStores = async () => {
  const storesRef = db.collection(COLLECTION);

  const snapshot = await storesRef
    .where("tags", "array-contains", STORE_TAG.EMERGENCY)
    .orderBy("createTime", "desc")
    .get();

  // * limit to 9 approved stores — filter before slicing so unapproved
  // * stores don't eat into the displayed count
  const approvedStores = mapDocsToStores(snapshot)
    .filter((store) => store.status === STORE_STATUS.APPROVED)
    .slice(0, 9);

  return resolveStoreImages(approvedStores, { coverOnly: true });
};

export const getSoldStores = async () => {
  const storesRef = db.collection(COLLECTION);

  // * single-field equality query — no composite index needed; sort in memory
  const snapshot = await storesRef
    .where("status", "==", STORE_STATUS.SOLD)
    .get();

  // * newest transfers first — updateTime records when the status flipped to
  // * sold (via updateStoreStatus), unlike createTime which is the listing date.
  const soldStores = mapDocsToStores(snapshot)
    .sort((a, b) => b.updateTime.getTime() - a.updateTime.getTime())
    .slice(0, 9);

  return resolveStoreImages(soldStores, { coverOnly: true });
};

// TODO: create store
