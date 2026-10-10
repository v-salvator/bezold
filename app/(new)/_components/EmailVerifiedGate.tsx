"use client";

import Card from "@/components/refactored/Card";
import VerifyEmailPanel from "@/app/(new)/_components/VerifyEmailPanel";
import { useEmailVerification } from "@/hooks/useEmailVerification";

/**
 * Renders `children` only for verified members. A signed-in member whose email
 * isn't verified sees the verification card instead, and the children mount
 * (and start loading data) the moment verification is detected. Signed-out
 * visitors fall through to the children, whose own auth check sends them to
 * /login.
 */
export default function EmailVerifiedGate({
  source,
  redirectPath,
  title,
  context,
  children,
}: {
  // Analytics source for resends from this gate, e.g. "sell_gate".
  source: string;
  // The gated page — where the verification link returns the member.
  redirectPath: string;
  title?: string;
  context?: string;
  children: React.ReactNode;
}) {
  const verification = useEmailVerification({ source, redirectPath });
  const { authReady, user, isVerified } = verification;

  // Mounting the children before auth resolves would let them start loading
  // data for an account that may turn out to be unverified.
  if (!authReady) return null;

  if (user && !isVerified) {
    return (
      <div className="flex w-full justify-center">
        <Card className="w-full max-w-[440px]">
          <VerifyEmailPanel
            verification={verification}
            title={title}
            context={context}
          />
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
