# Spec: 數位資產頂讓

## Objective

Bezold 目前只刊登實體店面。很多人想轉手的是線上的生意：電商、FB 社團、蝦皮賣場、網站、App、SaaS、電子報等。這次讓這些「數位資產」也能在 Bezold 刊登與頂讓。

數位資產跟實體店面有四個根本差異，整個設計都圍繞這四點：

1. **沒有地點**：沒有縣市、地址、坪數、租金、設備；改看「經營時間」、「平均月營收」，以及一個**價格區間**（例：NT$ 50–100 萬）。
2. **匿名**：公開頁面不露出賣家是誰，也不露出資產本身（社團名稱、賣場網址）。買家按「我有興趣，想申請了解」送出**詢問**，由平台確認雙方後再媒合。實體店面那套「會員可看賣家電話／LINE」不適用。
3. **數字要能核對**：實體店面可以去現場看，數位資產不行。賣家刊登時必須上傳後台的營收／數據**截圖**，讓管理員核對資產是真的、數字對得上，擋掉詐騙刊登。截圖只有管理員和刊登者本人看得到。
4. **轉移風險**：帳號、社團的移轉受各平台規範限制。表單和頁面要明講：**請勿提供密碼、驗證碼或其他登入資訊**。

使用者：

- **買家**：從首頁「數位資產頂讓」區塊或 `/digital-assets` 依類型瀏覽 → 看詳細頁 → 送出詢問。
- **賣家**：在 `/sell` 選「數位資產」刊登，填資產連結、上傳核對截圖（都只有管理員看得到）→ 等審核；之後在 `/my-listings` 編輯。
- **管理員**：在後台建立／編輯數位資產；審核時對照資產連結和核對截圖；在新的「詢問」頁處理買家詢問。

Prototype（首頁區塊、詳細頁）只是參考內容與資訊架構，樣式一律用現有的 design system（`SectionTitle`、`StoreCard`、`Pill`、`Section`、`Button`、`Card`、`(new)` token）。

### 已確認的決定

| 題目           | 決定                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 資料放哪       | 同一個 Store 集合，新增 `listingType` 欄位；**沒有這個欄位 = 實體店面**，既有資料不用遷移                                                              |
| 誰能刊登       | 賣家從 `/sell` 刊登（走 pending 審核），管理員也能從後台建立                                                                                           |
| 聯絡方式       | 匿名、經平台媒合；買家送出詢問，存進新的 inquiries 集合，後台處理                                                                                      |
| 新詢問通知     | **v1 不寄 email**，管理員到後台「詢問」頁查看                                                                                                          |
| 瀏覽入口       | 首頁「04 數位資產頂讓」區塊（最新 6 筆）＋專屬列表頁 `/digital-assets`（依類型篩選）                                                                   |
| 詳細頁網址     | 沿用 `/store/[storeId]`，依 `listingType` 顯示數位版本                                                                                                 |
| 資產連結       | 必填 `assetUrl`。Firestore rules 只讓管理員和刊登者本人讀店家文件，公開頁面又經過 `omitSellerContact()`，所以買家拿不到                                |
| 核對截圖       | 賣家**必須**上傳 1–10 張後台營收／數據截圖，存在 `verification/` 子資料夾；只有管理員和刊登者本人看得到，絕不出現在公開頁面                            |
| 營收           | 數字欄位 `monthlyRevenue`，前台標示「平均月營收」；不收自由文字，金額下方顯示固定警語                                                                  |
| 導覽列         | 在「我要找店」後面加「數位資產」→ `/digital-assets`                                                                                                    |
| 截圖保留       | 成交、下架後照樣保留，刪除店家時才連同整個 `{storeId}/` 資料夾一起刪；不做自動清理                                                                     |
| 買家俱樂部     | 「想找的類型」多一個「數位資產」選項（只加在買家俱樂部，不加進實體店面的行業分類）；選數位資產時地區可以不填                                           |
| 詢問提醒       | 不寄 email；後台側欄「詢問」旁邊顯示未處理（`new`）的數量                                                                                              |
| Index 管理     | 改成跟 rules 一樣放在 repo：`firestore.indexes.json`（從正式專案匯出現有的 14 個，再加這次的 2 個），由你部署。取代 PR #90「index 留在 console」的規則 |
| 「等公開資訊」 | Prototype 的這顆按鈕 **v1 不做**：「等」的是什麼（訂閱更新？收藏？）不明確，而且只放一個 CTA 會讓「申請了解」更醒目。之後如果要做收藏功能，再一起設計  |

### Capability Map

| Module id         | 負責                                                                                                                          | 依賴                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `digital-model`   | Store 型別新欄位、類型常數、價格區間格式化、卡片轉換、實體查詢排除數位、`getDigitalAssets()`、`omitSellerContact` 擋私密欄位  | —                                 |
| `digital-admin`   | 後台建立／編輯表單支援數位資產；後台列表顯示並可篩選類型；核對截圖的上傳／檢視；`storage.rules` 開放 `verification/` 子資料夾 | `digital-model`                   |
| `digital-detail`  | `/store/[storeId]` 的數位版本（資訊列、匿名持有人卡、交易說明、metadata、JSON-LD）                                            | `digital-model`                   |
| `digital-inquiry` | 詢問 API、詳細頁 CTA、後台「詢問」頁與未處理數量、買家俱樂部的數位資產偏好、GA4 事件                                          | `digital-detail`                  |
| `digital-browse`  | 首頁區塊、`/digital-assets` 列表頁、導覽列連結                                                                                | `digital-model`                   |
| `digital-sell`    | `/sell` 的類型切換、數位欄位與核對截圖上傳；`/my-listings` 編輯；`firestore.rules` 開放賣家寫入新欄位                         | `digital-admin`, `digital-detail` |

