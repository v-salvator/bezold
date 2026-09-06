import { NextRequest, NextResponse } from "next/server";
import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { db } from "@/firebase/server";
import { COLLECTIONS } from "@/firebase/constants";
import { verifyAdminToken } from "@/lib/verifyAdminToken";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// Opaque cursor = base64("<createTime millis>|<uid>"). Pairs the sort key with
// the doc id so ties on createTime page deterministically.
function encodeCursor(millis: number, uid: string): string {
  return Buffer.from(`${millis}|${uid}`).toString("base64");
}

function decodeCursor(raw: string): { millis: number; uid: string } | null {
  try {
    const [millis, uid] = Buffer.from(raw, "base64")
      .toString("utf8")
      .split("|");
    const ms = Number(millis);
    if (!Number.isFinite(ms) || !uid) return null;
    return { millis: ms, uid };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const rawCursor = searchParams.get("cursor");

  try {
    let query = db
      .collection(COLLECTIONS.USER)
      .where("hasBuyerProfile", "==", true)
      .orderBy("createTime", "desc")
      .orderBy(FieldPath.documentId(), "desc")
      .limit(limit);

    if (rawCursor) {
      const cursor = decodeCursor(rawCursor);
      if (!cursor) {
        return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
      }
      query = query.startAfter(Timestamp.fromMillis(cursor.millis), cursor.uid);
    }

    const snap = await query.get();

    const rows = snap.docs.map((doc) => {
      const data = doc.data();
      const profile = data.buyerProfile ?? {};
      const createMillis =
        data.createTime instanceof Timestamp ? data.createTime.toMillis() : 0;
      return {
        uid: doc.id,
        userName: data.userName ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        lineId: data.lineId ?? "",
        category: profile.category ?? "",
        city: profile.city ?? "",
        budgetKey: profile.budgetKey ?? "",
        fromBuyerClub: data.fromBuyerClub === true,
        createTime: createMillis,
      };
    });

    // A full page implies there may be more; a short page is the last one.
    const last = snap.docs[snap.docs.length - 1];
    const nextCursor =
      snap.size === limit && last
        ? encodeCursor(rows[rows.length - 1].createTime, last.id)
        : null;

    return NextResponse.json({ rows, nextCursor });
  } catch (err) {
    // Firestore surfaces a console link here on the first run if the composite
    // index (hasBuyerProfile ASC, createTime DESC, __name__ DESC) is missing.
    console.error("Failed to fetch buyer profiles", err);
    return NextResponse.json(
      { error: "Failed to fetch buyer profiles" },
      { status: 500 },
    );
  }
}
