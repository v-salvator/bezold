import { cn } from "@/lib/utils";
import styles from "./Sparkline.module.css";

interface SparklineProps {
  series: number[];
  width?: number;
  height?: number;
}

// Tiny trend line; scaled to its own max so shape, not magnitude, reads.
export default function Sparkline({
  series,
  width = 88,
  height = 24,
}: SparklineProps) {
  const max = Math.max(...series, 1);
  const hasTraffic = series.some((value) => value > 0);
  const step = series.length > 1 ? width / (series.length - 1) : 0;
  const points = series
    .map((value, index) => {
      const pointX = index * step;
      const pointY = height - 2 - (value / max) * (height - 4);
      return `${pointX.toFixed(1)},${pointY.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      className={cn(styles.sparkline, !hasTraffic && styles.empty)}
    >
      <polyline points={points} />
    </svg>
  );
}
