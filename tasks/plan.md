# Implementation Plan: 數位資產頂讓

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md)

## Overview

讓電商、FB 社團、蝦皮賣場等數位資產也能在 Bezold 刊登與頂讓。資料跟實體店面放在同一個 Store 集合，用 `listingType` 區分。公開頁面匿名，買家送出詢問，由平台媒合。賣家必須上傳後台營收截圖，讓管理員核對。

整個功能分成 4 個 PR，順序跟 spec 的 capability map 一樣。每個 PR 結束時都是可以上線、不會壞掉實體店面的狀態。

| PR  | 模組                                 | Tasks | 上線前你要做的事                                          |
| --- | ------------------------------------ | ----- | --------------------------------------------------------- |
| 1   | `digital-model` + `digital-admin`    | 1–7   | 部署 storage rules 和 indexes（`firestore.indexes.json`） |
| 2   | `digital-detail` + `digital-inquiry` | 8–14  | 無                                                        |
| 3   | `digital-browse`                     | 15–17 | 無                                                        |
| 4   | `digital-sell`                       | 18–21 | 部署 firestore rules                                      |

## Architecture Decisions

- **`listingType` 沒有 = 實體**：舊資料不用遷移。所有判斷都經過 `isDigitalAsset()`，不要在各處自己比字串。
- **實體查詢在記憶體裡排除數位**：不加 `where("listingType", "!=", …)`。`!=` 會排除沒有這個欄位的舊文件，等於把所有實體店面都濾掉。
- **卡片共用 `StoreCard`**：`toCard()` 依類型分派，`digitalAssetToCard()` 回傳同一個形狀。不做新的卡片元件。
- **私密欄位一律經過 `omitSellerContact()`**：`assetUrl`、`verificationImages` 跟賣家聯絡資料走同一條路，公開頁面只有這一個出口要守。
- **核對截圖跟照片完全分開**：分開的欄位（`verificationImages`）、分開的 Storage 子資料夾（`verification/`）、分開的上傳 helper。`resolveStoreImages()` 只處理 `images`。
- **詢問全部走 Admin SDK**：client 不碰 inquiries 集合，rules 的 catch-all 已經擋住，不用新增 rule。
- **詳細頁沿用 `/store/[storeId]`**：在 `page.tsx` 依類型切換子元件。共用的部分（相簿、描述、買家俱樂部 popup）不複製。
- **數位專用的 UI 放在使用它的 route 底下**：只有通用的（例如 `VerificationImageUpload` 給 `/sell` 和 `/my-listings` 共用）才放 `components/storeForm/`；`components/refactored/` 只改 `StoreCard` 的圖示。

## Task List

### PR 1 — 資料模型與後台

- [x] Task 1: 合併 main（PR #90 rules）、index 改由 repo 管理、commit spec 和 plan
- [x] Task 2: 型別、常數、價格區間與卡片轉換
- [x] Task 3: 實體查詢排除數位、`getDigitalAssets()`、改用 `toCard()`
- [x] Task 4: 後台建立／編輯表單支援數位資產
- [x] Task 5: 後台列表的類型欄位與篩選、drawer 顯示數位欄位
- [x] Task 6: 核對截圖的 storage rule、測試、上傳 helper
- [x] Task 7: 後台核對截圖的上傳與檢視

### Checkpoint: PR 1

- [ ] lint、build、`npm run test:rules` 全過
- [ ] 你部署 storage rules（index 在 Task 1 之後已經部署）
- [ ] 在 `mockStore` 建好 2–3 筆數位資產（含截圖），後面的 PR 都用這些資料
- [ ] 實體店面首頁、`/store-list` 沒有變化
- [ ] 你 review → commit → 開 PR

### PR 2 — 詳細頁與詢問

- [x] Task 8: 詳細頁上半部（麵包屑、標題列、資訊列、metadata、JSON-LD）
- [x] Task 9: 匿名持有人卡與交易說明
- [x] Task 10: 詢問的資料層與會員 API
- [x] Task 11: 詳細頁的詢問 CTA 與 GA4
- [x] Task 12: 買家俱樂部的數位資產偏好
- [x] Task 13: 後台「詢問」頁
- [ ] Task 14: 側欄未處理詢問數量

