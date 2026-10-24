import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { countNewInquiries } from "@/firebase/serverUtils";

// Unhandled (status "new") inquiries — the badge beside 詢問 in AdminSidebar.
export async function GET(req: NextRequest) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  return NextResponse.json({ new: await countNewInquiries() });
}
