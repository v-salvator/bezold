import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { setFollowUpPaused } from "@/firebase/serverUtils/followUp";

interface FollowUpProps {
  params: { storeId: string };
}

// * the 「自動寄送追蹤信」 switch — paused stores are never emailed
export async function PATCH(request: NextRequest, { params }: FollowUpProps) {
  const { error } = await verifyAdminToken(request);
  if (error) return error;

  const body = await request.json().catch(() => ({}));
  if (typeof body?.paused !== "boolean") {
    return NextResponse.json({ error: "invalid_paused" }, { status: 400 });
  }

  await setFollowUpPaused(params.storeId, body.paused);
  return NextResponse.json({ paused: body.paused });
}
