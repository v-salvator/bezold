import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";

export async function GET(req: NextRequest) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  try {
    const { users } = await adminAuth.listUsers();
    const result = users.map((u) => ({
      uid: u.uid,
      email: u.email ?? "",
      isAdmin: u.customClaims?.admin === true,
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
