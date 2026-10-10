"use client";

import { useCallback, useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, trackEvent } from "@/firebase/client";
import {
  RESEND_COOLDOWN_SECONDS,
  VERIFY_ERRORS,
  refreshVerification,
  sendVerification,
} from "@/lib/auth/verification";

type DetectedBy = "page_load" | "manual_check";

// One email_verified event per account per page session, even when several
// components run this hook and notice the flip at the same moment.
const reportedVerifiedUids = new Set<string>();

function reportVerified(uid: string, detectedBy: DetectedBy) {
  if (reportedVerifiedUids.has(uid)) return;
  reportedVerifiedUids.add(uid);
  trackEvent("email_verified", { detected_by: detectedBy });
}

interface UseEmailVerificationParams {
  // Analytics source for resends from this surface.
  source: string;
  // Where the link in a resent email should land after verification.
  redirectPath?: string;
  // Start with the resend button cooling down — set when an email was sent
  // moments ago (right after signup).
  initialCooldown?: number;
}

/**
 * The signed-in user's email-verification state plus the two actions every
 * verification surface offers: resend the email, and "I've verified" (a
 * manual re-check). Listens to onIdTokenChanged because user.reload() never
 * fires onAuthStateChanged — the forced token refresh in refreshVerification()
 * is what tells every mounted surface that the account is now verified.
 */
export function useEmailVerification({
  source,
  redirectPath,
  initialCooldown = 0,
}: UseEmailVerificationParams) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(initialCooldown);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notYetVerified, setNotYetVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsVerified(firebaseUser?.emailVerified ?? false);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Quiet re-check: the persisted session still says "unverified" after the
  // user clicks the link in another tab, so check once on load and again
  // whenever this tab comes back into view. Failures are ignored — the manual
  // button reports errors.
  useEffect(() => {
    if (!user || isVerified) return;
    const currentUser = user;

    async function silentCheck() {
      try {
        const verified = await refreshVerification(currentUser);
        if (verified) reportVerified(currentUser.uid, "page_load");
      } catch {
        // Offline or token revoked — leave the state as it is.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") silentCheck();
    }

    silentCheck();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, isVerified]);

  const resend = useCallback(async () => {
    if (!user || cooldown > 0 || sending) return;
    setError(null);
    setNotYetVerified(false);
    setSending(true);
    try {
      await sendVerification(user, {
        redirectPath,
        trigger: "resend",
        source,
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(VERIFY_ERRORS[code] ?? "寄送失敗，請再試一次");
    } finally {
      setSending(false);
    }
  }, [user, cooldown, sending, redirectPath, source]);

  const checkNow = useCallback(async () => {
    if (!user || checking) return;
    setError(null);
    setNotYetVerified(false);
    setChecking(true);
    try {
      const verified = await refreshVerification(user);
      if (verified) {
        reportVerified(user.uid, "manual_check");
      } else {
        setNotYetVerified(true);
      }
    } catch {
      setError("無法確認驗證狀態，請檢查網路後再試一次");
    } finally {
      setChecking(false);
    }
  }, [user, checking]);

  return {
    user,
    authReady,
    isVerified,
    cooldown,
    sending,
    checking,
    notYetVerified,
    error,
    resend,
    checkNow,
  };
}

export type EmailVerificationState = ReturnType<typeof useEmailVerification>;
