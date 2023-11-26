import { mockStores } from "@/mocks";
import { getStoreById } from "@/firebase/serverUtils";

interface StoreProps {
  params: { storeId: string };
}

export async function GET(request: Request, { params }: StoreProps) {
  const { storeId } = params;

  // * query data from firebase

  // const storeInfo = mockStores.find((store) => store.id === storeId);
  const storeInfo = await getStoreById(storeId);

  if (!storeInfo) {
    return Response.json(
      { data: null },
      { status: 400, statusText: "Store not found" }
    );
  }

  return Response.json({ data: storeInfo });
}
