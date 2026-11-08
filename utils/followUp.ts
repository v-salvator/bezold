// * no runtime `@/` imports here — tests/unit runs this file with plain
// * `node --test`, which cannot resolve the alias. Type-only imports are fine.
import { STORE_STATUS } from "../types/StoreStatus.ts";
import { FOLLOW_UP_ANSWER } from "../types/FollowUp.ts";
import type { FollowUpState } from "../types/FollowUp.ts";
import type { Store, StoreStatus } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

// * first email this long after approval, then every REPEAT days after the
// * last email or 「還在頂讓」 answer, whichever is later
export const FIRST_FOLLOW_UP_DAYS = 60;
export const REPEAT_FOLLOW_UP_DAYS = 30;
// * how long an emailed link stays usable
export const FOLLOW_UP_LINK_DAYS = 30;
export const DEFAULT_MAX_PER_RUN = 100;

type FollowUpStore = Pick<Store, "status" | "approvedTime" | "createTime">;

export const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * DAY_MS);

// * the first email counts from first approval; stores approved before
// * approvedTime existed fall back to createTime
export const followUpAnchor = (
  store: Pick<Store, "approvedTime" | "createTime">,
) => store.approvedTime ?? store.createTime;

// * when this store's next follow-up email is due, or null if it never will
// * be (not approved, or an admin paused it)
export const nextFollowUpDate = (
  store: FollowUpStore,
  followUp: FollowUpState | null,
): Date | null => {
  if (store.status !== STORE_STATUS.APPROVED) return null;
  if (followUp?.paused) return null;
  if (!followUp || followUp.sentCount === 0 || !followUp.lastSentTime) {
    return addDays(followUpAnchor(store), FIRST_FOLLOW_UP_DAYS);
  }
  const stillSellingAt =
    followUp.lastAnswer === FOLLOW_UP_ANSWER.STILL_SELLING
      ? followUp.lastAnswerTime
      : null;
  const lastContact =
    stillSellingAt && stillSellingAt > followUp.lastSentTime
      ? stillSellingAt
      : followUp.lastSentTime;
  return addDays(lastContact, REPEAT_FOLLOW_UP_DAYS);
};

export const isFollowUpDue = (
  store: FollowUpStore,
  followUp: FollowUpState | null,
  now: Date,
) => {
  const dueDate = nextFollowUpDate(store, followUp);
  return dueDate !== null && dueDate.getTime() <= now.getTime();
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// * the seller's account email first, then the listing's contact email
// * (admin-created listings have no account); null when neither is usable
export const pickRecipient = ({
  userEmail,
  userInfoEmail,
}: {
  userEmail?: string;
  userInfoEmail?: string;
}) =>
  [userEmail, userInfoEmail]
    .map((email) => email?.trim() ?? "")
    .find((email) => EMAIL_PATTERN.test(email)) ?? null;

// * FOLLOW_UP_MAX_PER_RUN — anything but a positive whole number means default
export const parseMaxPerRun = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : DEFAULT_MAX_PER_RUN;
};

// * an emailed link works once, until it expires, and only while the store
// * is still approved
export const isLinkUsable = (
  link: { tokenUsed: boolean; tokenExpireTime: Date | null },
  storeStatus: StoreStatus | undefined,
  now: Date,
) =>
  !link.tokenUsed &&
  link.tokenExpireTime !== null &&
  link.tokenExpireTime.getTime() > now.getTime() &&
  storeStatus === STORE_STATUS.APPROVED;

// * Vercel runs in UTC — every date shown to sellers and admins is Taipei time
const taipeiParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return {
    date: `${part("year")}/${part("month")}/${part("day")}`,
    time: `${part("hour")}:${part("minute")}`,
  };
};

// * 2026/07/05
export const formatTaipeiDate = (date: Date) => taipeiParts(date).date;

// * 2026/07/05 14:32
export const formatTaipeiDateTime = (date: Date) => {
  const { date: day, time } = taipeiParts(date);
  return `${day} ${time}`;
};

export interface FollowUpCandidate {
  storeId: string;
  dueDate: Date;
  email: string | null;
}

// * one cron run: longest-overdue first. Stores without an email are set
// * aside (they don't use up the cap); the rest past the cap wait a day.
export const planFollowUpRun = <Candidate extends FollowUpCandidate>(
  candidates: Candidate[],
  maxPerRun: number,
) => {
  const byDueDate = [...candidates].sort(
    (left, right) => left.dueDate.getTime() - right.dueDate.getTime(),
  );
  const sendable = byDueDate.filter((candidate) => candidate.email);
  return {
    toSend: sendable.slice(0, maxPerRun),
    deferred: sendable.slice(maxPerRun),
    noEmail: byDueDate.filter((candidate) => !candidate.email),
  };
};
