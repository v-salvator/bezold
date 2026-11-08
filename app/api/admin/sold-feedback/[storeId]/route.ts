import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { getSoldFeedback } from "@/firebase/serverUtils/soldFeedback";

export const dynamic = "force-dynamic";

interface SoldFeedbackProps {
  params: { storeId: string };
}

// * one store's 頂讓回饋 for the Store List drawer; null = seller didn't fill it
export async function GET(request: NextRequest, { params }: SoldFeedbackProps) {
  const { error } = await verifyAdminToken(request);
  if (error) return error;

  return NextResponse.json({
    feedback: await getSoldFeedback(params.storeId),
  });
}
