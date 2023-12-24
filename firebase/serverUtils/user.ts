import { db } from "@/firebase/server";
import { User, UserBase } from "@/types";
import { COLLECTIONS } from "./constants";

const COLLECTION = COLLECTIONS.USER;

export const getUserById = async (userId: string) => {
  const userRef = db.collection(COLLECTION).doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) {
    return null;
  } else {
    const userData = doc.data();

    const user = {
      id: doc.id,
      ...userData,
      createTime: userData!.createTime.toDate(),
      updateTime: userData!.updateTime.toDate(),
    } as User;
    return user;
  }
};

export const createUser = async (user: UserBase) => {
  const userRef = await db.collection(COLLECTION).add({
    ...user,
    createTime: new Date(),
    updateTime: new Date(),
  });
  return userRef.id;
};
