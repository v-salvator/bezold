import { Tag } from "antd";
import { curencyFormatter } from "@/utils";
import { Store } from "@/types";
import { AnimatedImage } from "@/components/animated";
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
  const { data: store }: { data: Store } = await getStoreById(storeId);
  const {
    storeName,
    location,
    description,
    tags,
    price,
    createTime,
    updateTime,
    images,
    userInfo,
  } = store;
  return (
    <div
      className="max-w-[1024px] m-auto"
      style={{ border: "1px solid green" }}
    >
      <h1 className="py-[24px] font-bold text-[36px]">{storeName}</h1>
      <div className="h-[320px]">
        <AnimatedImage src={images[0]} alt="Picture of the store" />
      </div>
      <div className="p-[12px]">
        <h2 className="my-[12px] font-bold text-[24px]">{location}</h2>
        <div className="my-[12px]">{description}</div>
        <div className="my-[12px]">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="my-[12px] font-bold text-[24px]">{`頂讓金: ${curencyFormatter(
          price
        )}`}</div>
        <div className="my-[12px]">聯絡人: {userInfo?.userName}</div>
        <div className="my-[12px]">聯絡手機: {userInfo?.phone}</div>
        <div className="my-[12px] text-[12px]">{`最近更新時間: ${updateTime}`}</div>
      </div>
    </div>
  );
}
