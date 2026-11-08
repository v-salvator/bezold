import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { listFollowUpSummaries } from "@/firebase/serverUtils/followUp";

export const dynamic = "force-dynamic";

// * follow-up email state per store (keyed by storeId) for Store List
export async function GET(request: NextRequest) {
  const { error } = await verifyAdminToken(request);
  if (error) return error;

  return NextResponse.json({ followUps: await listFollowUpSummaries() });
}
