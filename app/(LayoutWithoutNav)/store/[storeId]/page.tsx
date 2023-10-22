interface StoreProps {
  params: { storeId: string };
}

export default function Store({ params }: StoreProps) {
  console.log("🚀 ~ file: page.tsx:6 ~ Store ~ params:", params);
  return <div>{params.storeId}</div>;
}
