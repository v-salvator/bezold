# Tasks: SEO 健檢修正

Plan: [`tasks/plan.md`](plan.md) · Spec: [`SPEC.md`](../SPEC.md)

每個任務都要先滿足以下條件才算完成：

- 修改過的檔案都跑過 `npx prettier --write`
- `npx eslint --no-eslintrc -c .eslintrc.json --ext .ts,.tsx app components constant types utils hooks lib firebase` 沒有新的錯誤（基準：0 個錯誤、2 個既有警告）
- `npm run build` 通過（worktree 先暫時 symlink 主 checkout 的 `.env`，結束後刪除）
- 遵守 CLAUDE.md（`constant/` 與 `utils/` 分工、CSS Module 和 Tailwind 不混用、`cn()`、`COLLECTIONS`、變數命名完整）
- 本機只讀資料：worktree 的 dev / start 連的是正式 Firestore
- 「SPEC #Tn」指 SPEC.md Testing Strategy 表的測試編號

---

## Phase 1: `seo-metadata`（PR 1）

### Task 1: SEO 驗證腳本 `npm run seo:audit`

**Description:** 新增 `scripts/seo-audit.mjs`（只用 Node 24 內建 `fetch`），依照 SPEC `seo-metadata` 驗收條件 1 檢查 sitemap 上的每一頁，以及跨頁的 description 重複、robots 與 sitemap 衝突、404。先對正式站跑，證明它抓得到已知的問題。

**Acceptance criteria:**

- [x] 支援 `<baseUrl>`、`--skip <checks>`、`--noindex <paths>`、`--json`；有失敗時 exit code 為 1
- [x] 輸出摘要表（檢查項目 × 失敗數）與失敗明細
- [x] 對正式站執行時，能列出 canonical 指向首頁（8 頁）、店家頁 description 重複、login / signup 被 robots 擋、`/store/__seo_audit_missing__` 回 500

**Verification:**

- [x] `npm run seo:audit -- https://www.bezold.com.tw --skip h1,status` 的結果和健檢報告一致（SPEC #T1），把輸出貼進 PR 描述當作改前基準
- [x] `--json` 輸出可以用 `node -e "JSON.parse(...)"` 解析

**Dependencies:** None

**Files likely touched:**

- `scripts/seo-audit.mjs`
- `package.json`

**Estimated scope:** S

### Task 2: metadata helper，修正 `/faq`、`/sell` 的 canonical 與 OG

**Description:** 新增 `constant/seo.ts`（`SITE_NAME`、`SITE_TITLE`、`SITE_DESCRIPTION`、`BASE_OPEN_GRAPH`）和 `utils/seo.ts`（`pageMetadata()`、`toMetaDescription()`）。移除 root layout 的 `alternates.canonical`，root openGraph 改成展開 `BASE_OPEN_GRAPH`。先套用到 `/faq`、`/sell`，跑通整條流程。

**Acceptance criteria:**

- [x] 首頁 canonical 仍是 `https://www.bezold.com.tw`
- [x] `/faq`、`/sell` 的 canonical、og:url 指向自己；og:title 是頁面自己的標題
- [x] 標題為「常見問題｜頂讓網 Bezold」、「免費刊登頂讓店面｜頂讓網 Bezold」

**Verification:**

- [x] 本機 `npm run build && npm run start` 後執行 `seo:audit -- --skip h1,status`：`/faq`、`/sell` 的 canonical 與 OG 檢查通過
- [x] curl 首頁確認 canonical、og 標籤和改前相同

**Dependencies:** Task 1

**Files likely touched:**

- `constant/seo.ts`
- `utils/seo.ts`
- `app/layout.tsx`
- `app/(new)/faq/page.tsx`
- `app/(new)/sell/page.tsx`

**Estimated scope:** M

### Task 3: `/store-guide`、`/store-list`、`/blog` 改用 `pageMetadata()`

