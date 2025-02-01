import { ReactNode } from "react";
import { cn } from "@/utils";

const Section = ({
  children,
  className,
  ...restProps
}: {
  children?: ReactNode;
  className?: string;
}) => {
  return (
    <section className={cn("py-[16px]", className)} {...restProps}>
      {children}
    </section>
  );
};

const Paragraph = ({ children, ...restProps }: { children: ReactNode }) => {
  return (
    <p className="text-sm py-[20px] text-left" {...restProps}>
      {children}
    </p>
  );
};

const H3 = ({ children, ...restProps }: { children: ReactNode }) => {
  return (
    <h3 className="text-lg font-semibold" {...restProps}>
      {children}
    </h3>
  );
};

const DoubleBreak = () => {
  return (
    <>
      <br />
      <br />
    </>
  );
};

export default async function About() {
  return (
    <div className="text-center px-[52px]">
      <Section>
        <h1 className="text-4xl font-semibold">創業，從選對店面開始</h1>
        <Paragraph>
          創業不再是少數人的專利。隨著科技進步、AI發展及資源共享，任何人都能開啟自己的事業。而創業成功已經不僅僅依賴產品或服務，選擇合適的店面同樣關鍵。
          <DoubleBreak />
          無論是實體店鋪、還是線上商業，店面位置、目標市場及曝光方式等，都直接影響運營和成長。
          <DoubleBreak />
          在實體店面選擇中，「地點」至關重要。繁華商圈、高人流的地段會增加顧客的進店機會，而合適的租金和設施則有助於控制運營成本。對於線上創業，選擇合適的「平台」同樣重要，決定了用戶體驗及轉換率。
          <DoubleBreak />
          選對「店面」不僅能提升創業者的信心，還能減少經營過程中的不確定因素。它不僅是創業的起點，也是未來成功的基石。因此，創業者應該慎重考慮店面選擇，從長遠規劃出發，為事業奠定穩固基礎，開創輝煌未來，而這也是我們打造：頂讓網、商家買賣平台「BEZOLD」的由來。
        </Paragraph>
      </Section>

      <Section className="flex justify-between gap-[32px]">
        <div>
          <H3>為什麼選擇頂讓，而非自創品牌？</H3>
          <Paragraph>
            頂讓能讓創業者快速進入市場，避免從零開始的風險和困難。現成的店面、穩定的客源和品牌認知度能讓創業者事半功倍，加速營運並專注於「優化業務」，而非重建基礎。
            <DoubleBreak />
            特別是在競爭激烈的市場中，現有的客戶群和穩定的收入來源，對於創業者來說是一種無形的優勢。這樣，創業者可以將更多精力集中在提升產品和服務上，快速適應市場需求。
          </Paragraph>
        </div>
        <div>
          <H3>如何提升創業成功率？頂讓只是創業的冰山一角。</H3>
          <Paragraph>
            創業成功率只有 5%，要在五年內存活下來只有
            1%。這個驚人的數字讓許多潛在創業者感到畏懼及猶豫不決。
            <DoubleBreak />
            然而，這並不意味著創業的道路是不可走的，反而是提醒創業者，成功並非偶然，而是需要謹慎規劃、持續努力和勇敢面對挑戰。
            <DoubleBreak />
            「如何提升創業成功率？」「如何運用科技及行銷，讓創業之路更順利？」基於這個兩個想法，Bezold
            開始有了雛形。
          </Paragraph>
        </div>
      </Section>

      <Section>
        <H3>Bezold：頂讓超 Easy，創業更 HAPPY</H3>
        <Paragraph>
          每一個創業者都知道，成功不僅僅取決於一個方面，而是需要多方面的配合與支持。選擇對的行銷策略與高效的工具，能夠大大提高創業者的成功機率，縮短成長時間，減少風險。
        </Paragraph>
        <div className="flex gap-[32px] justify-between">
          <Paragraph>
            <strong>創業思維</strong>
            ，是成功的根基。創業者需要具備創新思維和解決問題的能力。每一個創業的起點都是一個未解的問題或一個未滿足的市場需求。創業者需要抓住市場空隙，快速反應並提供相應的解決方案。而這個過程中，行銷策略的運用至關重要。
          </Paragraph>
          <Paragraph>
            <strong>行銷</strong>
            ，則是將創業者的產品或服務傳遞給潛在客戶的橋樑。創業者必須明確自己的目標市場，並根據不同的市場需求制定精確的行銷計劃。在這個過程中，行銷工具的運用能大大提高行銷效率，並幫助創業者掌握關鍵數據，以做出精準的行銷決策。
          </Paragraph>
          <Paragraph>
            <strong>工具</strong>
            ，則是創業過程中的無形助手。隨著科技發展，這些工具能夠幫助創業者在繁雜的業務中輕鬆找到重點。選擇適合的工具不僅能節省時間，還能提高營運效率，讓創業者專注於最重要的業務發展和創新。
          </Paragraph>
        </div>
        <Paragraph>
          BEZOLD
          除了提供輕鬆上手的頂讓平台，還致力於打造全方位的創業資訊網。我們的使命是幫助創業者實現最佳的收益來源，無論是在選擇頂讓店面，還是規劃業務發展上。
        </Paragraph>
      </Section>

      <Section>
        <H3>隨著科技發展，個人創業是趨勢</H3>
        <Paragraph>
          隨著人工智慧（AI）的快速發展，創業和副業已成為現代社會的熱門趨勢。對於小型企業或個體創業者來說，AI
          能簡化許多繁瑣的工作，如客戶服務和市場分析，讓創業者可以專注於創新與產品開發，提升業務效率。
          <DoubleBreak />
          AI
          使得創業和副業不再是高門檻的事，無論是內容創作、線上商店經營，還是智能應用開發，AI
          都能提供強大的支持。在這個科技驅動的時代，創業者與副業者若能運用 AI
          工具，將能迅速提升競爭力，抓住更多商機，開創屬於自己的成功之路。
        </Paragraph>
      </Section>

      <Section>
        <H3>加入 BEZOLD，探索各種可能性</H3>
        <Paragraph>
          加入 BEZOLD 輕鬆找到最合適的店面，並利用現有資源快速啟動事業。
          <DoubleBreak />
          讓我們開創新的事業巔峰！
        </Paragraph>

        <blockquote>
          <Paragraph>
            “You can’t connect the dots looking forward ; you can only connect
            them looking backwards.&quot; – Steve Jobs
          </Paragraph>
        </blockquote>
      </Section>
    </div>
  );
}
