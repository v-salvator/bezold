"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { auth, trackEvent } from "@/firebase/client";
import Button from "@/components/refactored/Button";
import SoldFeedbackForm, {
  type SoldFeedbackAnswers,
} from "@/app/(new)/_components/SoldFeedbackForm";
import { SOLD_VIA } from "@/types";
import siteStyles from "@/app/(new)/layout.module.css";
import styles from "./SoldFeedbackDialog.module.css";

// * 頂讓回饋 after the seller marks a listing sold on /my-listings. Closing
// * the dialog is the same as skipping.
export default function SoldFeedbackDialog({
  open,
  storeId,
  storeName,
  listedPriceLabel,
  listedPriceWan,
  onClose,
}: {
  open: boolean;
  storeId: string;
  storeName: string;
  listedPriceLabel: string;
  listedPriceWan: number | null;
  onClose: () => void;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  // * portal into the site root so the dialog keeps the --hand / --display
  // * font tokens, which live on that element, not on <body>
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setContainer(
      anchorRef.current?.closest<HTMLElement>(`.${siteStyles.root}`) ?? null,
    );
  }, []);

  const close = () => {
    if (!submitted) {
      trackEvent("sold_feedback_skip", { via: SOLD_VIA.MY_LISTINGS });
    }
    onClose();
  };

  const submit = async (answers: SoldFeedbackAnswers) => {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return false;
    const response = await fetch("/api/sold-feedback", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ storeId, ...answers }),
    });
    // * 409 = already sent from another tab — still a success
    if (!response.ok && response.status !== 409) return false;
    trackEvent("sold_feedback_submit", {
      via: SOLD_VIA.MY_LISTINGS,
      has_comment: answers.comment.trim() !== "",
    });
    setSubmitted(true);
    return true;
  };

  return (
    <>
      <span ref={anchorRef} hidden />
      <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && close()}>
        <Dialog.Portal container={container}>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content
            className={styles.content}
            aria-describedby={undefined}
          >
            <Dialog.Close className={styles.close} aria-label="關閉">
              ✕
            </Dialog.Close>
            {submitted ? (
              <div className={styles.thanks}>
                <Dialog.Title className={styles.thanksTitle}>
                  謝謝您的回饋！
                </Dialog.Title>
                <p className={styles.thanksText}>
                  您的分享會幫助下一位想頂讓、想創業的人。祝新的開始一切順利！
                </p>
                <Button variant="ghost" onClick={close}>
                  關閉
                </Button>
              </div>
            ) : (
              <>
                <Dialog.Title className={styles.banner}>
                  ✓ 已將「{storeName}」改成已頂讓，恭喜成交！
                </Dialog.Title>
                <SoldFeedbackForm
                  plain
                  listedPriceLabel={listedPriceLabel}
                  listedPriceWan={listedPriceWan}
                  onSubmit={submit}
                  onSkip={close}
                />
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
