# Spec: SEO 健檢修正

## Objective

修正 2026-10-18 SEO 健檢（[`docs/seo-audit-2026-10-18.html`](docs/seo-audit-2026-10-18.html)）找到的 12 個問題，讓 Google 正確索引每一頁、店家頁能吃到長尾搜尋、非公開刊登不外流，並把 `/store-list` 的速度拉回合理範圍。

**使用者**：

- 從 Google 搜尋進站的買家與賣家（手機為主）。
- 在 LINE / FB 分享店家頁的使用者：分享卡片要顯示正確的標題、描述和圖片。
- 營運者：之後每次上線都能重跑同一套檢查（`npm run seo:audit`）。

**為什麼**：目前 8 個頁面的 canonical 指向首頁、48 個店家頁的 description 全部相同、不存在的店家回 500，`/store-list` 的 TTFB 是 2.4 秒、LCP 是 6.1 秒，而且會把 73 筆草稿送進公開的 HTML。這些問題 Lighthouse 的 SEO 分數（100）都抓不到，所以需要自己的檢查腳本。

**Search Console 實際資料**（2026-10-18 讀取，近 90 天）：

- 332 次點擊、4,650 次曝光，平均點閱率 7.1%，平均排名 8。點擊有 66% 來自首頁（218 次）。
- **從來沒有提交過 sitemap**。Google 只索引了 32 頁：sitemap 裡的 66 個網址有 27 個被索引，**6 篇 blog 文章、`/blog`、`/faq`、`/sell`、`/store-list` 都不在索引裡**（blog 文章 7–8 月就已發布），23 個店家頁也還沒有被索引。
- 曝光最多的店家頁 `/store/HUluGiOrAjMfT5N1Oqzg`（巴地越南小吃，545 次曝光）是**已售出**的店，不在 sitemap，卻已經被索引；另外 3 個被索引的已售出店家也一樣。這代表成交案例本身就有搜尋流量。
- 「頂讓是什麼意思」相關的查詢（頂讓是什麼意思、頂讓意思、頂讓的意思、頂讓 意思…）合計約 55 次曝光、平均排名 10～11、**0 次點擊**。`/store-guide` 的 h1 就是「什麼是頂讓？」，但它的標題「頂讓指南」沒有對到這個搜尋意圖。
- 產品摘要報表有 **2 個無效項目**：「必須指定 offers、review 或 aggregateRating」。原因是面議的店家（`price === 0 && priceNegotiable`）的 JSON-LD 拿掉了 `offers`，但仍然輸出 `Product`。
- 商家資訊報表只有警告（缺 `hasMerchantReturnPolicy`、`shippingDetails`、全球 ID），這些欄位不適用於店面頂讓，不處理。
- Core Web Vitals：行動裝置和桌面的使用資料都還不足，無法判斷。HTTPS、導覽標記、人工判決處罰都沒有問題。

### 已確定的決策

| 項目                      | 決定                                                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 已售出（sold）店家頁      | **保留索引**，JSON-LD 標 `SoldOut`，當作成交案例                                                                                                                                          |
| pending / rejected 店家頁 | 頁面照常可以開啟，但設為 `noindex, nofollow`（比照 draft）                                                                                                                                |
| `/api/stores`（GET 列表） | **刪除**。前端沒有呼叫，而且會回傳草稿；`/api/stores/[storeId]/*` 與 `highlight` 不動                                                                                                     |
| 圖片網址                  | **Firebase 下載網址**：server 端改用 `firebase-admin` 的 `getDownloadURL()`（附 token 的永久網址），沒有 token 時退回原本的簽名網址。不改 Storage 權限、不經過 Vercel、沒有 4.5 MB 的限制 |
| 頁面標題                  | 各頁只寫頁面名稱，品牌交給 root template（`%s｜頂讓網 Bezold`）；採用健檢報告中的建議文案                                                                                                 |
| 對比度                    | `--accent #b33a1d`、`--muted #736b61`，新增 `--accent-on-dark #f07a5a`（見 [`docs/contrast-before-after.html`](docs/contrast-before-after.html)）                                         |
| 面議店家的結構化資料      | **不輸出 `Product` JSON-LD**。沒有價格就無法提供有效的 `offers`，輸出不完整的 Product 只會產生無效項目                                                                                    |
| 已售出店家與 sitemap      | **加進 sitemap**（priority 0.4），讓 Google 能持續發現這些有搜尋流量的成交案例                                                                                                            |
| `/store-guide` 標題       | 改成對應「頂讓是什麼意思」搜尋意圖的標題與描述（見 `seo-metadata` 驗收條件 7）                                                                                                            |
| 驗證腳本                  | 新增 `scripts/seo-audit.mjs` 與 `npm run seo:audit`，放進 repo                                                                                                                            |
| Spec 檔                   | Capability map 與 4 個模組的 spec 都放在這份 `SPEC.md`                                                                                                                                    |

