# Spec: SEO P0 — /store-guide, home, /sell, store template (issue #125)

Source: [v-salvator/bezold#125](https://github.com/v-salvator/bezold/issues/125) (parent #101; related #103, #111, #113, #121, #124).

## Capability map

The issue bundles independently shippable changes, so this spec is split into modules. Each module ships as its own PR. Per project convention everything stays in this one `SPEC.md`, and this table is the index.

| Module id        | Issue items | Responsibility                                                                                    | Depends on     | Deadline          |
| ---------------- | ----------- | ------------------------------------------------------------------------------------------------- | -------------- | ----------------- |
| `listing-copy`   | 2, 3        | Remove every "listing is free / 12/1" claim site-wide; new home + `/sell` metadata and H1         | —              | **live by 11/30** |
| `store-template` | 4           | Product JSON-LD on every indexable store page, `頂讓` in the H1, sold-store notice + alternatives | —              | —                 |
| `store-guide`    | 1           | Win「頂讓意思」: metadata, quick answer, FAQ, JSON-LD, pitfall rewrite, related reading           | `listing-copy` | —                 |

Build order: **`listing-copy` → `store-template` → `store-guide`**.
`store-guide` depends on `listing-copy` only because both touch `store-guide/_components/SellerSteps.tsx`. Landing `listing-copy` first avoids a conflict.

## Assumptions

1. **The copy after 12/1 is neutral** (decided). No page claims listing is free, and none mentions a deadline or a future fee. Lead with 買家直接聯絡、沒有仲介、成交永久不抽成. Claims that browsing, contacting, or creating an account are free stay, because they are still true.
2. **面議 pages get Product + Offer without `price`** (decided, per the issue). They will show an error in Rich Results Test and won't get a product snippet. We accept that.
3. The home description's listing count is **dynamic**. It counts physical stores (not digital assets) with status `approved` or `sold`, and refreshes with the home page's existing `revalidate = 60` (decided).
4. Digital-asset pages are out of scope for the H1 and sold-notice changes. They have no city/district and their own page layout. Their Product JSON-LD behaves the same as physical stores.
5. Blog posts from #124 that are not published yet (draft or missing file) are **not linked**. Links appear automatically once the post is published.
6. Title templates for store pages (#111) stay as they are.
7. Requesting re-indexing in GSC and running Rich Results Test on production URLs are done by the user after deploy. They are listed in each module's post-deploy checklist, not done by the agent.

---

## Module `listing-copy` (items 2 + 3) — must be live by 11/30

### Objective

On 12/1 the free-listing promo ends and listing rules change. Every "12/1 前免費刊登 / 限時免費" string becomes wrong on that day, and search results keep showing it. Replace them all with copy that is true both before and after 12/1. While doing that, add 頂讓 to the home H1 and retarget `/sell` at 頂出店面 / 刊登頂讓店面.

### Changes

**Home `/` (`app/(new)/page.tsx`, `HeroSplit`)**

| Field                  | Now                                        | New                                                                                                               |
| ---------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| title                  | 頂讓網｜全台店面頂讓平台 - Bezold 頂讓必售 | **unchanged**                                                                                                     |
| description            | …2026/12/1 前免費刊登，永久不抽成。        | 頂讓網 Bezold：全台店面頂讓平台，{N} 間真實刊登，可依縣市、行業找店。買家直接聯絡賣家，沒有仲介，成交永久不抽成。 |
| og/twitter description | inherits root `SITE_DESCRIPTION`           | same as description (set explicitly on the page)                                                                  |
| H1                     | 找一間準備好的店 / 開門就營業              | eyebrow `<p>`「全台店面頂讓平台」+ H1「找一間準備好的頂讓店，開門就營業」                                         |

- The H1 keeps the current two-line animated layout: line 1 is 找一間<em>準備好</em>的頂讓店, line 2 is 開門就營業. The existing kicker 「— 頂讓網 · 全台店面頂讓平台 · 真實刊登 —」 becomes the eyebrow, so no second eyebrow is added (decided).
- `{N}` comes from a server count. If the count fails, use the description without the number clause (「全台店面頂讓平台，可依縣市、行業找店。…」) and never `0 間`.

**Root default (`constant/seo.ts` `SITE_DESCRIPTION`)**: this is the static fallback for every page without its own description, so it has no count:

> 頂讓網 Bezold：全台店面頂讓平台，真實刊登，可依縣市、行業找店。買家直接聯絡賣家，沒有仲介，成交永久不抽成。

**`/llms.txt`**: 全台店面頂讓平台。買家直接聯絡賣家，平台不作為中間人；成交永久不抽成。

**`/sell` (`app/(new)/sell/page.tsx`)**

| Field                     | New                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| title                     | 刊登頂讓店面｜頂出店面找接手人，成交不抽成 (the layout template appends ｜頂讓網 Bezold)             |
| description (+og/twitter) | 想頂出店面？在 Bezold 刊登你的店，買家直接聯絡你，沒有仲介，成交永久不抽成。3 分鐘填完，審核後上架。 |
| H1                        | 刊登你的店，<strong>找到接手人</strong>                                                              |
| subheading                | 填寫以下資料，審核後即可上架。買家直接聯絡你，沒有中間人。                                           |

- Check that the rendered `<title>` has exactly one 「｜頂讓網 Bezold」 suffix.
- `?type=digital` keeps its own metadata if it has any. Only the shared strings change.

**Site-wide sweep**: every remaining occurrence. The proposed copy is below and the user reviews it in the PR.

| File                                                                                                                   | Now                                                                               | New                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_components/LaunchBannerRotator.tsx`                                                                                  | early-bird slide「開站慶 · 12/1 前免費刊登」                                      | remove the slide. The rotator must still render correctly with one message (no rotation, no empty slot)                                                   |
| `_components/HeroSplit/index.tsx` sub                                                                                  | 開站慶 · 12/1 前免費刊登 · 真實店家…                                              | 真實店家 · 買賣直接聯絡，沒有中間人。                                                                                                                     |
| `_components/HeroSplit/index.tsx` seller lead                                                                          | 12/1 前免費刊登（限早鳥）· 買家直接聯絡你，0 抽成                                 | 買家直接聯絡你，沒有仲介，成交 0 抽成                                                                                                                     |
| `_components/HeroSplit/index.tsx` CTA                                                                                  | 立即免費刊登 →                                                                    | 立即刊登 →                                                                                                                                                |
| `_components/TrustBar.tsx`                                                                                             | 0 元 · 早鳥刊登費 (12/1 前)                                                       | replace the stat with **5 分鐘 · 填完上架**. The 4-item grid stays at 4 items                                                                             |
| `_components/SellerCta.tsx` subline                                                                                    | 12/1 前免費 · 早鳥限定                                                            | 買家直接聯絡你                                                                                                                                            |
| `_components/SellerCta.tsx` body                                                                                       | 5 分鐘上架 · 開站慶免費刊登 · … · 永久不抽成交抽成                                | 5 分鐘上架 · 買家直接聯絡你 · 沒有仲介 · 成交永久不抽成 (also fixes the 「不抽成交抽成」 typo)                                                            |
| `_components/SellerCta.tsx` stat                                                                                       | 12/1 前 · 早鳥免費                                                                | 0 · 仲介 (shown as **0 仲介**, matching the 0% / 5 分鐘 stats)                                                                                            |
| `_components/SellerCta.tsx` button                                                                                     | 搶早鳥免費刊登 →                                                                  | 刊登我的店 →                                                                                                                                              |
| `_components/HowItWorks.tsx`                                                                                           | 免費刊登（早鳥）/ 開站慶 12/1 前 0 元，當天上架                                   | 刊登店面 / 5 分鐘填好店況、上傳照片，審核後上架。                                                                                                         |
| `_components/WhyUs.tsx`                                                                                                | 開站慶 12/1 前刊登 0 元；瀏覽永久免費…                                            | 瀏覽永久免費、聯絡永久免費。買賣雙方直接談，平台不抽任何成交抽成。                                                                                        |
| `_components/Faq.tsx` + `faq/_components/faqData.tsx` (fee Q)                                                          | 開站慶 · 2026/12/1 前完全免費刊登… 12/1 起預計開始收取刊登費…                     | 瀏覽永久免費 · 買賣雙方聯絡永久免費 · 成交永久不抽成。(No listing-fee sentence. The `text` string, which feeds FAQPage JSON-LD, and the JSX stay in sync) |
| `faq/_components/faqData.tsx` (how-to Q)                                                                               | 點「+ 限時免費刊登」                                                              | 點「+ 刊登店面」                                                                                                                                          |
| `_components/SellButton.tsx`                                                                                           | + 限時免費刊登                                                                    | + 刊登店面                                                                                                                                                |
| `_components/SiteFooter.tsx`                                                                                           | 早鳥免費刊登                                                                      | 刊登店面                                                                                                                                                  |
| `about/page.tsx`                                                                                                       | 開站慶早鳥 2026/12/1 前完全免費刊登；瀏覽與買賣雙方聯絡永久免費；成交永久不抽成。 | 瀏覽與買賣雙方聯絡永久免費；成交永久不抽成。                                                                                                              |
| `sell/_components/SellGuide.tsx`                                                                                       | 開站慶 · 早鳥 2026/12/1 前完全免費刊登。/ 12/1 起預計開始收取刊登費…              | remove both lines. Keep the remaining guide items                                                                                                         |
| `sell/_components/SellForm.tsx` submit                                                                                 | 免費刊登                                                                          | 送出刊登                                                                                                                                                  |
| `store-guide/_components/SellerSteps.tsx`                                                                              | 免費刊登 / 早鳥 12/1 前 0 元，當天審核上架。                                      | 刊登店面 / 5 分鐘填好表單、上傳照片，審核後上架。                                                                                                         |
| `store-example/_components/ExampleBanner.tsx`                                                                          | 立即免費刊登 →                                                                    | 立即刊登 →                                                                                                                                                |
| `my-listings/_components/MyListingsContent.tsx`                                                                        | 立即免費刊登 →                                                                    | 立即刊登 →                                                                                                                                                |
| `my-listings/_components/AccelerationBanner.tsx`                                                                       | 免費刊登不變。                                                                    | coordinate with #121 (acceleration copy rewrite). Remove 「免費刊登不變。」 here if #121 hasn't landed                                                    |
| `digital-assets/_components/DigitalAssetsTeaser.tsx`, `DigitalAssetResults.tsx`, `_components/DigitalAssets/index.tsx` | 賣家免費刊登 / 免費刊登數位資產                                                   | 賣家刊登 / 刊登數位資產 (匿名、公開頁面不顯示賣家資料 stays)                                                                                              |
| `components/blog/Cta.tsx`                                                                                              | …或免費刊登你的店。                                                               | …或刊登你的店。                                                                                                                                           |
| `content/blog/*.mdx`                                                                                                   | any 12/1 or free-listing claim                                                    | same rule. Grep shows none today, so re-check at implementation                                                                                           |

Analytics: no event names or `cta_location` values change. Only labels change.

### Acceptance criteria

- `grep -rnE "12/1|限時免費|免費刊登|早鳥" app components constant content lib utils` returns **0 hits**. Allowed: 瀏覽／聯絡 永久免費, 免費建立帳號.
- On the rendered home page: `<meta name="description">`, `og:description` and `twitter:description` all equal the new copy with a real number. The page has exactly one `<h1>` and it contains 頂讓.
- On the rendered `/sell`: title, description, og and twitter match the table. There is one `<h1>`, and the FAQPage JSON-LD on the page has no free-listing claim.
- The launch banner renders and does not jump on desktop or at 375 px with only one message.
- TrustBar and SellerCta keep their grid at desktop and 375 px (before/after screenshots in the PR).
- `npm run build` and lint pass.

### Post-deploy (user)

GSC: request re-indexing for `/` and `/sell`. Four weeks later, check that 頂讓網 / 頂讓 / 免費頂讓 rank and CTR on `/` have not dropped.

---

## Module `store-template` (item 4)

### Objective

Store pages bring about 40% of site clicks, and this one template covers about 166 pages. Every indexable store page should describe itself as a Product. Its H1 should say 頂讓. A sold page should tell the visitor the store is gone and send them to live listings nearby, because most of its traffic searches the shop by name or address (#103).

### Root cause (confirmed 11/25)

The two in-sale pages the issue cites (`H0AnHlQWH2rfsemeEOv6` 永和豆漿大王, `00HZfgN80EAplNHZD82X`) are both **面議** (price 0 + negotiable). `storeOffer()` in `utils/seo.ts` returns `null` on purpose for 面議, so the page skips the Product block. Priced in-sale pages already output Product + Offer.

### Changes

**1. JSON-LD (`utils/seo.ts` `storeOffer`, `store/[storeId]/page.tsx`)**

- `storeOffer` never returns `null`. For 面議 it returns `{ "@type": "Offer", priceCurrency, availability, url }` with no `price`.
- `availability`: `approved` → `https://schema.org/InStock`, `sold` → `https://schema.org/SoldOut`. Other statuses are noindexed, so the value doesn't matter, but it must stay valid.
- A price range keeps using `AggregateOffer`.
- The page renders Product on every store page. Update the comment that explains why 面議 was skipped.

**2. H1 (`StoreTitleRow.tsx`), physical stores only**

- In sale: `{店名}頂讓｜{縣市}{區}`, e.g. 永和豆漿大王頂讓｜新北市中和區
- Sold: `{店名}（已頂讓）｜{縣市}{區}`
- Don't double it: if the store name already contains 頂讓 (e.g. 台北內湖區義大利麵燉飯餐廳頂讓), don't append 頂讓 again.
- With no district, use just `{縣市}`. With no city either, drop the ｜ part.
- Visual: the store name keeps its `<em>` emphasis, and the location part is styled as the secondary piece. The existing `.loc` line under the H1 (city/district · address) stays.
- Put the string logic in a pure helper (e.g. `storeHeading()` in `utils/seo.ts`) so it is easy to check.

**3. Sold notice + alternatives (`store/[storeId]/page.tsx`)**

- Show a notice at the top of the main column, above the gallery, only when the status is `sold`: 「這間店已頂讓」 with one line of body copy (「看看同區、同業種還在頂讓的店面 ↓」) that links to the related-listings section anchor.
- Sold pages get related stores ranked **same district + same category → same district → same city + same category → same city → same category**. Reuse the existing `getRelatedStores` queries (city, then category) and rank in memory, so no new Firestore query or composite index is needed. The section title on sold pages is 「同區還在頂讓的店」. In-sale pages keep the current title and ranking.
- When the #113 district page ships, the notice links there instead. Out of scope now.
- Build the notice as a co-located `_components/SoldNotice.tsx` + `.module.css`, using `--accent` tokens from `layout.module.css`.

### Acceptance criteria

- Rendered JSON-LD on dev, with one page of each kind: a priced in-sale page has Product + Offer with `price` and InStock. A 面議 in-sale page has Product + Offer without `price` and InStock. A sold page has Product + Offer with SoldOut. All are valid JSON-LD, checked with Schema Markup Validator or by parsing.
- Every physical store page has exactly one `<h1>`, and it contains 頂讓 (or 已頂讓). No H1 contains 「頂讓頂讓」.
- A sold page shows the notice and a non-empty related section when the city has other approved stores. An in-sale page shows no notice.
- Digital-asset pages: H1 unchanged and no notice.
- `npm run build` and lint pass. The PR includes before/after screenshots of an in-sale page and a sold page, desktop and 375 px.

### Post-deploy (user)

Run Rich Results Test on one in-sale, one sold and one 面議 production page. The 面議 page will show the known price error. Request re-indexing for 3 pages. Watch the GSC 產品摘要 report for in-sale pages. Four weeks later, check that the 巴地越南小吃 page CTR is above 3%.

---

## Module `store-guide` (item 1)

### Objective

`/store-guide` ranks about 10th for 「頂讓意思」 and related queries (290 impressions, 0 clicks in 3 months) and has no structured data. Give searchers a direct definition at the top, a FAQ and rich-result markup so the result earns clicks, without competing with the blog posts that own 頂讓金 and 頂讓 vs 盤讓.

### Changes

**Metadata (`store-guide/page.tsx`)**

- title: 頂讓意思是什麼？店面頂讓流程與注意事項一次看懂 (the template appends ｜頂讓網 Bezold)
- description: 頂讓的意思：把正在營業的店面連同設備、裝潢、客群和租約一起轉給新老闆，新老闆付「頂讓金」接手。一頁看懂頂讓流程、頂讓金行情與常見地雷。

**Hero (`GuideHero.tsx`)**

- H1: 頂讓是什麼意思？
- The first element under the H1 is a **快速回答** block, 40–60 characters:
  > **快速回答：**頂讓是把正在營業的店面，連同設備、裝潢、客群和租約一起轉給新老闆，新老闆付一筆「頂讓金」接手經營。
- Next, one line on how 頂讓 differs from 盤讓, linking to `/blog/takeover-vs-transfer`. While that post isn't published, render the sentence without a link.
- The existing sub paragraph about saving time compared with starting from scratch or buying a franchise stays below.

**頂讓金 (glossary or a new short paragraph)**: one paragraph only, linking to `/blog/how-to-calculate-takeover-fee` (plain text until that post is published). Don't explain how to calculate it here.

**Pitfalls (`PitfallsList.tsx`)**

- 「頂讓金遠超『月租 × 6』」 → 「頂讓金超過約 16 個月租金」 / desc: 平台刊登的頂讓金中位數約 10 個月租金；超過約 16 個月時，要求賣方提供近期帳本、稅單或收銀紀錄，用數字確認獲利撐得住。

**FAQ section (new, before `GuideCta`)**: 4 questions, also used for FAQPage JSON-LD from one data source, following `faqData.tsx`'s `{ q, text, a }` pattern.

1. **頂讓是什麼意思？** 頂讓是把正在營業的店面，連同設備、裝潢、客群和租約一起轉給新老闆。新老闆付「頂讓金」給原店主，不用從零裝潢、找客人，接手後就能營業。
2. **頂讓金是什麼？** 頂讓金是接手店面時付給原店主的費用，買的是設備、裝潢、既有客群與地點，不含房租押金。金額怎麼算，請看〈頂讓金怎麼算〉。 (links only once published)
3. **頂讓要房東同意嗎？** 要。店面租約在房東手上，換人經營通常要房東書面同意轉租或重新簽約。付頂讓金前，先確認房東同意並拿到書面文件。
4. **頂讓和加盟差在哪？** 頂讓是接手一間已經在營業的店，付一次頂讓金；加盟是用品牌的名字從頭開一間店，要付加盟金、權利金，通常還要裝潢。詳見〈頂讓還是加盟〉。 (links to `/blog/takeover-vs-franchise`, which exists)

**Related reading (new, page bottom)**: links to the #124 posts, filtered to the ones `getPostBySlug()` returns (published only). Hide the section if none are published. This section also covers #124's 「/store-guide 延伸閱讀」 item, so #124 does not build its own.

Slugs, in #124's publish order (keep this order, and the title shown is each post's own frontmatter title):

| #   | Slug                            | Planned publish | Note                        |
| --- | ------------------------------- | --------------- | --------------------------- |
| 1   | `how-to-calculate-takeover-fee` | 2026-11-26      |                             |
| 2   | `store-takeover-process`        | 2026-11-27      |                             |
| 3   | `restaurant-takeover-guide`     | 2026-11-29      |                             |
| 4   | `takeover-contract`             | 2026-11-30      | legal review before publish |
| 5   | `takeover-vs-transfer`          | 2026-12-02      |                             |
| 6   | `takeover-scams`                | 2026-12-03      |                             |
| 7   | `landlord-consent`              | 2026-12-05      | legal review before publish |

"Published" means `getPostBySlug(slug)` returns a post, which is the same rule `/blog` uses (in production, the file exists and has no `draft: true`). The blog does not gate on `publishedAt`, so whoever publishes a post controls when its link appears here. The guide page needs no change when posts go live.

**JSON-LD**: `Article` (headline = H1, description, `datePublished` / `dateModified`, author/publisher = Organization Bezold 頂讓必售, url), `BreadcrumbList` (首頁 → 頂讓指南) built with `breadcrumbJsonLd`, and `FAQPage` built with `faqPageJsonLd` from the same FAQ data.

### Acceptance criteria

- The rendered page has the new title, description and og/twitter description. It has one `<h1>` = 頂讓是什麼意思？, and the 快速回答 block is the H1's next sibling content.
- Three JSON-LD blocks (Article, BreadcrumbList, FAQPage) parse as valid JSON, and the FAQPage text matches the visible FAQ.
- No 「月租 × 6」 left on the page.
- With no #124 posts published, the page shows no related-reading section and no broken links. With one published (test with a dev draft), it shows that one.
- `npm run build` and lint pass. The PR includes before/after screenshots of the hero, FAQ and pitfalls.

### Post-deploy (user)

Run Rich Results Test (FAQ, Article, Breadcrumb) and request re-indexing. Four weeks later, check that CTR on 頂讓意思-family queries is above 3%.

---

## Tech stack

Next.js 14 App Router · TypeScript · CSS Modules + Tailwind · Firebase Admin SDK (server components) · gray-matter MDX blog (`lib/blog.ts`). No new dependencies.

## Commands

```bash
nvm use                                    # Node 24
npm run dev                                # http://localhost:3000 (check .env.development NEXT_PUBLIC_ENV_VERSION=dev first)
npm run build
npx eslint --no-eslintrc -c .eslintrc.json app components utils lib constant   # lint inside a worktree
npx prettier --write <changed files>
```

## Project structure (touched areas)

```
app/(new)/page.tsx, _components/{HeroSplit,TrustBar,SellerCta,HowItWorks,WhyUs,Faq,LaunchBannerRotator,SellButton,SiteFooter}  → listing-copy
app/(new)/sell/{page.tsx,_components/SellGuide.tsx,_components/SellForm.tsx}                                                   → listing-copy
app/(new)/faq/_components/faqData.tsx, about/page.tsx, app/llms.txt/route.ts, constant/seo.ts                                 → listing-copy
app/(new)/store/[storeId]/{page.tsx,_components/StoreTitleRow.tsx,_components/SoldNotice.tsx}, utils/seo.ts                  → store-template
app/(new)/store-guide/{page.tsx,_components/*}, utils/structuredData.ts                                                       → store-guide
```

## Code style

Follow CLAUDE.md: CSS Modules for paint and Tailwind for layout, never both on one element. Use `cn()` for conditional classes and readable variable names. Sub-components go at the bottom of the parent file. Use `// *` comments for the why. Keep pure string logic in `utils/`, for example:

```ts
// * 店名 already says 頂讓 for some listings — don't print it twice
export const storeHeading = (
  store: Pick<Store, "storeName" | "city" | "district" | "status">,
) => {
  const isSold = store.status === STORE_STATUS.SOLD;
  const suffix = isSold
    ? "（已頂讓）"
    : store.storeName.includes("頂讓")
      ? ""
      : "頂讓";
  const place = [store.city, store.district].filter(Boolean).join("");
  return { name: `${store.storeName}${suffix}`, place };
};
```

## Testing strategy

App code has no test runner, and adding one is an Ask-first item. Each module is verified by:

1. `npm run build` + lint.
2. Rendering on the dev server (mock collections) and checking with `curl` + parsing: the `<title>`, meta description, og/twitter, `<h1>` count and text, and every `application/ld+json` block parsed as JSON.
3. The `grep` sweep in `listing-copy`'s acceptance criteria.
4. Before/after screenshots per CLAUDE.md for every UI change, desktop + 375 px.
5. Rich Results Test on production URLs after deploy (user).

No Firestore rules change: every read is server-side through the Admin SDK. No new composite index: related-store ranking reuses the existing queries.

## Boundaries

- **Always**: three separate PRs in build order. Before/after screenshots. Run prettier on every changed file. Keep FAQ visible text and FAQPage JSON-LD from one data source. Use `COLLECTIONS.*` and never hardcode collection names. Wait for the user's review before committing.
- **Ask first**: any copy change beyond the tables above. Adding a test runner or dependency. Adding a Firestore query that needs a new index. Changing store page `<title>` templates (#111). Touching `AccelerationBanner` beyond removing 「免費刊登不變。」 if #121 is in flight.
- **Never**: say listing is free, mention 12/1, or announce a fee amount. Output `0 間` or a stale hardcoded count in the home description. Link to an unpublished blog post. Remove the `omitSellerContact` path on store pages. Run deploys, GSC actions or prod cron calls.

## Success criteria

- **By 11/30**: `listing-copy` is live in production, and the sweep grep returns 0 hits.
- `store-template`: every indexable store page outputs Product + Offer with the correct availability. Every physical store H1 contains 頂讓. Sold pages show the notice and alternatives.
- `store-guide`: new metadata/H1/quick answer/FAQ are live with three valid JSON-LD blocks.
- Four-week outcomes (tracked by the user in GSC, not a gate for merging): 頂讓意思 CTR > 3%; 巴地 page CTR > 3%; home 頂讓網 / 頂讓 / 免費頂讓 not worse.

## Resolved decisions

1. **Home count**: physical stores, on sale + sold (`approved` + `sold`).
2. **Home eyebrow**: the existing kicker line becomes the eyebrow. No second label is added.
3. **#124 slugs**: confirmed from the updated #124. See the table in `store-guide` → Related reading.
4. **Site-wide copy table**: the proposed strings in `listing-copy` are accepted as written.

## Open questions

None. Any new wording or scope change goes back through the Ask first boundary.
