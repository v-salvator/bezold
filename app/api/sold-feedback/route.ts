import { NextRequest, NextResponse } from "next/server";
import { findSoldStoreByToken } from "@/firebase/serverUtils/followUp";
import { createSoldFeedback } from "@/firebase/serverUtils/soldFeedback";
import { SOLD_VIA, STORE_STATUS, type SoldVia, type Store } from "@/types";
import { verifyUserToken } from "@/lib/verifyUserToken";
import { getRawStoreById } from "@/firebase/serverUtils/store";
import { parseSoldFeedback } from "@/utils/soldFeedback";

export const dynamic = "force-dynamic";

// * 頂讓回饋 after a store is marked sold. Two ways to prove the seller: the
// * email link's (already used) token within 7 days of the sold answer, or a
// * member ID token + storeId for listings marked sold on /my-listings.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = parseSoldFeedback(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  let store: Store | null;
  let soldVia: SoldVia;
  if (typeof body?.token === "string") {
    store = await findSoldStoreByToken(body.token);
    soldVia = SOLD_VIA.FOLLOW_UP_EMAIL;
    if (!store) {
      return NextResponse.json({ error: "link_invalid" }, { status: 410 });
    }
  } else {
    // * /my-listings: a signed-in, verified seller on their own sold listing
    const { decoded, error } = await verifyUserToken(request);
    if (error) return error;
    if (typeof body?.storeId !== "string" || body.storeId === "") {
      return NextResponse.json({ error: "invalid_field" }, { status: 400 });
    }
    store = await getRawStoreById(body.storeId);
    soldVia = SOLD_VIA.MY_LISTINGS;
    if (!store || store.user !== decoded.uid) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (store.status !== STORE_STATUS.SOLD) {
      return NextResponse.json({ error: "not_sold" }, { status: 422 });
    }
  }

  const result = await createSoldFeedback({
    store,
    soldVia,
    fields: parsed.fields,
  });
  if (result === "already_submitted") {
    return NextResponse.json({ error: "already_submitted" }, { status: 409 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
