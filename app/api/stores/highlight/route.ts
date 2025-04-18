import { getHighlightedStores } from "@/firebase/serverUtils";

export async function GET() {
  // * query data from firebase
  const mockStoresByDB = await getHighlightedStores();

  return Response.json({ data: mockStoresByDB });
}
