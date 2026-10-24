import {
  type DigitalAssetTab,
  type DigitalAssetType,
  type Store,
  ALL_DIGITAL_ASSET_TYPES,
  DIGITAL_ASSET_TYPE,
} from "@/types";

const DIGITAL_ASSET_TYPE_VALUES: string[] = Object.values(DIGITAL_ASSET_TYPE);

// * ?type= on /digital-assets — anything unrecognised (or repeated) is 全部
export const toDigitalAssetTab = (value: unknown): DigitalAssetTab =>
  typeof value === "string" && DIGITAL_ASSET_TYPE_VALUES.includes(value)
    ? (value as DigitalAssetType)
    : ALL_DIGITAL_ASSET_TYPES;

export const filterByDigitalAssetTab = <
  Item extends Pick<Store, "digitalTypes">,
>(
  items: Item[],
  tab: DigitalAssetTab,
) =>
  tab === ALL_DIGITAL_ASSET_TYPES
    ? items
    : items.filter((item) => item.digitalTypes?.includes(tab));

export const digitalAssetListHref = (tab: DigitalAssetTab) =>
  tab === ALL_DIGITAL_ASSET_TYPES
    ? "/digital-assets"
    : `/digital-assets?${new URLSearchParams({ type: tab })}`;
