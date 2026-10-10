"use client";

import { useEffect, useRef, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/firebase/client";
import type { SellerContact } from "@/types";

export type SellerContactStatus =
  "loading" | "locked" | "unverified" | "unlocked" | "error";

class SellerContactError extends Error {
  constructor(readonly status: number) {
    super(`Seller contact request failed: ${status}`);
  }
}

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
    if (!response.ok) throw new SellerContactError(response.status);
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
  const { phone, lineId, threadsId, email } = initialContact;
  const [status, setStatus] = useState<SellerContactStatus>(
    isExample ? "unlocked" : "loading",
  );
  const [contact, setContact] = useState<SellerContact>(initialContact);
  // Tracks the locked → unlocked transition so the card can acknowledge a
  // just-completed signup or verification, without greeting members who
  // arrived signed in.
  const wasLocked = useRef(false);
  // A just-verified member may still hold an ID token minted before the
  // email_verified claim flipped; force one refresh, never loop.
  const forcedRefresh = useRef(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    if (isExample) return;
    let active = true;

    // onIdTokenChanged (not onAuthStateChanged) so a verification finished
    // elsewhere on the page — which force-refreshes the token — unlocks the
    // contact without a reload.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !firebaseUser.emailVerified) {
        if (!active) return;
        wasLocked.current = true;
        setContact({ phone, lineId, threadsId, email });
        setStatus(firebaseUser ? "unverified" : "locked");
        return;
      }
      try {
        const idToken = await firebaseUser.getIdToken();
        const revealed = await fetchSellerContact(storeId, idToken);
        if (!active) return;
        setContact(revealed);
        setStatus("unlocked");
        setJustUnlocked(wasLocked.current);
      } catch (err) {
        if (!active) return;
        const staleToken =
          err instanceof SellerContactError &&
          err.status === 403 &&
          !forcedRefresh.current;
        if (staleToken) {
          // The refreshed token re-fires this listener and retries the fetch.
          forcedRefresh.current = true;
          firebaseUser.getIdToken(true).catch(() => setStatus("error"));
          return;
        }
        setStatus("error");
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [storeId, isExample, phone, lineId, threadsId, email]);

  return { status, contact, justUnlocked };
}
