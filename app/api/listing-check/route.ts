import { NextRequest, NextResponse } from "next/server";
import {
  answerListingCheck,
  resolveSellerRecipients,
} from "@/firebase/serverUtils/followUp";
import { FOLLOW_UP_ANSWER, type FollowUpAnswer, type Store } from "@/types";
import { soldConfirmationEmail } from "@/lib/followUp/emailTemplates";
import { deliveryAddress } from "@/lib/followUp/delivery";
import { sendEmail } from "@/lib/email/brevo";
import { formatTaipeiDateTime } from "@/utils/followUp";

export const dynamic = "force-dynamic";

const parseAnswer = (value: unknown): FollowUpAnswer | null =>
  value === FOLLOW_UP_ANSWER.SOLD || value === FOLLOW_UP_ANSWER.STILL_SELLING
    ? value
    : null;

// * best-effort: the store is already sold; a failed email is only logged
const sendSoldConfirmation = async (store: Store, soldAt: Date) => {
  try {
    const recipient = (await resolveSellerRecipients([store])).get(store.id);
    const to = deliveryAddress(recipient?.email ?? null);
    if (!to) {
      console.warn(
        `[listing-check] no address for sold confirmation ${store.id}`,
      );
      return;
    }
    await sendEmail({
      to,
      tag: "listing-follow-up-sold",
      content: soldConfirmationEmail({
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
        storeId: store.id,
        storeName: store.storeName,
        sellerName: recipient?.name ?? "",
        soldAtLabel: formatTaipeiDateTime(soldAt),
      }),
    });
  } catch (error) {
    console.error(
      `[listing-check] sold confirmation failed ${store.id}:`,
      (error as Error).message,
    );
  }
};

// * the seller's answer from /listing-check. No login: the one-time token is
// * the proof, re-checked here inside a transaction (never trust the page).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const answer = parseAnswer(body?.answer);
  if (!answer) {
    return NextResponse.json({ error: "invalid_answer" }, { status: 400 });
  }

  const now = new Date();
  const store = await answerListingCheck(body?.token, answer, now);
  if (!store) {
    return NextResponse.json({ error: "link_invalid" }, { status: 410 });
  }

  if (answer === FOLLOW_UP_ANSWER.SOLD) await sendSoldConfirmation(store, now);

  return NextResponse.json({ answer, storeName: store.storeName });
}
