"use client";

import { useEffect, useRef } from "react";
import { Phone, MessageCircle, Mail, Lock } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import Button from "@/components/refactored/Button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/firebase/client";
import {
  buyerClubOpenAtom,
  buyerClubSourceAtom,
  type BuyerClubSource,
} from "@/atoms/BuyerClubAtom";
import { useSellerContact } from "@/hooks/useSellerContact";
import type { SellerContact } from "@/types";
import styles from "./SellerContactGate.module.css";

const EXAMPLE_TITLE = "這是示範頁面，非真實物件";

interface GateProps {
  storeId: string;
  /** Placeholder values from the server — see maskSellerContact(). */
  masked: SellerContact;
  /** The example listing is fictional data, so it is never gated. */
  isExample?: boolean;
}

// Opens the buyer club popup and records which lock was clicked. A popup that
// is already open (today's auto-open) is left alone — re-opening it would
// double-fire the impression and restart the animation.
function useBuyerClubOpener(storeId: string) {
  const open = useAtomValue(buyerClubOpenAtom);
  const setOpen = useSetAtom(buyerClubOpenAtom);
  const setSource = useSetAtom(buyerClubSourceAtom);

  return (source: BuyerClubSource) => {
    trackEvent("contact_gate_click", { store_id: storeId, trigger: source });
    if (open) return;
    setSource(source);
    setOpen(true);
  };
}

/**
 * The seller's phone / LINE / email inside the price card's seller row.
 * Logged out: blurred placeholders behind a lock that opens the buyer club
 * popup. Signed in: the real values, fetched once the token resolves.
 */
export function SellerContactLines({ storeId, masked, isExample }: GateProps) {
  const { status, contact, justUnlocked } = useSellerContact({
    storeId,
    masked,
    isExample,
  });
  const openBuyerClub = useBuyerClubOpener(storeId);
  const viewTracked = useRef(false);

  useEffect(() => {
    if (status !== "locked" || viewTracked.current) return;
    viewTracked.current = true;
    trackEvent("contact_gate_view", { store_id: storeId });
  }, [status, storeId]);

  if (status === "loading") {
    return (
      <div className={styles.slot} aria-busy="true">
        <span className={cn(styles.skeleton, styles.skeletonWide)} />
        <span className={cn(styles.skeleton, styles.skeletonNarrow)} />
        <span className={styles.skeleton} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={styles.slot}>
        <p className={styles.error}>聯絡方式載入失敗，請重新整理頁面。</p>
      </div>
    );
  }

  const isLocked = status === "locked";

  return (
    <div className={styles.slot}>
      <div
        className={cn(
          styles.lines,
          isLocked && styles.blurred,
          justUnlocked && styles.unblur,
        )}
        // Placeholders carry no information — keep them out of screen readers.
        aria-hidden={isLocked}
      >
        {contact.phone && (
          <span>
            <Phone size={12} strokeWidth={2} />
            {contact.phone}
          </span>
        )}
        {contact.lineId && (
          <span>
            <MessageCircle size={12} strokeWidth={2} />
            {contact.lineId}
          </span>
        )}
        {contact.email && (
          <span>
            <Mail size={12} strokeWidth={2} />
            {contact.email}
          </span>
        )}
      </div>

      {isLocked && (
        <button
          type="button"
          className={styles.overlay}
          onClick={() => openBuyerClub("contact_gate_blur")}
          aria-label="加入買家俱樂部以查看賣家聯絡方式"
        >
          <span className={styles.lockPill}>
            <Lock size={14} strokeWidth={2.5} />
            加入後顯示
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * The price card's two contact CTAs. Locked they open the buyer club popup;
 * unlocked they are the real tel: / LINE links.
 */
export function SellerContactCta({ storeId, masked, isExample }: GateProps) {
  const { status, contact, justUnlocked } = useSellerContact({
    storeId,
    masked,
    isExample,
  });
  const openBuyerClub = useBuyerClubOpener(storeId);

  if (status === "loading") {
    return (
      <div className={styles.cta} aria-busy="true">
        <span className={cn(styles.skeleton, styles.skeletonBtn)} />
        <span className={cn(styles.skeleton, styles.skeletonBtn)} />
      </div>
    );
  }

  // The contact lines already explain the failure — don't repeat it here.
  if (status === "error") return null;

  if (status === "locked") {
    return (
      <div className={styles.cta}>
        {contact.phone && (
          <Button
            className={styles.btn}
            onClick={() => openBuyerClub("contact_gate_cta_phone")}
          >
            <Lock size={15} strokeWidth={2.5} />
            撥打賣家電話
          </Button>
        )}
        {contact.lineId && (
          <Button
            variant="sage"
            className={styles.btn}
            onClick={() => openBuyerClub("contact_gate_cta_line")}
          >
            <Lock size={15} strokeWidth={2.5} />加 LINE 聯繫
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className={styles.cta}>
        {contact.phone &&
          (isExample ? (
            <span title={EXAMPLE_TITLE} className={styles.ctaLink}>
              <Button className={styles.btn} disabled>
                <Phone size={15} strokeWidth={2.5} />
                撥打賣家電話
              </Button>
            </span>
          ) : (
            <a href={`tel:${contact.phone}`} className={styles.ctaLink}>
              <Button className={styles.btn}>
                <Phone size={15} strokeWidth={2.5} />
                撥打賣家電話
              </Button>
            </a>
          ))}
        {contact.lineId &&
          (isExample ? (
            <span title={EXAMPLE_TITLE} className={styles.ctaLink}>
              <Button variant="sage" className={styles.btn} disabled>
                <MessageCircle size={15} strokeWidth={2.5} />加 LINE 聯繫
              </Button>
            </span>
          ) : (
            <a
              href={`https://line.me/ti/p/~${contact.lineId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaLink}
            >
              <Button variant="sage" className={styles.btn}>
                <MessageCircle size={15} strokeWidth={2.5} />加 LINE 聯繫
              </Button>
            </a>
          ))}
      </div>
      {justUnlocked && (
        <p className={styles.welcome}>✓ 已加入買家俱樂部 — 聯絡方式已解鎖</p>
      )}
    </>
  );
}
