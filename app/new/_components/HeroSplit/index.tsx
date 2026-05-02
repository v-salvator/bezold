import Pill from "@/components/refactored/Pill";
import styles from "./HeroSplit.module.css";

export default function HeroSplit() {
  return (
    <section className={styles.hero}>
      <div className={styles.kicker}>— 全台店面頂讓平台 · 真實刊登 —</div>
      <h1 className={styles.title}>
        找一間<em>準備好</em>的店
        <br />
        開門就營業
      </h1>
      <p className={styles.sub}>
        買家直接接手已有客群、設備、營運的店面 · 賣家把心血交給合適的人。
        <br />
        <b className={styles.subAccent}>開站慶 · 前 3 個月免費刊登</b> ·
        真實店家 · 買賣直接聯絡，沒有中間人。
      </p>

      <div className={styles.split}>
        <div className={`${styles.col} ${styles.buy}`}>
          <div className={styles.lab}>FOR BUYERS · 買家</div>
          <h2 className={styles.colTitle}>
            找店
            <br />
            接手就開張
          </h2>
          <p className={styles.lead}>
            2,481 間真實刊登 · 含設備清單、客群分析、月營業額參考
          </p>
          <div className={styles.form}>
            <div className={styles.field}>
              <b>地區</b>
              <span className={styles.fieldCar}>選擇縣市 / 行政區</span>
            </div>
            <div className={styles.field}>
              <b>行業</b>
              <span className={styles.fieldCar}>餐飲 · 飲料 · 零售 …</span>
            </div>
            <div className={styles.formGrid2}>
              <div className={styles.field}>
                <b>頂讓金</b>
                <span className={styles.fieldCar}>不限</span>
              </div>
              <div className={styles.field}>
                <b>坪數</b>
                <span className={styles.fieldCar}>不限</span>
              </div>
            </div>
            <span className={styles.btn}>瀏覽符合的店 →</span>
          </div>
          <div className={styles.row}>
            <Pill>100 萬以下</Pill>
            <Pill>含生財設備</Pill>
            <Pill variant="warm">急售</Pill>
            <Pill>捷運站旁</Pill>
          </div>
        </div>

        <div className={`${styles.col} ${styles.sell}`}>
          <div className={styles.lab}>FOR SELLERS · 賣家</div>
          <h2 className={styles.colTitle}>
            頂出
            <br />
            找到接手人
          </h2>
          <p className={styles.lead}>
            5 分鐘填好就上架 · <b>前 3 個月免費（限早鳥）</b> · 買家直接聯絡你
          </p>
          <div className={styles.form}>
            <div className={`${styles.field} ${styles.fieldInput}`}>
              <b>店在</b>
              <span className={styles.fieldCar}>輸入店面地址 ⌨︎</span>
            </div>
            <div className={styles.field}>
              <b>類型</b>
              <span className={styles.fieldCar}>選擇行業類別</span>
            </div>
            <span className={`${styles.btn} ${styles.btnMus}`}>
              早鳥免費刊登 →
            </span>
          </div>
          <div className={styles.row}>
            <Pill variant="outlineLight">早鳥 0 元</Pill>
            <Pill variant="outlineLight">本月新案 136</Pill>
            <Pill variant="outlineLight">不抽成</Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
