import { NextRequest, NextResponse } from "next/server";
import { mockStores } from "@/mocks";
import { getStoreById } from "@/firebase/serverUtils";
import { omitSellerContact } from "@/utils/store";
import { db, bucket } from "@/firebase/server";
import { COLLECTIONS } from "@/firebase/constants";
import { verifyAdminToken } from "@/lib/verifyAdminToken";

interface StoreProps {
  params: { storeId: string };
}

export async function GET(request: Request, { params }: StoreProps) {
  const { storeId } = params;

  // * query data from firebase

  // const storeInfo = mockStores.find((store) => store.id === storeId);
  const storeInfo = await getStoreById(storeId);

  if (!storeInfo) {
    return Response.json(
      { data: null },
      { status: 400, statusText: "Store not found" },
    );
  }

  // Seller contact is members-only — see GET /api/stores/[storeId]/contact.
  return Response.json({ data: omitSellerContact(storeInfo) });
}

export async function DELETE(req: NextRequest, { params }: StoreProps) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  const { storeId } = params;

  try {
    // * images first — clear the whole Storage folder (including strays) so a
    // * mid-failure never leaves orphaned files with no doc to trace them back.
    await bucket.deleteFiles({ prefix: `${COLLECTIONS.STORE}/${storeId}/` });
    // * doc last — the destructive, irreversible step.
    await db.collection(COLLECTIONS.STORE).doc(storeId).delete();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete store" },
      { status: 500 },
    );
  }
}
