"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/client";
import type { SellerContact } from "@/types";

export type SellerContactStatus = "loading" | "locked" | "unlocked" | "error";

// Both halves of the gate (the contact lines and the CTA buttons) call this
// hook, and they mount together — dedupe the request per store so one page view
// hits the API once.
const inFlight = new Map<string, Promise<SellerContact>>();

async function fetchSellerContact(
  storeId: string,
  idToken: string,
): Promise<SellerContact> {
  const cached = inFlight.get(storeId);
  if (cached) return cached;

  const request = fetch(`/api/stores/${storeId}/contact`, {
    headers: { authorization: `Bearer ${idToken}` },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Seller contact request failed: ${response.status}`);
    }
    return (await response.json()) as SellerContact;
  });

  inFlight.set(storeId, request);
  // A failure must not be cached, or a retry after a flaky network would keep
  // replaying the same rejection.
  request.catch(() => inFlight.delete(storeId));
  return request;
}

interface UseSellerContactParams {
  storeId: string;
  /** Contact from the store payload — blank on real listings, fictional on
   *  the example listing (which is returned as-is, never gated). */
  initialContact: SellerContact;
  /** The example listing is fictional data, so it is never gated. */
  isExample?: boolean;
}

export function useSellerContact({
  storeId,
  initialContact,
  isExample = false,
}: UseSellerContactParams) {
  const { phone, lineId, email } = initialContact;
  const [status, setStatus] = useState<SellerContactStatus>(
    isExample ? "unlocked" : "loading",
  );
  const [contact, setContact] = useState<SellerContact>(initialContact);
  // Tracks the locked → unlocked transition so the card can acknowledge a
  // just-completed signup, without greeting members who arrived signed in.
  const wasLocked = useRef(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (isExample) return;
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (!active) return;
        wasLocked.current = true;
        setContact({ phone, lineId, email });
        setStatus("locked");
        return;
      }
      try {
        const idToken = await firebaseUser.getIdToken();
        const revealed = await fetchSellerContact(storeId, idToken);
        if (!active) return;
        setContact(revealed);
        setStatus("unlocked");
        setJustUnlocked(wasLocked.current);
      } catch {
        if (!active) return;
        setStatus("error");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [storeId, isExample, phone, lineId, email]);

  return { status, contact, justUnlocked };
}
