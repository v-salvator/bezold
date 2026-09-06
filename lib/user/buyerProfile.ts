import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { COLLECTIONS } from "@/firebase/constants";
import type { BuyerProfile } from "@/types/User";

// `buyerProfile` (the preference map) and `hasBuyerProfile` (a denormalized flag
// the admin panel queries) MUST always move together — Firestore can't cheaply
// test map existence, so the flag is the queryable proxy. These helpers weld the
// two so no writer can set one without the other and desync them.

// Fields to spread into a setDoc/updateDoc payload. Pass the profile to attach
// one, or null/undefined to explicitly mark the user as having none.
export function buyerProfileFields(
  profile: BuyerProfile | null | undefined,
):
  | { buyerProfile: BuyerProfile; hasBuyerProfile: true }
  | { hasBuyerProfile: false } {
  return profile
    ? { buyerProfile: profile, hasBuyerProfile: true }
    : { hasBuyerProfile: false };
}

// Update an existing user doc's buyer profile (client SDK). Future buyer-profile
// editors should call this rather than writing buyerProfile/hasBuyerProfile by
// hand.
export async function writeBuyerProfile(
  uid: string,
  profile: BuyerProfile,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USER, uid), {
    ...buyerProfileFields(profile),
    updateTime: serverTimestamp(),
  });
}
