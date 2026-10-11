import { NextRequest, NextResponse } from "next/server";
import { getStoreById } from "@/firebase/serverUtils";
import { STORE_STATUS, type SellerContact } from "@/types";
import { verifyUserToken } from "@/lib/verifyUserToken";

interface ContactProps {
  params: { storeId: string };
}

const EMPTY_CONTACT: SellerContact = {
  phone: "",
  lineId: "",
  threadsId: "",
  email: "",
};

// Seller contact details are stripped from the public store payload, so this is
// the only way to read them. Any signed-in member with a verified email may
// call it — the gate is "has a verified account", not "is an admin".
export async function GET(req: NextRequest, { params }: ContactProps) {
  const { error } = await verifyUserToken(req);
  if (error) return error;

  const store = await getStoreById(params.storeId);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Sold listings are closed to enquiries, and drafts are only shown to the
  // seller for approval — members get nothing for either.
  if (
    store.status === STORE_STATUS.SOLD ||
    store.status === STORE_STATUS.DRAFT
  ) {
    return NextResponse.json(EMPTY_CONTACT);
  }

  const { userInfo } = store;
  const contact: SellerContact = {
    phone: userInfo?.phone ?? "",
    lineId: userInfo?.lineId ?? "",
    threadsId: userInfo?.threadsId ?? "",
    email: userInfo?.email ?? "",
  };
  return NextResponse.json(contact);
}
