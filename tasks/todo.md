# Tasks: 數位資產頂讓

Spec: [`SPEC.md`](../SPEC.md) · Plan: [`tasks/plan.md`](plan.md)

每個 task 完成時都要：prettier 改過的檔案、lint 0 錯誤、`npm run build` 通過。下面的「驗證」只列這個 task 額外要做的事。本機驗證前先確認 `NEXT_PUBLIC_ENV_VERSION=dev`。

**Prerequisite（你）**：rules 測試需要 Java 21（`brew install openjdk@21`），PR #90 已經寫在 CLAUDE.md。

---

## PR 1 — 資料模型與後台

### Task 1: 合併 main、index 改由 repo 管理、commit spec 和 plan

**說明**：這個分支是在 PR #90（Firestore／Storage rules）合併前切出來的。先 commit `SPEC.md`、`tasks/plan.md`、`tasks/todo.md`，再用 `sync_with_base_branch` 合併 `main`。衝突的 `SPEC.md`、`tasks/*` 保留這個分支的版本。

接著把 index 改成在 repo 管理：`firestore.indexes.json` 已經從正式專案匯出（14 個現有的 index），並加上數位資產的 2 個。`firebase.json` 指向這個檔案；CLAUDE.md 改掉「Indexes stay console-managed」，換成新的規則和部署指令。

**Acceptance criteria**：

- [ ] 分支包含 `firestore.rules`、`storage.rules`、`tests/rules/`、新版 CLAUDE.md
- [ ] `SPEC.md`、`tasks/*` 是數位資產的版本
- [ ] `firebase.json` 的 `firestore` 有 `"indexes": "firestore.indexes.json"`
- [ ] CLAUDE.md：index 由 `firestore.indexes.json` 管理、部署指令包含 `firestore:indexes`、不要加 `--force`、新的複合查詢要在同一個 PR 加 index

**驗證**：

- [ ] `npm run test:rules` 全過（確認 emulator 能跑）
- [ ] 你執行 `npx firebase deploy --only firestore:indexes --project bezold`（不加 `--force`）：CLI 只新增 2 個數位資產 index，沒有要刪除任何 index；如果問要不要刪除，回答 No 並告訴我
- [ ] console 上 2 個新 index 的狀態變成「已啟用」
- [ ] `npm run build` 通過

**Dependencies**：None
**Files**：`SPEC.md`、`tasks/plan.md`、`tasks/todo.md`、`firestore.indexes.json`、`firebase.json`、`CLAUDE.md`
**Scope**：S

### Task 2: 型別、常數、價格區間與卡片轉換

**說明**：建立數位資產的資料形狀和純函式，還沒有任何頁面使用。

**Acceptance criteria**：

- [ ] `Store`／`StoreDoc` 有 spec 列的 7 個 optional 欄位；`LISTING_TYPE`、`DIGITAL_ASSET_TYPE` 和型別 export 自 `types/`
- [ ] `constant/digitalAsset.ts` 有類型標籤（8 種，順序同 prototype）、`REVENUE_DISCLAIMER`、交易說明文案、勿提供密碼警語、截圖說明
- [ ] `utils/store.ts` 有 `isDigitalAsset()`、`formatPriceRange()`、`digitalAssetToCard()`、`toCard()`；`omitSellerContact()` 會把 `assetUrl` 清成 `""`、`verificationImages` 清成 `[]`（實體店面也照清，沒有就不加）
- [ ] `StoreCard` 的 `SPEC_ICONS` 加 `clock`、`trendingUp`

**驗證**：

- [ ] 用 scratchpad 的小腳本跑 `formatPriceRange`（用 repo 裡已有的 `jiti`，設定 `@/` alias；不另外裝套件）：`(500000, 1000000)` → `NT$ 50–100 萬`；`(8000, 12000)` → 跨單位格式；`(0, 0, true)` → 面議；`(300000, 0)` → 單一金額
- [ ] `omitSellerContact` 對有 `assetUrl`／`verificationImages` 的物件回傳空值

**Dependencies**：Task 1
**Files**：`types/DigitalAsset.ts`、`types/Store.ts`、`types/index.ts`、`constant/digitalAsset.ts`、`utils/store.ts`、`components/refactored/StoreCard.tsx`
**Scope**：M

### Task 3: 實體查詢排除數位、`getDigitalAssets()`、改用 `toCard()`

**說明**：讓數位資產進資料庫後不會出現在任何實體店面的地方，並準備好數位資產自己的查詢。

