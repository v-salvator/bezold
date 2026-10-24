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
