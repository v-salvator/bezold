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
          <li>
            <a href="/new/store-list">所有店面</a>
          </li>
          <li>
            <a href="/new/store-list?tag=RECOMMENDED">精選專區</a>
          </li>
          <li>
            <a href="/new/store-list?tag=EMERGENCY">急售專區</a>
          </li>
        </ul>
      </div>
      <div>
        <h6>頂出</h6>
        <ul>
          <li>
            <a href="/new/sell">早鳥免費刊登</a>
          </li>
          <li>
            <a href="/new/store-example">刊登範例</a>
          </li>
          <li>定價指南</li>
          <li>
            <a href="/new/my-listings">賣家後台</a>
          </li>
        </ul>
      </div>
      <div>
        <h6>關於 / 支援</h6>
        <ul>
          <li>
            <a href="/new/faq">常見問題</a>
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
