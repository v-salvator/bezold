import { Table } from "antd";
import styles from "./page.module.css";
import { Spotlight } from "@/components/motion-primitives/spotlight";
import AnimatedNTValue from "./animated-nt-value";
import { Tilt } from "@/components/motion-primitives/tilt";
import { FloatingPaths } from "./floating-paths";

export default function How() {
  const dataSource = [
    {
      key: "1",
      name: "基本刊登",
      contex: (
        <>
          <p>
            店面資訊永久曝光
            <br />
            基礎流量推廣
          </p>
        </>
      ),
      price: <AnimatedNTValue targetValue={1500} />,
    },
    {
      key: "2",
      name: "加值推薦",
      contex: (
        <>
          <p>
            店面資訊永久曝光
            <br />
            首頁推薦位曝光 90 天
          </p>
        </>
      ),
      price: <AnimatedNTValue targetValue={3800} />,
    },
    {
      key: "3",
      name: "加值推薦",
      contex: (
        <>
          <p>
            店面資訊永久曝光
            <br />
            首頁推薦位曝光 90 天
            <br />
            顧問審核優化
          </p>
        </>
      ),
      price: <AnimatedNTValue targetValue={4800} />,
    },
  ];

  const columns = [
    {
      title: "方案名稱",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "內容簡介",
      dataIndex: "contex",
      key: "contex",
    },
    {
      title: "價格",
      dataIndex: "price",
      key: "price",
    },
  ];

  return (
    <div className="relative">
      <div className="absolute inset-0">
        <FloatingPaths position={-1} />
      </div>
      <div className="max-w-[800px] mx-auto pt-[1px] pb-[32px]">
        <div className={styles["info"]}>
          <h1 className={styles["info-title"]}>刊登方案</h1>
          <Tilt className={styles["info-card"]} rotationFactor={8} isRevese>
            <Spotlight
              className="from-red-400 via-red-500 to-red-600"
              size={120}
            />
            <div className={styles["info-card-content"]}>
              <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
              />
            </div>
          </Tilt>
        </div>

        <div className={styles["info"]}>
          <h1 className={styles["info-title"]}>限時優惠活動</h1>
          <Tilt className={styles["info-card"]} rotationFactor={8} isRevese>
            <Spotlight
              className="from-red-400 via-red-500 to-red-600"
              size={120}
            />
            <div className={styles["info-card-content"]}>
              🔥 限時優惠活動！打造你的創業夢，現在就來加入 Bezold！
              <br />
              活動期間：XXXX
              <br />
              <span className={styles["info-card-content-inner-header"]}>
                優惠內容：
              </span>
              <br />
              活動期間內，購買任何服務方案，即可享七折優惠！
              <br />
              <span className={styles["info-card-content-inner-header"]}>
                基本刊登方案：
              </span>
              <br />
              原價 NT$ 1,500 → 優惠價{" "}
              <AnimatedNTValue targetValue={1050} initialValue={1500} />
              <br />
              <span className={styles["info-card-content-inner-header"]}>
                加值推薦方案：
              </span>
              <br />
              原價 NT$ 3,800 → 優惠價{" "}
              <AnimatedNTValue targetValue={2660} initialValue={3800} />
              <br />
              <span className={styles["info-card-content-inner-header"]}>
                一對一顧問方案：
              </span>
              <br />
              原價 NT$ 7,800 → 優惠價{" "}
              <AnimatedNTValue targetValue={5460} initialValue={7800} />
              <br />
              <p className="text-sm mt-[12px] text-gray-500">
                <span className={styles["info-card-content-inner-header"]}>
                  注意事項：
                </span>
                <br />
                本優惠僅限於 2025年x月x日到x月x日
                <br />
                期間有效，逾期不再享有折扣。
                <br />
                <br />
                折扣適用於所有可選擇的服務方案，優惠無需使用折扣碼。
                <br />
                完成付款後，即可開始進行服務。
                <br />
                每位用戶僅能使用一次優惠
              </p>
            </div>
          </Tilt>
        </div>
        <div className={styles["info"]}>
          <h1 className={styles["info-title"]}>銀行轉帳</h1>
          <Tilt className={styles["info-card"]} rotationFactor={8} isRevese>
            <Spotlight
              className="from-red-400 via-red-500 to-red-600"
              size={120}
            />
            <div className={styles["info-card-content"]}>
              銀行名稱：○○銀行（代碼：123）
              <br />
              帳號：123-456-789-000
              <br />
              戶名：○○○○有限公司
              <br />
              👉 匯款後，請透過 line or email
              <br />
              提供您的帳號後五碼 + 店名，我們會盡快開通！
            </div>
          </Tilt>
        </div>
      </div>
    </div>
  );
}
