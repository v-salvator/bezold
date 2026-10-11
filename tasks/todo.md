# Tasks: 草稿商店（`draft` 狀態）

Plan: [`tasks/plan.md`](plan.md) · Spec: [`SPEC.md`](../SPEC.md)

每個任務都要先滿足以下條件才算完成：

- 修改過的檔案都跑過 `npx prettier --write`
- `npm run lint` 和 `npm run build` 沒有錯誤
- 遵守 CLAUDE.md（CSS Module 和 Tailwind 不混用在同一個元素、`cn()`、`COLLECTIONS`、`updateDoc`／`addDoc` 不寫入 `undefined`、變數命名完整）
- 手動測試編號對應 SPEC 的 Testing Strategy 表

---

## Phase 1: 狀態與轉為草稿

### Task 1: 新增 `draft` 狀態與所有對照表

**Description:** 在 `STORE_STATUS` 加上 `DRAFT: "draft"`，並補齊所有以 `StoreStatus` 為 key 的對照表：管理後台的標籤與顏色、賣家端「整理中」徽章（新的中性樣式）。這個任務只讓型別和顯示文字就緒，不改變任何流程。

**Acceptance criteria:**

- [x] `STORE_STATUS.DRAFT === "draft"`，`StoreStatus` 型別包含它
- [x] `STATUS_LABEL.draft === "草稿"`；`STATUS_COLOR.draft` 為紫色（Ant Design `"purple"`）
- [x] `StatusBadge` 對 draft 顯示「整理中」，樣式和其他四種狀態有明顯區別
- [x] 用 grep 確認所有讀取 store 狀態的地方都檢查過，清單寫在 PR 描述裡

**Verification:**

- [x] lint、build 通過（型別檢查會擋下漏掉的對照表）

**Dependencies:** None

**Files likely touched:**

- `types/StoreStatus.ts`
- `constant/adminStore.ts`
- `app/(new)/my-listings/_components/StatusBadge.tsx`
- `app/(new)/my-listings/_components/StatusBadge.module.css`

**Estimated scope:** S

---

### Task 2: Store List 轉為草稿（drawer＋批次），Store List／Analytics 排除草稿

**Description:** 管理員可以在 Store List 把任何狀態的店轉為草稿：`StoreDetailDrawer` 加「↩ 轉為草稿」，批次操作列加同名按鈕。兩者都先跳確認框；選取的店如果包含已上架或已頂讓，確認文字說明會從前台列表下架。轉換後該店從 Store List 消失。Store List 和 Store Analytics（包含「所有狀態」）都不再列出草稿。

**Acceptance criteria:**

- [x] Drawer 與批次的「轉為草稿」都會先確認，確認後只改 `status` 和 `updateTime`，該列從表格消失
- [x] 批次中有失敗的列時，失敗的列保持勾選並顯示失敗數量（與現有批次行為相同）
- [x] Store List、Store Analytics 的狀態篩選沒有「草稿」選項，「所有狀態」也不含草稿

**Verification:**

- [x] lint、build 通過
- [x] 手動：SPEC T7、T8、T9（dev 環境，用 mockStore 的資料）

**Dependencies:** Task 1

**Files likely touched:**

- `app/admin/store/list/page.tsx`
- `app/admin/store/list/_components/StoreDetailDrawer.tsx`
- `app/admin/store/analytics/page.tsx`

**Estimated scope:** M

---

## Checkpoint A

- [x] lint、build 通過
- [x] 手動：SPEC T7、T8、T9
- [x] 和你 review 後再進 Phase 2

---

## Phase 2: Draft Stores 頁

### Task 3: `/admin/store/drafts` 列表、完成度、側邊欄項目

**Description:** 新增 Draft Stores 頁，列出所有草稿（建立時間新到舊），欄位為勾選、店名（空白顯示「（未命名）」）、完成度、城市／區域、頂讓金、建立、最後編輯、操作（編輯）。完成度由 `getDraftChecklist()` 計算：必填 5 項（店名、地址、描述、賣家姓名、賣家電話）＋建議 4 項（城市、區域、類別、至少一張圖片），共 9 項。可依店名搜尋。側邊欄在 Store List 下方新增「Draft Stores」（不顯示數量）。

**Acceptance criteria:**

- [x] 頁面只列出 `status === "draft"` 的店，預設依建立時間新到舊排序；有「建立」和「最後編輯」兩欄
- [x] 完成度百分比 = 已填項目 ÷ 9，賣家欄位讀自 `getUserById(store.user)`，賣家文件不存在時視為未填
- [x] 側邊欄「Draft Stores」可導到此頁，且在此頁時呈現選取狀態；「＋ 新增草稿」導到 `/admin/store/create`

**Verification:**

- [x] lint、build 通過
- [x] 手動：把一間資料齊全的店和一間缺圖片的店轉為草稿，確認兩者的完成度（賣家資料齊全時分別是 100% 和 89%）和排序正確

**Dependencies:** Task 2（需要草稿資料才能驗證）

**Files likely touched:**

- `constant/storeDraft.ts` ★
- `utils/storeDraft.ts` ★
- `app/admin/store/drafts/page.tsx` ★
- `components/AdminSidebar.tsx`

