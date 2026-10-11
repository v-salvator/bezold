# Spec: 草稿商店（`draft` 狀態）

## Objective

新增商店狀態 `draft`。管理員可以先把蒐集到一半的店面存成草稿，資料補齊後再送審；也可以把 Store List 裡任何一間店轉回草稿重新整理。草稿只有管理員看得到管理介面，不會出現在前台列表。

**使用者**：Bezold 管理員（`/admin`，Firebase custom claims 驗證）。賣家只會在「我的刊登」看到自己的店被轉成草稿後的狀態。

**草稿頁面的用途**：管理員會把草稿的前台網址 `/store/{id}` 給賣家看，請賣家確認內容後再送審。所以草稿頁面要能用網址開啟，外觀和一般店面頁完全相同（包含「免費加入會員後顯示」的聯絡鎖頭），但任何人都拿不到賣家聯絡方式。

**為什麼**：管理員常常是陸續拿到店家資料（圖片、月租、聯絡方式），現在只能等全部到齊才建立，或先建立成 `pending` 混在審核佇列裡。草稿讓「還在整理」和「等待審核」分開。

UI 參考：[`mockups/admin-draft-stores.html`](mockups/admin-draft-stores.html)（方案 A ＋「所有方案共通：轉為草稿」區塊）。

### 已確定的決策

| 項目                 | 決定                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 誰能建立草稿         | 只有管理員                                                                                                                  |
| 草稿列表位置         | **方案 A**：獨立頁面 `/admin/store/drafts`，側邊欄新增「Draft Stores」（不顯示數量）                                        |
| 主 Store List        | 不顯示草稿，狀態篩選也沒有「草稿」選項                                                                                      |
| 草稿發布後的狀態     | **一律 `pending`**（送審），走一般審核流程                                                                                  |
| 轉為草稿             | Store List 裡**任何狀態**的店都可以轉為草稿（單筆或批次）                                                                   |
| 再次送審是否還原原狀 | 不還原。草稿送審一律變 `pending`，不記錄轉換前的狀態                                                                        |
| 賣家看到什麼         | 「我的刊登」顯示徽章「整理中」，不提供編輯和標記已頂讓                                                                      |
| 前台 `/store/[id]`   | 知道網址仍可開啟草稿頁面（給賣家確認用），**外觀比照一般店面頁**（未登入顯示註冊解鎖）；但 contact API 對草稿不回傳聯絡方式 |
| Firestore Rules      | 這次不改，之後另外加上「草稿只有管理員能寫」                                                                                |

### User stories 與驗收條件

1. **新增狀態**：`STORE_STATUS.DRAFT = "draft"`。管理後台標籤為紫色虛線「草稿」，賣家端徽章為「整理中」。所有以 `StoreStatus` 為 key 的對照表都要有 draft 的值（型別檢查會強制）。
2. **儲存草稿**：`/admin/store/create` 底部按鈕變成「Cancel ／ 儲存草稿 ／ Create」。
   - 「儲存草稿」不檢查必填欄位，可以全部空白；建立 user 文件與 store 文件，`status: "draft"`，空的字串欄位寫入 `""`（不寫 `undefined`）。
   - 成功後導向 `/admin/store/edit/{storeId}/image`，與 Create 相同。
   - 「Create」維持現在的行為（檢查必填、建立為 `pending`）。
3. **草稿列表頁** `/admin/store/drafts`：
   - 只列出 `status === "draft"` 的店，預設依建立時間新到舊排序（`createTime` desc，與 `getStores()` 的查詢順序相同）。
   - 欄位：勾選、店名（空白顯示「（未命名）」）、完成度（進度條＋百分比）、城市／區域、頂讓金、建立、最後編輯、操作（編輯、送審）。
   - 可依店名搜尋。
   - 點「編輯」前往現有的 `/admin/store/edit/{storeId}`。
   - 右上角「＋ 新增草稿」前往 `/admin/store/create`。
4. **完成度**：檢查清單共 9 項。
   - **必填（擋送審）**：店名、地址 `location`、描述、賣家姓名 `userName`、賣家電話 `phone`。與現有 Create 的必填一致。
   - **建議（只顯示）**：城市、區域、類別、至少一張圖片。
   - 完成度 ＝ 已填項目 ÷ 9。列表不另外顯示缺少哪些欄位。
5. **送審**：
   - 單筆：必填全部填好時「送審」按鈕可按，按下後 `status → pending`，該列從草稿頁消失，成功訊息「已送審」。必填未齊時按鈕停用，滑過顯示缺少哪些欄位。
   - 批次：勾選後出現「送審」「刪除」「取消選取」。送審只處理必填已齊的列；其餘列保持勾選並提示「N 筆缺少必填，未送審」。
6. **刪除草稿**：沿用現有 `DELETE /api/stores/{storeId}` 與確認框，文字改為「刪除草稿」。批次刪除也要先確認一次。
7. **轉為草稿（Store List）**：
   - `StoreDetailDrawer` 新增「↩ 轉為草稿」按鈕；批次操作列新增「↩ 轉為草稿」。
   - 轉換前一律跳確認框。若選取的店包含已上架或已頂讓（前台看得到的），確認文字說明「會從前台列表下架」。
   - 只改 `status` 和 `updateTime`，資料、圖片、瀏覽數全部保留。
   - 成功後該店從 Store List 消失、出現在 Draft Stores。
