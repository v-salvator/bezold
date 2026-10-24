import { atom } from "jotai";

// Unhandled inquiries shown beside 詢問 in AdminSidebar. The sidebar fetches it
// on entering admin and on every admin page change (no polling); the inquiries
// page adjusts it in place as statuses change, so the badge updates at once.
export const newInquiryCountAtom = atom(0);
