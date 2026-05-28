import type { Metadata } from "next";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import LegalHero from "@/app/(new)/_components/LegalHero";
import Section from "@/app/(new)/_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "服務條款 — 頂讓.tw",
  description: "頂讓.tw 平台服務條款，規範買賣雙方使用本平台之權利與義務。",
};

export default function TermsPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <div className="flex-1">
        <LegalHero
          badge="服務條款"
          title="服務條款"
          effectiveDate="2026 年 1 月 1 日"
        />

        <Section variant="default">
          <SectionTitle num="01" title="平台說明" />
          <div className={styles.prose}>
            <p>
              頂讓.tw（以下簡稱「本平台」）由 bezold
              營運，提供台灣店面頂讓資訊之刊登、搜尋與媒合服務。
            </p>
            <p>
              <b>本平台為純媒合平台，不介入買賣雙方之任何交易。</b>
              刊登店面之賣家與有意承接之買家，雙方直接洽談、議價與簽約，本平台不擔任中間人、代理人或保證人角色，亦不對任何交易結果負責。
            </p>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="02" title="帳號與資格" />
          <div className={styles.prose}>
            <p>使用本平台之刊登功能，您須符合以下條件：</p>
            <p>
              · <b>年齡</b>：須年滿 18 歲，或在法定代理人同意下使用。
            </p>
            <p>
              · <b>資料真實</b>
              ：帳號資訊（姓名、電話、聯絡方式）須為真實有效資料，不得冒用他人身份。
            </p>
            <p>
              · <b>帳號不得轉讓</b>
              ：帳號為個人使用，不得出售、轉讓或共用。
            </p>
            <p>本平台保留在不另行通知的情況下，暫停或終止違規帳號之權利。</p>
          </div>
        </Section>

        <Section variant="default">
          <SectionTitle num="03" title="刊登規範" />
          <div className={styles.prose}>
            <p>刊登店面時，您同意遵守以下規範：</p>
            <p>
              · 僅限台灣境內<b>實體</b>店面，虛擬商店或純線上業務不在受理範圍。
            </p>
            <p>· 刊登內容須真實正確，禁止虛偽不實、誇大或誤導性描述。</p>
            <p>· 禁止重複刊登相同店面。</p>
            <p>
              ·
              刊登照片須為本店實際拍攝，不得使用他人圖片或與實際店況嚴重不符之照片。
            </p>
            <p>
              · 禁止刊登涉及違法行業、賭博、色情或其他違反中華民國法令之內容。
            </p>
            <p>
              本平台保留審核、修改或下架任何不符規範刊登之權利，無需事先通知。
            </p>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="04" title="使用者行為" />
          <div className={styles.prose}>
            <p>使用本平台時，您不得從事以下行為：</p>
            <p>· 騷擾、恐嚇或欺詐其他用戶。</p>
            <p>· 散布惡意程式、病毒或任何有害程式碼。</p>
            <p>
              ·
              以爬蟲、自動化程式或其他非正常方式大量擷取平台資料，未經書面授權不得商業利用。
            </p>
            <p>· 假冒本平台或其他用戶之身份進行通訊或交易。</p>
            <p>· 任何妨礙平台正常運作之行為。</p>
          </div>
        </Section>

        <Section variant="default">
          <SectionTitle num="05" title="免責聲明" />
          <div className={styles.prose}>
            <p>
              本平台對用戶刊登之店面資訊（包括但不限於頂讓金、月租、設備狀況、客流量等）
              <b>不作任何保證</b>，亦不對其正確性、完整性或時效性負責。
            </p>
            <p>
              買方在接洽任何店面前，應自行進行盡職調查（due
              diligence），包括親赴現場查看、索取財務資料、向房東確認租約等。
            </p>
            <p>
              因使用本平台所衍生之任何交易糾紛、財物損失或法律責任，
              <b>由買賣雙方自行承擔</b>，本平台不負任何連帶責任。
            </p>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="06" title="智慧財產權" />
          <div className={styles.prose}>
            <p>
              本平台之名稱、商標、標誌、設計、介面及全部內容，其智慧財產權歸
              bezold 所有，未經書面授權不得重製、修改或商業使用。
            </p>
            <p>
              用戶上傳之文字描述、照片等內容，著作權歸用戶本人所有。用戶刊登內容時，即授予本平台在服務範圍內免費展示、重製及傳輸之授權，直至該刊登下架為止。
            </p>
          </div>
        </Section>

        <Section variant="default">
          <SectionTitle num="07" title="服務變更與中斷" />
          <div className={styles.prose}>
            <p>
              本平台保留隨時修改、暫停或終止部分或全部服務之權利。若屬重大變更，將提前至少{" "}
              <b>7 日</b>於平台公告，緊急情況（如資安事件）除外。
            </p>
            <p>
              因系統維護、天災、網路中斷等不可抗力因素導致服務暫時中斷，本平台不承擔賠償責任。
            </p>
          </div>
        </Section>

        <Section variant="alt">
          <SectionTitle num="08" title="條款修改" />
          <div className={styles.prose}>
            <p>
              本平台得視業務需要修改本服務條款，修改後將於平台公告。
              <b>於公告後繼續使用本平台，即視為您已同意修改後之條款。</b>
            </p>
            <p>建議您定期查閱本頁面以了解最新條款內容。</p>
          </div>
        </Section>

        <Section variant="default">
          <SectionTitle num="09" title="準據法與管轄" />
          <div className={styles.prose}>
            <p>
              本服務條款之解釋與適用，以<b>中華民國法律</b>為準據法。
            </p>
            <p>
              因本條款或使用本平台所生之爭議，雙方同意以<b>台灣台北地方法院</b>
              為第一審管轄法院。
            </p>
          </div>
        </Section>
      </div>
      <SiteFooter />
    </>
  );
}
