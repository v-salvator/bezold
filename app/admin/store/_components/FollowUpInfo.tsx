"use client";
import { Alert, Descriptions, Switch, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import {
  FOLLOW_UP_ERROR,
  SOLD_VIA,
  STORE_STATUS,
  type FollowUpSummary,
  type Store,
} from "@/types";
import { FOLLOW_UP_ANSWER_LABEL } from "@/constant/adminStore";
import { nextFollowUpDate } from "@/utils/followUp";

const toDate = (millis: number | null) => (millis ? new Date(millis) : null);

const nextSendDate = (store: Store, followUp: FollowUpSummary) =>
  nextFollowUpDate(store, {
    ...followUp,
    lastSentTime: toDate(followUp.lastSentTime),
    lastAnswerTime: toDate(followUp.lastAnswerTime),
  });

const isSendFailure = (lastError: string) =>
  lastError !== "" && lastError !== FOLLOW_UP_ERROR.NO_EMAIL;

/** Store List's 追蹤信 column: emails sent, plus why sending stopped. */
export function FollowUpCell({
  store,
  followUp,
  loaded,
}: {
  store: Store;
  followUp: FollowUpSummary;
  loaded: boolean;
}) {
  if (!loaded) return <span className="text-black/25">…</span>;

  const tags = (
    <>
      {followUp.paused && <Tag>已停止</Tag>}
      {followUp.lastError === FOLLOW_UP_ERROR.NO_EMAIL && (
        <Tag color="red">無信箱</Tag>
      )}
      {isSendFailure(followUp.lastError) && <Tag color="red">寄送失敗</Tag>}
    </>
  );

  // * never emailed: show when the first one goes out
  if (followUp.sentCount === 0) {
    const firstSend = nextSendDate(store, followUp);
    return (
      <span className="whitespace-nowrap">
        {firstSend && !followUp.lastError ? (
          <Tooltip title={`第一封 ${dayjs(firstSend).format("YYYY-MM-DD")}`}>
            <span className="text-black/45">—</span>
          </Tooltip>
        ) : (
          <span className="text-black/45">—</span>
        )}{" "}
        {tags}
      </span>
    );
  }

  return (
    <div className="whitespace-nowrap">
      <span className="tabular-nums">{followUp.sentCount} 封</span> {tags}
      {followUp.lastSentTime && (
        <div className="text-[12px] text-black/45">
          最後 {dayjs(followUp.lastSentTime).format("MM-DD")}
        </div>
      )}
    </div>
  );
}

/** The drawer's 追蹤信 section: what was sent, the answer, the pause switch. */
export function FollowUpSection({
  store,
  followUp,
  toggling,
  onPausedChange,
}: {
  store: Store;
  followUp: FollowUpSummary;
  toggling: boolean;
  onPausedChange: (paused: boolean) => void;
}) {
  const isSold = store.status === STORE_STATUS.SOLD;
  const nextSend = nextSendDate(store, followUp);
  const formatTime = (millis: number | null) =>
    millis ? dayjs(millis).format("YYYY-MM-DD HH:mm") : "—";

  return (
    <div className="flex flex-col gap-[10px]">
      <Descriptions
        column={1}
        size="small"
        labelStyle={{ width: 88 }}
        items={[
          {
            key: "sent",
            label: "已寄出",
            children: <b>{followUp.sentCount} 封</b>,
          },
          {
            key: "lastSent",
            label: "最後寄出",
            children: formatTime(followUp.lastSentTime),
          },
          {
            key: "lastAnswer",
            label: "最後回覆",
            children: followUp.lastAnswer ? (
              `${FOLLOW_UP_ANSWER_LABEL[followUp.lastAnswer]} · ${formatTime(followUp.lastAnswerTime)}`
            ) : (
              <span className="text-black/45">沒有回覆</span>
            ),
          },
          ...(!isSold
            ? [
                {
                  key: "nextSend",
                  label: "下次寄送",
                  children: !nextSend
                    ? "—"
                    : dayjs(nextSend).isAfter(dayjs())
                      ? dayjs(nextSend).format("YYYY-MM-DD")
                      : "已到期，下次排程寄出",
                },
              ]
            : []),
        ]}
      />

      {isSold && store.soldVia === SOLD_VIA.FOLLOW_UP_EMAIL && (
        <Alert
          type="info"
          message={`由追蹤信標記已頂讓 · ${
            store.soldTime
              ? dayjs(store.soldTime).format("YYYY-MM-DD HH:mm")
              : ""
          }`}
          description="賣家若回信說不是本人操作，用上方狀態切回「已上架」即可。"
        />
      )}

      {!isSold && (
        <div className="flex items-center justify-between gap-[12px] rounded-[8px] border border-black/[0.06] px-[12px] py-[10px]">
          <div>
            <div className="font-semibold">自動寄送追蹤信</div>
            <div className="text-[12px] text-black/45">
              {followUp.paused
                ? "已停止，這家店不會再收到追蹤信"
                : "關掉後這家店不會再收到追蹤信"}
            </div>
          </div>
          <Switch
            checked={!followUp.paused}
            loading={toggling}
            onChange={(checked) => onPausedChange(!checked)}
          />
        </div>
      )}

      {followUp.lastError === FOLLOW_UP_ERROR.NO_EMAIL && (
        <Alert
          type="warning"
          message="找不到賣家的 email，追蹤信寄不出去。補上信箱後，隔天會自動補寄。"
        />
      )}
      {isSendFailure(followUp.lastError) && (
        <Alert
          type="error"
          message="上次寄送失敗，明天會再試一次"
          description={followUp.lastError}
        />
      )}
    </div>
  );
}
