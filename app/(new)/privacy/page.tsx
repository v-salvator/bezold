import type { Metadata } from "next";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import LegalHero from "@/app/(new)/_components/LegalHero";
import Section from "@/app/(new)/_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "隱私政策 — Bezold 頂讓必售",
  description:
    "Bezold 頂讓必售 如何蒐集、使用與保護您的個人資料，依個人資料保護法說明您的權利。",
};

export default function PrivacyPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <div className="flex-1">
        <LegalHero
          badge="隱私政策"
          title="隱私政策"
          effectiveDate="2026 年 1 月 1 日"
        />

        <Section variant="default">
          <SectionTitle num="01" title="蒐集的個人資料" />
          <div className={styles.prose}>
            <p>依使用情境，本平台可能蒐集以下個人資料：</p>
            <p>
              · <b>賣家（刊登用戶）</b>：姓名、電話號碼、Email、LINE ID。
            </p>
            <p>
              · <b>所有用戶</b>
              ：瀏覽紀錄、IP 位址、裝置類型、作業系統、瀏覽器版本。
            </p>
            <p>
              本平台不主動蒐集身分證字號、金融帳戶或其他敏感個人資料。買賣雙方若於洽談過程中自行交換此類資訊，責任由當事人自負。
            </p>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="02" title="蒐集目的" />
          <div className={styles.prose}>
            <p>本平台蒐集個人資料之目的包括：</p>
            <p>· 建立及驗證用戶帳號。</p>
            <p>· 展示刊登資訊，協助買賣雙方媒合聯繫。</p>
            <p>· 回覆客服詢問與處理檢舉案件。</p>
            <p>· 維護平台安全，偵測並防範違規或詐騙行為。</p>
            <p>· 分析使用行為以改善平台功能與使用體驗。</p>
          </div>
        </Section>

        <Section variant="default">
          <SectionTitle num="03" title="資料使用方式" />
          <div className={styles.prose}>
            <p>
              賣家於刊登頁面所提供之聯絡資訊（電話、LINE
              ID）將公開顯示，供有意接洽之買家直接聯繫。
            </p>
            <p>
              平台內部將使用匯總的瀏覽資料進行功能優化與效能分析，
              <b>不會用於個人化廣告投放，亦不會出售給第三方廣告商。</b>
            </p>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="04" title="資料分享對象" />
          <div className={styles.prose}>
            <p>
              本平台<b>不主動出售或出租</b>您的個人資料給任何第三方。
            </p>
            <p>以下情況除外：</p>
            <p>
              · <b>法律要求</b>
              ：依法院命令、主管機關或執法單位之合法要求，本平台得提供必要資料。
            </p>
            <p>
              · <b>基礎建設服務商</b>
              ：本平台使用 Firebase（Google
              Cloud）作為資料庫、驗證及儲存服務，相關資料處理受 Google
              隱私政策約束。
            </p>
          </div>
        </Section>

        <Section variant="default">
          <SectionTitle num="05" title="Cookie 與追蹤技術" />
          <div className={styles.prose}>
            <p>
              本平台使用 Cookie
              及類似技術維持您的登入狀態、記憶偏好設定，並統計頁面瀏覽數據。
            </p>
            <p>
              您可透過瀏覽器設定拒絕或刪除
              Cookie，但部分功能（如保持登入）可能因此受到影響。
            </p>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="06" title="資料保存期限" />
          <div className={styles.prose}>
            <p>
              個人資料於<b>帳號存續期間</b>
              保留。帳號刪除後，相關個人識別資料將於 <b>30 日內</b>
              自系統移除，但法律義務要求保存之資料（如交易紀錄）除外。
            </p>
            <p>
              已下架之刊登內容將自公開頁面移除，但平台得保留匿名化的統計資料供內部分析使用。
            </p>
          </div>
        </Section>

        <Section variant="default">
          <SectionTitle num="07" title="您的個人資料權利" />
          <div className={styles.prose}>
            <p>
              依中華民國<b>個人資料保護法</b>
              ，您對本平台持有之個人資料享有以下權利：
            </p>
            <p>· 查詢或請求閱覽。</p>
            <p>· 請求製給複製本。</p>
            <p>· 請求補充或更正。</p>
            <p>· 請求停止蒐集、處理或利用。</p>
            <p>· 請求刪除。</p>
            <p>
              如需行使上述任何權利，請透過客服 LINE <b>@ding-rang</b>{" "}
              與我們聯繫，說明您的帳號與請求內容，我們將於 <b>15 個工作日</b>
              內回覆處理。
            </p>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="08" title="聯絡我們" />
          <div className={styles.prose}>
            <p>
              如對本隱私政策有任何疑問，或需行使個人資料相關權利，請透過以下方式聯繫：
            </p>
            <p>
              客服 LINE：<b>@ding-rang</b>
              <br />
              服務時間：09:00 – 21:00（週一至週日）
            </p>
          </div>
        </Section>
      </div>
      <SiteFooter />
    </>
  );
}
