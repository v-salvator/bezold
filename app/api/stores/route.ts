import { mockStores } from "@/mocks";

export async function GET() {
  // const res = await fetch('https://data.mongodb-api.com/...', {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'API-Key': process.env.DATA_API_KEY,
  //   },
  // })

  // * query data from firebase

  const stores = Object.entries(mockStores).map(([key, value]) => {
    return {
      id: key,
      ...value,
    };
  });
  return Response.json({ data: stores });
}
