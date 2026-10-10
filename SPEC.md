# Spec: Email 註冊信箱驗證

## Objective

用 email + 密碼註冊的會員，必須點擊驗證信中的連結，才算完成註冊。未驗證的帳號可以照常登入與瀏覽，但不能查看賣家聯絡方式，也不能刊登或編輯店面。

**使用者**：在 Bezold 註冊的買家（多數從 Buyer Club 彈窗或聯絡資訊鎖頭進來）和賣家（從 `/sell` 進來）。

**為什麼**：確保會員的 email 是真的，賣家聯絡方式只給可聯繫的真人，也減少假帳號刊登。

### 已確定的決策

| 項目       | 決定                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| 驗證方式   | Firebase 原生驗證連結（`sendEmailVerification`），不做 OTP                     |
| 連結處理頁 | **做法 1**：沿用 Firebase 預設的處理頁；`continueUrl` 帶回本站 `/verify-email` |
| 既有會員   | 一次性腳本，把上線前建立的帳號標成 `emailVerified: true`                       |
| 限制強度   | 軟性限制：只擋「查看賣家聯絡方式」和「刊登 / 編輯店面」                        |
| UI 方向    | Prototype 的 **A 版（頁面式）**                                                |

### User stories 與驗收條件

1. **註冊後收信**：在 `/signup` 送出後，系統寄出繁中驗證信，畫面導到 `/verify-email`，顯示收件信箱、「我已完成驗證」和「重寄驗證信」按鈕。
2. **完成驗證**：點擊信中連結，經過 Firebase 處理頁後回到 `/verify-email`。頁面偵測到已驗證，就顯示成功畫面，3 秒後自動前往 `redirect` 參數指定的頁面（預設 `/store-list`）。
3. **重寄**：按「重寄驗證信」後再寄一封，按鈕進入 60 秒冷卻；遇到 `auth/too-many-requests` 時顯示繁中錯誤訊息。
4. **手動確認**：按「我已完成驗證」會重新抓取帳號狀態。尚未驗證就顯示「還沒偵測到驗證完成」；已驗證則進入成功畫面。
5. **Buyer Club 彈窗**：在彈窗註冊後，彈窗切換到「差一步就完成」的收信畫面，按「先逛逛」才關閉，之後可以繼續瀏覽。
6. **聯絡資訊鎖頭**：已登入但未驗證時，鎖頭文字是「驗證信箱後顯示」，點擊後前往 `/verify-email?redirect=/store/{storeId}`。未登入時維持現在的「免費加入會員後顯示」。
7. **刊登與編輯**：未驗證的使用者進入 `/sell`、`/my-listings`、`/my-listings/edit/[storeId]` 時，表單換成整頁的驗證卡片。
8. **頭像選單**：未驗證時，選單第一列顯示「信箱未驗證」，點擊前往 `/verify-email`。
9. **伺服器端**：`GET /api/stores/[storeId]/contact` 收到未驗證的 token，回 `403 { error: "email_unverified" }`。
10. **既有會員不受影響**：腳本執行後，上線前註冊的帳號登入後一切照舊，看不到任何驗證提示。
11. **轉換率追蹤**：透過 `trackEvent()` 送出兩個 GA4 事件，並記錄在 `docs/analytics-events.md`：
    - `verification_email_sent`：每寄出一封驗證信送一次。參數 `trigger`（`signup` | `resend`）、`source`（註冊時沿用 `signup()` 的 `source`；重寄時是當下頁面，例如 `verify_email_page`、`sell_gate`）。
    - `email_verified`：在這個 session 中第一次偵測到 `emailVerified` 從 false 變成 true 時送一次。參數 `detected_by`（`page_load` | `manual_check`）。

### 驗證信範本

使用 Firebase 內建範本，不做修改。Console 已設定寄件人「Bezold」`<noreply@bezold.com.tw>`。寄信前設定 `auth.languageCode = "zh-TW"`，和現在的重設密碼信一致；T1 會確認收到的信是什麼語言。

### 不在範圍內

- 自建 `/auth/action` 處理頁（做法 2）和品牌化的「連結失效」畫面。
- OTP 驗證碼、更改 email、Google / 第三方登入。
- 重設密碼流程（維持現狀）。
- 後台 admin 登入（admin 帳號由既有會員腳本標成已驗證）。

## Tech Stack

Next.js 14（App Router）· TypeScript · React 18 · Firebase JS SDK 10（Auth、Firestore、Storage）· firebase-admin 11 · Jotai · CSS Modules + Tailwind · Node 24（`.nvmrc`）。