**Description:** 這三頁是 Search Console 上最需要被索引的頁面。`/store-guide` 換成 SPEC 驗收條件 7 的標題與描述（對應「頂讓是什麼意思」的搜尋意圖）；`/store-list` 的標題改成「全台頂讓店面列表」；`/blog` 補上 openGraph。

**Acceptance criteria:**

- [x] 三頁的 canonical、og:url 都指向自己，og:title 與 `<title>` 一致
- [x] `/store-guide` 的 title、description 和 SPEC 驗收條件 7 完全相同（SPEC #T20）
- [x] `/blog` 的 og:title 不再是首頁標題

**Verification:**

- [x] 本機 `seo:audit -- --skip h1,status`：這三頁通過
- [x] curl `/store-list?category=FACTORY`，確認 canonical 仍是 `/store-list`

**Dependencies:** Task 2

**Files likely touched:**

- `app/(new)/store-guide/page.tsx`
- `app/(new)/store-list/page.tsx`
- `app/(new)/blog/page.tsx`

**Estimated scope:** S

### Task 4: 法律頁與 `/policy/editor-pick` 的 metadata

**Description:** `/privacy`、`/terms`、`/disclaimer` 改用 `pageMetadata()`，標題去掉「— Bezold 頂讓必售」；`/policy/editor-pick` 的 openGraph 展開 `BASE_OPEN_GRAPH`，補上 og:image。

**Acceptance criteria:**

- [x] 四頁的 canonical 都指向自己
- [x] `/policy/editor-pick` 有 og:image，`og:type` 仍為 `article`

**Verification:**

- [x] 本機 `seo:audit -- --skip h1,status`：canonical、OG 檢查在所有靜態頁都通過

**Dependencies:** Task 2

**Files likely touched:**

- `app/(new)/privacy/page.tsx`
- `app/(new)/terms/page.tsx`
- `app/(new)/disclaimer/page.tsx`
- `app/(new)/policy/editor-pick/page.tsx`

**Estimated scope:** S

### Task 5: 店家頁 description、標題、索引規則、404

**Description:** 修改 `generateMetadata`：加上 `description`、標題改成 `店名｜城市店面頂讓`、openGraph 展開 `BASE_OPEN_GRAPH`；只有 approved 和 sold 可以被索引。找不到店家時，`generateMetadata` 和頁面本體都呼叫 `notFound()`。

**Acceptance criteria:**

- [x] 48 個店家頁的 description 都不一樣，而且不超過 120 字
- [x] pending、rejected、draft 店家頁為 `noindex, nofollow`；approved、sold 為 `index, follow`（SPEC #T3、#T4）
- [x] `/store/__seo_audit_missing__` 回 404，不是 500
- [x] 沒有 city 的店家，標題是「店名｜店面頂讓」

**Verification:**

- [x] 本機 `seo:audit -- --skip h1,status --noindex <pending>,<rejected>,<draft>`：description 重複、404、noindex 檢查都通過
- [x] curl 一筆 sold 店家頁，確認是 `index, follow`

**Dependencies:** Task 2

**Files likely touched:**

- `app/(new)/store/[storeId]/page.tsx`

**Estimated scope:** S

### Task 6: 店家頁 JSON-LD

**Description:** sold 店家標 `SoldOut`；面議（`price === 0 && priceNegotiable`）完全不輸出 `Product`；沒有圖片時的 fallback 改成 `${NEXT_PUBLIC_APP_URL}/bezold-og.png`。

**Acceptance criteria:**

- [ ] sold 店家的 `availability` 為 `https://schema.org/SoldOut`
- [ ] 面議店家頁沒有 `application/ld+json` 的 Product；免頂讓金店家仍有 `price: 0` 的 Offer
- [ ] JSON-LD 的 image 一律是絕對網址

**Verification:**

- [ ] curl 一筆 sold、一筆面議、一筆免頂讓金、一筆沒有圖片的店家，檢查 JSON-LD
- [ ] PR 的 Vercel preview 通過 Rich Results Test（SPEC #T5、#T18）

**Dependencies:** Task 5

**Files likely touched:**

- `app/(new)/store/[storeId]/page.tsx`

