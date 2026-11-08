// * no runtime `@/` imports here — tests/unit runs this file with plain
// * `node --test`, which cannot resolve the alias. Type-only imports are fine.
import { BUYER_SOURCE, SOLD_DURATION } from "../types/SoldFeedback.ts";
import type {
  BuyerSource,
  Satisfaction,
  SoldDuration,
} from "../types/SoldFeedback.ts";

export const SOLD_FEEDBACK_COMMENT_MAX_LENGTH = 500;
// * 萬; 10 億 is far above any listing on the site
const MAX_FINAL_PRICE_WAN = 100_000;

// * keys a submission may carry: the five answers, plus how each path proves
// * the seller (email link token, or storeId with a member ID token)
const ALLOWED_KEYS = new Set([
  "token",
  "storeId",
  "soldDuration",
  "buyerSource",
  "finalPriceWan",
  "satisfaction",
  "comment",
]);

export interface SoldFeedbackFields {
  soldDuration: SoldDuration | null;
  buyerSource: BuyerSource | null;
  finalPrice: number | null; // * NT$
  satisfaction: Satisfaction | null;
  comment: string;
}

export type ParsedSoldFeedback =
  | { ok: true; fields: SoldFeedbackFields }
  | { ok: false; error: "invalid_field" | "empty_feedback" };

const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

const INVALID = { ok: false, error: "invalid_field" } as const;

const oneOf = <Value extends string>(
  value: unknown,
  allowed: Record<string, Value>,
): Value | null | undefined => {
  if (isBlank(value)) return null;
  return Object.values(allowed).includes(value as Value)
    ? (value as Value)
    : undefined;
};

// * every answer is optional; undefined = present but invalid
const parsePriceWan = (value: unknown): number | null | undefined => {
  if (isBlank(value)) return null;
  const wan = typeof value === "string" ? Number(value.trim()) : value;
  if (typeof wan !== "number" || !Number.isFinite(wan)) return undefined;
  if (wan < 0 || wan > MAX_FINAL_PRICE_WAN) return undefined;
  return Math.round(wan * 10_000);
};

const parseSatisfaction = (value: unknown): Satisfaction | null | undefined => {
  if (isBlank(value)) return null;
  return Number.isInteger(value) &&
    (value as number) >= 1 &&
    (value as number) <= 5
    ? (value as Satisfaction)
    : undefined;
};

const parseComment = (value: unknown): string | undefined => {
  if (isBlank(value)) return "";
  if (typeof value !== "string") return undefined;
  const comment = value.trim();
  // * count characters, not UTF-16 units — an emoji is one
  return Array.from(comment).length <= SOLD_FEEDBACK_COMMENT_MAX_LENGTH
    ? comment
    : undefined;
};

export const parseSoldFeedback = (body: unknown): ParsedSoldFeedback => {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return INVALID;
  }
  const input = body as Record<string, unknown>;
  if (Object.keys(input).some((key) => !ALLOWED_KEYS.has(key))) return INVALID;

  const soldDuration = oneOf(input.soldDuration, SOLD_DURATION);
  const buyerSource = oneOf(input.buyerSource, BUYER_SOURCE);
  const finalPrice = parsePriceWan(input.finalPriceWan);
  const satisfaction = parseSatisfaction(input.satisfaction);
  const comment = parseComment(input.comment);

  if (
    soldDuration === undefined ||
    buyerSource === undefined ||
    finalPrice === undefined ||
    satisfaction === undefined ||
    comment === undefined
  ) {
    return INVALID;
  }

  const fields = {
    soldDuration,
    buyerSource,
    finalPrice,
    satisfaction,
    comment,
  };
  const answeredAnything =
    soldDuration !== null ||
    buyerSource !== null ||
    finalPrice !== null ||
    satisfaction !== null ||
    comment !== "";
  return answeredAnything
    ? { ok: true, fields }
    : { ok: false, error: "empty_feedback" };
};

// * 成交價 ÷ 刊登價 as a whole percent; null without a final price or when the
// * listing had no price (面議 / 免頂讓金)
export const priceRatioPercent = ({
  finalPrice,
  listedPrice,
}: {
  finalPrice: number | null;
  listedPrice: number;
}) =>
  finalPrice === null || listedPrice <= 0
    ? null
    : Math.round((finalPrice / listedPrice) * 100);

type SummaryInput = {
  storeId: string;
  soldDuration: SoldDuration | null;
  buyerSource: BuyerSource | null;
  finalPrice: number | null;
  listedPrice: number;
  satisfaction: Satisfaction | null;
};

const percentOf = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 100) : null;

const averageOf = (values: number[]) =>
  values.length > 0
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;

const countBy = <Key extends string>(
  keys: Record<string, Key>,
  values: (Key | null)[],
) =>
  Object.fromEntries(
    Object.values(keys).map((key) => [
      key,
      values.filter((value) => value === key).length,
    ]),
  ) as Record<Key, number>;

// * share of the stores sold right now that have feedback. Pass every
// * feedback, never the page's filtered rows: the filters don't narrow the
// * sold stores, so a filtered numerator would make the rate meaningless.
// * Feedback for a store an admin switched back from sold doesn't count.
// * The denominator includes stores sold before the form existed (they have
// * no reliable marker), so the page labels the rate as such.
export const summarizeFillRate = (
  feedback: { storeId: string }[],
  soldStoreIds: ReadonlySet<string>,
) => {
  const soldWithFeedback = feedback.filter((item) =>
    soldStoreIds.has(item.storeId),
  ).length;
  return {
    soldStoreCount: soldStoreIds.size,
    soldWithFeedback,
    percent: percentOf(soldWithFeedback, soldStoreIds.size),
  };
};

// * the Sold Feedback page's stat cards and bars, over whatever rows the
// * filters leave. Each average only counts the feedback that answered that
// * question.
export const summarizeSoldFeedback = (feedback: SummaryInput[]) => {
  const withSource = feedback.filter((item) => item.buyerSource !== null);
  const viaBezold = withSource.filter(
    (item) => item.buyerSource === BUYER_SOURCE.BEZOLD,
  ).length;
  const ratings = feedback
    .map((item) => item.satisfaction)
    .filter((value): value is Satisfaction => value !== null);
  const ratios = feedback
    .map(priceRatioPercent)
    .filter((value): value is number => value !== null);
  const averageRating = averageOf(ratings);
  const averageRatio = averageOf(ratios);

  return {
    count: feedback.length,
    viaBezold: {
      count: viaBezold,
      answered: withSource.length,
      percent: percentOf(viaBezold, withSource.length),
    },
    satisfaction: {
      average:
        averageRating === null ? null : Math.round(averageRating * 10) / 10,
      answered: ratings.length,
    },
    priceRatio: {
      averagePercent: averageRatio === null ? null : Math.round(averageRatio),
      answered: ratios.length,
    },
    durations: countBy(
      SOLD_DURATION,
      feedback.map((item) => item.soldDuration),
    ),
    durationUnanswered: feedback.filter((item) => item.soldDuration === null)
      .length,
    sources: countBy(
      BUYER_SOURCE,
      feedback.map((item) => item.buyerSource),
    ),
    sourceUnanswered: feedback.length - withSource.length,
  };
};
