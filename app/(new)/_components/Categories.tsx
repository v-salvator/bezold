import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import Category, {
  type Category as CategoryType,
} from "@/components/refactored/Category";
import { STORE_CATEGORY } from "@/types";
import cn from "classnames";

const categories: CategoryType[] = [
  {
    ico: "餐",
    variant: "a",
    name: "餐飲",
    href: `/store-list?category=${STORE_CATEGORY.RESTAURANT}`,
  },
  {
    ico: "服",
    variant: "b",
    name: "服飾",
    href: `/store-list?category=${STORE_CATEGORY.CLOTHING}`,
  },
  {
    ico: "工",
    variant: "c",
    name: "工廠",
    href: `/store-list?category=${STORE_CATEGORY.FACTORY}`,
  },
  {
    ico: "百",
    variant: "default",
    name: "百貨",
    href: `/store-list?category=${STORE_CATEGORY.DEPARTMENT}`,
  },
  {
    ico: "他",
    variant: "a",
    name: "其他",
    href: `/store-list?category=${STORE_CATEGORY.OTHERS}`,
  },
];

export default function Categories() {
  return (
    <Section>
      <SectionTitle num="03" title="依行業瀏覽" sub="— 從你熟悉的類型開始 —" />
      <div
        className={cn(
          "grid gap-2",
          "lg:grid-cols-5 md:grid-cols-5 grid-cols-3",
        )}
      >
        {categories.map((category) => (
          <Category key={category.name} category={category} />
        ))}
      </div>
    </Section>
  );
}
