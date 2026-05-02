import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import Category, {
  type Category as CategoryType,
} from "@/components/refactored/Category";
import cn from "classnames";

const categories: CategoryType[] = [
  { ico: "餐", variant: "a", name: "餐飲", count: "412" },
  { ico: "咖", variant: "b", name: "咖啡", count: "188" },
  { ico: "飲", variant: "c", name: "手搖飲", count: "156" },
  { ico: "火", variant: "default", name: "火鍋燒烤", count: "74" },
  { ico: "美", variant: "a", name: "美容美髮", count: "96" },
  { ico: "補", variant: "c", name: "補習教育", count: "41" },
  { ico: "零", variant: "b", name: "零售", count: "132" },
  { ico: "他", variant: "default", name: "其他", count: "88" },
];

export default function Categories() {
  return (
    <Section>
      <SectionTitle num="05" title="依行業瀏覽" sub="— 從你熟悉的類型開始 —" />
      <div
        className={cn(
          "grid gap-2",
          "lg:grid-cols-8 md:grid-cols-4 grid-cols-3",
        )}
      >
        {categories.map((category) => (
          <Category key={category.name} category={category} />
        ))}
      </div>
    </Section>
  );
}
