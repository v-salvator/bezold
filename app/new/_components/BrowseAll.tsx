import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./BrowseAll.module.css";

export default function BrowseAll() {
  return (
    <Section>
      <SectionTitle
        num="05"
        title="看所有店面"
        sub="— 不限行業、不限地區，全台即時刊登 —"
      />
      <div className={styles.body}>
        <p className={styles.text}>
          精選只是起點。瀏覽全部刊登，用行業與城市篩選，找到真正適合你的那一間。
        </p>
        <a href="/new/store-list" className={styles.btn}>
          立即瀏覽 →
        </a>
      </div>
    </Section>
  );
}