Build order：`digital-model` + `digital-admin` → `digital-detail` + `digital-inquiry` → `digital-browse` → `digital-sell`

先做 model + admin，管理員才能在 `mockStore` 建立測試資料，後面每個模組都靠這些資料驗證。核對截圖的 storage rule 和上傳 helper 也放在這一步：Storage 現在只開放 `{storeId}/` 底下的檔案，子資料夾連管理員都會被拒絕。detail 和 inquiry 一起上，因為沒有詢問功能的詳細頁沒有任何聯絡方式。browse 是第一個對外露出入口的模組，放在 detail 和 inquiry 之後，買家點進去時整條路都通。sell 最後做：賣家刊登後要等審核，而審核後的資產要有地方展示；賣家寫入新欄位也是到這一步才需要改 `firestore.rules`。

預計 4 個 PR，依上面的 build order 各一個。第一個和最後一個 PR 都改 rules，**你要先部署 rules，PR 才能上線**。

**開工前**：這個 worktree 的分支是在 PR #90（Firestore／Storage rules）合併之前切出來的，第一個任務要先把 `main` 合併進來。

## Tech Stack

- Next.js 14（App Router）· TypeScript · Jotai · Tailwind + CSS Modules · Ant Design 5（只用在後台）· Firebase JS SDK 10 · Firebase Admin 11 · lucide-react
- Firestore／Storage rules 測試：`@firebase/rules-unit-testing` + Firebase emulator（PR #90 已建好）
- **不加任何套件**

## Commands

```bash
nvm use

# 格式化、lint、build（每個任務完成前都要跑）
npx prettier --write <changed files>
npx eslint --no-eslintrc -c .eslintrc.json --ext .ts,.tsx app components constant types utils hooks lib firebase atoms
npm run build

# rules 測試（改到 firestore.rules／storage.rules 或新增集合時要跑）
npm run test:rules

# 部署 rules 和 index（由你執行，不是 Claude；不要加 --force）
npx firebase deploy --only firestore:rules,firestore:indexes,storage --project bezold

# 本機驗證（先確認 .env.development 的 NEXT_PUBLIC_ENV_VERSION=dev，寫入 mockStore）
npm run dev
```

## Project Structure

```
types/Store.ts                         → listingType、digitalTypes、operatingYears、monthlyRevenue、priceMax、assetUrl、verificationImages
types/DigitalAsset.ts                  → LISTING_TYPE、DIGITAL_ASSET_TYPE 常數與型別
types/Inquiry.ts                       → Inquiry / InquiryDoc / INQUIRY_STATUS
constant/digitalAsset.ts               → 類型標籤、營收警語、交易說明文案、勿提供密碼警語、截圖說明
constant/buyerClub.ts                  → BUYER_CLUB_CATEGORIES（STORE_CATEGORIES ＋「數位資產」）
atoms/InquiryAtom.ts                   → newInquiryCountAtom（側欄數字與詢問頁共用）
constant/image.ts                      → VERIFICATION_IMAGE_MAX_EDGE、VERIFICATION_IMAGE_MAX_COUNT
firebase/constants.ts                  → COLLECTIONS.INQUIRY（mockInquiry / prodInquiry）
firebase/serverUtils/store.ts          → getDigitalAssets()；既有查詢排除數位
firebase/serverUtils/inquiry.ts        → 詢問的讀寫（Admin SDK）
firebase/clientUtils/image.ts          → uploadVerificationImageByFile()、deleteVerificationImage()
utils/image.ts                         → resizeImageFile() 加 maxEdge 選項
utils/store.ts                         → formatPriceRange()、digitalAssetToCard()、toCard()、omitSellerContact 擋私密欄位

components/refactored/StoreCard.tsx    → 新增 spec 圖示（clock、trendingUp）；其餘不變
components/storeForm/                  → formTypes 加數位欄位與驗證分支；新增 DigitalFieldsSection.tsx、VerificationImageUpload.tsx

app/(new)/_components/DigitalAssets/   → 首頁區塊（index.tsx，最新 6 筆，沒有類型分頁）
app/(new)/digital-assets/              → 列表頁（page.tsx + _components/）
app/(new)/store/[storeId]/_components/ → DigitalStatsBar、DigitalHolderCard、DigitalTransferNotes、InquiryCta
app/(new)/sell/_components/SellForm.tsx → 實體／數位切換（?type=digital 預選）、核對截圖步驟
app/(new)/my-listings/                 → 數位刊登的卡片與編輯（含核對截圖）

app/admin/store/_components/StoreDetailDrawer.tsx → 數位欄位、資產連結、核對截圖預覽
app/admin/store/edit/[storeId]/image/page.tsx     → 加「核對截圖」區塊（上傳／刪除）

app/api/stores/[storeId]/inquiry/route.ts    → GET（我送過了嗎）/ POST（送出詢問），會員限定
app/api/admin/inquiries/route.ts             → GET 列表（管理員）
app/api/admin/inquiries/[inquiryId]/route.ts → PATCH 狀態（管理員）
app/admin/inquiries/page.tsx                 → 後台詢問列表
app/api/admin/inquiries/count/route.ts       → GET 未處理數量（管理員）
components/AdminSidebar.tsx                  → 加「詢問」＋未處理數量
app/(new)/store/[storeId]/_components/BuyerClubPopup.tsx → 類型選項換成 BUYER_CLUB_CATEGORIES；選數位資產時地區選填
app/admin/buyer-profiles/page.tsx            → 類型標籤改用 BUYER_CLUB_CATEGORIES

firebase.json                          → firestore 加 "indexes": "firestore.indexes.json"（Task 1）
firestore.indexes.json                 → 現有 14 個 composite index ＋ 數位資產 2 個（Task 1）
storage.rules                          → verification/ 子資料夾（digital-admin）
firestore.rules                        → sellFormKeys() / ownerEditableKeys() 加數位欄位（digital-sell）
tests/rules/storage.test.ts            → verification/ 的讀寫測試（digital-admin）
tests/rules/firestore.test.ts          → inquiries 集合對 client 全部拒絕的測試（digital-inquiry）
tests/rules/stores.test.ts             → 賣家建立／編輯數位資產的測試（digital-sell）

docs/analytics-events.md               → 新事件
```

