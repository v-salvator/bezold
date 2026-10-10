import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/server";

// Same shape as verifyAdminToken, minus the admin claim check — for endpoints
// that any signed-in member with a verified email may call (e.g. revealing
// seller contact details). Unverified accounts get 403 "email_unverified" so
// the client can tell them apart from signed-out callers.
export async function verifyUserToken(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    if (!decoded.email_verified) {
      return {
        error: NextResponse.json(
          { error: "email_unverified" },
          { status: 403 },
        ),
      };
    }
    return { decoded };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}
