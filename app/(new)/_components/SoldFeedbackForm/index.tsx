"use client";

import { useState } from "react";
import Button from "@/components/refactored/Button";
import {
  BUYER_SOURCE_OPTIONS,
  SATISFACTION_LABELS,
  SOLD_DURATION_OPTIONS,
} from "@/constant/soldFeedback";
import { SOLD_FEEDBACK_COMMENT_MAX_LENGTH } from "@/utils/soldFeedback";
import type { BuyerSource, SoldDuration } from "@/types";
import { cn } from "@/lib/utils";
import styles from "./SoldFeedbackForm.module.css";

// * what POST /api/sold-feedback takes besides the auth fields
export interface SoldFeedbackAnswers {
  soldDuration: SoldDuration | null;
  buyerSource: BuyerSource | null;
  finalPriceWan: string; // * as typed; the server parses it
  satisfaction: number | null;
  comment: string;
}

const EMPTY_ANSWERS: SoldFeedbackAnswers = {
  soldDuration: null,
  buyerSource: null,
  finalPriceWan: "",
  satisfaction: null,
  comment: "",
};

const hasAnyAnswer = (answers: SoldFeedbackAnswers) =>
  answers.soldDuration !== null ||
  answers.buyerSource !== null ||
  answers.finalPriceWan.trim() !== "" ||
  answers.satisfaction !== null ||
  answers.comment.trim() !== "";

// * 頂讓回饋 — shown after a seller confirms sold, on /listing-check (email
// * link) and in the /my-listings dialog. Every question is optional.
export default function SoldFeedbackForm({
  listedPriceLabel,
  listedPriceWan,
  plain = false,
  onSubmit,
  onSkip,
}: {
  listedPriceLabel: string | null; // * e.g. NT$ 45 萬 — the hint under the price
  listedPriceWan: number | null; // * placeholder for the price input
  plain?: boolean; // * no card frame (inside a dialog)
  onSubmit: (answers: SoldFeedbackAnswers) => Promise<boolean>; // * true = saved
  onSkip: () => void;
}) {
  const [answers, setAnswers] = useState<SoldFeedbackAnswers>(EMPTY_ANSWERS);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  const update = (patch: Partial<SoldFeedbackAnswers>) =>
    setAnswers((previous) => ({ ...previous, ...patch }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setFailed(false);
    const saved = await onSubmit(answers).catch(() => false);
    // * on failure keep everything typed so the seller can retry
    if (!saved) setFailed(true);
    setSubmitting(false);
  };

  const commentLength = Array.from(answers.comment).length;

  return (
    <div className={cn(styles.form, plain && styles.plain)}>
      <h2 className={styles.title}>花一分鐘，跟我們分享這次頂讓經驗</h2>
      <p className={styles.subtitle}>全部選填，只有 Bezold 團隊看得到。</p>

      <fieldset className={styles.field}>
        <legend className={styles.label}>從刊登到頂讓成功，花了多久？</legend>
        <div className={styles.choices}>
          {SOLD_DURATION_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={styles.choice}
              aria-pressed={answers.soldDuration === value}
              onClick={() =>
                update({
                  soldDuration: answers.soldDuration === value ? null : value,
                })
              }
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.field}>
        <legend className={styles.label}>買家是從哪裡來的？</legend>
        <div className={styles.choices}>
          {BUYER_SOURCE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={styles.choice}
              aria-pressed={answers.buyerSource === value}
              onClick={() =>
                update({
                  buyerSource: answers.buyerSource === value ? null : value,
                })
              }
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sold-feedback-price">
          實際成交頂讓金
        </label>
        <div className={styles.priceInput}>
          <span className={styles.affix}>NT$</span>
          <input
            id="sold-feedback-price"
            className={styles.priceValue}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={listedPriceWan ? String(listedPriceWan) : ""}
            value={answers.finalPriceWan}
            onChange={(event) =>
              update({
                // * digits and one decimal point only
                finalPriceWan: event.target.value
                  .replace(/[^\d.]/g, "")
                  .replace(/(\..*)\./g, "$1"),
              })
            }
          />
          <span className={styles.affix}>萬</span>
        </div>
        <p className={styles.hint}>
          {listedPriceLabel ? `刊登價 ${listedPriceLabel}。` : ""}
          不會公開，只用來了解行情。
        </p>
      </div>

      <fieldset className={styles.field}>
        <legend className={styles.label}>您對 Bezold 的滿意度</legend>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={cn(
                styles.star,
                answers.satisfaction !== null &&
                  value <= answers.satisfaction &&
                  styles.starOn,
              )}
              aria-label={`${value} 顆星`}
              aria-pressed={answers.satisfaction === value}
              onClick={() =>
                update({
                  satisfaction: answers.satisfaction === value ? null : value,
                })
              }
            >
              ★
            </button>
          ))}
          <span className={styles.starLabel}>
            {SATISFACTION_LABELS[answers.satisfaction ?? 0]}
          </span>
        </div>
      </fieldset>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="sold-feedback-comment">
          有什麼建議或想對我們說的？
        </label>
        <textarea
          id="sold-feedback-comment"
          className={styles.textarea}
          placeholder="例如：買家怎麼找到您、哪裡可以做得更好…"
          value={answers.comment}
          onChange={(event) => update({ comment: event.target.value })}
        />
        <p
          className={cn(
            styles.counter,
            commentLength > SOLD_FEEDBACK_COMMENT_MAX_LENGTH &&
              styles.counterOver,
          )}
        >
          {commentLength} / {SOLD_FEEDBACK_COMMENT_MAX_LENGTH}
        </p>
      </div>

      {failed && (
        <p className={styles.error} role="alert">
          送出失敗，請重試
        </p>
      )}

      <div className={styles.actions}>
        <Button
          disabled={
            submitting ||
            !hasAnyAnswer(answers) ||
            commentLength > SOLD_FEEDBACK_COMMENT_MAX_LENGTH
          }
          onClick={handleSubmit}
        >
          {submitting ? "送出中…" : "送出"}
        </Button>
        <button
          type="button"
          className={styles.skip}
          disabled={submitting}
          onClick={onSkip}
        >
          略過
        </button>
      </div>
    </div>
  );
}
