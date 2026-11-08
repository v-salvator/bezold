import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { listSoldFeedback } from "@/firebase/serverUtils/soldFeedback";

export const dynamic = "force-dynamic";

// * every 頂讓回饋 (newest first) and the sold-store count, for Sold Feedback
export async function GET(request: NextRequest) {
  const { error } = await verifyAdminToken(request);
  if (error) return error;

  return NextResponse.json(await listSoldFeedback());
}