### Checkpoint: PR 2

- [ ] lint、build、`npm run test:rules` 全過
- [ ] 公開 HTML／RSC payload 沒有 `assetUrl`、`verification/`、賣家聯絡資料
- [ ] 完整走過：未登入點詢問 → 加入買家俱樂部 → 驗證 email → 送出詢問 → 後台看到、改狀態、側欄數字變化
- [ ] 你 review → commit → 開 PR

### PR 3 — 瀏覽入口

- [ ] Task 15: 首頁「04 數位資產頂讓」區塊
- [ ] Task 16: `/digital-assets` 列表頁
- [ ] Task 17: 導覽列「數位資產」

### Checkpoint: PR 3

- [ ] lint、build 全過
- [ ] 首頁 → 列表頁 → 詳細頁 → 詢問整條路都通，桌機和手機都檢查
- [ ] 你 review → commit → 開 PR

### PR 4 — 賣家刊登

- [ ] Task 18: firestore rules 開放賣家寫入數位欄位
- [ ] Task 19: 共用表單的數位欄位與驗證
- [ ] Task 20: `/sell` 的類型切換與核對截圖步驟
- [ ] Task 21: `/my-listings` 的數位刊登卡片與編輯

### Checkpoint: 完成

- [ ] lint、build、`npm run test:rules` 全過
- [ ] spec 的 T1–T22 全部走過一次
- [ ] 實體店面回歸檢查（T21）
- [ ] 你部署 firestore rules → review → commit → 開 PR

## Risks and Mitigations

| 風險                                                                    | 影響 | 對策                                                                                                                                              |
| ----------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| index 還沒部署或還沒建好，`getDigitalAssets()` 直接丟錯                 | 高   | Task 1 就部署 index，Task 3 開始前確認 console 上狀態是「已啟用」。`getDigitalAssets()` 出錯時回傳 `[]`，首頁區塊和列表頁顯示空狀態，不會整頁 500 |
| 數位資產漏進實體列表（漏改某個查詢）                                    | 高   | Task 3 用 grep 列出所有 `COLLECTIONS.STORE` 的讀取點，逐一確認；T2 測試把數位資產設成精選、急售、已售出                                           |
| 私密欄位外流到公開頁面                                                  | 高   | 全部經過 `omitSellerContact()`；每個 PR 的 checkpoint 都在頁面原始碼和 RSC payload 搜 `assetUrl` 的值和 `verification/`                           |
| rules 沒部署就上線，賣家或管理員上傳時 `permission-denied`              | 中   | rules 改動都只增加權限、不收緊，可以先部署再合併 PR；PR 描述寫明部署步驟                                                                          |
| 在 PR 2 上線前，有人在 `prodStore` 建了數位資產，舊詳細頁會當成實體顯示 | 中   | PR 1 只在 `mockStore` 測試；正式站建立第一筆要先問你                                                                                              |
| 合併 main 時 `SPEC.md`、`tasks/*` 衝突（PR #90 也改過）                 | 低   | Task 1 保留這個分支的版本；PR #90 的 rules 文件已經寫進 CLAUDE.md，不會遺失                                                                       |
| 第一次部署 index 時，CLI 要刪除或重建現有的 index                       | 高   | 檔案是從正式專案直接匯出的，理論上沒有差異。部署**不加 `--force`**；CLI 如果問要不要刪除任何 index，一律回答 No，停下來告訴我                     |
| `BuyerClubPopup` 很大（約 570 行），改動可能影響實體店面的 popup        | 中   | Task 12 只動類型選項、地區必填判斷、source 三個點；實體類型的註冊流程照 T13 回歸檢查                                                              |
| rules 測試需要 Java（emulator）                                         | 低   | PR #90 的前置條件：`brew install openjdk@21`。沒裝的話我會停下來告訴你                                                                            |

## Parallelization

Task 15–17（瀏覽）只依賴 PR 1，跟 PR 2 可以同時做。但 spec 刻意讓瀏覽入口在詢問功能之後上線，所以照順序做，不另開 session。每個 PR 內的 task 依序執行，不平行。

## Open Questions

目前沒有。