**Acceptance criteria**：

- [ ] `getStores`、`getHighlightedStores`、`getEmergencyStores`、`getSoldStores` 在 slice 之前排除數位資產
- [ ] `getDigitalAssets({ statuses, limit, coverOnly })` 存在：`listingType` 和 `status`（單一用 `==`、多個用 `in`）都在查詢裡，依 `createTime` 由新到舊，有 `limit` 時套用；圖片網址在 limit 之後才產生
- [ ] 查詢失敗時 `console.error` 並回傳 `[]`
- [ ] `FeaturedListings`、`ResultsArea` 改呼叫 `toCard()`
- [ ] `GET /api/stores/[storeId]/contact` 遇到數位資產回空值
- [ ] grep 所有讀取 `COLLECTIONS.STORE` 的地方（sitemap、highlight API、analytics 等），逐一確認是否需要排除，結果寫在 PR 描述

**驗證**：

- [ ] 用 scratchpad 腳本呼叫 `getDigitalAssets({ statuses: ["approved"], limit: 2 })`：只回傳 approved、最多 2 筆、由新到舊；`statuses: ["approved", "sold"]` 也成功（確認 `in` 用的是同一個 index）
- [ ] 查詢失敗時回傳 `[]`、有錯誤 log、不會丟出例外（暫時把查詢改成沒有 index 的組合來觸發，驗證完改回來）
- [ ] 用 Admin SDK 在 `mockStore` 手動放一筆 `listingType: "digital"`、tags 含 RECOMMENDED／EMERGENCY 的文件 → 首頁 01／02／03、`/store-list` 都不出現（T2）
- [ ] 實體店面的數量和順序跟改之前一樣

**Dependencies**：Task 2
**Files**：`firebase/serverUtils/store.ts`、`app/(new)/_components/FeaturedListings.tsx`、`app/(new)/store-list/_components/ResultsArea.tsx`、`app/api/stores/[storeId]/contact/route.ts`
**Scope**：M

### Task 4: 後台建立／編輯表單支援數位資產

**說明**：管理員能建立和編輯數位資產。表單的數位欄位做成後台共用的元件，給建立頁和編輯頁一起用。

**Acceptance criteria**：

- [ ] 建立頁有「實體店面／數位資產」切換；選數位時隱藏地點、坪數、租金、設備、行業，顯示類型（多選）、經營時間、平均月營收、價格上限、資產連結
- [ ] 編輯頁依文件的 `listingType` 顯示對應欄位，沒有切換
- [ ] 寫入的文件沒有 `undefined`；數位資產的地點類字串欄位是 `""`

**驗證**：

- [ ] T1：建立一筆數位資產，Firestore 文件欄位正確
- [ ] T3：編輯價格和類型，存檔後正確
- [ ] 建立和編輯一筆實體店面，行為跟之前一樣

**Dependencies**：Task 3
**Files**：`app/admin/store/_components/DigitalAssetFields.tsx`、`app/admin/store/create/StoreBaseForm.tsx`、`app/admin/store/edit/[storeId]/page.tsx`
**Scope**：M

### Task 5: 後台列表的類型欄位與篩選、drawer 顯示數位欄位

**說明**：管理員在列表分得出實體和數位，打開 drawer 看得到數位欄位和資產連結。

**Acceptance criteria**：

- [ ] `list`、`drafts` 多一欄「類型」，可以篩選實體／數位
- [ ] 數位資產在列表的地點欄顯示類型標籤，價格欄顯示區間
- [ ] `StoreDetailDrawer` 對數位資產顯示類型、經營時間、平均月營收、價格區間、資產連結（另開分頁）

**驗證**：

- [ ] 篩選切換正確，實體店面列表沒有變化
- [ ] drawer 的資產連結可以點開

**Dependencies**：Task 4
**Files**：`app/admin/store/list/page.tsx`、`app/admin/store/drafts/page.tsx`、`app/admin/store/_components/StoreDetailDrawer.tsx`
**Scope**：M

### Task 6: 核對截圖的 storage rule、測試、上傳 helper

**說明**：建立核對截圖的儲存路徑和權限，以及上傳／刪除 helper（這一步還沒有 UI）。

**Acceptance criteria**：

