import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/server";

// Same shape as verifyAdminToken, minus the admin claim check — for endpoints
// that any signed-in member may call (e.g. revealing seller contact details).
export async function verifyUserToken(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { decoded };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}
