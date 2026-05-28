import Logo from "./Logo";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.brand}>
        <Logo light />
        <p>
          台灣店面頂讓媒合平台。
          <br />
          真實刊登 · 直接聯絡 · 永久不抽成。
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
          <li>
            <a href="/store-list">所有店面</a>
          </li>
          <li>
            <a href="/store-list?tag=RECOMMENDED">精選專區</a>
          </li>
          <li>
            <a href="/store-list?tag=EMERGENCY">急售專區</a>
          </li>
        </ul>
      </div>
      <div>
        <h6>頂出</h6>
        <ul>
          <li>
            <a href="/sell">早鳥免費刊登</a>
          </li>
          <li>
            <a href="/store-example">刊登範例</a>
          </li>
          <li>
            <a href="/my-listings">賣家後台</a>
          </li>
        </ul>
      </div>
      <div>
        <h6>關於 / 支援</h6>
        <ul>
          <li>
            <a href="/faq">常見問題</a>
          </li>
          <li>
            <a
              href="https://line.me/ti/p/~@ding-rang"
              target="_blank"
              rel="noopener noreferrer"
            >
              聯絡客服
            </a>
          </li>
          <li>
            <a href="/terms">服務條款</a>
          </li>
          <li>
            <a href="/privacy">隱私政策</a>
          </li>
        </ul>
      </div>
      <div className={styles.legal}>
        <span>© 2026 bezold . tw · 必售！ 頂讓創業平台</span>
        <span>made in Taipei</span>
      </div>
    </footer>
  );
}