## 模組規格

### `digital-model`

**資料欄位**（`Store` 與 `StoreDoc` 都加，全部 optional）：

| 欄位                 | 型別                      | 說明                                                                                                                                                                        |
| -------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `listingType`        | `"physical" \| "digital"` | 沒有 = 實體。新建立的數位資產一律寫 `"digital"`；實體店面維持不寫                                                                                                           |
| `digitalTypes`       | `DigitalAssetType[]`      | 至少一個。`SOCIAL` 社群、`WEBSITE` 網站／內容平台、`ECOMMERCE` 電商、`APP` App、`SAAS` SaaS、`NEWSLETTER` 電子報／會員社群、`DIGITAL_PRODUCT` 數位產品／品牌、`OTHERS` 其他 |
| `operatingYears`     | `number`                  | 經營時間（年，可有小數，例 0.5）                                                                                                                                            |
| `monthlyRevenue`     | `number`                  | 平均月營收（NT$），跟 `monthlyRent` 一樣是數字輸入                                                                                                                          |
| `priceMax`           | `number`                  | 價格區間上限。`price` 當下限；`priceMax > price` 才顯示區間                                                                                                                 |
| `assetUrl`           | `string`                  | 資產連結，**只給管理員看**                                                                                                                                                  |
| `verificationImages` | `string[]`                | 核對截圖的 Storage 路徑（`{collection}/{storeId}/verification/…`），**只給管理員和刊登者本人看**。跟 `images` 完全分開                                                      |

數位資產的 `city`、`district`、`location`、`category`、`areaPing`、`monthlyRent`、`equipment` 都不寫（字串欄位寫 `""`，避免 `updateDoc` 收到 `undefined`）。依 CLAUDE.md，每個新欄位都要照「Adding fields to the Store type」的五個地方處理；`firestore.rules` 那一項在 `digital-sell` 做。

**營收顯示**：標籤一律是「平均月營收」，金額用 `formatPriceParts`（例 `NT$ 20 萬`）。下方顯示固定警語 `REVENUE_DISCLAIMER = "賣家提供，未經 Bezold 查核"`（放在 `constant/digitalAsset.ts`），不讓賣家自己填。

**價格顯示** `formatPriceRange(price, priceMax, priceNegotiable)`：

- `priceMax > price` → `NT$ 50–100 萬`（同單位才合併；跨單位寫 `NT$ 8,000–1.2 萬` 這類，照 `formatPriceParts` 的規則）
- 其他情況 → 交給既有的 `formatPriceDisplay()`（面議、免頂讓金、單一金額）

**卡片** `digitalAssetToCard(store)` 回傳既有的 `StoreCard` 形狀，不另做新元件：

- `location` → 類型標籤，用「 · 」串起來（例「電商 · 社群」）
- `specs` → `[{ clock, "經營 5 年" }, { trendingUp, "月營收 NT$ 20 萬" }]`
- `price` → `formatPriceRange(...)`
- `ribbon` → 沿用 tags（急售／精選／划算）；售出時 `sold`
- `toCard(store)` 依 `listingType` 分派給 `storeToCard` 或 `digitalAssetToCard`，所有列卡片的地方改呼叫 `toCard`

**查詢**：

- 既有的實體查詢（`getStores`、`getHighlightedStores`、`getEmergencyStores`、`getSoldStores`）在記憶體裡排除 `listingType === "digital"`，排除要在 `.slice(0, 9)` 之前做。不加 `where`，所以不用新索引。
- 新的 `getDigitalAssets({ statuses, limit, coverOnly })`：狀態也放進查詢，讓 Firestore 只回傳要顯示的文件，pending、draft、rejected 完全不會讀到。
  - 單一狀態：`where("listingType", "==", "digital").where("status", "==", status).orderBy("createTime", "desc").limit(limit)`
  - 多個狀態：`where("status", "in", statuses)`，其餘相同
  - 這需要一個 **composite index（`listingType` 升冪、`status` 升冪、`createTime` 降冪）**，單一狀態和 `in` 共用同一個。mock 和 prod 集合各一個，寫在 `firestore.indexes.json`，由你部署。
  - 查詢失敗（例如 index 還沒建）時 `console.error` 並回傳 `[]`，呼叫的頁面顯示空狀態，不會整頁 500。
- `resolveStoreImages()` 只處理 `images`，**不碰** `verificationImages`；server 端永遠不幫核對截圖產生網址。
- `sitemap.ts` 不改：數位資產用同一個 `/store/[id]` 網址，approved／sold 照樣收錄。

