import { Search } from "lucide-react";
import Section from "@/app/(new)/_components/Section";
import AccelerationCta from "./AccelerationCta";
import styles from "./HeroPromo.module.css";

export default function HeroPromo() {
  return (
    <Section variant="alt">
      <div className={styles.hero}>
        <div className={styles.copy}>
          <h1 className={styles.headline}>
            刊登後，不要只是
            <br />
            <span className={styles.accent}>等買家出現。</span>
          </h1>
          <p className={styles.lede}>
            主動讓正在 Google 搜尋店面與創業機會的潛在買家，來看見你的頂讓案件。
          </p>
          <div className={styles.actions}>
            <AccelerationCta plan="hero">查看加速方案 →</AccelerationCta>
            <span className={styles.hint}>了解加速運作</span>
          </div>
          <ul className={styles.checks}>
            <li>✓ 廣告直達案件頁</li>
            <li>✓ 站內置頂曝光</li>
            <li>✓ 完整漏斗追蹤</li>
          </ul>
        </div>

        {/* Google search-result mock — kept literal since it depicts Google. */}
        <div className={styles.mock}>
          <div className={styles.mockSearch}>
            <span className={styles.googleG}>G</span>
            <span className={styles.mockQuery}>台北 餐飲店 頂讓</span>
            <Search size={15} className={styles.mockSearchIcon} />
          </div>
          <div className={styles.mockResult}>
            <div className={styles.mockMeta}>
              <span className={styles.mockAd}>贊助</span>
              bezold.com.tw
            </div>
            <div className={styles.mockTitle}>
              台北餐飲店頂讓｜設備完整可立即營業
            </div>
            <div className={styles.mockDesc}>
              免頂讓仲介直接聯繫賣家！查看隔週店家完整條件
            </div>
            <div className={styles.mockLinks}>
              <span>完整頂讓條件</span>
              <span>實景設備清單</span>
            </div>
          </div>
          <div className={styles.mockTag}>點擊直達案件頁</div>
        </div>
      </div>
    </Section>
  );
}
