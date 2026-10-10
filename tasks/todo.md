# Tasks: Email 註冊信箱驗證

Plan: [`tasks/plan.md`](plan.md) · Spec: [`SPEC.md`](../SPEC.md)

每個任務都要先滿足以下條件才算完成：

- 修改過的檔案都跑過 `npx prettier --write`
- `npm run lint` 和 `npm run build` 沒有錯誤
- 遵守 CLAUDE.md（CSS Module 和 Tailwind 不混用在同一個元素、`cn()`、URL 不含 `/new/`、變數命名完整）
- 手動測試編號對應 SPEC 的 Testing Strategy 表

---

## Phase 1: 註冊到驗證的主流程

### Task 1: `/verify-email` 頁（待驗證狀態）、驗證工具、共用 hook 和收信卡片

**Description:** 建立驗證的基礎元件，並用 `/verify-email` 頁把它們串起來。登入中、未驗證的使用者打開這個頁面，可以重寄驗證信，也可以按「我已完成驗證」確認。

**Acceptance criteria:**

- [ ] `lib/auth/verification.ts` 匯出 `sendVerification()`（設定 zh-TW、`continueUrl` 帶 `redirect`、送 `verification_email_sent`）、`refreshVerification()`、`safeRedirectPath()`，以及錯誤訊息表 `VERIFY_ERRORS`
- [ ] `useEmailVerification()` 回傳 `{ user, authReady, isVerified, cooldown, checking, notYetVerified, error, resend, checkNow }`，監聽 `onIdTokenChanged`，未驗證時在 `visibilitychange` 自動檢查
- [ ] 未驗證時打開 `/verify-email`，會看到步驟列、收件信箱、兩顆按鈕；重寄後倒數 60 秒；尚未驗證時按確認，顯示「還沒偵測到驗證完成」

**Verification:**

- [ ] lint、build 通過
- [ ] 手動：T2、T3（先用現有帳號登入，直接打開 `/verify-email`）

**Dependencies:** None

**Files likely touched:**

- `lib/auth/verification.ts` ★
- `hooks/useEmailVerification.ts` ★
- `app/(new)/_components/VerifyEmailPanel.tsx` + `.module.css` ★
- `app/(new)/_components/AuthNav.tsx`（新增 `verify` variant）
- `app/(new)/verify-email/page.tsx` + `page.module.css` + `_components/VerifyEmailContent.tsx` ★

**Estimated scope:** M（新檔案多但每個都小）

---

### Task 2: `/signup` 註冊後寄驗證信，並導到 `/verify-email`

**Description:** `signup()` 建立帳號、寫入 user 文件後呼叫 `sendVerification()`。`SignupForm` 改為導到 `/verify-email`。寄信失敗不應該讓註冊失敗：帳號已經建好，使用者可以在 `/verify-email` 重寄。

**Acceptance criteria:**

- [ ] 註冊成功後收到驗證信，畫面導到 `/verify-email`
- [ ] 寄信失敗時（例如 too-many-requests）仍然導到 `/verify-email`，頁面上可以重寄
- [ ] `verification_email_sent` 帶 `trigger: "signup"` 和 `signup()` 的 `source`；`docs/analytics-events.md` 已記錄兩個新事件

**Verification:**

- [ ] lint、build 通過
- [ ] 手動：T1（用 plus 地址註冊，並記錄信件語言）

**Dependencies:** Task 1

**Files likely touched:**

- `lib/auth/signup.ts`
- `app/(new)/signup/_components/SignupForm.tsx`
- `docs/analytics-events.md`

**Estimated scope:** S

---

### Task 3: `/verify-email` 的成功狀態、未登入狀態、自動跳轉和 `email_verified` 事件

**Description:** 補上 `/verify-email` 另外兩種狀態。從 Firebase 處理頁回來時偵測到已驗證，就顯示成功畫面，3 秒後跳轉到安全的 `redirect`。在沒有登入的瀏覽器打開時，顯示「驗證完成，請登入」並附上登入連結（保留 `redirect`）。

**Acceptance criteria:**

