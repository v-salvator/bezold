import { Tag, Carousel, Divider } from "antd";
import { curencyFormatter } from "@/utils";
import { AnimatedImage } from "@/components/animated";

import type { Store } from "@/types";
interface StoreProps {
  params: { storeId: string };
}

async function getStoreById(storeId: StoreProps["params"]["storeId"]) {
  // TODO: add get store by category
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/stores/${storeId}`,
    {
      cache: "no-store",
    }
  );
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
    city,
    district,
  } = store;
  const defaultImage = ["/assets/bezold.png"];
  const carouselImage = images.length ? images : defaultImage;
  return (
    <div className="max-w-[1024px] m-auto">
      <h1 className="py-[24px] font-bold text-[36px]">{storeName}</h1>
      <Carousel dotPosition="bottom" effect="fade" arrows infinite autoplay>
        {carouselImage.map((image, i) => (
          <div key={i}>
            <div className="h-[360px]">
              <AnimatedImage
                src={image}
                isRounded={false}
                alt="Picture of the store"
              />
            </div>
          </div>
        ))}
      </Carousel>
      <div className="p-[12px]">
        <h2 className="mt-[12px] font-bold text-[20px]">{`${city} ${district}`}</h2>
        <h2 className="ml-[12px] mb-[12px] font-bold text-[24px]">
          {location}
        </h2>
        <div className="my-[12px]">{description}</div>
        <div className="my-[12px]">
          {tags?.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="my-[12px] font-bold text-[24px] text-right">{`頂讓金: ${curencyFormatter(
          price
        )}`}</div>
        <Divider orientation="left" orientationMargin="0">
          聯絡資訊
        </Divider>
        <div className="my-[12px]">聯絡人: {userInfo?.userName}</div>
        <div className="my-[12px]">聯絡手機: {userInfo?.phone}</div>
        <div className="my-[12px] text-[12px]">{`最近更新時間: ${updateTime}`}</div>
      </div>
    </div>
  );
}
