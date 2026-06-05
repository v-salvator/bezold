import type { EquipmentStatus } from "@/types/Store";

export const EQUIPMENT_OPTIONS: { value: EquipmentStatus; label: string }[] = [
  { value: "all", label: "含設備" },
  { value: "none", label: "不含設備" },
  { value: "partial", label: "含部分設備" },
];

export const EQUIPMENT_LABEL: Record<EquipmentStatus, string> = {
  all: "含設備",
  none: "不含設備",
  partial: "含部分設備",
};