- [ ] 已驗證時顯示成功畫面，3 秒後 `router.replace(safeRedirectPath(redirect))`，也提供「立即前往」按鈕
- [ ] 未登入時顯示登入提示，連到 `/login?redirect=<原本的 redirect>`
- [ ] `email_verified` 在 session 中第一次從 false 變 true 時送一次，帶 `detected_by`；已經驗證過的人重新打開頁面不會再送

**Verification:**

- [ ] lint、build 通過
- [ ] 手動：T4、T10、T12；`redirect=https://evil.com` 和 `redirect=//evil.com` 都會改成 `/store-list`

**Dependencies:** Task 1、Task 2

**Files likely touched:**

- `app/(new)/verify-email/_components/VerifyEmailContent.tsx`
- `hooks/useEmailVerification.ts`
- `app/(new)/_components/VerifyEmailPanel.tsx` + `.module.css`（成功樣式）

**Estimated scope:** S

---

## Checkpoint A：主流程

- [ ] lint、build 通過
- [ ] T1–T4、T10、T12 通過
- [ ] 回報驗證信的語言，和你一起 review 再繼續

---

## Phase 2: 限制與入口

### Task 4: 未驗證時擋下賣家聯絡方式（API 403 + 鎖頭 UI）

**Description:** `verifyUserToken` 檢查 `email_verified`，未驗證回 403 `email_unverified`。`useSellerContact` 新增 `"unverified"` 狀態：有登入但未驗證時不打 API；遇到 403 但 `user.emailVerified` 已經是 true 時，刷新 token 後重試一次。`SellerContactGate` 的鎖頭和兩顆 CTA 在 `unverified` 狀態下，顯示「驗證信箱後顯示」並連到 `/verify-email?redirect=/store/{id}`。

**Acceptance criteria:**

- [ ] 用未驗證的 token 呼叫 contact API 回 403 `{ error: "email_unverified" }`；已驗證的 token 照常回傳資料
- [ ] 未驗證的會員看到「驗證信箱後顯示」，點擊後帶著 `redirect` 前往 `/verify-email`；未登入的訪客維持原本的「免費加入會員後顯示」
- [ ] 剛驗證完回到店面頁，即使 token 是舊的，也能看到聯絡方式

**Verification:**

- [ ] lint、build 通過
- [ ] 手動：T6、T7（curl 帶 `Authorization: Bearer <未驗證帳號的 token>`）、T9

**Dependencies:** None（UI 文案連到 Task 1 的頁面）

**Files likely touched:**

- `lib/verifyUserToken.ts`
- `hooks/useSellerContact.ts`
- `app/(new)/store/[storeId]/_components/SellerContactGate.tsx` + `.module.css`

**Estimated scope:** M

---

### Task 5: Buyer Club 彈窗註冊後顯示收信步驟

**Description:** 在彈窗註冊成功後，不立刻關閉，改為顯示 `VerifyEmailPanel`（標題「差一步就完成」，加一顆「先逛逛」按鈕）。按「先逛逛」或關閉後，彈窗才卸載。重寄的 `source` 是 `buyer_club_popup`。

**Acceptance criteria:**

- [ ] 在彈窗註冊後看到收信步驟，不會閃一下就消失
- [ ] 按「先逛逛」後彈窗關閉，頁面可以繼續瀏覽，聯絡資訊顯示 Task 4 的未驗證鎖頭
- [ ] 已登入的會員進入店面頁，彈窗仍然不會出現（維持現有行為）

**Verification:**

- [ ] lint、build 通過
- [ ] 手動：T8

**Dependencies:** Task 1、Task 2

**Files likely touched:**

- `app/(new)/store/[storeId]/_components/BuyerClubPopup.tsx` + `.module.css`

**Estimated scope:** S

---

### Task 6: `/sell`、`/my-listings`、編輯頁的驗證閘門

**Description:** 這三個頁面在已登入但未驗證時，不顯示表單或列表，改顯示放在 `Card` 裡的 `VerifyEmailPanel`（情境文案：「驗證信箱後就能刊登你的店面」），`redirect` 指回目前頁面。驗證完成後（`onIdTokenChanged`）自動顯示原本的內容。

**Acceptance criteria:**