**公開 payload**：`omitSellerContact()` 也把 `assetUrl` 清成 `""`、`verificationImages` 清成 `[]`。`GET /api/stores/[storeId]/contact` 遇到數位資產一律回空值（數位資產不開放直接聯絡）。

### `digital-admin`

**表單與列表**：

- `StoreBaseForm.tsx`（建立）和 `edit/[storeId]/page.tsx`（編輯）最上面加「刊登類型：實體店面／數位資產」切換。選數位時隱藏地點、坪數、租金、設備、行業，改顯示類型（多選）、經營時間、平均月營收、價格上限、資產連結。
- 編輯頁的 `handleUpdateStore` 用條件展開，不寫 `undefined`。
- 已經存在的實體店面**不能**在編輯頁改成數位資產（反之亦然），避免留下半套欄位；切換只在建立時出現。
- 後台列表（`list`、`drafts`）加一欄「類型」和篩選。

**核對截圖**：

- 上傳 helper（`firebase/clientUtils/image.ts`，跟 `uploadStoreImageByFile` 同一套流程）：
  - `uploadVerificationImageByFile(storeId, file)`：縮圖 → `assertUploadableImage` → 上傳到 `{collection}/{storeId}/verification/{唯一檔名}` → `arrayUnion` 寫進 `verificationImages`
  - `deleteVerificationImage(storeId, path)`：刪檔 → `arrayRemove`
- 縮圖：`resizeImageFile(file, { maxEdge: VERIFICATION_IMAGE_MAX_EDGE })`，最長邊 **2400px**（一般照片是 1600px）。手機長截圖縮到 1600px 時，數字會糊到看不清楚。檔案大小和格式照舊（JPG／PNG／WebP／GIF、5 MB 以內）。
- 最多 `VERIFICATION_IMAGE_MAX_COUNT = 10` 張。
- `StoreDetailDrawer`：顯示數位欄位、`assetUrl`（另開分頁）、核對截圖縮圖。縮圖用 Ant Design `Image.PreviewGroup`，點了可以放大、可以左右切換。沒有截圖時顯示警告「賣家還沒上傳核對截圖」，但**不擋**審核按鈕（要不要上架由管理員決定）。
- 後台圖片頁（`/admin/store/edit/[storeId]/image`）在數位資產時多一個「核對截圖」區塊，可以上傳、刪除。管理員自己建立的數位資產，截圖不強制。
- 刪除店家時，`DELETE /api/stores/[storeId]` 已經用 `{collection}/{storeId}/` 前綴刪檔，會連 `verification/` 一起刪，不用改。
- `scripts/shrink-store-images.mjs` 只處理 `images`，不會碰到核對截圖，不用改。

**Storage rules**（`storage.rules`）：現有的 `/{collectionName}/{storeId}/{fileName}` 只配到一層，`verification/` 子資料夾會落到最後的「全部拒絕」。新增一段：

```
// * seller-provided revenue / dashboard screenshots — admin review only,
// * never resolved to a public URL
match /{collectionName}/{storeId}/verification/{fileName} {
  allow read: if isStoreCollection(collectionName)
    && (isAdmin() || isStoreOwner(collectionName, storeId));
  allow create: if resource == null
    && isStoreCollection(collectionName)
    && (isAdmin() || isEditableByOwner(collectionName, storeId))
    && isAllowedImage();
  allow delete: if isStoreCollection(collectionName)
    && (isAdmin() || isEditableByOwner(collectionName, storeId));
}
```

`tests/rules/storage.test.ts` 加測試：

- 刊登者、管理員可以上傳和讀取
- 未登入、其他會員讀取失敗
- 超過 5 MB 或 SVG 上傳失敗
- 刊登者在 draft／sold 狀態下上傳或刪除失敗

這個 PR 合併前，你要先部署 rules。

### `digital-detail`

`/store/[storeId]` 在 `listingType === "digital"` 時：

| 區塊     | 內容                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 導覽     | `SiteNav activeLink="數位資產"`；麵包屑「首頁 / 數位資產 / 名稱」，第二層連到 `/digital-assets`                                     |
| 相簿     | 沿用 `StoreGallery`（只用 `images`，不含核對截圖）                                                                                  |
| 標題列   | 類型 Pill（每個類型一個）＋「詳細資料需申請」Pill；標題；副標「DIGITAL ASSET」                                                      |
| 資訊列   | `DigitalStatsBar`：經營時間｜平均月營收（下面小字 `REVENUE_DISCLAIMER`）｜頂讓金額（區間）。沒填的欄位顯示「—」                     |
| 介紹     | 沿用 `StoreDescription`（「資產介紹」、「數位資產優勢」這些段落就是賣家寫的描述）                                                   |
| 交易說明 | `DigitalTransferNotes`：固定文案「分階段揭露詳細資料」、移轉範圍需雙方確認、金額為賣家提供未經 Bezold 查核、勿提供密碼              |
| 側欄卡   | `DigitalHolderCard`：匿名頭像＋「數位資產持有人」＋「詳細營運與聯絡資料需經同意後提供」、頂讓金額、`InquiryCta`（下一模組）、提醒框 |

- 不出現 `SellerContactGate`，也不出現任何 `userInfo`。
- metadata title 用「`名稱`｜數位資產頂讓」；description 照舊取自描述；og:image 照舊取 `images` 第一張。
- JSON-LD：有區間時用 `AggregateOffer`（`lowPrice` / `highPrice`），否則照舊 `Offer`；面議照舊不輸出。
- 已售出：隱藏詢問 CTA，顯示「已頂讓」，跟實體店面一致。

