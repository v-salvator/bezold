import { User } from "./User";
import type { Timestamp } from "firebase/firestore";

// * types in client
export interface Store {
  id: string;
  storeName: string;
  location: string;
  description: string;
  tags: string[]; // TODO: maybe list all type of tags
  price: number;
  currency: string; // TODO: maybe list all type of currency
  createTime: Date;
  updateTime: Date;
  images: string[];
  user?: string; // TODO: should not be optional
  userInfo?: User;
}

// * types in firestore doc
export interface StoreDoc {
  storeName: string;
  location: string;
  description: string;
  tags: string[]; // TODO: maybe list all type of tags
  price: number;
  currency: string; // TODO: maybe list all type of currency
  createTime: Timestamp;
  updateTime: Timestamp;
  images: string[];
  user?: string; // TODO: should not be optional
  userInfo?: User;
}
