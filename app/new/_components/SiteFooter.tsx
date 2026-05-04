import Logo from "./Logo";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <Logo light />
        <p>
          全台最大店面頂讓平台。
          <br />
          真實刊登 · 履約保障 · 專人陪跑。
        </p>
        <div className={styles.line}>
          <div className={styles.qr} />
          <div>
            客服 LINE
            <br />
            <b>@ding-rang</b>
            <br />
            09:00 – 21:00
          </div>
        </div>
      </div>
      <div>
        <h6>找店</h6>
        <ul>
          <li>所有店面</li>
          <li>地圖瀏覽</li>
          <li>依行業</li>
          <li>依地區</li>
          <li>急售專區</li>
        </ul>
      </div>
      <div>
        <h6>頂出</h6>
        <ul>
          <li>早鳥免費刊登</li>
          <li>刊登範例</li>
          <li>定價指南</li>
          <li>賣家後台</li>
          <li>成交故事</li>
        </ul>
      </div>
      <div>
        <h6>關於 / 支援</h6>
        <ul>
          <li>關於我們</li>
          <li>常見問題</li>
          <li>聯絡客服</li>
          <li>服務條款</li>
          <li>隱私政策</li>
        </ul>
      </div>
      <div className={styles.legal}>
        <span>© 2026 bezold . tw · 必售！ 頂讓創業平台</span>
        <span>made in Taipei</span>
      </div>
    </footer>
  );
}
