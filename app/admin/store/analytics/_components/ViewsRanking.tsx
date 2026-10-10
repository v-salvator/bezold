import { Card, Empty } from "antd";
import type { StoreAnalyticsRow } from "@/utils/storeAnalytics";
import styles from "./ViewsRanking.module.css";

const RANKING_SIZE = 10;

interface ViewsRankingProps {
  rows: StoreAnalyticsRow[];
  days: number;
  loading: boolean;
}

export default function ViewsRanking({
  rows,
  days,
  loading,
}: ViewsRankingProps) {
  const ranked = rows
    .filter((row) => row.analytics.current.views > 0)
    .sort(
      (left, right) =>
        right.analytics.current.views - left.analytics.current.views,
    )
    .slice(0, RANKING_SIZE);
  const topViews = ranked[0]?.analytics.current.views ?? 0;

  return (
    <Card
      size="small"
      title="瀏覽數排行"
      extra={
        <span className={styles.caption}>
          近 {days} 天 · 前 {RANKING_SIZE} 名
        </span>
      }
      loading={loading}
    >
      {ranked.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="這段期間沒有瀏覽"
        />
      ) : (
        <ol className={styles.ranking}>
          {ranked.map(({ store, analytics }) => (
            <li
              key={store.id}
              className={styles.item}
              title={`${store.storeName}：${analytics.current.views.toLocaleString()} 次瀏覽`}
            >
              <span className={styles.name}>{store.storeName || "—"}</span>
              <span className={styles.track}>
                <span
                  className={styles.bar}
                  style={{
                    width: `${(analytics.current.views / topViews) * 100}%`,
                  }}
                />
              </span>
              <span className={styles.value}>
                {analytics.current.views.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
