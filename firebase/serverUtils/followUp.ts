import { db } from "@/firebase/server";
import { COLLECTIONS } from "@/firebase/constants";
import type { FollowUpDoc, FollowUpState, Store } from "@/types";
import { hashToken, isWellFormedToken } from "@/lib/followUp/token";
import { isLinkUsable } from "@/utils/followUp";
import { mapStoreDoc } from "./store";

const followUps = () => db.collection(COLLECTIONS.FOLLOW_UP);

const toDate = (value: FirebaseFirestore.Timestamp | null | undefined) =>
  value ? value.toDate() : null;

// * the fields utils/followUp.ts reasons about, with Dates
export const toFollowUpState = (followUp: FollowUpDoc): FollowUpState => ({
  sentCount: followUp.sentCount ?? 0,
  lastSentTime: toDate(followUp.lastSentTime),
  lastAnswer: followUp.lastAnswer ?? null,
  lastAnswerTime: toDate(followUp.lastAnswerTime),
  paused: followUp.paused ?? false,
});

export interface ListingCheck {
  store: Store; // * raw doc — never send it to the browser as is
  followUp: FollowUpDoc;
}

// * the store behind an emailed link, or null when the link is malformed,
// * unknown, used, expired, or its store is no longer approved. One answer for
// * every failure, so the page reveals nothing about which one it was.
export const findUsableListingCheck = async (
  token: unknown,
  now = new Date(),
): Promise<ListingCheck | null> => {
  if (!isWellFormedToken(token)) return null;

  const snapshot = await followUps()
    .where("tokenHash", "==", hashToken(token))
    .limit(1)
    .get();
  if (snapshot.empty) return null;

  const followUpSnapshot = snapshot.docs[0];
  const followUp = followUpSnapshot.data() as FollowUpDoc;
  const storeSnapshot = await db
    .collection(COLLECTIONS.STORE)
    .doc(followUpSnapshot.id)
    .get();
  if (!storeSnapshot.exists) return null;

  const store = mapStoreDoc(storeSnapshot);
  const usable = isLinkUsable(
    {
      tokenUsed: followUp.tokenUsed,
      tokenExpireTime: toDate(followUp.tokenExpireTime),
    },
    store.status,
    now,
  );
  return usable ? { store, followUp } : null;
};
