"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import Section from "./Section";
import styles from "./SellerCta.module.css";
import Button from "@/components/refactored/Button";

export default function SellerCta() {
  const router = useRouter();

  function handleSell() {
    if (auth.currentUser) {
      router.push("/new/sell");
    } else {
      router.push("/new/login?redirect=/new/sell");
    }
  }

  return (
    <Section>
      <div className={styles.band}>
        <div>
          <h3>
            想頂出你的店？
            <br />
            <span className={styles.subline}>前 3 個月免費 · 早鳥限定</span>
          </h3>
          <p>5 分鐘上架 · 開站慶免費刊登 · 買家直接聯絡你 · 永久不抽成交抽成</p>
        </div>
        <div className={styles.stats}>
          <div>
            <b>
              3<small className={styles.unit}> 個月</small>
            </b>
            早鳥免費
          </div>
          <div>
            <b>0%</b>成交抽成
          </div>
          <div>
            <b>
              5<small className={styles.unit}> 分鐘</small>
            </b>
            上架
          </div>
        </div>
        <div className={"flex flex-col gap-2"}>
          <Button onClick={handleSell}>搶早鳥免費刊登 →</Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/new/store-example")}
          >
            看刊登範例
          </Button>
        </div>
      </div>
    </Section>
  );
}
