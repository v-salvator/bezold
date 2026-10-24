import { INQUIRY_MESSAGE_MAX_LENGTH } from "@/constant/inquiry";

// * the optional note a buyer sends with an inquiry — missing means ""
export const parseInquiryMessage = (
  value: unknown,
): { message: string } | { error: "message_too_long" | "invalid_message" } => {
  if (value === undefined || value === null) return { message: "" };
  if (typeof value !== "string") return { error: "invalid_message" };
  const message = value.trim();
  if (message.length > INQUIRY_MESSAGE_MAX_LENGTH)
    return { error: "message_too_long" };
  return { message };
};

export const getInquiryId = (storeId: string, buyerUid: string) =>
  `${storeId}_${buyerUid}`;

// * POST /api/stores/[id]/inquiry failure → what the CTA tells the buyer.
// * status 0 = the request never got a response (offline).
export const inquiryErrorMessage = (status: number, error?: string) => {
  if (error === "message_too_long")
    return `訊息最多 ${INQUIRY_MESSAGE_MAX_LENGTH} 字`;
  if (status === 404 || error === "not_digital_asset")
    return "這個資產目前不開放申請";
  if (status === 401) return "登入狀態已過期，請重新登入後再試";
  return "送出失敗，請稍後再試";
};