### `digital-inquiry`

**資料**（新集合 `COLLECTIONS.INQUIRY`，`mockInquiry` / `prodInquiry`）：

```ts
interface InquiryDoc {
  storeId: string;
  storeName: string; // * 建立當下的名稱快照，後台列表不用再 join
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string; // * 可空字串，上限 500 字
  status: "new" | "contacted" | "closed";
  createTime: Timestamp;
  updateTime: Timestamp;
}
```

文件 id 固定是 `${storeId}_${buyerUid}`：同一位買家對同一筆資產只會有一份詢問，重送不會重複。

**Rules**：所有讀寫都走 Admin SDK，`firestore.rules` 最後的 catch-all 已經拒絕 client 存取 `mockInquiry` / `prodInquiry`，所以 rules **不用改**。在 `tests/rules/firestore.test.ts` 加測試：會員、刊登者、管理員用 client SDK 讀寫 inquiries 都失敗。如果之後要讓管理員用 client SDK 直接讀，再加 rule。

**API**：

- `GET /api/stores/[storeId]/inquiry`：`verifyUserToken` → `{ submitted: boolean }`
- `POST /api/stores/[storeId]/inquiry`：`verifyUserToken` → 資產必須是 `digital` 且 `approved`，否則 400／404；已存在 → 200 `{ submitted: true, alreadySubmitted: true }`，**不覆寫**；否則用使用者文件的姓名／電話與 token 的 email 建立。`message` 超過 500 字 → 400。
- `GET /api/admin/inquiries`：`verifyAdminToken` → 依 `createTime` 由新到舊
- `PATCH /api/admin/inquiries/[inquiryId]`：`verifyAdminToken` → 只改 `status` 和 `updateTime`

**詳細頁 CTA**（`InquiryCta`，client component）：

| 狀態                 | 行為                                                                 |
| -------------------- | -------------------------------------------------------------------- |
| 未登入／email 未驗證 | 按下開啟 `BuyerClubPopup`，`buyerClubSourceAtom = "digital_inquiry"` |
| 已登入、還沒送過     | 按下展開一個訊息欄（選填）＋「送出申請」；成功後切成已送出           |
| 已送過               | 按鈕停用，文字「已送出申請，我們會盡快與你聯絡」                     |
| 送出失敗             | 留在表單，顯示錯誤，可重試                                           |

下方小字：「由平台確認後與你聯繫。送出不代表承諾購買，也不會立即揭露賣家聯絡資料。」

**後台「詢問」頁**（`/admin/inquiries`，`AdminSidebar` 加入口）：Ant Design Table，欄位為時間、資產（連到 `/store/[id]`，另開後台編輯）、買家姓名／email／電話、訊息、狀態（Select，改了就 PATCH）。預設只顯示 `new` + `contacted`，可切換顯示全部。

**未處理數量**：

- `GET /api/admin/inquiries/count`：`verifyAdminToken` → `{ new: number }`，用 Admin SDK 的 `where("status", "==", "new").count()`。這是單一欄位的條件，不用 composite index；aggregation 只算一次讀取。
- `AdminSidebar` 的「詢問」旁邊用 Ant Design `Badge` 顯示數字，0 的時候不顯示。進後台和切換後台頁面時重新抓一次，不輪詢。
- 數字放在 `newInquiryCountAtom`。詢問頁把一筆從 `new` 改成別的狀態（或改回 `new`）時，直接加減 atom，側欄馬上更新，不用重抓。

**買家俱樂部的數位資產偏好**：

- `constant/buyerClub.ts` 新增 `BUYER_CLUB_CATEGORIES = [...STORE_CATEGORIES, { label: "數位資產", key: "DIGITAL_ASSET" }]`。**不改** `STORE_CATEGORIES`：它也用在賣家表單、`/store-list` 篩選、首頁 HeroSplit、後台表單，加進去的話，實體店面也能選「數位資產」行業。
- `BuyerClubPopup` 的「類型」選項改用 `BUYER_CLUB_CATEGORIES`。選「數位資產」時，「地區」改成選填，沒填就寫 `city: ""`。`BuyerProfile.city` 的註解要更新：空字串代表不限地區。
- 從數位資產的詢問按鈕打開（`source === "digital_inquiry"`）時，類型預選「數位資產」。
- 註冊時的 `source` 目前只有 contact gate 會保留原值，其他一律寫 `"buyer_club_popup"`。這裡改成 `digital_inquiry` 也保留，才分得出這些會員是從數位資產詢問來的。
- 後台 `/admin/buyer-profiles` 的類型標籤改用 `BUYER_CLUB_CATEGORIES`，`DIGITAL_ASSET` 才會顯示成「數位資產」而不是「—」；地區空字串照舊顯示「—」。
- 寫入照舊走 `writeBuyerProfile()`／`buyerProfileFields()`；`firestore.rules` 對使用者文件的 `buyerProfile` 沒有限制欄位值，不用改 rules。

**GA4**（`trackEvent()`，並更新 `docs/analytics-events.md`）：

- `digital_inquiry_click`：`{ store_id, signed_in }`
- `digital_inquiry_submit`：`{ store_id, has_message }`
- `BuyerClubSource` 加 `"digital_inquiry"`

### `digital-browse`

