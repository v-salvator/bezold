import { Tag, Carousel, Divider } from "antd";
import { curencyFormatter } from "@/utils";
import { AnimatedImage } from "@/components/animated";
import type { Metadata, ResolvingMetadata } from "next";
import { getStoreById } from "@/firebase/serverUtils";

import type { Store } from "@/types";
interface StoreProps {
  params: { storeId: string };
}

export async function generateMetadata(
  { params }: StoreProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = (await params).storeId;

  // fetch data
  const store = await getStoreById(id);
  if (!store) {
    return {
      title: `Bezold - Store not found`,
      openGraph: {
        title: `Bezold - Store not found`,
        siteName: `Bezold - Store not found`,
        description: "Store not found",
        url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${id}`,
        images: ["/assets/bezold.png"],
      },
    };
  }

  return {
    title: `Bezold - ${store.storeName}`,
    openGraph: {
      title: `Bezold - ${store.storeName}`,
      siteName: `Bezold - ${store.storeName}`,
      description: store.description,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${id}`,
      images: store.images.length ? store.images : ["/assets/bezold.png"],
    },
  };
}

export default async function Store({ params }: StoreProps) {
  const { storeId } = params;
  const store = await getStoreById(storeId);

  if (!store) {
    throw new Error("Store not found");
  }

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