**注意**：`.env` 與 `.env.development` 指向**同一個 Firebase 專案**，dev 和 prod 共用同一批 Auth 使用者。本機測試會寄出真的信，既有會員腳本也會一次影響全部帳號。

## Commands

```bash
nvm use
npm run dev       # 開發伺服器（port 3000）
npm run lint      # ESLint
npm run build     # production build，型別檢查
npx prettier --write <changed files>

# 既有會員腳本：預設只列出名單（dry run），加 --apply 才寫入
node --env-file=.env scripts/mark-existing-users-verified.mjs --before 2026-10-20T00:00:00+08:00
node --env-file=.env scripts/mark-existing-users-verified.mjs --before 2026-10-20T00:00:00+08:00 --apply
```

## Project Structure

新增（★）與修改（✎）的檔案：

```
lib/auth/
  signup.ts                         ✎ 建立帳號後寄驗證信
  verification.ts                   ★ sendVerification(user, redirectPath)、refreshVerification(user)、錯誤訊息表
hooks/
  useEmailVerification.ts           ★ 驗證狀態 + 重寄冷卻 + 手動確認，給所有驗證 UI 共用
  useSellerContact.ts               ✎ 新增 "unverified" 狀態
lib/
  verifyUserToken.ts                ✎ 檢查 decoded.email_verified，未驗證回 403
app/(new)/
  _components/
    VerifyEmailPanel.tsx (+ .module.css)  ★ 收信卡片（信箱、步驟、兩顆按鈕、錯誤訊息），各處共用
    NavAuthStatus.tsx (+ .module.css)     ✎ 選單加「信箱未驗證」列
  verify-email/
    page.tsx                        ★ 沿用 /signup、/login 的驗證頁外殼（AuthNav + 點點背景）
    page.module.css                 ★
  _components/AuthNav.tsx           ✎ 新增 "verify" variant（「想先逛逛？回到找店面」）
    _components/VerifyEmailContent.tsx    ★ 待驗證 / 成功 / 未登入 三種狀態
  signup/_components/SignupForm.tsx       ✎ 註冊後導到 /verify-email
  store/[storeId]/_components/
    BuyerClubPopup.tsx              ✎ 註冊後顯示收信步驟
    SellerContactGate.tsx           ✎ 未驗證的鎖頭文字與連結
  sell/_components/SellForm.tsx           ✎ 未驗證 → VerifyEmailPanel
  my-listings/_components/MyListingsContent.tsx       ✎ 同上
  my-listings/edit/[storeId]/_components/EditListingForm.tsx  ✎ 同上
scripts/
  mark-existing-users-verified.mjs  ★ 一次性腳本（firebase-admin，dry run 為預設）
docs/
  analytics-events.md               ✎ 新增驗證相關事件
  firebase-rules-email-verification.md  ★ 給你貼到 Console 的 Firestore / Storage rules 片段
```

## Code Style

沿用 repo 現有慣例：CSS Module 負責外觀、Tailwind 只用在沒有 module class 的排版容器；條件 class 用 `cn()`；錯誤碼對應繁中文案的表格；變數用完整英文命名。

```ts
// lib/auth/verification.ts
import { sendEmailVerification, type User } from "firebase/auth";
import { auth, trackEvent } from "@/firebase/client";

export const VERIFY_ERRORS: Record<string, string> = {
  "auth/too-many-requests": "寄送次數過多，請稍後再試",
  "auth/network-request-failed": "網路連線失敗，請再試一次",
};

// Sends (or re-sends) the verification email. The link returns the user to
// /verify-email, which forwards to `redirectPath` once verified.
export async function sendVerification(
  user: User,
  { redirectPath = "/store-list", trigger, source }: SendVerificationOptions,
) {
  auth.languageCode = "zh-TW";
  const continueUrl = new URL("/verify-email", window.location.origin);
  continueUrl.searchParams.set("redirect", redirectPath);
  await sendEmailVerification(user, { url: continueUrl.toString() });
  trackEvent("verification_email_sent", { trigger, source });
}

// emailVerified on the cached user and the ID token's email_verified claim are
// both stale until reloaded — refresh both before trusting either.
export async function refreshVerification(user: User): Promise<boolean> {
  await user.reload();
  await user.getIdToken(true);
  return user.emailVerified;
}
```

其他規則：

- `/verify-email` 和 `/signup`、`/login` 一樣使用 `AuthNav` 外殼；其他頁面的閘門卡片放在原本的 Page shell 內。
- URL 不含 `/new/`。`redirect` 參數只接受以 `/` 開頭的站內路徑，避免 open redirect。
- 每個修改或新增的檔案都跑 prettier。