8. **側邊欄**：「Store List」下方新增「Draft Stores」，不顯示草稿數量。
9. **賣家端**：
   - `StatusBadge` 新增 draft →「整理中」，使用新的中性樣式。
   - `ListingCard` 對草稿不顯示「編輯」和「標記已頂讓」（現有 `canEdit` 判斷已排除，需確認）。
   - `EditListingForm` 遇到 draft 時導回 `/my-listings`（比照 rejected）。
10. **其他管理頁**：Store Analytics 的狀態篩選不加入 draft；`STATUS_LABEL`／`STATUS_COLOR` 加入 draft 以通過型別檢查。
11. **草稿頁面外觀照常，但不洩漏聯絡方式**：
    - `GET /api/stores/{storeId}/contact` 對 draft 回傳空的聯絡資料，和已頂讓相同（伺服器端擋，這是唯一的讀取路徑）。
    - 前台元件**不改**：未登入時顯示模糊的聯絡資訊＋「免費加入會員後顯示」鎖頭與上鎖的 CTA 按鈕，和一般已上架店面一樣。未驗證信箱的會員看到「驗證信箱後顯示」。
    - 已登入且已驗證的會員因為 API 回空值，會看到現有的「賣家尚未提供聯絡方式」，不顯示聯絡按鈕。
    - 其他內容（價格、急售標籤、圖片、描述）照常顯示，讓賣家看到的畫面就是正式上架後的樣子。
12. **草稿頁面不被搜尋引擎收錄**：`/store/[storeId]` 的 `generateMetadata` 對 draft 回傳 `robots: { index: false, follow: false }`。其他狀態的 metadata 不變；送審後（`pending` 以後）自動恢復可收錄。

### 不在範圍內

- 前台 `/store/[id]` 對草稿回 404（草稿要給賣家確認，網址必須能開）。
- Firestore Rules（之後另外處理）。
- 草稿直接發布為「已上架」或還原成轉換前的狀態。
- 賣家自己建立草稿（`/sell` 不變）。
- 方案 C 的「快速建立」列與卡片看板。
- 新增測試框架。

## Tech Stack

Next.js 14 App Router · TypeScript · Ant Design 5（管理後台）· Firebase client SDK（Firestore 讀寫）· CSS Modules（賣家端徽章）。不新增依賴。

## Commands

```bash
nvm use
npm run dev       # 開發伺服器（port 3000），NEXT_PUBLIC_ENV_VERSION=dev 走 mockStore
npm run lint      # ESLint
npm run build     # production build，含型別檢查
npx prettier --write <changed files>
```

## Project Structure

新增（★）與修改（✎）的檔案：

```
types/
  StoreStatus.ts                         ✎ 新增 DRAFT
constant/
  adminStore.ts                          ✎ STATUS_LABEL / STATUS_COLOR 加 draft
  storeDraft.ts                          ★ 完成度檢查清單（必填 / 建議欄位、標籤文字）
utils/
  storeDraft.ts                          ★ getDraftChecklist(store, seller) → { done, total, missingRequired, missingSuggested }
components/
  AdminSidebar.tsx                       ✎ 新增 Draft Stores 項目
app/admin/store/
  create/StoreBaseForm.tsx               ✎ 「儲存草稿」按鈕，跳過必填檢查
  list/page.tsx                          ✎ 排除 draft；批次「轉為草稿」＋確認框
  list/_components/StoreDetailDrawer.tsx ✎ 「轉為草稿」按鈕
  drafts/page.tsx                        ★ 草稿列表（表格、搜尋、批次送審／刪除）
  analytics/page.tsx                     ✎ 只在型別需要時調整
app/(new)/store/[storeId]/
  page.tsx                               ✎ generateMetadata：draft 加 noindex
app/api/stores/[storeId]/contact/
  route.ts                               ✎ draft 回空聯絡資料（比照 sold）
app/(new)/my-listings/
  _components/StatusBadge.tsx (+ .module.css)  ✎ draft →「整理中」
  _components/ListingCard.tsx            ✎ 確認草稿沒有任何操作
  edit/[storeId]/_components/EditListingForm.tsx  ✎ draft 導回 /my-listings
```

## Code Style

遵守 CLAUDE.md：Ant Design 元件用 Tailwind 排版、不和 CSS module 混用；`cn()` 組 class；變數名稱不用單字母；資料轉換放 `utils/`，靜態對照表放 `constant/`。

```ts
// constant/storeDraft.ts
export const DRAFT_REQUIRED_FIELDS = [
  { key: "storeName", label: "店名" },
  { key: "location", label: "地址" },
  { key: "description", label: "描述" },
] as const;

// utils/storeDraft.ts
export const getDraftChecklist = (store: Store, seller?: Partial<User>) => {
  const missingRequired = [
    ...DRAFT_REQUIRED_FIELDS.filter(({ key }) => !store[key]),
    ...DRAFT_REQUIRED_SELLER_FIELDS.filter(({ key }) => !seller?.[key]),
  ].map(({ label }) => label);
  // ...
  return { done, total, missingRequired, missingSuggested };
};
```