**首頁區塊**（`app/(new)/_components/DigitalAssets/`）放在「03 已頂讓店家」後面，編號 `04`；後面的 Categories、Districts、BrowseAll、HowItWorks、WhyUs、Faq 編號各往後一號。

- `SectionTitle`：`num="04"`、`title="數位資產頂讓"`、`NEW` 標籤（等寬字體，跟卡片的「精選」「急售」標籤同一種樣式；`Pill` 的手寫字體會讓英文大寫歪斜）、`sub="— 讓線上的心血，也有下一章 —"`、右側「看全部數位資產 →」連到 `/digital-assets`
- 不放類型分頁：首頁直接顯示全部類型的最新刊登，依類型篩選留給 `/digital-assets`。
- 資料：`getDigitalAssets({ statuses: ["approved"], limit: 6, coverOnly: true })`，最多 6 張卡片，由新到舊。
- 區塊底部：「我也有數位資產想刊登 ↗」連到 `/sell?type=digital`。不放警語：首頁沒有要填的東西，「請勿提供密碼、驗證碼」放在 `/sell` 數位表單、詳細頁和 `/digital-assets` 的刊登 CTA。
- 完全沒有 approved 資料時整個區塊照樣顯示，內容換成空狀態＋刊登 CTA（避免編號跳號）。

**列表頁** `/digital-assets`：

- 頁面殼照 CLAUDE.md：`LaunchBanner` → `SiteNav activeLink="數位資產"` → `<div className="flex-1">` → `SiteFooter`
- 網址參數 `?type=ECOMMERCE` 是篩選狀態的唯一來源（跟 `/store-list` 同一個原則）。篩選列跟 `/store-list` 的 SearchBar 同一個樣式：一個「類型」`Dropdown`（不限＝全部），只有一個條件，所以選了就用 `router.push` 改網址，不需要「搜尋」按鈕。不認得的 `type` 當作「全部」。
- 資料：`getDigitalAssets({ statuses: ["approved", "sold"], coverOnly: true })`，不設 limit；類型在記憶體裡篩選。approved 在前、sold 在後（sold ribbon），跟 `/store-list` 一致。
- 之後如果數量多到要分頁，就要加上 `digitalTypes` 的 `array-contains` 條件和 cursor 分頁，那時會需要另一個 index。這次不做。
- metadata：title「數位資產頂讓｜電商、社群、網站轉讓 - Bezold」、canonical `/digital-assets`；加進 `sitemap.ts` 的靜態頁。
- 導覽列 `navLinks` 在「我要找店」後面加 `{ label: "數位資產", href: "/digital-assets" }`；確認手機版選單 6 個連結放得下。

### `digital-sell`

**表單**：

- `/sell` 最上面加「我要頂讓：實體店面／數位資產」切換；`?type=digital` 預選數位。切換只在建立時出現。
- 數位欄位放在新的 `components/storeForm/DigitalFieldsSection.tsx`：名稱、類型（多選 Pill，至少一個）、經營時間、平均月營收（數字）、價格下限／上限（＋價格可議）、資產連結（必填，旁邊說明「只有 Bezold 管理員看得到，用來查核」）、描述、照片。
- 表單最上方和資產連結旁都放警語：**請勿提供密碼、驗證碼或其他登入資訊**。
- `validateStoreForm()` 依 `listingType` 分支：
  - 數位不檢查地址，改檢查名稱、類型、資產連結（`http(s)://` 開頭）、描述、價格
  - `priceMax` 有填時必須 ≥ 下限
  - 經營時間、平均月營收有填時必須是 ≥ 0 的數字
- 聯絡資料（`ContactFieldsSection`）照舊必填，因為平台要用它聯絡賣家；只是不會公開。
- 送出後是 `pending`，跟實體一樣。

**核對截圖**（`components/storeForm/VerificationImageUpload.tsx`，`/sell` 和 `/my-listings` 編輯共用）：

- 標題「營收與數據核對截圖（必填，不公開）」，說明文字：
  - 請上傳後台的營收報表或數據截圖。例如蝦皮賣家中心的月營收、Shopify／電商後台的訂單報表、FB 社團洞察報告、GA 流量、App 下載數。
  - 截圖要看得到帳號或賣場名稱，方便我們對應你填的資產連結。
  - 只有 Bezold 管理員看得到，用來核對資料、防止詐騙刊登，不會出現在公開頁面。
  - 請遮住個資，不要截到密碼或驗證碼。
- 沿用現有的兩步驟流程：送出表單建立文件（rules 規定建立時不能帶檔案）→ 進到上傳畫面。數位資產的上傳畫面有兩個區塊，照片（`StoreImageUpload`，可略過）和核對截圖。**至少上傳 1 張核對截圖，「完成刊登」才能按**，也不會出現「略過」。
- 賣家在上傳畫面直接離開時，刊登已經成立但沒有截圖：`/my-listings` 卡片會提示補上，管理員在 drawer 也會看到缺截圖的警告。
- 縮圖、張數上限、檔案限制都跟後台一樣（共用 `uploadVerificationImageByFile`）。

**我的刊登**：

- `/my-listings` 用 `toCard()` 顯示數位刊登。沒有核對截圖的數位刊登，卡片上顯示「請補上核對截圖」。
- 編輯頁（`EditListingForm`）依 `listingType` 顯示數位欄位和核對截圖區塊，不能切換類型。
- 已上架（approved）的刊登新增或刪除截圖時，跟照片一樣送回 `pending` 重新審核。

**Firestore rules**（`firestore.rules`）：

