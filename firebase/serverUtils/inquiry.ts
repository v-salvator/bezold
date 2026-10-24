import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/firebase/server";
import { COLLECTIONS } from "@/firebase/constants";
import {
  INQUIRY_STATUS,
  STORE_STATUS,
  type Inquiry,
  type InquiryDoc,
  type InquiryStatus,
} from "@/types";
import { getInquiryId } from "@/utils/inquiry";
import { isDigitalAsset } from "@/utils/store";

// * gRPC codes DocumentReference.create() / update() throw
const NOT_FOUND = 5;
const ALREADY_EXISTS = 6;

export const hasSubmittedInquiry = async (
  storeId: string,
  buyerUid: string,
) => {
  const snapshot = await db
    .collection(COLLECTIONS.INQUIRY)
    .doc(getInquiryId(storeId, buyerUid))
    .get();
  return snapshot.exists;
};

export type SubmitInquiryResult =
  "created" | "already_submitted" | "not_found" | "not_digital";

// * only approved digital assets take inquiries. create() fails if the doc
// * exists, so a resubmit can never overwrite the first inquiry.
export const submitInquiry = async ({
  storeId,
  buyerUid,
  buyerEmail,
  message,
}: {
  storeId: string;
  buyerUid: string;
  buyerEmail: string;
  message: string;
}): Promise<SubmitInquiryResult> => {
  const storeSnapshot = await db
    .collection(COLLECTIONS.STORE)
    .doc(storeId)
    .get();
  const store = storeSnapshot.data();
  if (!store) return "not_found";
  if (!isDigitalAsset(store)) return "not_digital";
  if (store.status !== STORE_STATUS.APPROVED) return "not_found";

  // * accounts created in the Auth console may have no user doc yet
  const buyer = (
    await db.collection(COLLECTIONS.USER).doc(buyerUid).get()
  ).data();

  try {
    await db
      .collection(COLLECTIONS.INQUIRY)
      .doc(getInquiryId(storeId, buyerUid))
      .create({
        storeId,
        storeName: store.storeName ?? "",
        buyerUid,
        buyerName: buyer?.userName ?? "",
        buyerEmail,
        buyerPhone: buyer?.phone ?? "",
        message,
        status: INQUIRY_STATUS.NEW,
        createTime: FieldValue.serverTimestamp(),
        updateTime: FieldValue.serverTimestamp(),
      });
    return "created";
  } catch (error) {
    if ((error as { code?: number }).code === ALREADY_EXISTS)
      return "already_submitted";
    throw error;
  }
};

// * admin inbox — newest first. Single-field order, no composite index; the
// * collection only holds a handful of requests per asset, so no paging yet.
export const listInquiries = async (): Promise<Inquiry[]> => {
  const snapshot = await db
    .collection(COLLECTIONS.INQUIRY)
    .orderBy("createTime", "desc")
    .get();
  return snapshot.docs.map((doc) => {
    const data = doc.data() as InquiryDoc;
    return {
      ...data,
      id: doc.id,
      createTime: data.createTime.toDate(),
      updateTime: data.updateTime.toDate(),
    };
  });
};

// * only status + updateTime ever change; update() fails on a missing doc,
// * so a bad id can't create a stray inquiry. false = not found.
export const updateInquiryStatus = async (
  inquiryId: string,
  status: InquiryStatus,
) => {
  try {
    await db.collection(COLLECTIONS.INQUIRY).doc(inquiryId).update({
      status,
      updateTime: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    if ((error as { code?: number }).code === NOT_FOUND) return false;
    throw error;
  }
};