### 不在範圍內

- 上傳時壓縮或縮圖（4032px 原圖問題的根治方式），之後另開 PR。
- 在 Search Console 提交 sitemap、要求重新索引，以及 Bing Webmaster 設定（由你在 Console 操作）。
- 商家資訊報表的警告（退貨政策、運送資訊、全球 ID），這些欄位不適用於店面頂讓。
- `/faq` 的 FAQPage 結構化資料（Google 已不對一般網站顯示 FAQ rich result）。
- 不在 sitemap 裡的頁面（`/acceleration`、`/store-example`、`/my-listings`…）的 metadata 調整；root 拿掉 canonical 之後它們會沒有 canonical，這是可以接受的預設行為。
- 新增測試框架。

---

## Capability Map

| Module id            | 負責範圍                                                                                                                                                                                                  | 依賴                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `seo-metadata`       | 驗證腳本；canonical / OG；店家頁 description、索引規則、SoldOut、面議不輸出 Product、404；sitemap（含已售出）；標題與 `/store-guide` 文案（報告 P0-1～4、P1-4、P2-1、P2-2，以及 Search Console 的新發現） | —                    |
| `store-list-payload` | `getStores` 狀態過濾與平行簽圖；刪除 `/api/stores`；首屏卡片 priority（P0-5、P1-3）                                                                                                                       | `seo-metadata`       |
| `headings-a11y`      | h1；對比度 token；「04」看不見的 bug；`<main>`、nav `<li>`、heading 層級（P1-1、P2-3）                                                                                                                    | —                    |
| `stable-image-urls`  | 用 Firebase 下載網址取代 7 天過期的簽名網址；公開列表只解析封面圖（P1-2）                                                                                                                                 | `store-list-payload` |

建置順序：`seo-metadata` → `store-list-payload` → `headings-a11y` → `stable-image-urls`

- `store-list-payload` 依賴 `seo-metadata`，因為兩者都會修改 `app/(new)/store-list/page.tsx`，而且會用到 `seo-metadata` 提供的驗證腳本。
- `stable-image-urls` 依賴 `store-list-payload`，因為兩者都會修改 `firebase/serverUtils/store.ts` 的 `getStores` 與 `resolveStoreImages`，而且要用 `store-list-payload` 量到的 TTFB 當基準。
- `headings-a11y` 和其他模組沒有共用檔案，必要時可以和前兩個模組並行。
- 一個模組一個分支、一個 PR，PR 說明連回本文件對應的章節。

---

## Module: `seo-metadata`

### 驗收條件

1. **驗證腳本** `scripts/seo-audit.mjs`（Node 24 內建 `fetch`，不加依賴），以 `npm run seo:audit -- <baseUrl>` 執行，預設 `http://localhost:3000`：
   - 讀取 `/robots.txt` 與 `/sitemap.xml`，逐一抓取 sitemap 裡的網址（同時最多 8 個連線）。
   - 每頁檢查：HTTP 200；`<link rel="canonical">` 等於自己的網址；有 `<meta name="description">`；`og:title`、`og:description`、`og:image` 存在，且 `og:title` 不等於首頁標題（首頁除外）；h1 恰好 1 個；HTML 裡沒有 `"status":"draft|pending|rejected"`。
   - 跨頁檢查：description 不可重複（列出重複的群組）；sitemap 裡的網址不可被 robots.txt 的 `Disallow` 擋住。
   - 額外檢查：`/store/__seo_audit_missing__` 回 404。
   - 可以用 `--noindex /store/<id>,…` 指定應該為 noindex 的網址，用 `--json` 輸出 JSON。
   - 輸出一張「檢查項目 × 失敗數」摘要表，加上每個失敗網址的明細；有任何失敗就以 exit code 1 結束。
   - h1 和 status 這兩項在 `headings-a11y`、`store-list-payload` 完成之前一定會失敗，所以提供 `--skip h1,status` 參數，讓每個模組只驗證自己負責的項目。