- `sellFormKeys()` 加 `listingType`、`digitalTypes`、`operatingYears`、`monthlyRevenue`、`priceMax`、`assetUrl`。
- `isNewSellerListing()` 加一條：有 `listingType` 時只能是 `'digital'`（實體店面照舊不寫）。`verificationImages` **不放進** `sellFormKeys()`：建立時不能帶，之後由上傳 helper 用 `arrayUnion` 寫入。
- `ownerEditableKeys()` 加 `digitalTypes`、`operatingYears`、`monthlyRevenue`、`priceMax`、`assetUrl`、`verificationImages`，**不加 `listingType`**。這樣 rules 也擋住賣家切換類型，不只靠 UI。
- `tests/rules/stores.test.ts` 加測試，payload 要跟程式實際送出的完全一樣：
  - 賣家建立數位資產成功
  - `listingType: 'physical'` 或其他值建立失敗；建立時帶 `verificationImages` 失敗
  - 刊登者編輯數位欄位成功；`arrayUnion` 新增核對截圖路徑成功
  - 刊登者改 `listingType` 失敗
  - 別人編輯失敗
- 部署由你執行：`npx firebase deploy --only firestore:rules,firestore:indexes,storage --project bezold`。**rules 要先部署，這個 PR 才能上線**，不然賣家送出會收到 `permission-denied`。

## Code Style

沿用專案現有寫法：`// *` 註解、完整變數名稱、轉換資料的函式放 `utils/`、靜態值放 `constant/`、條件 class 用 `cn()`、同一個元素不混用 CSS Module 和 Tailwind。

```ts
// types/DigitalAsset.ts
export const LISTING_TYPE = {
  PHYSICAL: "physical",
  DIGITAL: "digital",
} as const;

export type ListingType = (typeof LISTING_TYPE)[keyof typeof LISTING_TYPE];

// utils/store.ts
// * listingType is absent on every store created before digital assets
// * existed — treat missing as physical so no backfill is needed
export const isDigitalAsset = (store: Pick<Store, "listingType">) =>
  store.listingType === LISTING_TYPE.DIGITAL;

export function toCard(store: Store): StoreCard {
  return isDigitalAsset(store) ? digitalAssetToCard(store) : storeToCard(store);
}
```

## Testing Strategy

App 本身沒有測試框架，這次也**不新增**。Rules 用 PR #90 建好的 emulator 測試（`npm run test:rules`）。emulator **不檢查 index**，所以 index 是否正確，要在部署後用本機 dev（連到真的 Firestore）驗證。其他都在本機 dev（`NEXT_PUBLIC_ENV_VERSION=dev`，寫入 `mockStore` / `mockInquiry`）用瀏覽器驗證：

| #   | 驗證                                                                                                                                                                                                                                      | 對應模組          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| T1  | 後台建立一筆數位資產（電商＋社群、5 年、平均月營收 20 萬、50–100 萬、資產連結）：Firestore 文件有 `listingType: "digital"`，沒有任何 `undefined` 欄位                                                                                     | `digital-admin`   |
| T2  | 把它設成精選、急售：首頁 01／02 區塊、`/store-list` 都**不**出現它；實體店面的數量與順序跟改之前一樣                                                                                                                                      | `digital-model`   |
| T3  | 後台編輯數位資產改價格與類型：存檔後正確；編輯頁沒有類型切換                                                                                                                                                                              | `digital-admin`   |
| T4  | 後台圖片頁上傳一張 1170×2532 的手機長截圖：存到 `verification/`、最長邊 2400、數字清楚可讀；drawer 縮圖可以放大和切換；刪除後檔案和路徑都消失；沒有截圖時 drawer 顯示警告                                                                 | `digital-admin`   |
| T5  | `npm run test:rules`：`verification/` 的新測試和既有測試全過                                                                                                                                                                              | `digital-admin`   |
| T6  | 詳細頁：資訊列（「平均月營收」＋固定警語）、類型 Pill、區間價格、交易說明都對；頁面原始 HTML 和 RSC payload 裡搜不到 `assetUrl` 的值、`verification/` 路徑、賣家電話／email                                                               | `digital-detail`  |
| T7  | 詳細頁 JSON-LD 是 `AggregateOffer`，`lowPrice` / `highPrice` 正確；Rich Results Test 沒有錯誤                                                                                                                                             | `digital-detail`  |
| T8  | 未登入按「我有興趣」→ 開啟買家俱樂部；登入並驗證 email 的帳號送出詢問 → `mockInquiry` 出現 `${storeId}_${uid}`；重新整理後顯示「已送出」                                                                                                  | `digital-inquiry` |
| T9  | 同一帳號用 curl 再 POST 一次：回 `alreadySubmitted`，文件內容與 `updateTime` 不變；對實體店面或 pending 資產 POST：400／404                                                                                                               | `digital-inquiry` |
| T10 | 後台「詢問」頁看得到 T8 的詢問，改狀態後重新整理仍保持；非管理員打 admin API：401／403                                                                                                                                                    | `digital-inquiry` |
| T11 | `npm run test:rules`：inquiries 對所有 client 角色都拒絕；既有測試全過                                                                                                                                                                    | `digital-inquiry` |
| T12 | 側欄「詢問」顯示未處理數量；在詢問頁把一筆改成 `contacted` → 數字立刻減 1；全部處理完 → 數字消失；再送一筆新詢問後切換後台頁面 → 數字出現                                                                                                 | `digital-inquiry` |
| T13 | 從數位資產詢問按鈕打開買家俱樂部：類型已預選「數位資產」、地區不填也能註冊；使用者文件 `buyerProfile.category = "DIGITAL_ASSET"`、`city = ""`，註冊 source 是 `digital_inquiry`；後台買家偏好頁顯示「數位資產」。選實體類型時地區照舊必填 | `digital-inquiry` |
| T14 | 首頁 04 區塊：顯示最新 6 筆（不分類型）、沒有資料時顯示空狀態；後面區塊編號是 05–10                                                                                                                                                       | `digital-browse`  |
| T15 | `/digital-assets?type=SOCIAL` 只顯示社群；改「類型」選項網址跟著變；重新整理後選項保留；`?type=xyz` 當作全部                                                                                                                              | `digital-browse`  |
| T16 | 導覽列在桌機與手機寬度（375px）都正常，「數位資產」在列表頁與詳細頁亮起                                                                                                                                                                   | `digital-browse`  |
| T17 | `npm run test:rules`：賣家建立／編輯數位資產、新增核對截圖路徑的新測試和既有測試全過                                                                                                                                                      | `digital-sell`    |
| T18 | 用一般帳號在 `/sell?type=digital` 刊登：缺資產連結、連結不是 http(s)、上限小於下限都擋下；上傳畫面沒有截圖時「完成刊登」不能按；成功後 `pending`，照片在 `images`、截圖在 `verificationImages`，後台看得到                                | `digital-sell`    |
| T19 | 用另一個一般帳號，拿 T18 截圖的 Storage 路徑呼叫 `getDownloadURL`：失敗（permission-denied）                                                                                                                                              | `digital-sell`    |
| T20 | `/my-listings`：數位刊登卡片顯示正確；刪光截圖後卡片提示「請補上核對截圖」；補上後已上架的刊登回到 `pending`；編輯欄位存檔正確，沒有類型切換                                                                                              | `digital-sell`    |
| T21 | 實體店面的 `/sell`、`/my-listings`、詳細頁、`SellerContactGate`、照片上傳行為跟改之前一樣（回歸檢查）                                                                                                                                     | 全部              |
| T22 | 每個 PR 都要通過 lint（0 錯誤）和 `npm run build`                                                                                                                                                                                         | 全部              |

