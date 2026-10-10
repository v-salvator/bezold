import { Tooltip, Typography } from "antd";
import { changeRatio } from "@/utils/storeAnalytics";

interface ChangeIndicatorProps {
  current: number;
  previous: number;
}

export default function ChangeIndicator({
  current,
  previous,
}: ChangeIndicatorProps) {
  const ratio = changeRatio(current, previous);
  if (ratio === null)
    return <Typography.Text type="secondary">—</Typography.Text>;

  if (ratio === 0)
    return <Typography.Text type="secondary">0%</Typography.Text>;

  const isUp = ratio > 0;
  return (
    <Tooltip title="與前一期（相同天數）比較">
      <Typography.Text
        type={isUp ? "success" : "danger"}
        className="whitespace-nowrap text-[12px] tabular-nums"
      >
        {isUp ? "▲" : "▼"} {Math.abs(ratio * 100).toFixed(0)}%
      </Typography.Text>
    </Tooltip>
  );
}
