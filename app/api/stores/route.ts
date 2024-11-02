import { mockStores } from "@/mocks";
import { getStores } from "@/firebase/serverUtils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchObj = Object.fromEntries(searchParams);
  // * query data from firebase
  const mockStoresByDB = await getStores(searchObj);

  return Response.json({ data: mockStoresByDB });
}
