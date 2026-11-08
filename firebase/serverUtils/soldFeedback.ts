import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/firebase/server";
import { COLLECTIONS } from "@/firebase/constants";
import type {
  SoldFeedbackDoc,
  SoldFeedbackSummary,
  SoldVia,
  Store,
} from "@/types";
import type { SoldFeedbackFields } from "@/utils/soldFeedback";

// * gRPC code DocumentReference.create() throws when the doc exists
const ALREADY_EXISTS = 6;

const soldFeedback = () => db.collection(COLLECTIONS.SOLD_FEEDBACK);

// * one per store: create() fails if it exists, so a replay can never
// * overwrite the first answer
export const createSoldFeedback = async ({
  store,
  soldVia,
  fields,
}: {
  store: Store;
  soldVia: SoldVia;
  fields: SoldFeedbackFields;
}): Promise<"created" | "already_submitted"> => {
  const feedback: SoldFeedbackDoc = {
    storeId: store.id,
    storeName: store.storeName,
    listedPrice: store.price ?? 0,
    listedPriceNegotiable: Boolean(store.priceNegotiable),
    soldVia,
    ...fields,
    createTime: Timestamp.now(),
  };
  try {
    await soldFeedback().doc(store.id).create(feedback);
    return "created";
  } catch (error) {
    if ((error as { code?: number }).code === ALREADY_EXISTS) {
      return "already_submitted";
    }
    throw error;
  }
};

const toSummary = (
  snapshot: FirebaseFirestore.DocumentSnapshot,
): SoldFeedbackSummary => {
  const feedback = snapshot.data() as SoldFeedbackDoc;
  return { ...feedback, createTime: feedback.createTime.toMillis() };
};

export const getSoldFeedback = async (storeId: string) => {
  const snapshot = await soldFeedback().doc(storeId).get();
  return snapshot.exists ? toSummary(snapshot) : null;
};
