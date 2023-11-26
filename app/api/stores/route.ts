import { mockStores } from "@/mocks";
import { getStores } from "@/firebase/serverUtils";

export async function GET() {
  // const res = await fetch('https://data.mongodb-api.com/...', {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'API-Key': process.env.DATA_API_KEY,
  //   },
  // })

  // * query data from firebase
  const mockStoresByDB = await getStores();

  return Response.json({ data: mockStoresByDB });
}
