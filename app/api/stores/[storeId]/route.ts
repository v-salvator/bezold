import { mockStores } from "@/mocks";

interface StoreProps {
  params: { storeId: string };
}

export async function GET(request: Request, { params }: StoreProps) {
  const { storeId } = params;

  // * query data from firebase

  const storeInfo = mockStores[storeId as keyof typeof mockStores];

  if (!storeInfo) {
    return Response.json(
      { data: null },
      { status: 400, statusText: "Store not found" }
    );
  }

  const store = {
    id: storeId,
    ...storeInfo,
  };

  return Response.json({ data: store });
}
