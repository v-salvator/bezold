import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { listInquiries } from "@/firebase/serverUtils";

// Every digital-asset inquiry, newest first, for /admin/inquiries.
export async function GET(req: NextRequest) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  const inquiries = await listInquiries();
  return NextResponse.json({
    inquiries: inquiries.map((inquiry) => ({
      ...inquiry,
      createTime: inquiry.createTime.getTime(),
      updateTime: inquiry.updateTime.getTime(),
    })),
  });
}
