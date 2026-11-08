"use client";

import { useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import Button from "@/components/refactored/Button";
import SoldFeedbackForm, {
  type SoldFeedbackAnswers,
} from "@/app/(new)/_components/SoldFeedbackForm";
import { FOLLOW_UP_ANSWER, type FollowUpAnswer } from "@/types";
import { cn } from "@/lib/utils";
import LinkInvalid from "./LinkInvalid";
import styles from "./ListingCheck.module.css";

// * everything the page shows about the store — no seller contact
export interface ListingCheckStore {
  storeName: string;
  summary: string;
  listedSince: string; // * 2026/07/05
  imageUrl: string | null;
  listedPriceLabel: string; // * e.g. NT$ 45 萬 / 面議
  listedPriceWan: number | null; // * null for 面議 / 免頂讓金
}

type View =
  | "choose"
  | "confirm-sold"
  | "confirm-still"
  | "feedback" // * sold just confirmed — 頂讓回饋 form
  | "done-sold" // * feedback skipped
  | "thanks" // * feedback sent
  | "done-still"
  | "invalid";

const initialView = (answer: FollowUpAnswer | null): View => {
  if (answer === FOLLOW_UP_ANSWER.SOLD) return "confirm-sold";
  if (answer === FOLLOW_UP_ANSWER.STILL_SELLING) return "confirm-still";
  return "choose";
};

// * the email button only pre-selects an answer; nothing is written until
// * the seller presses a button here (mail scanners open every link)
export default function ListingCheck({
  token,
  initialAnswer,
  store,
}: {
  token: string;
  initialAnswer: FollowUpAnswer | null;
  store: ListingCheckStore;
}) {
  const [view, setView] = useState<View>(initialView(initialAnswer));
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  const submit = async (answer: FollowUpAnswer) => {
    setSubmitting(true);
    setFailed(false);
    try {
      const response = await fetch("/api/listing-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, answer }),
      });
      if (response.status === 410) {
        setView("invalid");
        return;
      }
      if (!response.ok) throw new Error(`listing-check ${response.status}`);
      setView(answer === FOLLOW_UP_ANSWER.SOLD ? "feedback" : "done-still");
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  const switchTo = (next: View) => {
    setFailed(false);
    setView(next);
  };

  // * the link is used by now; it still authorizes this one feedback for 7
  // * days. 409 = already sent (another tab) — that's a success too.
  const submitFeedback = async (answers: SoldFeedbackAnswers) => {
    const response = await fetch("/api/sold-feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, ...answers }),
    });
    if (!response.ok && response.status !== 409) return false;
    setView("thanks");
    return true;
  };

  if (view === "invalid") return <LinkInvalid />;

  if (view === "feedback") {
    return (
      <div className={styles.panel}>
        <div className={styles.successBanner} role="status">
          <span aria-hidden>✓</span>
          <span>已將「{store.storeName}」改成已頂讓，恭喜成交！</span>
        </div>
        <SoldFeedbackForm
          listedPriceLabel={store.listedPriceLabel}
          listedPriceWan={store.listedPriceWan}
          onSubmit={submitFeedback}
          onSkip={() => setView("done-sold")}
        />
      </div>
    );
  }

  if (view === "thanks") {
    return (
      <div className={styles.panel}>
        <div className={styles.mark} aria-hidden>
          ✓
        </div>
        <h1 className={styles.title}>謝謝您的回饋！</h1>
        <p className={styles.lead}>
          您的分享會幫助下一位想頂讓、想創業的人。祝新的開始一切順利！
        </p>
        <div className={styles.actions}>
          <NextLink href="/" className={styles.ghostLink}>
            回到首頁
          </NextLink>
          <NextLink href="/store-list" className={styles.textLink}>
            看看其他頂讓店面
          </NextLink>
        </div>
      </div>
    );
  }

  if (view === "done-sold") {
    return (
      <div className={styles.panel}>
        <div className={styles.mark} aria-hidden>
          ✓
        </div>
        <h1 className={styles.title}>恭喜成交！</h1>
        <p className={styles.lead}>
          「{store.storeName}
          」已改成已頂讓，之後不會再收到確認信。祝新的開始一切順利！
        </p>
        <div className={styles.actions}>
          <NextLink href="/" className={styles.ghostLink}>
            回到首頁
          </NextLink>
        </div>
      </div>
    );
  }

  if (view === "done-still") {
    return (
      <div className={styles.panel}>
        <div className={styles.mark} aria-hidden>
          ✓
        </div>
        <h1 className={styles.title}>收到，謝謝！</h1>
        <p className={styles.lead}>
          「{store.storeName}」會照常刊登，我們 30 天後再跟您確認。
        </p>
        <div className={cn(styles.note, styles.noteSage)}>
          資料有變動嗎？調整頂讓金、月租或照片，能讓買家更快找上門。
        </div>
        <div className={styles.actions}>
          <NextLink href="/my-listings" className={styles.ghostLink}>
            到我的刊登管理修改
          </NextLink>
        </div>
      </div>
    );
  }

  const question =
    view === "confirm-sold"
      ? "已經頂讓了嗎？"
      : view === "confirm-still"
        ? "還在頂讓中？"
        : "還在頂讓嗎？";

  return (
    <div className={styles.panel}>
      <div className={styles.eyebrow}>刊登狀態確認</div>
      <h1 className={styles.title}>
        「{store.storeName}」<em className={styles.accent}>{question}</em>
      </h1>

      <div className={styles.storeCard}>
        {store.imageUrl ? (
          <Image
            src={store.imageUrl}
            alt=""
            width={96}
            height={72}
            className={styles.thumb}
          />
        ) : (
          <div className={styles.thumbEmpty} aria-hidden />
        )}
        <div className="min-w-0">
          <div className={styles.storeName}>{store.storeName}</div>
          <div className={styles.storeMeta}>
            {store.summary}
            <br />
            上架於 {store.listedSince}
          </div>
        </div>
      </div>

      {view === "confirm-sold" && (
        <div className={styles.note}>
          確認後，刊登會<b>立即</b>
          改成「已頂讓」，買家不會再看到您的聯絡方式。這個動作無法自行復原。
        </div>
      )}

      <div className={styles.actions}>
        {view === "choose" && (
          <>
            <Button
              variant="sage"
              disabled={submitting}
              onClick={() => submit(FOLLOW_UP_ANSWER.STILL_SELLING)}
            >
              {submitting ? "處理中…" : "還在頂讓"}
            </Button>
            <Button
              variant="ghost"
              disabled={submitting}
              onClick={() => switchTo("confirm-sold")}
            >
              已經頂讓了
            </Button>
          </>
        )}
        {view === "confirm-sold" && (
          <>
            <Button
              disabled={submitting}
              onClick={() => submit(FOLLOW_UP_ANSWER.SOLD)}
            >
              {submitting ? "處理中…" : "確認已頂讓"}
            </Button>
            <button
              type="button"
              className={styles.textButton}
              disabled={submitting}
              onClick={() => switchTo("confirm-still")}
            >
              其實還在頂讓
            </button>
          </>
        )}
        {view === "confirm-still" && (
          <>
            <Button
              variant="sage"
              disabled={submitting}
              onClick={() => submit(FOLLOW_UP_ANSWER.STILL_SELLING)}
            >
              {submitting ? "處理中…" : "確認：還在頂讓"}
            </Button>
            <button
              type="button"
              className={styles.textButton}
              disabled={submitting}
              onClick={() => switchTo("confirm-sold")}
            >
              其實已經頂讓了
            </button>
          </>
        )}
      </div>

      {failed && (
        <p className={styles.error} role="alert">
          送出失敗，請重試
        </p>
      )}

      <p className={styles.fine}>
        {view === "confirm-still"
          ? "確認後刊登照常顯示，我們 30 天後再跟您確認。不用登入。"
          : "不用登入。這個連結只能使用一次，30 天內有效。"}
      </p>
    </div>
  );
}