**Estimated scope:** XS

### Task 7: sitemap、登入頁、blog 文章標題

**Description:** sitemap 移除 `/login`、`/signup`，店家改成收錄 approved 與 sold（sold 為 `monthly` / 0.4）；登入頁與註冊頁加上 metadata 與 noindex；blog 文章頁的標題改成 `meta.title`。

**Acceptance criteria:**

- [ ] sitemap 包含 sold 店家，不包含 pending、rejected、draft、`/login`、`/signup`（SPEC #T19）
- [ ] `/login`、`/signup` 的標題是「登入」、「加入會員」，並設為 `noindex, follow`
- [ ] blog 文章標題不再包含「— Bezold 頂讓必售」

**Verification:**

- [ ] 本機 `seo:audit -- --skip h1,status`：「sitemap 網址被 robots 擋」這項通過
- [ ] 比對本機 sitemap 的店家數量 = approved + sold 的數量

**Dependencies:** Task 2

**Files likely touched:**

- `app/sitemap.ts`
- `app/(new)/login/page.tsx`
- `app/(new)/signup/page.tsx`
- `app/(new)/blog/[slug]/page.tsx`

**Estimated scope:** S

### Checkpoint A: `seo-metadata` 完成

- [ ] 本機 `npm run seo:audit -- --skip h1,status` 0 個失敗（SPEC #T2）
- [ ] prettier、eslint、build 通過
- [ ] 和你 review；通過後 commit（連同 `SPEC.md`、`tasks/`、`docs/`）並開 PR 1
- [ ] PR 1 的 Vercel preview 完成 Task 6 的 Rich Results Test

---

## Phase 2: `store-list-payload`（PR 2，PR 1 合併後從 main 開分支）

### Task 8: `getStores` 狀態過濾與平行簽圖，`/store-list` 只取 approved

**Description:** 先在 `next start` 量 3 次 `/store-list` 的 TTFB 與 HTML 大小當作基準值。接著 `getStores(searchObj, { statuses })` 在記憶體中過濾、過濾後才簽圖；`resolveStoreImages` 改用 `Promise.all`；`/store-list` 只取 approved，`Breadcrumbs` 改用 `stores.length`。

**Acceptance criteria:**

- [ ] `/store-list` 的 HTML 裡沒有 `"status":"draft|pending|rejected|sold"`（SPEC #T6）
- [ ] TTFB 至少降低 50%、HTML 至少縮小 40%（3 次取中位數，改前改後數字寫進 PR）
- [ ] admin 的 3 個 `getStores()` 呼叫不傳 `statuses`，行為不變

**Verification:**

- [ ] 本機 `seo:audit -- --skip h1`：status 檢查通過
- [ ] 開 admin Store List、Drafts、Analytics，確認仍然列出所有狀態（SPEC #T9）

**Dependencies:** Checkpoint A

**Files likely touched:**

- `firebase/serverUtils/store.ts`
- `app/(new)/store-list/page.tsx`

**Estimated scope:** S

### Task 9: 刪除 `GET /api/stores`

**Description:** 先 grep 整個 repo（含 `hooks/`、`components/`、`mocks/`、`app/admin/`），確認沒有任何地方呼叫 `GET /api/stores`，再刪除 `app/api/stores/route.ts`。

**Acceptance criteria:**

- [ ] `GET /api/stores` 回 404；`/api/stores/{id}`、`/api/stores/{id}/contact`、`/api/stores/highlight` 照常運作（SPEC #T8）
- [ ] grep 的結果寫進 PR 描述

**Verification:**

- [ ] 本機 curl 上面 4 個端點
- [ ] build 通過（沒有殘留的 import）

**Dependencies:** Task 8

**Files likely touched:**

- `app/api/stores/route.ts`（刪除）

**Estimated scope:** XS

### Task 10: 首屏 StoreCard 加 priority

**Description:** `StoreCard` 新增選用的 `priority` prop 並傳給 `next/image`；`ResultsArea` 對前 2 張卡片傳 `priority`。

**Acceptance criteria:**

