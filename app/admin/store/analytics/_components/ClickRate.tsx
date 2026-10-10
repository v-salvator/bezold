import { Tooltip } from "antd";
import { CONTACT_GATE_TRACKING_START } from "@/constant/storeAnalytics";
import styles from "./ClickRate.module.css";

// Rates at or above this fill the bar; typical contact-gate rates sit well
// below it, so the bar still separates weak and strong stores.
const FULL_BAR_RATE = 0.35;

interface ClickRateProps {
  gateViews: number;
  gateClicks: number;
  /** Show the raw gate view / click counts on hover. */
  showCounts?: boolean;
}

export const clickRateOf = ({ gateViews, gateClicks }: ClickRateProps) =>
  gateViews > 0 ? gateClicks / gateViews : null;

export default function ClickRate({
  gateViews,
  gateClicks,
  showCounts = false,
}: ClickRateProps) {
  const rate = clickRateOf({ gateViews, gateClicks });
  if (rate === null) return <span className={styles.empty}>—</span>;

  const content = (
    <span className={styles.clickRate}>
      <span className={styles.track}>
        <span
          className={styles.fill}
          style={{ width: `${Math.min(rate / FULL_BAR_RATE, 1) * 100}%` }}
        />
      </span>
      {(rate * 100).toFixed(1)}%
    </span>
  );

  if (!showCounts) return content;
  // Gate views are counts of locked contact blocks, not people, so spell out
  // why they can be far below the visitor count.
  return (
    <Tooltip
      title={
        <>
          <div>
            未登入訪客看到聯絡區 {gateViews.toLocaleString()} 次 → 點擊解鎖{" "}
            {gateClicks.toLocaleString()} 次
          </div>
          <div className="text-[12px] opacity-75">
            已登入會員不計入；自 {CONTACT_GATE_TRACKING_START} 開始記錄
          </div>
        </>
      }
    >
      {content}
    </Tooltip>
  );
}