2. **Canonical / OG**：
   - 移除 root `app/layout.tsx` 的 `alternates.canonical`；`SITE_TITLE`、`SITE_DESCRIPTION` 移到 `constant/seo.ts`，並新增 `BASE_OPEN_GRAPH`。
   - 新增 `utils/seo.ts`：`pageMetadata({ title, description, path, images? })` 與 `toMetaDescription(text, maxLength = 120)`。
   - `/faq`、`/sell`、`/store-guide`、`/privacy`、`/terms`、`/disclaimer`、`/store-list` 改用 `pageMetadata()`；`/policy/editor-pick` 的 openGraph 展開 `BASE_OPEN_GRAPH`；`/blog` 目前沒有設定 openGraph（會沿用首頁的分享卡片），也改用 `pageMetadata()`。
3. **店家頁 metadata**（`app/(new)/store/[storeId]/page.tsx`）：
   - `description` = `toMetaDescription(store.description)`；`og:description` 用 200 字上限。
   - 標題 `${storeName}｜${city}店面頂讓`；沒有 city 時為 `${storeName}｜店面頂讓`。
   - 只有 `approved`、`sold` 可以被索引，其他狀態（含 `status` 不存在）一律 `robots: { index: false, follow: false }`。
   - JSON-LD：`sold` 為 `https://schema.org/SoldOut`，其他狀態為 `InStock`；沒有圖片時的 fallback 改成絕對網址 `${NEXT_PUBLIC_APP_URL}/bezold-og.png`。
   - 面議（`price === 0 && priceNegotiable`）的店家**完全不輸出** `Product` JSON-LD。免頂讓金（`price === 0` 且不可議價）照常輸出 `price: 0` 的 Offer。
4. **404**：`generateMetadata` 和頁面本體在找不到店家時都呼叫 `notFound()`，刪除原本「找不到物件」的 metadata 分支。`error.tsx` 保留給真正的錯誤。
5. **Sitemap / 登入頁**：
   - `app/sitemap.ts` 移除 `/login`、`/signup`；這兩頁加上 `metadata`（標題「登入」、「加入會員」，`robots: { index: false, follow: true }`）。
   - 店家網址改為收錄 `approved` 與 `sold`：查詢改成 `where("status", "in", [STORE_STATUS.APPROVED, STORE_STATUS.SOLD])`。這是單一欄位的 `in` 查詢，不需要 composite index。`approved` 維持 `weekly` / 0.7，`sold` 為 `monthly` / 0.4，`lastModified` 都用 `updateTime`。
6. **標題**：頁面 title 不再包含「— Bezold 頂讓必售」或「Bezold 頂讓必售 —」，blog 文章頁改成 `meta.title`。首頁維持 `title.absolute`。
7. **`/store-guide` 文案**（`pageMetadata()`，path `/store-guide`）：
   - title：`頂讓是什麼？頂讓流程、頂讓金與注意事項一次看懂`（加上 template 後是「…｜頂讓網 Bezold」）。
   - description：`頂讓是什麼意思？從頂讓、頂讓金、盤讓等名詞解釋，到買店與頂出的交接流程和常見地雷，第一次接手店面也能一頁看懂。`
   - 頁面內容和 h1「什麼是頂讓？」不變。

### 檔案

```
scripts/seo-audit.mjs                       ★ 驗證腳本
package.json                                ✎ "seo:audit": "node scripts/seo-audit.mjs"
constant/seo.ts                             ★ SITE_NAME / SITE_TITLE / SITE_DESCRIPTION / BASE_OPEN_GRAPH
utils/seo.ts                                ★ pageMetadata() / toMetaDescription()
app/layout.tsx                              ✎ 移除 canonical，改用 constant/seo
app/sitemap.ts                              ✎ 移除 /login /signup；店家收錄 approved + sold
app/(new)/{faq,sell,store-guide,privacy,terms,disclaimer,store-list}/page.tsx  ✎ pageMetadata()
app/(new)/policy/editor-pick/page.tsx       ✎ BASE_OPEN_GRAPH
app/(new)/blog/page.tsx                     ✎ pageMetadata()
app/(new)/blog/[slug]/page.tsx              ✎ 標題
app/(new)/login/page.tsx                    ✎ metadata
app/(new)/signup/page.tsx                   ✎ metadata
app/(new)/store/[storeId]/page.tsx          ✎ description / 標題 / 索引規則 / SoldOut / 面議不輸出 Product / notFound()
```