## Boundaries

- **Always**
  - 既有資料視為實體店面（`listingType` 不存在 = physical），不做資料遷移
  - 任何公開頁面或 API 都經過 `omitSellerContact()`；`assetUrl`、`verificationImages` 和賣家聯絡資料不進公開 payload
  - 核對截圖只存在 `verification/` 子資料夾和 `verificationImages` 欄位，永遠不進 `images`
  - 實體查詢在記憶體裡排除數位資產，排除在 slice 之前
  - `updateDoc` 不寫 `undefined`；集合名稱用 `COLLECTIONS.*`
  - client 端新的讀寫一定要有對應的 rule 和 `tests/rules/` 測試
  - 新的元件先看 `components/refactored/` 有沒有可以用的；通用的才抽到那裡
  - 改過的檔案都跑 prettier；本機寫資料前確認 `NEXT_PUBLIC_ENV_VERSION=dev`
  - 每個模組完成、驗證後先停下讓你看，再 commit；用 worktree branch + PR，不直接動 main
- **Ask first**
  - 新增、修改或刪除 `firestore.indexes.json` 裡的 index（這次只加數位資產的 2 個）
  - 任何寫入 `prodStore` / `prodInquiry` 的動作（包含在正式站建立第一筆數位資產）
  - 加任何套件；改動本 spec 範圍以外的 rules
  - 改動實體店面既有的欄位、查詢條件或顯示方式（超出「排除數位資產」的範圍）
- **Never**
  - 要求或儲存賣家的密碼、驗證碼、登入資訊
  - 在公開頁面露出賣家身份、資產連結、核對截圖或任何聯絡方式
  - 在 server 端幫核對截圖產生 download URL（公開頁面用的 `resolveStoreImages` 只處理 `images`）
  - 讓已存在的刊登在實體／數位之間切換
  - 部署 rules 或 index（由你執行），或在 Firebase console 直接改 rules、建立或刪除 index
  - 部署時加 `--force`（會刪掉檔案裡沒有的 index）
  - 在 `digital-detail` 合併之前，在 `prodStore` 建立數位資產（舊的詳細頁會把它當實體店面顯示）

## Success Criteria

1. 管理員和賣家都能建立數位資產，審核後出現在首頁 04 區塊和 `/digital-assets`，並能依類型篩選（T1、T14、T15、T18）。
2. 賣家刊登數位資產時一定要選核對截圖；管理員能在後台放大檢視，數字清楚可讀（T4、T18）。
3. 數位資產完全不會出現在實體店面的任何列表裡，實體店面的行為沒有任何變化（T2、T21）。
4. 公開頁面的 HTML、RSC payload 與公開 API 都沒有 `assetUrl`、核對截圖和賣家聯絡資料；其他會員也讀不到截圖檔案（T6、T19）。
5. 已驗證的會員能送出詢問；同一人同一筆只有一份；管理員能在後台看到並更新狀態，側欄顯示未處理數量（T8–T10、T12）。
6. 數位資產的買家能在買家俱樂部選「數位資產」，不用填地區；管理員在買家偏好頁看得到（T13）。
7. Rules 測試全過：賣家改不了 `listingType`，client 讀不到 inquiries，只有刊登者和管理員讀得到核對截圖（T5、T11、T17）。
8. 所有 PR 通過 lint 和 build（T22）。

## Open Questions

目前沒有。