- [ ] 前 2 張卡片的 `<img>` 有 `fetchpriority="high"`，而且不是 `loading="lazy"`；其他卡片維持 lazy
- [ ] 首頁等其他使用 StoreCard 的地方行為不變

**Verification:**

- [ ] 本機 `/store-list` 效能追蹤：LCP 圖片的 LCPDiscovery 檢查通過（SPEC #T10）

**Dependencies:** Task 8

**Files likely touched:**

- `components/refactored/StoreCard.tsx`
- `app/(new)/store-list/_components/ResultsArea.tsx`

**Estimated scope:** XS

### Checkpoint B: `store-list-payload` 完成

- [ ] 本機 `npm run seo:audit -- --skip h1` 0 個失敗
- [ ] prettier、eslint、build 通過
- [ ] 和你 review；通過後 commit、開 PR 2

---

## Phase 3: `headings-a11y`（PR 3，不依賴其他模組，可以和 Phase 1、2 並行）

### Task 11: 店家頁與 `/store-list` 的 h1

**Description:** `StoreTitleRow` 的店名和 `Breadcrumbs` 的標題從 `<h2>` 改成 `<h1>`。樣式都在 CSS module 的 class 上，預期外觀不變。

**Acceptance criteria:**

- [ ] 店家頁與 `/store-list` 都恰好有 1 個 h1
- [ ] 390px 和 1280px 的截圖和改前相同

**Verification:**

- [ ] 本機 `seo:audit -- --skip status`：店家頁與 `/store-list` 的 h1 檢查通過（SPEC #T11）
- [ ] 改前改後截圖比對（SPEC #T13）

**Dependencies:** None

**Files likely touched:**

- `app/(new)/store/[storeId]/_components/StoreTitleRow.tsx`
- `app/(new)/store-list/_components/Breadcrumbs.tsx`

**Estimated scope:** XS

### Task 12: 對比度 token、深色區塊 accent、「04」標籤

**Description:** 依照 [`docs/contrast-before-after.html`](../docs/contrast-before-after.html) 的 diff 修改 `globals.css` 的 token、`HowItWorks.module.css`，以及 `SectionTitle.module.css` 的 `&.numDark`。

**Acceptance criteria:**

- [ ] 首頁、店家頁、`/store-list`、`/faq`、`/store-guide` 對比度掃描 0 處不足（SPEC #T12）
- [ ] `/store-guide` 深色區塊的「04」看得到
- [ ] `app/icon.svg` 維持原色

**Verification:**

- [ ] 本機用 Chrome DevTools 執行對比度掃描片段，5 頁都是 0
- [ ] 截圖和對照頁的「改後」一致

**Dependencies:** None

**Files likely touched:**

- `app/globals.css`
- `app/(new)/_components/HowItWorks.module.css`
- `components/refactored/SectionTitle.module.css`

**Estimated scope:** S

### Task 13: `<main>`、nav `<li>`、heading 層級

**Description:** 首頁與 `/faq` 的外框改用 `<main>`；`SiteNav` 手機版 `<ul>` 內的 `<a>` 外面包 `<li>`；HowItWorks、WhyUs 的 `<h5>` 改成 `<h3>`，SiteFooter 的 `<h6>` 改成符合層級的標籤，並用 CSS module 保持原本字級。

**Acceptance criteria:**

- [ ] Lighthouse（手機）無障礙：首頁、店家頁、`/faq` 都 ≥ 95，而且 heading-order、landmark-one-main、list 三項通過（SPEC #T14）
- [ ] 390px 和 1280px 截圖：排版與字級不變（SPEC #T13）

**Verification:**

- [ ] 本機跑 Lighthouse（Chrome DevTools MCP）
- [ ] 改前改後截圖比對

**Dependencies:** None

**Files likely touched:**

- `app/(new)/page.tsx`
- `app/(new)/faq/page.tsx`
- `app/(new)/_components/SiteNav.tsx`
- `app/(new)/_components/HowItWorks.tsx`、`WhyUs.tsx`、`SiteFooter.tsx`（及對應的 `.module.css`，只在字級需要時修改）

