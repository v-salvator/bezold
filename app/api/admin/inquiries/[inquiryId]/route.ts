import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { updateInquiryStatus } from "@/firebase/serverUtils";
import { parseInquiryStatus } from "@/utils/inquiry";

interface InquiryProps {
  params: { inquiryId: string };
}

// The admin's only edit: moving an inquiry between new / contacted / closed.
export async function PATCH(req: NextRequest, { params }: InquiryProps) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const status = parseInquiryStatus(body?.status);
  if (!status) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const updated = await updateInquiryStatus(params.inquiryId, status);
  if (!updated) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }
  return NextResponse.json({ status });
}
