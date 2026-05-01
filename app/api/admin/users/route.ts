import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/server";

export async function GET(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const decoded = await adminAuth.verifyIdToken(idToken);
  if (!decoded.admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { users } = await adminAuth.listUsers();
  const result = users.map((u) => ({
    uid: u.uid,
    email: u.email ?? "",
    isAdmin: u.customClaims?.admin === true,
  }));

  return NextResponse.json(result);
}
