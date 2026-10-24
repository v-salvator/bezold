import { NextRequest, NextResponse } from "next/server";
import { verifyUserToken } from "@/lib/verifyUserToken";
import { hasSubmittedInquiry, submitInquiry } from "@/firebase/serverUtils";
import { parseInquiryMessage } from "@/utils/inquiry";

interface InquiryProps {
  params: { storeId: string };
}

// Has this member already asked about this digital asset? Drives the
// InquiryCta's "已送出" state after a reload.
export async function GET(req: NextRequest, { params }: InquiryProps) {
  const { decoded, error } = await verifyUserToken(req);
  if (error) return error;

  const submitted = await hasSubmittedInquiry(params.storeId, decoded.uid);
  return NextResponse.json({ submitted });
}

// Buyers never contact a digital-asset seller directly — this records the
// request and the platform follows up. Repeats return the original inquiry
// untouched.
export async function POST(req: NextRequest, { params }: InquiryProps) {
  const { decoded, error } = await verifyUserToken(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = parseInquiryMessage(body?.message);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await submitInquiry({
    storeId: params.storeId,
    buyerUid: decoded.uid,
    buyerEmail: decoded.email ?? "",
    message: parsed.message,
  });

  switch (result) {
    case "not_found":
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    case "not_digital":
      return NextResponse.json({ error: "not_digital_asset" }, { status: 400 });
    case "already_submitted":
      return NextResponse.json({ submitted: true, alreadySubmitted: true });
    case "created":
      return NextResponse.json({ submitted: true }, { status: 201 });
  }
}