---

## Module: `store-list-payload`

### 驗收條件

1. `getStores(searchObj, { statuses? })`：有傳 `statuses` 時，在記憶體中過濾（不新增 Firestore `where`，避免需要新的 composite index），**過濾完才**呼叫 `resolveStoreImages`。不傳時行為和現在完全相同（admin 的 3 個呼叫點不改）。
2. `resolveStoreImages` 改用 `Promise.all` 平行簽圖。
3. `/store-list` 呼叫 `getStores(searchObj, { statuses: [STORE_STATUS.APPROVED] })`；`Breadcrumbs` 的數量改用 `stores.length`。`ResultsArea` 內原本的 approved 過濾可以保留（無害）。
4. 刪除 `app/api/stores/route.ts`。刪除前用 grep 確認整個 repo（含 `hooks/`、`components/`、`mocks/`）沒有任何地方呼叫 `GET /api/stores`。
5. `StoreCard` 新增選用的 `priority` prop，傳給 `next/image`；`ResultsArea` 對前 2 張卡片傳 `priority`。
6. 成效（本機 `next start` 搭配正式資料，量 3 次取中位數）：`/store-list` 的 TTFB 至少比改前低 50%，HTML 大小至少比改前小 40%。實作前先用同樣方式量一次改前的基準值，記錄在 PR 裡。

### 檔案

```
firebase/serverUtils/store.ts               ✎ statuses 選項、平行簽圖
app/(new)/store-list/page.tsx               ✎ 只取 approved
app/api/stores/route.ts                     ✗ 刪除
components/refactored/StoreCard.tsx         ✎ priority prop
app/(new)/store-list/_components/ResultsArea.tsx  ✎ 前 2 張 priority
```

---

## Module: `headings-a11y`

### 驗收條件

1. `StoreTitleRow` 的店名和 `/store-list` `Breadcrumbs` 的標題由 `<h2>` 改為 `<h1>`，外觀不變（在 390px 與 1280px 兩種寬度截圖比對）。
2. `app/globals.css`：`--accent: #b33a1d`、`--muted: #736b61`，新增 `--accent-on-dark: #f07a5a`。
3. `HowItWorks.module.css`：`.buyer .type` 改用 `--accent-on-dark`；`.seller .number` 加上 `color: var(--ink)`。
4. `SectionTitle.module.css`：`.numDark` 改成巢狀 `&.numDark`，修正 `/store-guide` 深色區塊「04」看不見的問題。
5. 首頁與 `/faq` 的外框 `<div className={styles.frame}>` 改為 `<main>`；`SiteNav` 手機版 `<ul>` 內的 `<a>` 外面包 `<li>`；首頁 HowItWorks / WhyUs 的 `<h5>` 和 SiteFooter 的 `<h6>` 改成符合層級的標籤，並用 CSS module 保持原本的字級。
6. 用健檢時的對比度掃描（實作時放進 `scripts/seo-audit.mjs` 的 `--contrast` 模式，或以瀏覽器 console 執行）檢查首頁、店家頁、`/store-list`、`/faq`、`/store-guide`：對比不足的文字 **0 處**。
7. Lighthouse（手機）無障礙分數：首頁、店家頁、`/faq` 都 ≥ 95。
8. Favicon `app/icon.svg` 維持原色。

### 檔案

```
app/globals.css                                         ✎ token
app/(new)/_components/HowItWorks.module.css             ✎ 深色區塊與黃色編號
app/(new)/_components/HowItWorks.tsx                    ✎ h5 → h3
app/(new)/_components/WhyUs.tsx (+ .module.css)         ✎ h5 → h3
app/(new)/_components/SiteFooter.tsx (+ .module.css)    ✎ h6 → 適當層級
app/(new)/_components/SiteNav.tsx                       ✎ <li>
components/refactored/SectionTitle.module.css           ✎ &.numDark
app/(new)/store/[storeId]/_components/StoreTitleRow.tsx ✎ h1
app/(new)/store-list/_components/Breadcrumbs.tsx        ✎ h1
app/(new)/page.tsx、app/(new)/faq/page.tsx              ✎ <main>
```