狀態更新沿用 `updateStoreStatus(storeId, STORE_STATUS.DRAFT)`，批次沿用 `Promise.allSettled`，失敗的列保持勾選（與現有 `handleBulkStatusChange` 一致）。

## Testing Strategy

這個專案**沒有測試框架**，加入測試框架屬於「先詢問」。驗證方式：

1. `npm run lint` 和 `npm run build` 都要通過。
2. 在 dev server（mock collections）用瀏覽器手動跑以下流程：

| #   | 流程                                              | 預期結果                                                                                       |
| --- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| T1  | Store Create 全部空白 → 儲存草稿                  | 建立成功，導到圖片頁；Draft Stores 出現「（未命名）」，完成度 0%                               |
| T2  | Store Create 只填必填 → Create                    | 和現在一樣建立為待審核，不出現在 Draft Stores                                                  |
| T3  | Draft Stores 必填未齊的列                         | 「送審」停用，滑過顯示缺少欄位；完成度百分比正確                                               |
| T4  | 補齊必填後送審                                    | 列消失；Store List 出現該店，狀態「待審核」                                                    |
| T5  | 批次送審（1 筆齊、1 筆未齊）                      | 齊的送審成功；未齊的保持勾選並提示                                                             |
| T6  | 刪除草稿（單筆、批次）                            | 先確認，確認後文件與圖片刪除                                                                   |
| T7  | Store List drawer 對已上架的店「轉為草稿」        | 確認框提到前台下架；確認後從 Store List 消失、出現在 Draft Stores                              |
| T8  | Store List 批次轉為草稿（待審核＋已拒絕＋已頂讓） | 全部轉為草稿；任一失敗時保持勾選並提示                                                         |
| T9  | Store List 狀態篩選、Store Analytics 狀態篩選     | 都沒有「草稿」選項，也不會列出草稿                                                             |
| T10 | 前台 `/store-list`、首頁區塊、`/sitemap.xml`      | 不出現草稿                                                                                     |
| T11 | 賣家帳號：自己的店被轉為草稿後開「我的刊登」      | 顯示「整理中」徽章，沒有編輯和標記已頂讓；直接開編輯網址會被導回 `/my-listings`                |
| T12 | 草稿送審後，賣家「我的刊登」                      | 顯示「審核中」                                                                                 |
| T13 | 未登入開草稿的 `/store/{id}`                      | 和一般店面頁相同：聯絡資訊模糊，顯示「免費加入會員後顯示」，CTA 上鎖，點擊開啟 Buyer Club 彈窗 |
| T14 | 已登入且已驗證的會員開同一個草稿頁                | 顯示「賣家尚未提供聯絡方式」，沒有聯絡按鈕；Network 裡 contact API 回空值                      |
| T15 | 用 curl 帶會員 token 呼叫草稿的 contact API       | 回傳空的 `phone` / `lineId` / `threadsId` / `email`                                            |
| T16 | 草稿送審並通過後，會員再開同一個網址              | 看得到賣家聯絡方式與聯絡按鈕                                                                   |
| T17 | 檢視草稿頁與已上架店面頁的原始碼                  | 草稿頁有 `<meta name="robots" content="noindex, nofollow">`；已上架店面頁沒有                  |

## Boundaries

- **Always**
  - 在這個 worktree 的分支上工作，做完先停下來等你 review，再 commit 和開 PR。
  - 遵守 CLAUDE.md 的樣式與 Firebase 規則（`COLLECTIONS`、`updateDoc` 不寫入 `undefined`、空字串用 `""`）。
  - 新的 UI 先看 `components/refactored/` 有沒有可以重用的元件。
  - 每次修改都跑 prettier、lint、build。
- **Ask first**
  - 新增任何 npm 依賴。
  - 修改 Firestore Rules（例如禁止賣家把自己的草稿改成別的狀態），這些由你在 Console 操作。
  - 修改前台 `/store/[id]` 或公開 API 的行為（user story 11、12 以外）。
  - 修改不在上面檔案清單裡的檔案。
- **Never**
  - commit `.env` 或任何金鑰。
  - 直接修改 `main` 或 push 到 `main`。
  - 讓草稿出現在前台列表、首頁區塊或 sitemap。
  - 讓賣家聯絡方式出現在公開 payload。

## Success Criteria

- User stories 1–12 的驗收條件全部成立，測試表 T1–T17 全部通過。
- 任何人（包含已驗證的會員）都無法從草稿頁面或 API 取得賣家聯絡方式。
- `npm run lint`、`npm run build` 沒有錯誤。
- 主 Store List 與 Draft Stores 的資料互不重疊，兩者加起來等於全部店面。
- 現有流程（Create、狀態切換、批次通過／拒絕／已頂讓、刪除、賣家標記已頂讓）行為不變。

## Open Questions

目前沒有。（Firestore Rules：之後另外處理。草稿頁 noindex：要加，見 user story 12。）