- [ ] 未驗證時進入三個頁面都看到閘門卡片，不會讀取或寫入店面資料
- [ ] 在閘門上完成驗證後，不用重新整理就會顯示原本的表單或列表
- [ ] 已驗證的帳號完全沒有變化；未登入時仍然導到 `/login?redirect=...`

**Verification:**

- [ ] lint、build 通過
- [ ] 手動：T5、T9

**Dependencies:** Task 1

**Files likely touched:**

- `app/(new)/_components/EmailVerifiedGate.tsx` ★（實作時改為包住頁面的閘門元件，表單本身不用改）
- `app/(new)/sell/page.tsx`
- `app/(new)/my-listings/page.tsx`
- `app/(new)/my-listings/edit/[storeId]/page.tsx`

**Estimated scope:** M

---

### Task 7: 頭像選單的「信箱未驗證」列

**Description:** `NavAuthStatus` 在未驗證時，於選單 email 下方加一列「信箱未驗證・點此完成驗證」，連到 `/verify-email?redirect=<目前頁面>`。

**Acceptance criteria:**

- [ ] 未驗證時看得到這一列，已驗證時看不到
- [ ] 點擊後前往 `/verify-email`，並帶上目前頁面當 `redirect`
- [ ] 這一列是 `<a>`（NextLink），CSS class 包含 `text-decoration: none; color: inherit`

**Verification:**

- [ ] lint、build 通過
- [ ] 手動：未驗證和已驗證帳號各開一次選單

**Dependencies:** Task 1

**Files likely touched:**

- `app/(new)/_components/NavAuthStatus.tsx` + `.module.css`

**Estimated scope:** S

---

## Checkpoint B：限制

- [ ] lint、build 通過
- [ ] T5–T9 通過；已驗證帳號在所有頁面看不到驗證提示
- [ ] 和你一起 review 再繼續

---

## Phase 3: 上線準備

### Task 8: 既有會員腳本

**Description:** `scripts/mark-existing-users-verified.mjs` 用 firebase-admin 分頁讀取所有使用者，篩出「有 password provider、`emailVerified` 為 false、`creationTime` 早於 `--before`」的帳號。dry run 印出數量和 uid / 建立時間 / 遮罩過的 email；加 `--apply` 才呼叫 `updateUser(uid, { emailVerified: true })`。

**Acceptance criteria:**

- [ ] 沒有 `--before` 時直接報錯結束；預設不寫入任何資料
- [ ] dry run 的名單只包含 `--before` 之前建立的未驗證帳號，email 有遮罩（例如 `yo***@gmail.com`）
- [ ] 不新增 npm 依賴，用 `node --env-file=.env` 可以直接執行

**Verification:**

- [ ] 手動：T11（只跑 dry run；`--apply` 要等部署後你同意才執行）

**Dependencies:** None

**Files likely touched:**

- `scripts/mark-existing-users-verified.mjs` ★

**Estimated scope:** S

---

### Task 9: Firestore / Storage Rules 文件

**Description:** 整理成一份文件，讓你貼到 Console：寫入店面文件（`COLLECTIONS.STORE` 對應的 mock 和 prod collection）和上傳店面圖片時，要求 `request.auth.token.email_verified == true`；寫入 user 文件不加這個條件。附上套用後的檢查步驟。

**Acceptance criteria:**

- [ ] 文件寫明要加的條件、要套用的 collection 和 path，以及不能擋 user 文件的原因
- [ ] 附上套用後的檢查方式：未驗證帳號刊登會被拒，已驗證帳號正常

**Verification:**

- [ ] 你套用 Rules 後，未驗證帳號用 devtools 直接呼叫 `createStoreDoc` 會收到 permission-denied

**Dependencies:** None

**Files likely touched:**

- `docs/firebase-rules-email-verification.md` ★

**Estimated scope:** XS

---

## Checkpoint C：完成

- [ ] T1–T12 全部通過
- [ ] SPEC 的 Success Criteria 全部成立
- [ ] 等你 review 後才 commit、開 PR（PR 描述附上 before/after 截圖）
- [ ] 上線後：部署 → 腳本 dry run → 你確認 → `--apply` → 你套用 Rules