## Testing Strategy

這個專案**沒有測試框架**，加入測試框架屬於「先詢問」。這次的驗證方式：

1. `npm run lint` 和 `npm run build` 都要通過。
2. 在 dev server 用瀏覽器手動跑以下流程（需要一個收得到信的測試信箱）：

| #   | 流程                                         | 預期結果                                                                                                   |
| --- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| T1  | `/signup` 註冊                               | 導到 `/verify-email`，收到繁中驗證信                                                                       |
| T2  | 未驗證時按「我已完成驗證」                   | 顯示「還沒偵測到驗證完成」                                                                                 |
| T3  | 重寄                                         | 收到第二封信，按鈕倒數 60 秒                                                                               |
| T4  | 點信中連結 → 繼續                            | 回到 `/verify-email`，顯示成功，3 秒後跳轉到 `redirect`                                                    |
| T5  | 未驗證時進入 `/sell`、`/my-listings`、編輯頁 | 顯示驗證卡片，看不到表單                                                                                   |
| T6  | 未驗證時在店面頁點鎖頭                       | 前往 `/verify-email?redirect=/store/{id}`；驗證後回到店面，可看到聯絡方式                                  |
| T7  | 用 curl 帶未驗證的 token 呼叫 contact API    | 回 403 `email_unverified`                                                                                  |
| T8  | Buyer Club 彈窗註冊                          | 出現收信步驟，按「先逛逛」後關閉                                                                           |
| T9  | 已驗證的帳號（或腳本標記過的舊帳號）         | 所有頁面和現在一樣，沒有驗證提示                                                                           |
| T10 | 在另一個沒登入的瀏覽器開驗證連結             | `/verify-email` 顯示「驗證完成，請登入」                                                                   |
| T11 | 腳本 dry run                                 | 只列出 `--before` 之前建立、尚未驗證的帳號，不寫入                                                         |
| T12 | 走一次 T1 → T3 → T4，開 GA4 DebugView        | 依序看到 `verification_email_sent`（signup）、`verification_email_sent`（resend）、`email_verified` 各一次 |

## Boundaries

- **Always**
  - 在這個 worktree 的分支上工作，做完先停下來等你 review，再 commit 和開 PR。
  - 遵守 CLAUDE.md 的樣式、頁面外殼和 Firebase 規則（例如 `COLLECTIONS`、`omitSellerContact`、`updateDoc` 不寫入 `undefined`）。
  - 伺服器端（API）和 Rules 都要擋，前端的擋法只負責 UX。
  - 每次修改都跑 prettier、lint、build。
- **Ask first**
  - 新增任何 npm 依賴（測試框架、`tsx` 等）。
  - 用 `--apply` 實際執行既有會員腳本（會改到正式環境的帳號）。
  - Firebase Console 的任何設定變更（Rules、授權網域），這些由你操作。
  - 修改重設密碼流程，或改成自建 `/auth/action`。
- **Never**
  - commit `.env`、service account 或任何金鑰。
  - 直接修改 `main` 或 push 到 `main`。
  - 為了方便測試，關掉伺服器端的驗證檢查。
  - 讓賣家聯絡方式出現在公開 payload。

## Success Criteria

- User stories 1–11 的驗收條件全部成立，測試表 T1–T12 全部通過。
- `npm run lint`、`npm run build` 沒有錯誤。
- 未驗證的 token 無法從 contact API 取得聯絡方式（T7）。
- Rules 套用後，未驗證帳號無法寫入店面文件或上傳店面圖片，但註冊時寫入 user 文件不受影響。
- 腳本 apply 之後，上線前的帳號全部是 `emailVerified: true`，上線後註冊的帳號不受影響。

## Rollout 順序

1. PR merge 並部署。
2. 立刻執行腳本（先 dry run 給你確認，再 `--apply`），`--before` 設為部署完成的時間。只標記部署前建立的帳號，避免把上線後新註冊、還沒驗證的帳號也標掉。
3. 你在 Firebase Console 套用 `docs/firebase-rules-email-verification.md` 裡的 Firestore 和 Storage Rules。

在步驟 1 和 2 之間的幾分鐘內，舊會員會被當成未驗證。這段期間很短，影響可以接受；如果不能接受，就把部署和腳本排在離峰時段一起做。

## Open Questions

目前沒有。（Analytics 事件：要加，見 user story 11。驗證信範本：使用 Firebase 內建範本。）
