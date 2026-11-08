import { NextRequest, NextResponse } from "next/server";
import {
  findDueFollowUps,
  recordFollowUpError,
  recordFollowUpSent,
  resolveSellerRecipients,
} from "@/firebase/serverUtils/followUp";
import { FOLLOW_UP_ERROR } from "@/types";
import { followUpEmail } from "@/lib/followUp/emailTemplates";
import { listingRows } from "@/lib/followUp/listingRows";
import { createToken, hashToken } from "@/lib/followUp/token";
import {
  deliveryAddress,
  isDevEnvironment,
  testRecipient,
} from "@/lib/followUp/delivery";
import { sendEmail } from "@/lib/email/brevo";
import { parseMaxPerRun, planFollowUpRun } from "@/utils/followUp";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// * a few at a time — fast enough for the cap, gentle on Brevo
const SEND_CONCURRENCY = 5;

// * Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. No secret
// * configured = nobody gets in.
const isAuthorized = (request: NextRequest) => {
  const secret = process.env.CRON_SECRET;
  return (
    Boolean(secret) &&
    request.headers.get("authorization") === `Bearer ${secret}`
  );
};

const emailDomain = (email: string | null) => email?.split("@")[1] ?? null;

// * daily (vercel.json): email every seller whose listing is due a follow-up.
// * ?dryRun=1 lists who would get one and writes nothing — it works even
// * while FOLLOW_UP_ENABLED is off.
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  if (!dryRun && process.env.FOLLOW_UP_ENABLED !== "true") {
    return NextResponse.json({ disabled: true });
  }
  if (!dryRun && isDevEnvironment() && !testRecipient()) {
    return NextResponse.json(
      { error: "missing_test_recipient" },
      { status: 500 },
    );
  }

  const now = new Date();
  const due = await findDueFollowUps(now);
  const recipients = await resolveSellerRecipients(
    due.map(({ store }) => store),
  );
  const candidates = due.map(({ store, dueDate }) => ({
    storeId: store.id,
    store,
    dueDate,
    email: recipients.get(store.id)?.email ?? null,
  }));
  const plan = planFollowUpRun(
    candidates,
    parseMaxPerRun(process.env.FOLLOW_UP_MAX_PER_RUN),
  );

  if (dryRun) {
    const describe = (candidate: (typeof candidates)[number]) => ({
      storeId: candidate.storeId,
      storeName: candidate.store.storeName,
      dueDate: candidate.dueDate.toISOString(),
      // * domain only — enough to spot test accounts, no addresses in logs
      recipientDomain: emailDomain(candidate.email),
    });
    return NextResponse.json({
      dryRun: true,
      due: due.length,
      toSend: plan.toSend.map(describe),
      deferred: plan.deferred.length,
      noEmail: plan.noEmail.map(describe),
    });
  }

  await Promise.all(
    plan.noEmail.map(({ storeId }) =>
      recordFollowUpError(storeId, FOLLOW_UP_ERROR.NO_EMAIL),
    ),
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  let sent = 0;
  let failed = 0;

  const sendOne = async ({ store, email }: (typeof candidates)[number]) => {
    const to = deliveryAddress(email);
    if (!to) return; // * unreachable: dev without a test inbox exits above
    const token = createToken();
    try {
      await sendEmail({
        to,
        tag: "listing-follow-up",
        content: followUpEmail({
          appUrl,
          storeId: store.id,
          storeName: store.storeName,
          sellerName: recipients.get(store.id)?.name ?? "",
          rows: listingRows(store),
          token,
        }),
      });
    } catch (error) {
      failed += 1;
      await recordFollowUpError(
        store.id,
        `send_failed: ${(error as Error).message}`,
      );
      return;
    }
    // * written only after Brevo accepted it, so a crash never counts an
    // * email that wasn't sent
    await recordFollowUpSent(store.id, hashToken(token), now);
    sent += 1;
  };

  for (let index = 0; index < plan.toSend.length; index += SEND_CONCURRENCY) {
    await Promise.all(
      plan.toSend.slice(index, index + SEND_CONCURRENCY).map(sendOne),
    );
  }

  const summary = {
    due: due.length,
    sent,
    failed,
    skipped: plan.noEmail.length,
    deferred: plan.deferred.length,
  };
  console.log("[listing-follow-up]", JSON.stringify(summary));
  return NextResponse.json(summary);
}
