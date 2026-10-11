# Implementation Plan: 草稿商店（`draft` 狀態）

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md) · Mockup: [`mockups/admin-draft-stores.html`](../mockups/admin-draft-stores.html)

## Overview

新增 `draft` 商店狀態。管理員可以在 Store Create 儲存草稿、在 Store List 把任何店轉為草稿，並在新的 `/admin/store/drafts` 頁查看完成度、送審（→ `pending`）或刪除。草稿不出現在 Store List、Store Analytics 和前台列表。草稿的前台頁面仍可用網址開啟（給賣家確認），外觀和一般店面相同，但 contact API 不回傳聯絡方式，頁面加上 `noindex`。賣家在「我的刊登」看到「整理中」，沒有任何操作。

## Architecture Decisions

- **先做「轉為草稿」，再做草稿頁**：dev 環境（mockStore）一開始沒有任何草稿。先讓 Store List 能把既有的店轉為草稿，後面每個任務就有真實資料可以驗證，不用到 Firestore Console 手動改資料。
- **草稿頁沿用 `getStores()` 再在前端篩選**：和 Store List 相同的讀法（`orderBy("createTime", "desc")`），本來就是建立時間新到舊，不需要新的 Firestore 查詢，也不需要 composite index。
- **完成度需要賣家資料**：client 端的 `getStores()` 不會 join `userInfo`，所以草稿頁對每筆草稿用既有的 `getUserById(store.user)` 讀賣家文件（`Promise.all`）。草稿數量少，額外讀取可以接受。賣家文件不存在時，賣家欄位視為未填。
- **完成度邏輯放 `utils/`，欄位清單放 `constant/`**：`constant/storeDraft.ts` 是必填／建議欄位與中文標籤；`utils/storeDraft.ts` 的 `getDraftChecklist(store, seller)` 回傳 `{ done, total, missingRequired }`。草稿頁的進度條、送審按鈕的停用與 tooltip、批次送審的篩選都用它。
- **狀態寫入沿用 `updateStoreStatus()`**：轉為草稿、送審都只改 `status` 和 `updateTime`。批次處理沿用 Store List 的 `Promise.allSettled` 模式，失敗的列保持勾選。
- **排除草稿的位置**：Store List、Store Analytics 都在現有的前端篩選加一條 `status !== draft`（包含「所有狀態」）。前台列表、首頁區塊、sitemap 已經只取 `approved`／`sold`，不用改。
- **聯絡方式只在 API 擋**：`/api/stores/[storeId]/contact` 對 `draft` 回 `EMPTY_CONTACT`（和 `sold` 同一個分支）。前台元件不改，所以未登入時照樣顯示「免費加入會員後顯示」。
- **`noindex` 放在 `generateMetadata`**：只對 `draft` 加 `robots: { index: false, follow: false }`，其他狀態的 metadata 完全不變。
- **儲存草稿跳過所有驗證**：`StoreBaseForm` 新增 `handleSaveDraft`，與 `handleCreateStore` 共用建立 user 文件和 store 文件的流程，只差在不驗證、`status: draft`。空字串欄位保持 `""`。

## Dependency Graph

```
types/StoreStatus.ts  DRAFT
  │
  ├── constant/adminStore.ts  STATUS_LABEL / STATUS_COLOR          ┐
  ├── my-listings StatusBadge  整理中                               ├─ T1（型別一定要一起改，build 才會過）
  │                                                                ┘
  ├── Store List：排除草稿 + 轉為草稿（drawer、批次）、Analytics 排除   ── T2
  │        │ （產生草稿資料）
  │        ▼
  ├── constant + utils/storeDraft.ts ── /admin/store/drafts 列表 + 側邊欄   ── T3
  │                                          │
  │                                          └── 送審、刪除（單筆、批次）   ── T4
  │
  ├── StoreBaseForm 儲存草稿   ── T5（只依賴 T1；T3 完成後才看得到結果）
  │
  ├── contact API 回空值 + store page noindex   ── T6（只依賴 T1）
  └── EditListingForm 導回、ListingCard 確認     ── T7（只依賴 T1）
```

T6、T7 只依賴 T1，可以和 Phase 2 平行進行；但照順序做比較好驗證，因為那時已經有草稿資料。

## Task List

### Phase 1: 狀態與轉為草稿

- [x] Task 1: 新增 `draft` 狀態與所有對照表
- [x] Task 2: Store List 轉為草稿（drawer＋批次），Store List／Analytics 排除草稿

### Checkpoint A

- [x] lint、build 通過
- [x] 手動：SPEC T7、T8、T9
- [x] 和你 review

### Phase 2: Draft Stores 頁

- [x] Task 3: `/admin/store/drafts` 列表、完成度、側邊欄項目
- [x] Task 4: 草稿頁的送審與刪除（單筆＋批次）
- [x] Task 5: Store Create「儲存草稿」

### Checkpoint B

- [x] lint、build 通過
- [x] 手動：SPEC T1–T6
- [x] 和你 review

### Phase 3: 前台與賣家端

- [x] Task 6: 草稿的 contact API 回空值，前台頁加 noindex
- [x] Task 7: 賣家「我的刊登」對草稿不提供操作

### Checkpoint C: 完成

- [x] lint、build 通過
- [ ] 手動：SPEC T1–T17 全部重跑一次
- [ ] 現有流程不受影響（Create、狀態切換、批次通過／拒絕／已頂讓、刪除、賣家標記已頂讓）
- [ ] 和你 review，之後才 commit、開 PR

## Risks and Mitigations

| Risk                                                                               | Impact | Mitigation                                                                                             |
| ---------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| 有地方用 `status ?? PENDING` 或 `switch` 處理狀態，漏掉 draft 不會造成型別錯誤     | Med    | T1 時用 `grep STORE_STATUS\|status` 列出所有讀取狀態的地方逐一檢查，計畫裡已列出目前找到的全部位置     |
| 空白草稿寫入 Firestore 時帶到 `undefined`（`addDoc` 會拒絕）                       | Med    | `handleSaveDraft` 只寫入表單裡已有的欄位；`price` 用 `Number(...) \|\| 0`；T5 驗證完全空白的表單可以存 |
| 草稿頁對每筆草稿讀一次賣家文件                                                     | Low    | 草稿數量少；用 `Promise.all` 平行讀取。如果之後草稿變多，再改成只讀需要的賣家                          |
| 賣家自己刊登的店轉為草稿後，賣家仍可在前端呼叫 `updateStoreStatus`（Rules 尚未擋） | Low    | SPEC 已決定之後另外加 Rules；這次 UI 不提供任何草稿操作                                                |
| 空白草稿的頂讓金是 `genDefaultStore()` 的預設值 1,000,000                          | Low    | 頂讓金不在完成度清單裡；如果你希望草稿預設是空的，在 T5 一起改（見 Open Questions）                    |
| 給賣家看的草稿頁也會送出 GA 事件（瀏覽、聯絡鎖頭）                                 | Low    | 不在範圍內，已在 SPEC 討論時告知；需要的話之後另開任務排除                                             |

## Open Questions

目前沒有。（空白草稿的頂讓金：維持 `genDefaultStore()` 的預設 1,000,000。）
