import Pill from "@/components/refactored/Pill";
import { DIGITAL_ASSET_TYPES } from "@/constant/digitalAsset";
import { type DigitalAssetTab, ALL_DIGITAL_ASSET_TYPES } from "@/types";
import styles from "./DigitalAssets.module.css";

const TABS: { key: DigitalAssetTab; label: string }[] = [
  { key: ALL_DIGITAL_ASSET_TYPES, label: "全部" },
  ...DIGITAL_ASSET_TYPES,
];

// * shared by the homepage section (local state) and /digital-assets (URL) —
// * the caller decides what selecting a tab does
export default function TypeTabs({
  activeTab,
  onSelect,
}: {
  activeTab: DigitalAssetTab;
  onSelect: (tab: DigitalAssetTab) => void;
}) {
  return (
    <div className={styles.tabs} role="group" aria-label="數位資產類型">
      {TABS.map(({ key, label }) => {
        const isActive = key === activeTab;
        return (
          <button
            key={key}
            type="button"
            className={styles.tab}
            aria-pressed={isActive}
            onClick={() => onSelect(key)}
          >
            <Pill variant={isActive ? "solid" : "default"}>{label}</Pill>
          </button>
        );
      })}
    </div>
  );
}