- [ ] `storage.rules` 新增 `/{collectionName}/{storeId}/verification/{fileName}`，內容照 spec
- [ ] `tests/rules/storage.test.ts` 涵蓋：刊登者／管理員可上傳、讀取；未登入／其他會員不能讀；超過 5 MB、SVG 不能上傳；draft／sold 時刊登者不能上傳、刪除
- [ ] `resizeImageFile(file, { maxEdge })` 可選參數，預設行為不變
- [ ] `constant/image.ts` 有 `VERIFICATION_IMAGE_MAX_EDGE = 2400`、`VERIFICATION_IMAGE_MAX_COUNT = 10`
- [ ] `uploadVerificationImageByFile()`、`deleteVerificationImage()` 寫入或移除 `verificationImages`，不碰 `images`

**驗證**：

- [ ] `npm run test:rules` 全過（T5）
- [ ] 一般照片上傳結果跟之前一樣（最長邊 1600）

**Dependencies**：Task 2
**Files**：`storage.rules`、`tests/rules/storage.test.ts`、`constant/image.ts`、`utils/image.ts`、`firebase/clientUtils/image.ts`
**Scope**：M

### Task 7: 後台核對截圖的上傳與檢視

**說明**：管理員在後台圖片頁上傳／刪除核對截圖，在 drawer 放大檢視。

**Acceptance criteria**：

- [ ] 後台圖片頁對數位資產多一個「核對截圖」區塊，可以上傳、刪除，達到 10 張時不能再上傳
- [ ] drawer 用 `Image.PreviewGroup` 顯示截圖，可放大、左右切換；沒有截圖時顯示「賣家還沒上傳核對截圖」警告，審核按鈕照常可用

**驗證**：

- [ ] 你部署 storage rules（`npx firebase deploy --only firestore:rules,firestore:indexes,storage --project bezold`，不加 `--force`）
- [ ] T4：上傳 1170×2532 的手機長截圖 → 存在 `verification/`、最長邊 2400、數字清楚；刪除後檔案和路徑都消失

**Dependencies**：Task 5、Task 6
**Files**：`app/admin/store/edit/[storeId]/image/page.tsx`、`app/admin/store/_components/StoreDetailDrawer.tsx`
**Scope**：S

### Checkpoint: PR 1

- [ ] lint、build、`npm run test:rules` 全過
- [ ] `mockStore` 有 2–3 筆數位資產（不同類型、有區間和單一價格、有截圖、一筆 sold）
- [ ] 你 review → commit → 開 PR

---

## PR 2 — 詳細頁與詢問

### Task 8: 詳細頁上半部

**說明**：`/store/[storeId]` 對數位資產顯示數位版本的麵包屑、標題列、資訊列，並調整 metadata 和 JSON-LD。

**Acceptance criteria**：

- [ ] `SiteNav activeLink="數位資產"`；麵包屑「首頁 / 數位資產 / 名稱」
- [ ] 標題列有類型 Pill、「詳細資料需申請」Pill、副標「DIGITAL ASSET」
- [ ] `DigitalStatsBar`：經營時間｜平均月營收＋`REVENUE_DISCLAIMER`｜頂讓金額；沒填顯示「—」
- [ ] title「名稱｜數位資產頂讓」；有區間時 JSON-LD 用 `AggregateOffer`

**驗證**：

- [ ] T7：Rich Results Test 沒有錯誤（用本機 HTML 貼進去）
- [ ] 實體店面詳細頁跟之前一樣

**Dependencies**：PR 1
**Files**：`app/(new)/store/[storeId]/page.tsx`、`_components/StoreBreadcrumb.tsx`、`_components/StoreTitleRow.tsx`、`_components/DigitalStatsBar.tsx`（+ module.css）
**Scope**：M

### Task 9: 匿名持有人卡與交易說明

**說明**：數位資產用 `DigitalHolderCard` 取代 `StorePriceCard`，下方加 `DigitalTransferNotes`。詢問按鈕先放一個不能按的佔位，Task 11 再換掉。

**Acceptance criteria**：

- [ ] 持有人卡：匿名頭像、「數位資產持有人」、說明文字、頂讓金額、提醒框；沒有任何 `userInfo` 和 `SellerContactGate`
- [ ] 交易說明的固定文案照 spec
- [ ] 已售出的數位資產顯示「已頂讓」

**驗證**：

- [ ] T6：頁面原始碼和 RSC payload 搜不到 `assetUrl` 的值、`verification/`、賣家電話／email
- [ ] 桌機和手機寬度版面正常

**Dependencies**：Task 8
**Files**：`app/(new)/store/[storeId]/page.tsx`、`_components/DigitalHolderCard.tsx`（+ css）、`_components/DigitalTransferNotes.tsx`（+ css）
**Scope**：M