**Estimated scope:** M（超過 5 個檔案時拆成「landmark + nav」和「heading 層級」兩個任務）

### Checkpoint C: `headings-a11y` 完成

- [ ] SPEC #T11–#T14 通過
- [ ] prettier、eslint、build 通過
- [ ] 和你 review；通過後 commit、開 PR 3

---

## Phase 4: `stable-image-urls`（PR 4，PR 2 合併後從 main 開分支）

### Task 14: 唯讀抽查沒有下載 token 的物件（gate）

**Description:** 寫一個唯讀腳本，列出 `COLLECTIONS.STORE` 底下的物件，用 `getMetadata()` 統計沒有 `firebaseStorageDownloadTokens` 的數量與代表路徑。這個腳本不寫入任何資料。

**Acceptance criteria:**

- [ ] 回報總數、沒有 token 的數量與比例、最多 10 筆代表路徑（SPEC #T15）
- [ ] 腳本只呼叫 list 與 getMetadata
- [ ] 比例超過 10% 時停下來，由你決定是否補 token（補 token 是寫入正式資料，屬於「先詢問」）

**Verification:**

- [ ] 結果貼給你確認後，才開始 Task 15

**Dependencies:** Checkpoint B

**Files likely touched:**

- `scripts/check-download-tokens.mjs`（可以不 commit）

**Estimated scope:** XS

### Task 15: `getImageByPath` 改用下載網址，加上快取與退回機制

**Description:** 改用 `firebase-admin/storage` 的 `getDownloadURL()`；成功的網址放進模組層級的 `Map` 快取（TTL 10 分鐘）；`storage/no-download-token` 或其他錯誤時，退回 7 天簽名網址並記 `console.warn`。維持 async 簽名，呼叫端都不用改。

**Acceptance criteria:**

- [ ] 店家頁的 og:image、JSON-LD image、`<img src>` 都是 `firebasestorage.googleapis.com/…&token=`，連續請求兩次完全相同（SPEC #T16）
- [ ] Task 14 回報的沒有 token 的物件仍然正常顯示（簽名網址）
- [ ] 簽名網址不進快取

**Verification:**

- [ ] 本機 curl 店家頁兩次並比對圖片網址
- [ ] 開一筆沒有 token 的店家頁，確認圖片正常顯示，server log 有 warn

**Dependencies:** Task 14

**Files likely touched:**

- `firebase/serverUtils/image.ts`

**Estimated scope:** S

### Task 16: 公開列表只解析封面圖

**Description:** `resolveStoreImages(stores, { coverOnly })`；`getStores` 新增 `coverOnly` 選項，`/store-list` 傳入 true；`getHighlightedStores`、`getEmergencyStores`、`getSoldStores` 改成 coverOnly。admin 和 `getStoreById` 維持解析全部圖片。

**Acceptance criteria:**

- [ ] `/store-list` 與首頁的 HTML 每間店只有 1 個圖片網址
- [ ] `/store-list` 的 TTFB ≤ Task 8 基準值的 110%（SPEC #T17）
- [ ] 首頁、`/store-list`、店家頁、admin 列表的圖片全部正常顯示

**Verification:**

- [ ] `next start` 量 3 次 TTFB 取中位數
- [ ] 逐頁目視檢查圖片

**Dependencies:** Task 15

**Files likely touched:**

- `firebase/serverUtils/store.ts`
- `app/(new)/store-list/page.tsx`

**Estimated scope:** S

### Checkpoint D: 全部完成

- [ ] 本機 `npm run seo:audit`（不帶 `--skip`）0 個失敗
- [ ] prettier、eslint、build 通過
- [ ] 和你 review；通過後 commit、開 PR 4
- [ ] 全部上線後：對正式站跑 `seo:audit` 與 Lighthouse（SPEC Success Criteria）
- [ ] 上線約 4 週後：回到 Search Console 確認 sitemap 狀態、blog 與 `/faq` 的索引、產品摘要無效項目為 0
