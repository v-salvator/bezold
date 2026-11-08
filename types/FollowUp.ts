import type { Timestamp } from "firebase-admin/firestore";

export const FOLLOW_UP_ANSWER = {
  SOLD: "sold",
  STILL_SELLING: "still_selling",
} as const;

export type FollowUpAnswer =
  (typeof FOLLOW_UP_ANSWER)[keyof typeof FOLLOW_UP_ANSWER];

// * why the cron couldn't email a store — shown in admin
export const FOLLOW_UP_ERROR = {
  NO_EMAIL: "no_email",
} as const;

// * the follow-up email state of one store. Doc id = storeId. Admin SDK only
// * (firestore.rules denies every client, admins included).
export interface FollowUpDoc {
  storeId: string;
  sentCount: number; // * total follow-up emails sent, ever
  lastSentTime: Timestamp | null;
  lastAnswer: FollowUpAnswer | null;
  lastAnswerTime: Timestamp | null;
  paused: boolean; // * admin switch — true = never email this store again
  // * the current link — replaced on every send, so older links die
  tokenHash: string; // * sha256(token) hex; "" when none outstanding
  tokenExpireTime: Timestamp | null;
  tokenUsed: boolean;
  lastError: string; // * "" or why the last attempt didn't send
}

// * FollowUpDoc with Dates — what the pure logic in utils/followUp.ts reads
export interface FollowUpState {
  sentCount: number;
  lastSentTime: Date | null;
  lastAnswer: FollowUpAnswer | null;
  lastAnswerTime: Date | null;
  paused: boolean;
}