### Task 10: 詢問的資料層與會員 API

**說明**：inquiries 集合、讀寫函式、`GET`／`POST /api/stores/[storeId]/inquiry`，以及確認 client 被擋住的 rules 測試。

**Acceptance criteria**：

- [ ] `types/Inquiry.ts`、`COLLECTIONS.INQUIRY`、`firebase/serverUtils/inquiry.ts`
- [ ] POST：數位且 approved 才收；文件 id `${storeId}_${uid}`；已存在時回 `alreadySubmitted`、不覆寫；訊息超過 500 字回 400
- [ ] `tests/rules/firestore.test.ts`：會員、刊登者、管理員用 client SDK 讀寫 `mockInquiry` 都失敗

**驗證**：

- [ ] T9：用 curl（帶 dev 帳號的 ID token）POST 兩次 → 第二次 `alreadySubmitted`、文件不變；對實體店面、pending 資產 → 400／404；沒有 token → 401
- [ ] T11：`npm run test:rules` 全過

**Dependencies**：PR 1
**Files**：`types/Inquiry.ts`、`types/index.ts`、`firebase/constants.ts`、`firebase/serverUtils/inquiry.ts`、`app/api/stores/[storeId]/inquiry/route.ts`、`tests/rules/firestore.test.ts`
**Scope**：M

### Task 11: 詳細頁的詢問 CTA 與 GA4

**說明**：`InquiryCta` 取代 Task 9 的佔位按鈕，處理未登入、可送出、已送過、失敗四種狀態。

**Acceptance criteria**：

- [ ] 未登入或 email 未驗證 → 開啟 `BuyerClubPopup`，source 是 `digital_inquiry`
- [ ] 會員 → 展開訊息欄（選填）→ 送出 → 已送出；重新整理後仍是已送出（GET）
- [ ] GA4 `digital_inquiry_click`、`digital_inquiry_submit`；`docs/analytics-events.md` 更新

**驗證**：

- [ ] T8：完整流程走一次，`mockInquiry` 出現文件
- [ ] 送出失敗（關掉網路）時留在表單、顯示錯誤、可重試

**Dependencies**：Task 9、Task 10
**Files**：`_components/InquiryCta.tsx`（+ css）、`_components/DigitalHolderCard.tsx`、`atoms/BuyerClubAtom.ts`、`docs/analytics-events.md`
**Scope**：M

### Task 12: 買家俱樂部的數位資產偏好

**說明**：買家俱樂部的類型多一個「數位資產」，選了之後地區選填；從詢問按鈕打開時預選。

**Acceptance criteria**：

- [ ] `BUYER_CLUB_CATEGORIES` 在 `constant/buyerClub.ts`；`STORE_CATEGORIES` 沒有改
- [ ] popup 選數位資產時地區選填（寫 `""`）；source 是 `digital_inquiry` 時預選數位資產，註冊 source 保留 `digital_inquiry`
- [ ] 後台買家偏好頁顯示「數位資產」；`BuyerProfile.city` 註解更新

**驗證**：

- [ ] T13：用新帳號從詢問按鈕註冊，使用者文件和後台顯示都正確
- [ ] 用實體類型註冊：地區照舊必填，source 照舊

**Dependencies**：Task 11
**Files**：`constant/buyerClub.ts`、`app/(new)/store/[storeId]/_components/BuyerClubPopup.tsx`、`app/admin/buyer-profiles/page.tsx`、`types/User.ts`
**Scope**：M

### Task 13: 後台「詢問」頁

**說明**：管理員列出詢問、更新狀態。

**Acceptance criteria**：

- [ ] `GET /api/admin/inquiries`、`PATCH /api/admin/inquiries/[inquiryId]`（只改 `status`、`updateTime`），都用 `verifyAdminToken`
- [ ] `/admin/inquiries`：表格欄位照 spec；預設只顯示 `new` + `contacted`，可切換全部；改狀態立即 PATCH
- [ ] `AdminSidebar` 有「詢問」入口

**驗證**：

- [ ] T10：看得到 Task 11 送出的詢問，改狀態後重新整理仍保持；一般會員打這兩個 API → 401／403

**Dependencies**：Task 10
**Files**：`app/api/admin/inquiries/route.ts`、`app/api/admin/inquiries/[inquiryId]/route.ts`、`app/admin/inquiries/page.tsx`、`components/AdminSidebar.tsx`
**Scope**：M