**Estimated scope:** M

---

### Task 4: 草稿頁的送審與刪除（單筆＋批次）

**Description:** 在 Draft Stores 頁加上送審與刪除。單筆「送審」在必填齊全時可按，按下後 `status → pending`；必填未齊時停用，滑過顯示缺少的必填欄位。勾選後出現批次列「送審／刪除／取消選取」：批次送審只處理必填齊全的列，其餘保持勾選並提示「N 筆缺少必填，未送審」。刪除沿用 `DELETE /api/stores/{id}`，單筆與批次都先確認。

**Acceptance criteria:**

- [x] 送審成功後該列從草稿頁消失，Store List 出現該店且狀態為「待審核」
- [x] 必填未齊時「送審」停用，tooltip 列出缺少的必填欄位
- [x] 批次送審與批次刪除都正確處理部分失敗或部分不符條件的情況，相關列保持勾選

**Verification:**

- [x] lint、build 通過
- [x] 手動：SPEC T3、T4、T5、T6

**Dependencies:** Task 3

**Files likely touched:**

- `app/admin/store/drafts/page.tsx`

**Estimated scope:** S

---

### Task 5: Store Create「儲存草稿」

**Description:** Store Create 底部按鈕變成「Cancel ／ 儲存草稿 ／ Create」。「儲存草稿」不做任何必填檢查，建立 user 文件與 store 文件（`status: draft`），成功後和 Create 一樣導到圖片上傳頁。「Create」行為不變。

**Acceptance criteria:**

- [x] 完全空白的表單可以儲存草稿，Firestore 沒有 `undefined` 錯誤，文件的空字串欄位為 `""`
- [x] 儲存後導到 `/admin/store/edit/{storeId}/image`，Draft Stores 出現該筆，店名顯示「（未命名）」
- [x] 「Create」仍然檢查必填並建立為 `pending`，不出現在 Draft Stores

**Verification:**

- [x] lint、build 通過
- [x] 手動：SPEC T1、T2

**Dependencies:** Task 1（Task 3 完成後才看得到列表結果）

**Files likely touched:**

- `app/admin/store/create/StoreBaseForm.tsx`

**Estimated scope:** S

---

## Checkpoint B

- [x] lint、build 通過
- [x] 手動：SPEC T1–T6
- [x] 和你 review 後再進 Phase 3

---

## Phase 3: 前台與賣家端

### Task 6: 草稿的 contact API 回空值，前台頁加 noindex

**Description:** `GET /api/stores/[storeId]/contact` 對 `draft` 回傳空的聯絡資料（和 `sold` 走同一個分支）。`/store/[storeId]` 的 `generateMetadata` 對 `draft` 加 `robots: { index: false, follow: false }`。前台元件不改，未登入時照樣顯示「免費加入會員後顯示」。

**Acceptance criteria:**

- [x] 會員 token 呼叫草稿的 contact API，四個欄位都是空字串；送審並通過後恢復正常
- [x] 草稿頁的 HTML 有 `<meta name="robots" content="noindex, nofollow">`，已上架的店面頁沒有
- [x] 未登入看草稿頁，聯絡區與一般店面相同（模糊＋鎖頭＋上鎖的 CTA）；已驗證的會員看到「賣家尚未提供聯絡方式」

**Verification:**

- [x] lint、build 通過
- [x] 手動：SPEC T13–T17

**Dependencies:** Task 1

**Files likely touched:**

- `app/api/stores/[storeId]/contact/route.ts`
- `app/(new)/store/[storeId]/page.tsx`

**Estimated scope:** S

---

### Task 7: 賣家「我的刊登」對草稿不提供操作

**Description:** 賣家的店被轉為草稿後，「我的刊登」顯示「整理中」徽章，沒有「編輯」和「標記已頂讓」。`ListingCard` 的 `canEdit` 已經只允許 pending／approved，只需確認；`EditListingForm` 遇到 draft 時導回 `/my-listings`（比照 rejected）。

**Acceptance criteria:**

- [ ] 草稿在「我的刊登」顯示「整理中」，沒有任何操作按鈕
- [ ] 直接打開草稿的 `/my-listings/edit/{storeId}` 會被導回 `/my-listings`
- [ ] 草稿送審後，「我的刊登」顯示「審核中」，編輯按鈕恢復

**Verification:**

- [ ] lint、build 通過
- [ ] 手動：SPEC T11、T12（需要一個在 dev 環境刊登過店面的賣家帳號）

**Dependencies:** Task 1

**Files likely touched:**

- `app/(new)/my-listings/edit/[storeId]/_components/EditListingForm.tsx`
- `app/(new)/my-listings/_components/ListingCard.tsx`（只在需要時修改）

**Estimated scope:** XS

---

## Checkpoint C: 完成

- [ ] lint、build 通過
- [ ] 手動：SPEC T1–T17 全部重跑一次
- [ ] 現有流程不受影響：Create、drawer 狀態切換、批次通過／拒絕／已頂讓、刪除、賣家標記已頂讓
- [ ] 和你 review，之後才 commit、開 PR
