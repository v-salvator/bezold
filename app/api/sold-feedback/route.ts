import { NextRequest, NextResponse } from "next/server";
import { findSoldStoreByToken } from "@/firebase/serverUtils/followUp";
import { createSoldFeedback } from "@/firebase/serverUtils/soldFeedback";
import { SOLD_VIA } from "@/types";
import { parseSoldFeedback } from "@/utils/soldFeedback";

export const dynamic = "force-dynamic";

// * 頂讓回饋 after a store is marked sold. The email-link path proves the
// * seller with the (already used) link token, within 7 days of the answer.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = parseSoldFeedback(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  if (typeof body?.token !== "string") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const store = await findSoldStoreByToken(body.token);
  if (!store) {
    return NextResponse.json({ error: "link_invalid" }, { status: 410 });
  }

  const result = await createSoldFeedback({
    store,
    soldVia: SOLD_VIA.FOLLOW_UP_EMAIL,
    fields: parsed.fields,
  });
  if (result === "already_submitted") {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
