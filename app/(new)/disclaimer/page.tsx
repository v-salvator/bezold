import type { Metadata } from "next";
import Link from "next/link";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import LegalHero from "@/app/(new)/_components/LegalHero";
import LegalProse from "@/app/(new)/_components/LegalProse";
import Section from "@/app/(new)/_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";

export const metadata: Metadata = {
  title: "免責聲明與交易提醒 — Bezold 頂讓必售",
  description:
    "Bezold 頂讓必售 平台服務範圍、刊登資訊限制與買方交易前查證事項說明，協助您了解頂讓交易風險。",
};

const LINE_SUPPORT_URL = "https://line.me/ti/p/~bezoldtw";

export default function DisclaimerPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <div className="flex-1">
        <LegalHero
          badge="免責聲明"
          title="免責聲明與交易提醒"
          effectiveDate="2026 年 10 月 3 日"
        />

        <Section variant="default">
          <SectionTitle num="01" title="平台服務與角色" />
          <LegalProse>
            <p>
              Bezold（以下簡稱「本平台」）提供店面頂讓及事業接手相關資訊之刊登、搜尋、整理與媒合服務，協助買賣雙方取得資訊並建立聯繫。
            </p>
            <p>
              除另有明確書面約定外，本平台並非刊登標的之所有人、出售人、交易當事人、代理人或保證人，亦不提供交易款項保管或履約保證。買賣雙方應自行協商交易條件、簽訂契約、支付款項及完成交接。
            </p>
            <p>
              本平台如提供個別付費服務，其服務範圍、交付內容及責任，依該服務之說明與雙方約定辦理，不因本聲明而免除本平台依法或依約應負之義務。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="02" title="刊登資訊與更新限制" />
          <LegalProse>
            <p>
              本平台刊登之文字、照片、價格、租金、坪數、設備、營運狀況、營收、獲利、客源及頂讓原因等資訊，可能由刊登者、其授權人或其他標示來源提供。
            </p>
            <p>
              刊登者應確保其具有刊登及提供資料之合法權限，所提供內容真實、正確且未侵害他人權利，並於價格、營運狀態或交易進度變動時及時更新。
            </p>
            <p>
              本平台得進行資料整理、格式調整、基本檢視或向刊登者確認部分資訊，但除另有明確說明外，不代表已對全部內容進行現場查驗、財務查核或法律盡職調查。資訊可能因更新時間差、資料缺漏或其他因素與實際情況不同，使用者應於交易前查證。
            </p>
            <p>
              本平台自行製作、修改或明確承諾查核之內容，仍應依適用法律及約定負相應責任。
            </p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="03" title="確認標示、精選與推薦之意義" />
          <LegalProse>
            <p>
              案件如顯示「已確認」「已認領」「精選」或其他標示，其意義以該標示旁或
              <Link href="/policy/editor-pick">相關說明頁</Link>
              所揭露之確認項目、方式及日期為限。
            </p>
            <p>
              聯絡方式驗證、刊登者確認或店面照片檢視，不等同於所有權、處分權、營收、獲利、租約、營業合法性或交易安全已獲全面認證。
            </p>
            <p>
              編輯精選、推薦排序及個人化配對，僅供使用者篩選與比較，不代表本平台保證該標的適合特定使用者、能夠成交或具有特定投資報酬。付費曝光或贊助內容應另以適當方式標示。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="04" title="買方交易前之查證" />
          <LegalProse>
            <p>買方應依交易性質，自行或委託適當專業人士查證下列事項：</p>
            <ol>
              <li>賣方身分、標的所有權及出售或轉讓之授權。</li>
              <li>
                租約期限、租金、押金、續租條件，以及轉租、租約移轉或重新簽約是否須取得房東同意。
              </li>
              <li>
                設備、裝潢及存貨之項目、數量、功能、權屬與是否存在租賃、分期付款或其他權利負擔。
              </li>
              <li>營收、成本、獲利及客源等資料之來源與可驗證性。</li>
              <li>營業登記、土地及建物使用、消防、衛生及其他營業所需許可。</li>
              <li>
                商標、品牌、加盟、技術、配方及其他智慧財產權能否合法移轉或使用。
              </li>
              <li>
                員工、稅務、欠款、預收款、會員儲值及其他未結清義務之處理方式。
              </li>
              <li>頂讓範圍、付款條件、交接程序及違約責任。</li>
            </ol>
            <p>
              刊登所載頂讓金不必然包含押金、租金、稅費、存貨、加盟費、修繕費或其他開業與營運支出，應由買賣雙方以書面確認。
            </p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="05" title="評分、估值、AI 與一般資訊" />
          <LegalProse>
            <p>
              本平台如提供成交準備評估、案件評分、參考估值、AI
              摘要、推薦或營運分析，係依當時可取得之資料、特定假設及方法產生，僅供資訊整理與初步判斷之用。
            </p>
            <p>
              上述結果可能因資料不完整、模型限制、市場變化或其他因素產生偏差，不構成正式鑑價、財務查核、法律意見、授信承諾或成交價格保證，亦不保證未來營收、獲利或經營成果。
            </p>
            <p>
              平台文章、指南、試算及契約範例屬一般參考資訊，使用者應依個別情況尋求律師、會計師或其他適當專業人士之協助。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="06" title="交易決策與糾紛" />
          <LegalProse>
            <p>
              交易是否成立、價款、付款、租約、設備、交接及其他履約事項，應由買賣雙方依其契約與適用法律處理。
            </p>
            <p>
              本平台不因提供刊登、聯繫或一般協助，即承擔交易當事人之履約義務，亦不保證任何使用者之信用或履約能力。本平台自身行為如依法或依約應負責任，仍依相關規定辦理。
            </p>
            <p>
              使用者應於確認身分、權限及交易條件後付款，並保留對話、契約、收據及交接紀錄。請勿僅憑平台刊登、推薦標示或他人自稱平台人員即支付款項。
            </p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="07" title="異常資訊與檢舉處理" />
          <LegalProse>
            <p>
              如發現疑似不實刊登、冒名、詐騙、侵權或其他違法情事，請透過
              <a
                href={LINE_SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                官網公布之客服管道
              </a>
              提供案件連結、事實說明及相關證據。
            </p>
            <p>
              本平台將依具體情況及適用法律進行處理，必要時得要求補充資料、標示爭議、限制聯繫、暫停或移除刊登，並依法配合主管機關。本平台之處理不等同於對爭議作成司法認定，也不保證能追回款項或促成和解。
            </p>
          </LegalProse>
        </Section>

        <Section variant="alt">
          <SectionTitle num="08" title="外部連結與服務可用性" />
          <LegalProse>
            <p>
              本平台提供之外部網站、通訊工具或第三方服務，可能適用其各自之條款及隱私政策。本平台不因提供連結即保證第三方內容、服務品質或交易安全；本平台依法應負之責任不受影響。
            </p>
            <p>
              本平台將採取合理措施維持服務運作，但服務可能因維護、網路故障、第三方系統異常或不可抗力而暫時中斷。發生中斷時，本平台將依情況採取合理處理措施；相關責任依適用法律及服務約定認定。
            </p>
          </LegalProse>
        </Section>

        <Section variant="default">
          <SectionTitle num="09" title="責任界線與使用者權利" />
          <LegalProse>
            <p>
              本聲明旨在說明平台服務範圍及交易風險，不排除或限制本平台因故意、重大過失，或其他依法不得排除或限制之責任，亦不影響使用者依法享有之權利。
            </p>
            <p>
              本聲明應與<Link href="/terms">服務條款</Link>、
              <Link href="/privacy">隱私權政策</Link>
              及個別服務約定一併閱讀。個別磋商約定與本聲明不一致時，依適用法律處理；本聲明部分條款如經認定無效，其餘條款於法律允許範圍內仍有效。
            </p>
            <p>
              本聲明之修訂將標示更新日期，並依適用法律及服務條款辦理必要之公告、通知或同意程序，不溯及排除已發生之責任或已成立之服務承諾。
            </p>
          </LegalProse>
        </Section>
      </div>
      <SiteFooter />
    </>
  );
}
