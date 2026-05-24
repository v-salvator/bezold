import { STORE_STATUS, type StoreStatus } from "@/types";
import { cn } from "@/lib/utils";
import styles from "./StatusBadge.module.css";

const STATUS_LABEL: Record<StoreStatus, string> = {
  [STORE_STATUS.PENDING]: "審核中",
  [STORE_STATUS.APPROVED]: "刊登中",
  [STORE_STATUS.REJECTED]: "未通過",
};

const STATUS_CLASS: Record<StoreStatus, string> = {
  [STORE_STATUS.PENDING]: styles.pending,
  [STORE_STATUS.APPROVED]: styles.approved,
  [STORE_STATUS.REJECTED]: styles.rejected,
};

export default function StatusBadge({ status }: { status: StoreStatus }) {
  return (
    <span className={cn(styles.badge, STATUS_CLASS[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