確切的元件檔名會在實作時用 grep 確認；如果需要改到超過 10 個檔案，先停下來和你確認。

---

## Module: `stable-image-urls`

### 為什麼要一起處理列表頁

`getSignedUrl()` 在本機用金鑰就能算出網址，不需要網路請求；`getDownloadURL()` 每張圖都要呼叫一次 Firebase metadata API。`/store-list` 目前每次會解析 474 張圖，直接換掉的話 TTFB 會變得更慢。所以這個模組會一起做兩件事：網址快取，以及公開列表只解析卡片會用到的封面圖。

### 驗收條件

1. **實作前先抽查**（唯讀腳本，不寫入任何資料）：統計 `COLLECTIONS.STORE` 底下有多少物件沒有 `firebaseStorageDownloadTokens`，並把數量和代表路徑回報給你。如果超過 10%，先停下來討論要不要補 token（補 token 等於寫入正式資料，屬於「先詢問」）。
2. `firebase/serverUtils/image.ts` 的 `getImageByPath(imagePath)`：
   - 先呼叫 `getDownloadURL(bucket.file(imagePath))`（`firebase-admin/storage`），成功時回傳附 token 的網址。
   - 遇到 `storage/no-download-token` 或其他錯誤時，退回原本的 7 天簽名網址，並在 server log 記一行 `console.warn`（含路徑）。
   - 成功的網址存在模組層級的 `Map` 快取，TTL 10 分鐘。賣家用相同檔名重新上傳時，token 可能會換，TTL 可以避免一直回傳舊網址。簽名網址不快取。
   - 維持 async 簽名，`getImagesByPath` 與所有呼叫端都不用改。
3. **公開列表只解析封面圖**：`resolveStoreImages(stores, { coverOnly })`。`coverOnly` 為 true 時只解析 `images[0]`，`store.images` 變成 `[封面網址]`，不會把原始路徑送到前台。
   - `getStores` 新增 `coverOnly` 選項；`/store-list` 傳入 `coverOnly: true`。
   - `getHighlightedStores`、`getEmergencyStores`、`getSoldStores`（首頁區塊）改成 `coverOnly`。
   - admin 呼叫端和店家頁（`getStoreById`）維持解析全部圖片。
4. Client 端的 `firebase/clientUtils/image.ts` 不改。
5. 成效：
   - 店家頁的 og:image、JSON-LD image、`<img src>` 都不再含 `Expires=`（沒有 token 的物件除外）。連續請求同一頁兩次，圖片網址完全相同。
   - `/store-list` 的 TTFB（`next start`，3 次取中位數）不超過 `store-list-payload` 完成後基準值的 110%。
   - 首頁、`/store-list`、店家頁、admin 列表的圖片全部正常顯示。

### 檔案

```
scripts/check-download-tokens.mjs           ★ 唯讀抽查腳本（驗收條件 1，可以不 commit）
firebase/serverUtils/image.ts               ✎ getImageByPath：下載網址 + 快取 + 退回簽名網址
firebase/serverUtils/store.ts               ✎ resolveStoreImages / getStores 的 coverOnly；首頁三個查詢改成 coverOnly
app/(new)/store-list/page.tsx               ✎ getStores 傳入 coverOnly: true
```

---

## Tech Stack

Next.js 14 App Router · TypeScript · CSS Modules + Tailwind · Firebase Admin SDK（Firestore、Storage）· Vercel。不新增 npm 依賴；驗證腳本只用 Node 24 內建的 `fetch`。

## Commands

```bash
nvm use
npm run dev                                   # port 3000；worktree 預設會讀到正式資料，見下方說明
npm run build && npm run start                # 量 TTFB 與 HTML 大小時用 production 模式
npx eslint --no-eslintrc -c .eslintrc.json --ext .ts,.tsx app components constant types utils hooks lib firebase
npx prettier --write <changed files>
npm run seo:audit                             # 本機 http://localhost:3000
npm run seo:audit -- https://www.bezold.com.tw --skip h1,status   # 正式站，改前的基準值
```

- Worktree 裡 `next lint` 會因為 plugin 衝突而失敗，請用上面的 eslint 指令。目前的基準是 0 個錯誤、2 個既有的警告。
- Worktree 沒有 `.env`。執行 `npm run build` 時，暫時建立指向主 checkout `.env` 的 symlink，結束後刪除。
- Worktree 的 `.env.development` 設定為 `prod`，所以本機會讀到正式資料。這次所有驗證都只讀不寫。

