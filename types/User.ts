import type { Timestamp } from "firebase/firestore";

// Buyer-intent preferences, captured at buyer club popup signup. Grouped into
// its own map so future scalar buyer preferences live here as a unit. NOTE:
// list-shaped buyer features (e.g. favorites) must NOT go here — they belong in
// a subcollection (users/{uid}/favorites/...) to avoid rewriting/reading the
// whole user doc on every mutation.
export interface BuyerProfile {
  category: string; // STORE_CATEGORIES key
  city: string; // cityItems key
  budgetKey: string; // amountItems key
  // Contact is NOT here — a buyer's phone/lineId live on the top-level User
  // fields (same as the sell form's contact section), and email is the account
  // email. This map holds preferences only.
}

export interface User {
  id: string;
  userName: string;
  phone: string;
  email?: string;
  lineId?: string;
  remark?: string;
  // Absent for users who never filled the buyer club form.
  buyerProfile?: BuyerProfile;
  // Denormalized "buyerProfile is present" flag, so admin can query it (Firestore
  // can't cheaply test map existence). MUST be written in the same write as
  // buyerProfile — always via writeBuyerProfile()/buyerProfileFields() in
  // lib/user/buyerProfile.ts, never by hand, or the two desync.
  hasBuyerProfile?: boolean;
  // Signup-source attribution — kept flat, it's an account fact not a preference.
  fromBuyerClub?: boolean;
  createTime: Date;
  updateTime: Date;
}

export type UserBase = Omit<User, "id" | "createTime" | "updateTime">;

export interface UserDoc {
  userName: string;
  phone: string;
  email?: string;
  lineId?: string;
  remark?: string;
  buyerProfile?: BuyerProfile;
  hasBuyerProfile?: boolean;
  fromBuyerClub?: boolean;
  createTime: Timestamp;
  updateTime: Timestamp;
}

// The three seller channels shown on a store page. Served by
// GET /api/stores/[storeId]/contact to signed-in members only — the public
// store payload carries masked placeholders instead (see utils/store.ts).
export interface SellerContact {
  phone: string;
  lineId: string;
  email: string;
}
