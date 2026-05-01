import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";

export async function POST(req: NextRequest) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  try {
    const { uid, admin } = await req.json();
    if (!uid || typeof admin !== "boolean") {
      return NextResponse.json({ error: "uid and admin (boolean) are required" }, { status: 400 });
    }
    await adminAuth.setCustomUserClaims(uid, { admin });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}