## Project Structure

```
scripts/        → 一次性或維運用的 Node 腳本（已有 mark-existing-users-verified.mjs）
constant/       → 靜態常數與對照表（新增 seo.ts）
utils/          → 資料轉換函式（新增 seo.ts）
app/            → 路由；metadata 寫在各 page.tsx
components/refactored/ → 共用元件
firebase/serverUtils/  → Admin SDK 存取
docs/           → 健檢報告與對比度對照頁（這次一起 commit）
```

## Code Style

遵守 CLAUDE.md：靜態值放 `constant/`、轉換函式放 `utils/`；CSS module 負責視覺、Tailwind 負責排版，不在同一個元素上混用；CSS 用巢狀語法；變數名稱不用單字母；註解沿用 `// *` 的風格。

```ts
// utils/seo.ts
export const pageMetadata = ({
  title,
  description,
  path,
  images,
}: PageMetadataInput): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title,
    description,
    url: path,
    images: images ?? [...BASE_OPEN_GRAPH.images],
  },
});

// app/(new)/faq/page.tsx
export const metadata: Metadata = pageMetadata({
  title: "常見問題",
  description:
    "關於頂讓平台的刊登、買賣流程、費用、安全保障等常見問題一次解答。",
  path: "/faq",
});
```

Next 的 metadata 合併是淺層的：子頁面只要設定了 `openGraph`，就會整個取代父層的設定。所以每個頁面層級的 `openGraph` 都必須從 `BASE_OPEN_GRAPH` 展開。

## Testing Strategy

這個專案沒有測試框架，加入測試框架屬於「先詢問」。每個模組的驗證方式：

1. prettier、eslint、`npm run build` 都要通過。
2. 本機 `npm run build && npm run start` 後，執行 `npm run seo:audit`，模組負責的檢查項目全部通過（尚未完成的模組用 `--skip` 略過）。
3. 模組各自的驗收條件：

