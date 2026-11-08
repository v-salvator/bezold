"use client";
import { useEffect, useState } from "react";
import { Descriptions, Rate, Skeleton, Tag } from "antd";
import dayjs from "dayjs";
import { useAdminAuth } from "@/hooks";
import { authedFetch } from "@/lib/authedFetch";
import type { SoldFeedbackSummary } from "@/types";
import {
  BUYER_SOURCE_LABEL,
  SOLD_DURATION_LABEL,
  SOLD_VIA_LABEL,
} from "@/constant/soldFeedback";
import { formatPrice } from "@/utils/store";
import { priceRatioPercent } from "@/utils/soldFeedback";

const NOT_ANSWERED = <span className="text-black/45">未填</span>;

/** The drawer's 頂讓回饋 section for a sold store. */
export function SoldFeedbackSection({ storeId }: { storeId: string }) {
  const { idToken } = useAdminAuth();
  const [feedback, setFeedback] = useState<SoldFeedbackSummary | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!idToken) return;
    let cancelled = false;
    setState("loading");
    authedFetch(idToken, `/api/admin/sold-feedback/${storeId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`sold-feedback ${response.status}`);
        return (await response.json()).feedback as SoldFeedbackSummary | null;
      })
      .then((result) => {
        if (cancelled) return;
        setFeedback(result);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [idToken, storeId]);

  if (state === "loading") return <Skeleton active paragraph={{ rows: 3 }} />;
  if (state === "error")
    return <span className="text-black/45">頂讓回饋載入失敗</span>;
  if (!feedback) return <span className="text-black/45">賣家未填寫</span>;

  return <SoldFeedbackDetails feedback={feedback} />;
}

/** One feedback's answers, labelled — shared by the drawer and Sold Feedback. */
export function SoldFeedbackDetails({
  feedback,
}: {
  feedback: SoldFeedbackSummary;
}) {
  const ratio = priceRatioPercent(feedback);

  return (
    <Descriptions
      column={1}
      size="small"
      labelStyle={{ width: 88 }}
      items={[
        {
          key: "duration",
          label: "花了多久",
          children: feedback.soldDuration
            ? SOLD_DURATION_LABEL[feedback.soldDuration]
            : NOT_ANSWERED,
        },
        {
          key: "source",
          label: "買家來源",
          children: feedback.buyerSource
            ? BUYER_SOURCE_LABEL[feedback.buyerSource]
            : NOT_ANSWERED,
        },
        {
          key: "price",
          label: "成交頂讓金",
          children:
            feedback.finalPrice === null ? (
              NOT_ANSWERED
            ) : (
              <span>
                {formatPrice(feedback.finalPrice)}
                <span className="ml-[6px] text-[12px] text-black/45">
                  刊登{" "}
                  {feedback.listedPrice > 0
                    ? formatPrice(feedback.listedPrice)
                    : "面議／免頂讓金"}
                  {ratio !== null && ` · ${ratio}%`}
                </span>
              </span>
            ),
        },
        {
          key: "satisfaction",
          label: "滿意度",
          children: feedback.satisfaction ? (
            <Rate disabled value={feedback.satisfaction} />
          ) : (
            NOT_ANSWERED
          ),
        },
        {
          key: "comment",
          label: "建議",
          children: feedback.comment ? (
            <span className="whitespace-pre-wrap">{feedback.comment}</span>
          ) : (
            <span className="text-black/45">—</span>
          ),
        },
        {
          key: "via",
          label: "標記方式",
          children: <Tag>{SOLD_VIA_LABEL[feedback.soldVia]}</Tag>,
        },
        {
          key: "time",
          label: "填寫時間",
          children: dayjs(feedback.createTime).format("YYYY-MM-DD HH:mm"),
        },
      ]}
    />
  );
}