### Task 14: 側欄未處理詢問數量

**說明**：側欄「詢問」旁邊顯示 `new` 的數量。

**Acceptance criteria**：

- [ ] `GET /api/admin/inquiries/count` → `{ new }`，用 `count()` aggregation
- [ ] `newInquiryCountAtom`；側欄進後台和切換頁面時抓一次，0 不顯示
- [ ] 詢問頁改狀態時直接加減 atom

**驗證**：

- [ ] T12：改成 `contacted` 數字立刻減 1；全部處理完數字消失；再送一筆後切換頁面數字出現

**Dependencies**：Task 13
**Files**：`app/api/admin/inquiries/count/route.ts`、`atoms/InquiryAtom.ts`、`components/AdminSidebar.tsx`、`app/admin/inquiries/page.tsx`
**Scope**：S

### Checkpoint: PR 2

- [ ] lint、build、`npm run test:rules` 全過
- [ ] 完整走過：未登入點詢問 → 加入買家俱樂部 → 驗證 email → 送出詢問 → 後台看到、改狀態、側欄數字變化
- [ ] 你 review → commit → 開 PR

---

## PR 3 — 瀏覽入口

### Task 15: 首頁「04 數位資產頂讓」區塊

**說明**：首頁加數位資產區塊，後面的區塊編號往後一號。

**Acceptance criteria**：

- [x] `SectionTitle` 04、`NEW` Pill、副標、「看全部數位資產 →」
- [x] 讀最新 30 筆 approved（`limit: 30`）；類型分頁在 client 端篩選、不改網址，每個分頁最多 6 張
- [x] 分頁沒資料時顯示「這個類型目前沒有最新刊登」＋「到列表頁看看 →」（`/digital-assets?type=<類型>`）；完全沒資料時顯示整區空狀態
- [x] 底部「我也有數位資產想刊登 ↗」（`/sell?type=digital`）和警語
- [x] Categories 05、Districts 06、BrowseAll 07、HowItWorks 08、WhyUs 09、Faq 10（`Stories` 沒有掛載，不改）
- [x] `getDigitalAssets()` 出錯時區塊顯示空狀態，首頁不會壞

**驗證**：

- [x] T14：分頁切換、空狀態、編號都正確；手機寬度分頁可以橫向捲動或換行，不撐破版面

**Dependencies**：PR 2
**Files**：`app/(new)/_components/DigitalAssets/index.tsx`、`DigitalAssets/TypeTabs.tsx`、`DigitalAssets/DigitalAssets.module.css`、`app/(new)/page.tsx`、6 個區塊元件的 `num`（每個只改一個字串）
**Scope**：M（檔案多，但編號是機械式修改）

### Task 16: `/digital-assets` 列表頁

**說明**：專屬列表頁，網址參數決定類型。

**Acceptance criteria**：

- [x] 頁面殼照 CLAUDE.md；`?type=` 是唯一的篩選來源，分頁用 `router.push`；不認得的 type 當全部
- [x] `getDigitalAssets({ statuses: ["approved", "sold"] })`，不設 limit，類型在記憶體裡篩選；approved 在前、sold 在後（sold ribbon）
- [x] metadata、canonical；`sitemap.ts` 加這一頁

**驗證**：

- [x] T15：`?type=SOCIAL` 只顯示社群；切換分頁網址跟著變；重新整理保留；`?type=xyz` 當全部

**Dependencies**：Task 15（共用 TypeTabs 的樣式）
**Files**：`app/(new)/digital-assets/page.tsx`、`digital-assets/_components/DigitalAssetResults.tsx`（+ css）、`app/sitemap.ts`
**Scope**：M

### Task 17: 導覽列「數位資產」

**說明**：`navLinks` 在「我要找店」後面加「數位資產」。

**Acceptance criteria**：

- [x] 列表頁和數位詳細頁「數位資產」亮起；實體詳細頁仍是「我要找店」
- [x] 375px 手機選單 6 個連結都放得下

**驗證**：

- [x] T16：桌機、平板、手機三種寬度截圖確認

**Dependencies**：Task 16
**Files**：`app/(new)/_components/SiteNav.tsx`（必要時加它的樣式）
**Scope**：XS

### Checkpoint: PR 3

- [x] lint、build 全過
- [ ] 首頁 → 列表頁 → 詳細頁 → 詢問整條路都通，桌機和手機都檢查
- [ ] 你 review → commit → 開 PR