| #   | 模組                 | 檢查                                                                                                         | 預期                                                                             |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| T1  | `seo-metadata`       | 對正式站執行 `seo:audit`（改前的基準值）                                                                     | 會列出 canonical、description 重複、404 等失敗，證明腳本抓得到                   |
| T2  | `seo-metadata`       | 本機 `seo:audit`                                                                                             | canonical、description、OG、robots-vs-sitemap、404 全部通過                      |
| T3  | `seo-metadata`       | `seo:audit --noindex` 指定 1 筆 pending、1 筆 rejected、1 筆 draft                                           | 三頁都是 `noindex, nofollow`                                                     |
| T4  | `seo-metadata`       | curl 一筆 sold 店家頁                                                                                        | `index, follow`，JSON-LD 為 `SoldOut`                                            |
| T5  | `seo-metadata`       | 用 [Rich Results Test](https://search.google.com/test/rich-results) 檢查 Vercel preview 的店家頁與 blog 文章 | Product、BlogPosting 都沒有錯誤                                                  |
| T6  | `store-list-payload` | 本機 `seo:audit`                                                                                             | status 檢查通過（任何頁面都沒有非公開狀態）                                      |
| T7  | `store-list-payload` | `/store-list` TTFB 與 HTML 大小，改前改後各量 3 次                                                           | 達到驗收條件 6 的目標                                                            |
| T8  | `store-list-payload` | `curl /api/stores`                                                                                           | 404；`/api/stores/{id}/contact` 照常運作                                         |
| T9  | `store-list-payload` | admin Store List、Drafts、Analytics 頁                                                                       | 仍然列出所有狀態（行為不變）                                                     |
| T10 | `store-list-payload` | `/store-list` 效能追蹤                                                                                       | LCP 圖片有 `fetchpriority=high`，不是 lazy                                       |
| T11 | `headings-a11y`      | 本機 `seo:audit`（不 skip）                                                                                  | h1 檢查通過                                                                      |
| T12 | `headings-a11y`      | 5 頁對比度掃描                                                                                               | 0 處不足                                                                         |
| T13 | `headings-a11y`      | 首頁、店家頁、`/faq`、`/store-guide` 在 390px 與 1280px 截圖                                                 | 除了顏色，排版與字級不變；「04」看得到                                           |
| T14 | `headings-a11y`      | Lighthouse（手機）無障礙                                                                                     | 首頁、店家頁、`/faq` 都 ≥ 95                                                     |
| T15 | `stable-image-urls`  | 抽查腳本（驗收條件 1）                                                                                       | 回報沒有 token 的物件數量與代表路徑；全程沒有寫入                                |
| T16 | `stable-image-urls`  | 本機店家頁原始碼連續抓兩次                                                                                   | og:image、JSON-LD image 都是 `firebasestorage.googleapis.com/…&token=`，兩次相同 |
| T17 | `stable-image-urls`  | 首頁、`/store-list`、店家頁、admin 列表的圖片；`/store-list` TTFB                                            | 全部正常顯示；TTFB ≤ 基準值的 110%；`/store-list` HTML 每間店只有 1 個圖片網址   |
| T18 | `seo-metadata`       | 用 Rich Results Test 檢查 Vercel preview 上一筆面議店家、一筆免頂讓金店家                                    | 面議頁沒有 Product；免頂讓金頁的 Product 有效（price 0）                         |
| T19 | `seo-metadata`       | 本機 `/sitemap.xml`                                                                                          | 包含已售出店家（priority 0.4），不包含 pending / rejected / draft                |
| T20 | `seo-metadata`       | 本機 `/store-guide` 原始碼                                                                                   | title、description、og:title 都是驗收條件 7 的文案；canonical 為 `/store-guide`  |

## Boundaries

- **Always**
  - 一個模組一個分支（從 main 開），做完先停下來等你 review，之後再 commit 和開 PR。
  - 每次修改都跑 prettier、eslint、build、`seo:audit`。
  - 公開頁面與 API 一律只輸出 `approved`（和 sold 的單頁），賣家聯絡方式維持只能從 `/api/stores/[storeId]/contact` 取得。
  - 變更 metadata 時，同時檢查 `og:*`，不能只改 `<title>`。
- **Ask first**
  - 新增任何 npm 依賴。
  - 修改 Storage / Firestore 權限或 Vercel 設定。
  - 修改不在各模組檔案清單裡的檔案，或單一模組改動超過 10 個檔案。
  - 調整 Firestore 查詢條件、新增 composite index。
  - 修改 `next.config.js`（例如重新開啟圖片優化）。
- **Never**
  - 直接修改或 push 到 `main`；commit `.env` 或金鑰。
  - 在本機驗證時寫入正式資料。
  - 讓 draft / pending / rejected 出現在任何公開的 HTML、API 或 sitemap。
  - 為了補下載 token 而寫入或修改正式環境的 Storage 物件 metadata（要先詢問）。

## Success Criteria

- 4 個模組的驗收條件全部成立，T1–T20 全部通過。
- 對本機與上線後的正式站執行 `npm run seo:audit`（不帶 `--skip`）結果為 0 個失敗。
- Search Console 追蹤（你提交 sitemap、`seo-metadata` 上線後約 4 週）：sitemap 狀態為「成功」；6 篇 blog 文章、`/faq`、`/store-list` 都已建立索引；產品摘要報表的無效項目為 0；「頂讓是什麼意思」相關查詢開始有點擊。
- 對正式站重新跑健檢：Lighthouse SEO 首頁、店家頁、`/faq` 都是 100；無障礙都 ≥ 95；`/store-list` 的 TTFB 和 HTML 大小達到 `store-list-payload` 的目標。
- 現有行為不變：admin 列表、草稿流程、聯絡方式的會員限制、分享按鈕、圖片上傳。

## Open Questions

目前沒有。

已解決：

- 圖片網址的做法：採用 Firebase 下載網址。302 轉址會多一次往返，而且 Google 圖片最後抓到的仍是會變動的簽名網址；bucket 公開讀取需要改權限。實測 474 張圖中有 19 張超過 Vercel Function 4.5 MB 的回應上限，所以不考慮由 Vercel 代送圖片。
- Vercel 頻寬：改用下載網址後圖片不經過 Vercel，Hobby 方案的額度（目前 Fast Data Transfer 2.22 GB / 100 GB）不受影響。
- 換照片沿用同檔名：下載網址不經過 CDN 快取；server 端快取 TTL 只有 10 分鐘，不會長時間顯示舊圖。
