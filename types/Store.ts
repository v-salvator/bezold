import { User } from "./User";
import type { Timestamp } from "firebase/firestore";
import { StoreTag } from "@/types/StoreTags";
import { StoreStatus } from "@/types/StoreStatus";

export type EquipmentStatus = "all" | "none" | "partial";

// * types in client
export interface Store {
  id: string;
  storeName: string;
  location: string;
  description: string;
  tags?: StoreTag[];
  category?: string; // TODO: maybe list type of category, will not be option in the future
  price: number;
  priceNegotiable?: boolean; // price 0 + true = 面議; price 0 + false = 免頂讓金; price > 0 + true = 可面議
  currency: string; // TODO: maybe list all type of currency
  createTime: Date;
  updateTime: Date;
  images: string[];
  user?: string; // TODO: should not be optional
  userInfo?: User;
  city?: string; // TODO: will not be option in the future
  district?: string; // TODO: will not be option in the future
  status?: StoreStatus;
  areaPing?: number;
  monthlyRent?: number;
  equipment?: EquipmentStatus;
}

// * types in firestore doc
export interface StoreDoc {
  storeName: string;
  location: string;
  description: string;
  tags?: StoreTag[];
  category?: string; // TODO: maybe list type of category
  price: number;
  priceNegotiable?: boolean; // price 0 + true = 面議; price 0 + false = 免頂讓金; price > 0 + true = 可面議
  currency: string; // TODO: maybe list all type of currency
  createTime: Timestamp;
  updateTime: Timestamp;
  images: string[];
  user?: string; // TODO: should not be optional
  userInfo?: User;
  city?: string; // TODO: will not be option in the future
  district?: string; // TODO: will not be option in the future
  status?: StoreStatus;
  areaPing?: number;
  monthlyRent?: number;
  equipment?: EquipmentStatus;
}
