# Implementation Plan: Email 註冊信箱驗證

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md)

## Overview

用 email + 密碼註冊後要點擊驗證信才算完成註冊（Firebase 原生驗證連結，連結處理沿用 Firebase 預設頁）。UI 採 A 版（頁面式）：新增 `/verify-email` 頁，未驗證的帳號在「查看聯絡方式」和「刊登 / 編輯店面」被擋下，其他地方照常瀏覽。伺服器端的 contact API 也會檢查。另外提供一支一次性腳本，把既有會員標成已驗證。

## Architecture Decisions

- **一個共用的 hook 管所有驗證狀態**：`hooks/useEmailVerification.ts` 負責目前使用者、`emailVerified`、重寄冷卻、手動確認和錯誤訊息。`/verify-email`、`/sell`、`/my-listings`、編輯頁和 Buyer Club 都用它，行為才會一致。
- **監聽 `onIdTokenChanged`，不用 `onAuthStateChanged`**：`user.reload()` 不會觸發 `onAuthStateChanged`，所以驗證完成後畫面不會更新。`refreshVerification()` 會呼叫 `getIdToken(true)`，這會觸發 `onIdTokenChanged`，所有監聽它的元件就會同步更新。
- **回到分頁時自動重新檢查**：使用者通常在另一個分頁點開驗證信，所以 hook 在還沒驗證時監聽 `visibilitychange`，分頁重新被看到就靜默檢查一次。
- **token 過期的保險**：已驗證但手上還是舊 token 時，contact API 會回 403 `email_unverified`。`useSellerContact` 遇到這種情況，如果 `user.emailVerified` 已經是 true，就用 `getIdToken(true)` 重試一次。
- **一個共用的收信卡片**：`app/(new)/_components/VerifyEmailPanel.tsx` 只負責畫面（信箱、按鈕、錯誤訊息、可選的步驟列和情境文案），狀態從 hook 傳進來。各頁面只把它放進自己的 `Card`。
- **`/verify-email` 沿用驗證頁外殼**：和 `/signup`、`/login` 一樣用 `AuthNav` 加點點背景，`AuthNav` 新增 `verify` variant。這部分已經寫回 SPEC。
- **`redirect` 只接受站內路徑**：用 `safeRedirectPath()` 檢查，只接受以 `/` 開頭、但不是 `//` 開頭的值，否則改用 `/store-list`，避免 open redirect。
- **聯絡資訊的新狀態**：`useSellerContact` 新增 `"unverified"`。有登入但未驗證時不打 API，直接回這個狀態。`SellerContactGate` 的鎖頭和兩顆 CTA 在這個狀態下都連到 `/verify-email?redirect=/store/{id}`。
- **Buyer Club 註冊後留在彈窗**：彈窗現在一偵測到登入就自動關閉並卸載。改成加一個 `justSignedUp` 狀態，註冊成功後先顯示收信步驟，按「先逛逛」才關閉。
- **腳本不依賴新套件**：`scripts/mark-existing-users-verified.mjs` 是純 ESM，用 `node --env-file=.env` 執行，讀取和 `firebase/configs.ts` 相同的 `FIREBASE_SERVER_*` 環境變數。預設 dry run，加 `--apply` 才寫入，必須帶 `--before`。

## Dependency Graph

```
lib/auth/verification.ts (sendVerification, refreshVerification, safeRedirectPath)
        │
        ├── hooks/useEmailVerification.ts
        │        │
        │        ├── VerifyEmailPanel ──┬── /verify-email page (T1, T3)
        │        │                      ├── Buyer Club 收信步驟 (T5)
        │        │                      └── /sell, /my-listings, edit 閘門 (T6)
        │        └── NavAuthStatus 選單列 (T7)
        │
        └── lib/auth/signup.ts 寄信 (T2)

lib/verifyUserToken.ts (403) ── useSellerContact "unverified" ── SellerContactGate (T4)

scripts/mark-existing-users-verified.mjs (T8)   docs/rules (T9)   ← 獨立
```

## Task List

### Phase 1: 註冊到驗證的主流程

- [x] Task 1: `/verify-email` 頁（待驗證狀態）、驗證工具、共用 hook 和收信卡片
- [x] Task 2: `/signup` 註冊後寄驗證信，並導到 `/verify-email`
- [x] Task 3: `/verify-email` 的成功狀態、未登入狀態、自動跳轉和 `email_verified` 事件

### Checkpoint A：主流程

- [ ] lint、build 通過
- [ ] T1–T4、T10、T12 手動通過（註冊 → 收信 → 點連結 → 回到站內成功跳轉）
- [ ] 確認驗證信的語言，並和你一起 review

### Phase 2: 限制與入口

- [x] Task 4: 未驗證時擋下賣家聯絡方式（API 403 + 鎖頭 UI）
- [ ] Task 5: Buyer Club 彈窗註冊後顯示收信步驟
- [ ] Task 6: `/sell`、`/my-listings`、編輯頁的驗證閘門
- [ ] Task 7: 頭像選單的「信箱未驗證」列

### Checkpoint B：限制

- [ ] lint、build 通過
- [ ] T5–T9 手動通過，已驗證帳號看不到任何差異
- [ ] 和你一起 review

### Phase 3: 上線準備

- [ ] Task 8: 既有會員腳本（dry run 為預設）
- [ ] Task 9: Firestore / Storage Rules 文件

### Checkpoint C：完成

- [ ] T1–T12 全部通過，SPEC 的 Success Criteria 全部成立
- [ ] 等你 review 後才 commit、開 PR

## Parallelization

T4、T8、T9 不依賴 Phase 1，可以平行做。T5–T7 依賴 T1 的 hook 和卡片。實際上會照順序一個一個做，每個 checkpoint 停下來給你看。

## Risks and Mitigations

| Risk                                                           | Impact | Mitigation                                                                                      |
| -------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------- |
| dev 和 prod 共用 Firebase 專案，測試會建立真的帳號、寄出真的信 | Med    | 用 `you+verify1@gmail.com` 這種 plus 地址測試。測試帳號在 Console 刪除由你操作                  |
| 驗證後 ID token 仍是舊的，API 回 403                           | High   | `refreshVerification()` 強制刷新 token；`useSellerContact` 遇到 403 會刷新後重試一次（T6 測試） |
| `reload()` 不會觸發 `onAuthStateChanged`，畫面停在未驗證       | High   | hook 改用 `onIdTokenChanged`，回到分頁時重新檢查                                                |
| Buyer Club 彈窗在登入後自動卸載，收信步驟顯示不出來            | Med    | 用 `justSignedUp` 狀態覆蓋「已登入就隱藏」的判斷（T8 測試）                                     |
| 驗證信是英文                                                   | Low    | T1 確認。如果是英文，再決定要不要在 Console 加繁中範本                                          |
| Rules 不在 repo，可能和 code 的預期不一致                      | Med    | T9 整理要加的條件和原因，由你貼到 Console 後再跑一次刊登測試                                    |
| 部署到執行腳本之間，舊會員被當成未驗證                         | Low    | 部署後立刻執行，或排在離峰時段                                                                  |
| `continueUrl` 的網域不在授權網域內，寄信失敗                   | Low    | localhost 預設已授權；正式網域在重設密碼信已經在用                                              |

## Open Questions

目前沒有。
