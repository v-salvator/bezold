import { useState, type MouseEvent } from "react";
import { useMeasure } from "react-use";
import styles from "./ViewsLineChart.module.css";

const HEIGHT = 160;
const PADDING = { left: 32, right: 8, top: 8, bottom: 20 };
const DAY_MS = 24 * 60 * 60 * 1000;

interface ViewsLineChartProps {
  /** Daily views, oldest → newest. */
  series: number[];
  /** YYYY-MM-DD of series[0]. */
  startDate: string;
}

const dayLabel = (startDate: string, index: number) => {
  const date = new Date(Date.parse(`${startDate}T00:00:00Z`) + index * DAY_MS);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
};

export default function ViewsLineChart({
  series,
  startDate,
}: ViewsLineChartProps) {
  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = Math.max(width - PADDING.left - PADDING.right, 1);
  const plotBottom = HEIGHT - PADDING.bottom;
  // Round the axis up to a multiple of 4 so the midline label is whole.
  const axisMax = Math.max(Math.ceil(Math.max(...series) / 4) * 4, 4);
  const pointX = (index: number) =>
    PADDING.left + (index / Math.max(series.length - 1, 1)) * plotWidth;
  const pointY = (value: number) =>
    PADDING.top + (1 - value / axisMax) * (plotBottom - PADDING.top);

  const linePath = series
    .map(
      (value, index) =>
        `${index ? "L" : "M"}${pointX(index).toFixed(1)},${pointY(value).toFixed(1)}`,
    )
    .join("");
  const areaPath = `${linePath}L${pointX(series.length - 1)},${plotBottom}L${pointX(0)},${plotBottom}Z`;

  const handleMouseMove = (event: MouseEvent<SVGRectElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    setHoverIndex(
      Math.min(
        series.length - 1,
        Math.max(0, Math.round(ratio * (series.length - 1))),
      ),
    );
  };

  const hoverValue = hoverIndex === null ? null : series[hoverIndex];

  return (
    <div ref={containerRef} className={styles.chart}>
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label="每日頁面瀏覽折線圖"
        >
          {[0, axisMax / 2, axisMax].map((tick) => (
            <g key={tick}>
              <line
                className={styles.gridLine}
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={pointY(tick)}
                y2={pointY(tick)}
              />
              <text
                className={styles.axisLabel}
                x={PADDING.left - 6}
                y={pointY(tick) + 4}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          ))}
          <path className={styles.area} d={areaPath} />
          <path className={styles.line} d={linePath} />
          <text className={styles.axisLabel} x={PADDING.left} y={HEIGHT - 4}>
            {dayLabel(startDate, 0)}
          </text>
          <text
            className={styles.axisLabel}
            x={width - PADDING.right}
            y={HEIGHT - 4}
            textAnchor="end"
          >
            {dayLabel(startDate, series.length - 1)}
          </text>
          {hoverIndex !== null && hoverValue !== null && (
            <>
              <line
                className={styles.crosshair}
                x1={pointX(hoverIndex)}
                x2={pointX(hoverIndex)}
                y1={PADDING.top}
                y2={plotBottom}
              />
              <circle
                className={styles.dot}
                cx={pointX(hoverIndex)}
                cy={pointY(hoverValue)}
                r={4}
              />
            </>
          )}
          {/* Hit area wider than the line so hovering is forgiving. */}
          <rect
            className={styles.hitArea}
            x={PADDING.left}
            y={0}
            width={plotWidth}
            height={HEIGHT}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
          />
        </svg>
      )}
      {hoverIndex !== null && hoverValue !== null && (
        <div
          className={styles.tooltip}
          style={{
            left: Math.min(pointX(hoverIndex) + 8, width - 120),
            top: pointY(hoverValue) + 8,
          }}
        >
          {dayLabel(startDate, hoverIndex)} · <b>{hoverValue}</b> 次瀏覽
        </div>
      )}
    </div>
  );
}
