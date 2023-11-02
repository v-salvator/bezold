interface StoreProps {
  params: { storeId: string };
}

async function getStoreById(storeId: StoreProps["params"]["storeId"]) {
  // TODO: add get store by category
  const res = await fetch(`http://localhost:3000/api/stores/${storeId}`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function Store({ params }: StoreProps) {
  const { storeId } = params;
  const { data: store } = await getStoreById(storeId);
  const {
    storeName,
    location,
    description,
    tags,
    price,
    createTime,
    updateTime,
  } = store;
  return (
    <div>
      <div>{storeName}</div>
      <div>{location}</div>
      <div>{description}</div>
      <div>{tags}</div>
      <div>{price}</div>
      <div>{createTime}</div>
      <div>{updateTime}</div>
    </div>
  );
}
