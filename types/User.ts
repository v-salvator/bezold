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
  contact: string; // free-text: Email / LINE ID / phone
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
  fromBuyerClub?: boolean;
  createTime: Timestamp;
  updateTime: Timestamp;
}
