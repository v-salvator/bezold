import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/firebase/server";
import { COLLECTIONS } from "@/firebase/constants";
import {
  FOLLOW_UP_ANSWER,
  SOLD_VIA,
  STORE_STATUS,
  type FollowUpAnswer,
  type FollowUpDoc,
  type FollowUpState,
  type Store,
} from "@/types";
import { hashToken, isWellFormedToken } from "@/lib/followUp/token";
import { isLinkUsable, pickRecipient } from "@/utils/followUp";
import { mapStoreDoc } from "./store";
import { getUsersByIds } from "./user";

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

// * records the seller's answer in one transaction, so a double click or two
// * tabs can't both use the link. Returns the store as it was before the
// * answer, or null when the link isn't usable (same rules as the page).
export const answerListingCheck = async (
  token: unknown,
  answer: FollowUpAnswer,
  now = new Date(),
): Promise<Store | null> => {
  if (!isWellFormedToken(token)) return null;
  const tokenQuery = followUps()
    .where("tokenHash", "==", hashToken(token))
    .limit(1);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(tokenQuery);
    if (snapshot.empty) return null;
    const followUpRef = snapshot.docs[0].ref;
    const followUp = snapshot.docs[0].data() as FollowUpDoc;

    const storeRef = db.collection(COLLECTIONS.STORE).doc(followUpRef.id);
    const storeSnapshot = await transaction.get(storeRef);
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
    if (!usable) return null;

    const answeredAt = Timestamp.fromDate(now);
    transaction.update(followUpRef, {
      tokenUsed: true,
      lastAnswer: answer,
      lastAnswerTime: answeredAt,
    });
    if (answer === FOLLOW_UP_ANSWER.SOLD) {
      transaction.update(storeRef, {
        status: STORE_STATUS.SOLD,
        soldTime: answeredAt,
        soldVia: SOLD_VIA.FOLLOW_UP_EMAIL,
        updateTime: answeredAt,
      });
    }
    return store;
  });
};

export interface SellerRecipient {
  email: string | null; // * null = nowhere to send
  name: string;
}

// * per store: the seller's account email (user doc, else Firebase Auth),
// * then the listing's contact email for admin-created listings
export const resolveSellerRecipients = async (
  stores: Store[],
): Promise<Map<string, SellerRecipient>> => {
  const userIds = Array.from(
    new Set(stores.map((store) => store.user).filter(Boolean)),
  ) as string[];
  const users = await getUsersByIds(userIds);

  return new Map(
    stores.map((store) => {
      const user = store.user ? users.get(store.user) : undefined;
      return [
        store.id,
        {
          email: pickRecipient({
            userEmail: user?.email,
            userInfoEmail: store.userInfo?.email,
          }),
          name: user?.userName || store.userInfo?.userName || "",
        },
      ];
    }),
  );
};