---

## PR 4 — 賣家刊登

### Task 18: firestore rules 開放賣家寫入數位欄位

**說明**：先改 rules 和測試，後面的 UI 才有權限寫入。

**Acceptance criteria**：

- [x] `sellFormKeys()`、`isNewSellerListing()`、`ownerEditableKeys()` 照 spec 修改；`listingType` 不在 owner 可編輯欄位裡
- [x] `tests/rules/stores.test.ts` 涵蓋 spec 列的 5 組情境

**驗證**：

- [x] T17：`npm run test:rules` 全過（含既有測試）

**Dependencies**：PR 3
**Files**：`firestore.rules`、`tests/rules/stores.test.ts`（必要時 `tests/rules/helpers.ts`）
**Scope**：S

### Task 19: 共用表單的數位欄位與驗證

**說明**：`/sell` 和 `/my-listings` 共用的表單層加上數位欄位和驗證，這一步還沒接到頁面。

**Acceptance criteria**：

- [ ] `StoreFields` 加 `listingType` 和數位欄位；`emptyStoreFields(listingType)`
- [ ] `validateStoreForm()` 依類型分支，規則照 spec；實體分支行為不變
- [ ] `DigitalFieldsSection`：類型多選 Pill、經營時間、平均月營收、價格下限／上限、資產連結＋說明、勿提供密碼警語

**驗證**：

- [ ] 用 scratchpad 腳本（同 Task 2 的 `jiti` 方式）跑 `validateStoreForm` 的數位情境：缺連結、非 http(s)、上限 < 下限、沒選類型都回錯誤；完整資料通過

**Dependencies**：Task 18
**Files**：`components/storeForm/formTypes.ts`、`components/storeForm/DigitalFieldsSection.tsx`、`components/storeForm/storeForm.module.css`
**Scope**：M

### Task 20: `/sell` 的類型切換與核對截圖步驟

**說明**：賣家在 `/sell` 刊登數位資產，建立後的上傳畫面多一個核對截圖區塊，至少 1 張才能完成。

**Acceptance criteria**：

- [ ] 表單最上方有類型切換；`?type=digital` 預選；送出的 payload 只有 rules 允許的欄位
- [ ] `VerificationImageUpload`：說明文字照 spec、最多 10 張、可刪除
- [ ] 數位資產的上傳畫面：照片可略過，截圖 0 張時「完成刊登」不能按，也沒有「略過」
- [ ] 實體店面的 `/sell` 跟之前一樣

**驗證**：

- [ ] T18：一般帳號刊登數位資產，驗證錯誤都擋下；成功後 `pending`，照片在 `images`、截圖在 `verificationImages`
- [ ] T19：另一個一般帳號拿截圖路徑 `getDownloadURL` → permission-denied

**Dependencies**：Task 19
**Files**：`app/(new)/sell/_components/SellForm.tsx`、`app/(new)/sell/_components/StoreImageUpload.tsx`（加 `doneDisabled` 之類的 prop）、`components/storeForm/VerificationImageUpload.tsx`（+ css）、`app/(new)/sell/page.tsx`（`useSearchParams` 需要 Suspense 時）
**Scope**：M

### Task 21: `/my-listings` 的數位刊登卡片與編輯

**說明**：賣家在我的刊登看到數位刊登、補截圖、編輯欄位。

**Acceptance criteria**：

- [ ] `ListingCard` 用 `toCard()`；數位刊登沒有截圖時顯示「請補上核對截圖」
- [ ] `EditListingForm` 依類型顯示數位欄位和 `VerificationImageUpload`，沒有類型切換
- [ ] 已上架的刊登改欄位、新增或刪除截圖 → 回到 `pending`（跟照片一樣）

**驗證**：

- [ ] T20：刪光截圖後卡片出現提示；補上後已上架刊登回到 `pending`；欄位編輯存檔正確
- [ ] T21：實體店面的 `/sell`、`/my-listings`、詳細頁、`SellerContactGate`、照片上傳回歸檢查

**Dependencies**：Task 20
**Files**：`app/(new)/my-listings/_components/ListingCard.tsx`、`app/(new)/my-listings/edit/[storeId]/_components/EditListingForm.tsx`
**Scope**：M

### Checkpoint: 完成

- [ ] lint、build、`npm run test:rules` 全過（T22）
- [ ] spec 的 T1–T22 全部走過一次
- [ ] 你部署 firestore rules
- [ ] 你 review → commit → 開 PR
