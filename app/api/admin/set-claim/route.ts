import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/server";

export async function POST(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await adminAuth.verifyIdToken(idToken);
  if (!decoded.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { uid, admin } = await req.json();
  if (!uid || typeof admin !== "boolean") {
    return NextResponse.json({ error: "uid and admin (boolean) are required" }, { status: 400 });
  }

  await adminAuth.setCustomUserClaims(uid, { admin });
  return NextResponse.json({ success: true });
}
