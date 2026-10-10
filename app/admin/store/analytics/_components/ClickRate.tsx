import { Tooltip } from "antd";
import styles from "./ClickRate.module.css";

// Rates at or above this fill the bar; typical contact-gate rates sit well
// below it, so the bar still separates weak and strong stores.
const FULL_BAR_RATE = 0.35;

interface ClickRateProps {
  gateViews: number;
  gateClicks: number;
  /** Show `點擊 X / 看到 Y 次` on hover. */
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
  return (
    <Tooltip
      title={`點擊 ${gateClicks.toLocaleString()} / 看到 ${gateViews.toLocaleString()} 次`}
    >
      {content}
    </Tooltip>
  );
}
