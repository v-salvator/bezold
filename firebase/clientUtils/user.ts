import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  updateDoc,
  setDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import type { User, UserDoc } from "@/types";
import { COLLECTIONS } from "@/firebase/constants";

const COLLECTION = COLLECTIONS.USER;

const userConverter = {
  // * try to figure out how to use toFirestore, dosn't seem to work maybe seems only work on setDoc not upateDoc
  // * doc link: https://firebase.google.com/docs/reference/js/firestore_.firestoredataconverter
  toFirestore: (user: User) => {
    return {
      ...user,
      updateTime: serverTimestamp(),
      createTime: user.createTime
        ? Timestamp.fromDate(user.createTime)
        : serverTimestamp(),
    };
  },
  fromFirestore: (userSnaphot: any) => {
    const userData = userSnaphot.data() as UserDoc;
    return {
      ...userData,
      // * addons
      id: userSnaphot.id,
      createTime: userData?.createTime.toDate(),
      updateTime: userData?.updateTime.toDate(),
    } as User;
  },
};

export const getUserById = async (userId: User["id"]) => {
  const docRef = doc(db, COLLECTION, userId).withConverter(userConverter);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const user = docSnap.data();
    return user;
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
    return undefined;
  }
};

export const editUserById = async (
  userId: User["id"],
  editedUser: Partial<User>,
) => {
  const docRef = doc(db, COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  // Accounts created directly in the Firebase Auth console have no user doc yet,
  // so updateDoc would throw. Upsert: create the doc on first edit.
  if (docSnap.exists()) {
    await updateDoc(docRef, {
      ...editedUser,
      updateTime: serverTimestamp(),
    });
  } else {
    await setDoc(docRef, {
      ...editedUser,
      createTime: serverTimestamp(),
      updateTime: serverTimestamp(),
    });
  }
};

export const createUserDoc = async (user: User) => {
  const docRef = collection(db, COLLECTION).withConverter(userConverter);
  const userRef = await addDoc(docRef, user);
  return userRef;
};
