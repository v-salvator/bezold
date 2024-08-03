import type { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  userName: string;
  phone: string;
  email?: string;
  lineId?: string;
  remark?: string;
  createTime: Date;
  updateTime: Date;
}

export type UserBase = Omit<User, "id" | "createTime" | "updateTime">;

export interface UserDoc {
  userName: string;
  phone: string;
  email?: string;
  lineId?: string;
  remark?: string;
  createTime: Timestamp;
  updateTime: Timestamp;
}
