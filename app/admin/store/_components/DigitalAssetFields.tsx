"use client";
import { Checkbox, Input, Typography } from "antd";

import type { Store } from "@/types";
import { DIGITAL_ASSET_TYPES } from "@/constant/digitalAsset";

interface DigitalAssetFieldsProps {
  values: Partial<Store>;
  onChange: (key: keyof Store, value: Store[keyof Store]) => void;
}

// * digital-only inputs shared by the admin create and edit forms. Numbers are
// * kept as typed strings; digitalAssetWriteFields() parses them on save.
export default function DigitalAssetFields({
  values,
  onChange,
}: DigitalAssetFieldsProps) {
  return (
    <>
      <Typography.Title level={5}>類型 Digital Types</Typography.Title>
      <Checkbox.Group
        style={{ width: "100%" }}
        defaultValue={values.digitalTypes}
        onChange={(checked) =>
          onChange("digitalTypes", checked as Store["digitalTypes"])
        }
      >
        {DIGITAL_ASSET_TYPES.map((type) => (
          <Checkbox key={type.key} value={type.key}>
            {type.label}
          </Checkbox>
        ))}
      </Checkbox.Group>
      <Typography.Title level={5}>
        經營時間 Operating Years (optional)
      </Typography.Title>
      <Input
        defaultValue={values.operatingYears}
        placeholder="e.g. 5 或 0.5"
        suffix="年"
        onChange={(event) => onChange("operatingYears", event.target.value)}
      />
      <Typography.Title level={5}>
        平均月營收 Monthly Revenue TWD (optional)
      </Typography.Title>
      <Input
        defaultValue={values.monthlyRevenue}
        placeholder="e.g. 200000"
        onChange={(event) => onChange("monthlyRevenue", event.target.value)}
      />
      <Typography.Title level={5}>
        價格上限 Price Max TWD (optional)
      </Typography.Title>
      <Input
        defaultValue={values.priceMax || undefined}
        placeholder="留空 = 單一價格；Price 是下限"
        onChange={(event) => onChange("priceMax", event.target.value)}
      />
      <Typography.Title level={5}>資產連結 Asset URL</Typography.Title>
      <Input
        defaultValue={values.assetUrl}
        placeholder="https://"
        onChange={(event) => onChange("assetUrl", event.target.value)}
      />
      <Typography.Paragraph
        type="secondary"
        style={{ marginTop: 4, marginBottom: 0, fontSize: 12 }}
      >
        只有管理員看得到，用來查核，不會出現在公開頁面。
      </Typography.Paragraph>
    </>
  );
}
