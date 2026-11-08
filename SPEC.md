# Spec: Listing follow-up email (自動追蹤頂讓狀態)

> Single capability, one spec. Every piece (anchor date, cron + email, the answer page, the admin view) serves one flow and is only testable end-to-end together, so no capability map.

## Objective

Listings stay 「上架中」 long after the shop has been handed over, because sellers forget to come back and press 「已頂讓」 on `/my-listings`. Buyers then contact dead listings.

We email every seller whose listing has been approved for **2 months**, asking whether the shop has been taken over. The email links to a page on our site where the seller answers with one click, **without logging in**:

- **「已頂讓」** → after a confirm step, the store's status becomes `sold` immediately.
- **「還在頂讓」** → nothing changes on the listing; we ask again **1 month later**.
- **No answer** → nothing changes; we ask again 1 month after the last email.

There is no limit on reminders. Admins can see how many follow-up emails each store has received, and can turn follow-ups off for any store.

Right after a seller confirms 已頂讓, by email link **or** with the existing button on `/my-listings`, we show a short optional **頂讓回饋** form: how long it took, where the buyer came from, final price, satisfaction, and comments. Only admins see the answers.

**Users**: sellers (receive the email, answer on the page, leave feedback); admins (watch counts, stop sending, read feedback).

### User stories

1. As a seller whose shop is sold, I click the link in the email, press 「已頂讓」 → 「確認」, and my listing shows 已頂讓 without logging in.
2. As a seller still looking for a buyer, I press 「還在頂讓」 and hear from Bezold again in a month.
3. As an admin, I see 「追蹤信 N 封」 on each store and can switch follow-ups off for a store (e.g. a seller who asked us to stop).
4. As a seller who just marked my shop sold (from the email or /my-listings), I can tell Bezold how it went in under a minute, or skip.
5. As an admin, I read each sold store's feedback in its drawer, to learn whether Bezold brought the buyer and how long deals take.

## Decisions (agreed 2026-11-08)

| Topic            | Decision                                                                                                                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2-month anchor   | New `approvedTime` on the store, set the **first** time an admin approves it (never overwritten on re-approval). Stores approved before this ships have none → fall back to `createTime`.                                                                        |
| Auth on the page | No login. A one-click link holding a random token. Protections below.                                                                                                                                                                                            |
| Cadence          | First email at anchor + 60 days. After that, every 30 days from the later of the last email / last 「還在頂讓」 answer. No cap.                                                                                                                                  |
| Stop sending     | Admin-only `paused` switch per store. Nothing stops automatically.                                                                                                                                                                                               |
| Sending          | Vercel Cron (daily) → route handler → **Brevo transactional API** from `hello@bezold.com.tw` (DKIM already set up on Brevo).                                                                                                                                     |
| Email design     | Follows the user's prototype (2026-11-08): dark header with logo, listing summary card, two answer buttons. See Email below.                                                                                                                                     |
| Sold feedback    | Optional form after every 已頂讓 confirm (email link and `/my-listings`). Five fields, all optional, one submission per store, admin-only.                                                                                                                       |
| Launch backlog   | Per-run cap is `FOLLOW_UP_MAX_PER_RUN` (default 100). Launch with **20** so the backlog spreads over about a week (fewer people hit if the first email has a bug, replies arrive a few a day, later 30-day rounds stay spread out). Raise it after a quiet week. |
| Sender name      | `Bezold 頂讓必售 <hello@bezold.com.tw>`, the name the site already uses in its title, metadata and terms.                                                                                                                                                        |
| Header image     | Cropped from the current logo `public/bezold-avatar-v2.png` (BEZOLD + 「必售！頂讓創業平台」 on `#1c1a17`). `bezold-removebg-rect.png` is the outdated admin logo. Never use it.                                                                                 |

### Link security (accepted residual risk: whoever the seller forwards the email to can mark that one store sold)

- Token = 32 random bytes (`crypto.randomBytes`), base64url. Only its **SHA-256 hash** is stored. Neither the code nor the database can produce a valid link, and there is no format to guess (2²⁵⁶ space).
- One token per email, scoped to **one store**. Sending a new email replaces the hash, so the old link dies.
- **Single-use**: answering marks the token used. **Expires 30 days** after sending.
- Opening the link (GET) changes nothing. Mail scanners that prefetch links are harmless. Only a button press on the page (POST) writes. The email button only pre-selects the answer, and for 已頂讓 the page warns 「刊登會立即改成已頂讓，無法自行復原」 next to the confirm button.
- Works only while the store is `approved`. A store that is pending, rejected, draft or already sold shows 「此連結已失效」.
- The sold write records `soldTime` and `soldVia: "follow-up-email"` on the store. A confirmation email goes to the seller: 「如非本人操作，請直接回覆此信」. An admin can switch the status back from the store drawer.
- **No rate limiting.** At 256 bits, guessing is infeasible without it, and the app has no store (KV/Redis) to rate-limit with. Revisit if abuse ever shows up in logs.

## Tech Stack

Existing: Next.js 14 App Router · TypeScript · Firebase Admin SDK (`firebase/server.ts`) · Ant Design (admin) · CSS Modules + Tailwind (public page).

New:

- **Brevo REST API** (`POST https://api.brevo.com/v3/smtp/email`) called with `fetch`. **No new npm dependency.**
- **Vercel Cron** via a new `vercel.json`.
- Node `crypto` for token generation and hashing.

New env vars (server-only, the user adds them in Vercel and `.env.development`):

| Var                        | Purpose                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `BREVO_API_KEY`            | Brevo transactional API key (separate from the SMTP key used by Gmail send-as)                                                        |
| `CRON_SECRET`              | Vercel sends `Authorization: Bearer $CRON_SECRET` to cron routes. The route rejects anything else.                                    |
| `FOLLOW_UP_TEST_RECIPIENT` | **Required when `NEXT_PUBLIC_ENV_VERSION=dev`**: every follow-up email goes here instead of the seller. Dev never emails real people. |
| `FOLLOW_UP_MAX_PER_RUN`    | Optional. Emails per cron run, default 100. Set to `20` for the launch week, then remove.                                             |
| `FOLLOW_UP_ENABLED`        | Kill switch. The cron sends nothing unless this is `true`. Lets the code ship before launch.                                          |

## Data model

### Store (existing collection) — admin/server-written fields, no seller rule change

| Field          | Type                | Written by                                                  |
| -------------- | ------------------- | ----------------------------------------------------------- |
| `approvedTime` | `Timestamp`         | Admin approve action (browser SDK, admin), only when absent |
| `soldTime`     | `Timestamp`         | Answer API when the seller confirms 已頂讓 (Admin SDK)      |
| `soldVia`      | `"follow-up-email"` | Answer API (Admin SDK). Absent = sold some other way        |

These are not in `sellFormKeys()` / `ownerEditableKeys()`, so sellers can't write them (correct). Not shown on store cards.

### Follow-up (new collection) — Admin SDK only

`COLLECTIONS.FOLLOW_UP` = `mockFollowUp` / `prodFollowUp`. Doc id = `storeId`. Clients are denied by the existing catch-all `match /{document=**}`.

```ts
// types/FollowUp.ts
export const FOLLOW_UP_ANSWER = {
  SOLD: "sold",
  STILL_SELLING: "still_selling",
} as const;
export type FollowUpAnswer =
  (typeof FOLLOW_UP_ANSWER)[keyof typeof FOLLOW_UP_ANSWER];

export interface FollowUpDoc {
  storeId: string;
  sentCount: number; // * total follow-up emails sent, ever
  lastSentTime: Timestamp | null;
  lastAnswer: FollowUpAnswer | null;
  lastAnswerTime: Timestamp | null;
  paused: boolean; // * admin switch — true = never email this store again
  // * current link — replaced on every send, so older links die
  tokenHash: string; // * sha256(token) hex; "" when none outstanding
  tokenExpireTime: Timestamp | null;
  tokenUsed: boolean;
  lastError: string; // * "" or why the last attempt didn't send (e.g. "no_email")
}
```

Token lookup on the answer page is `where("tokenHash", "==", hash)`. That's a single-field equality query with an automatic index, so `firestore.indexes.json` doesn't change.

### Sold feedback (new collection) — Admin SDK only

`COLLECTIONS.SOLD_FEEDBACK` = `mockSoldFeedback` / `prodSoldFeedback`. Doc id = `storeId`, so there's one per store. A second submit → 409. Clients are denied by the catch-all.

```ts
// types/SoldFeedback.ts
export const SOLD_DURATION = {
  UNDER_1M: "under_1m", // 1 個月內
  M1_TO_3: "1_to_3m", // 1–3 個月
  M3_TO_6: "3_to_6m", // 3–6 個月
  OVER_6M: "over_6m", // 6 個月以上
} as const;

export const BUYER_SOURCE = {
  BEZOLD: "bezold", // 透過 Bezold
  OTHER_PLATFORM: "other_platform", // 其他頂讓平台
  REFERRAL: "referral", // 親友介紹
  LANDLORD_AGENT: "landlord_agent", // 房東或仲介
  OTHER: "other", // 其他
} as const;

export interface SoldFeedbackDoc {
  storeId: string;
  storeName: string; // * snapshot — admin needs no join
  listedPrice: number; // * snapshot of store.price (NT$) — for 成交價 ÷ 刊登價
  listedPriceNegotiable: boolean; // * snapshot — 面議 / 免頂讓金 get no ratio
  soldVia: "follow-up-email" | "my-listings";
  soldDuration: SoldDuration | null; // * 從刊登到頂讓成功花了多久
  buyerSource: BuyerSource | null; // * 買家從哪裡來
  finalPrice: number | null; // * 實際成交頂讓金 (NT$, entered in 萬)
  satisfaction: 1 | 2 | 3 | 4 | 5 | null; // * 對 Bezold 的滿意度
  comment: string; // * "" or ≤ 500 chars
  createTime: Timestamp;
}
```

The seller answers duration as a choice instead of us computing `soldTime − approvedTime`. Sellers mark sold weeks after the deal, so the computed number would be wrong. A submission with every field empty is not saved (treated as skip).

## Behaviour

### Daily cron — `GET /api/cron/listing-follow-up`

Scheduled `0 2 * * *` (10:00 Asia/Taipei). `export const maxDuration = 60`.

1. Reject unless `Authorization === "Bearer " + CRON_SECRET` → 401.
   `?dryRun=1` works whatever the switch says: it runs steps 2–5 and returns the due list (store id, name, recipient email domain) without sending or writing anything. Otherwise, if `FOLLOW_UP_ENABLED !== "true"`, return `{ disabled: true }` and stop.
2. Load `approved` stores (physical **and** digital) and all follow-up docs.
3. A store is **due** when (pure function `isFollowUpDue(store, followUp, now)` in `utils/followUp.ts`):
   - `status === "approved"`, and
   - follow-up not `paused`, and
   - no follow-up doc / `sentCount === 0`: `(approvedTime ?? createTime) <= now − 60 days`
   - otherwise: `max(lastSentTime, lastAnswerTime if still_selling) <= now − 30 days`
4. Resolve the recipient: `store.user` → user doc `email`. Otherwise `store.userInfo.email` (admin-created listings). If there's none, skip, set `lastError: "no_email"`, and don't count it as sent.
5. Send at most **`FOLLOW_UP_MAX_PER_RUN`** per run (default 100, launch week 20; Brevo free plan is 300/day). Oldest-due first. The rest go out the next day.
6. Per store: generate token → send → on success write `{ sentCount + 1, lastSentTime: now, tokenHash, tokenExpireTime: now + 30d, tokenUsed: false, lastError: "" }`. On Brevo failure, write `lastError` and leave the counters alone. Write **after** a successful send, so a crash never counts an email that wasn't sent.
7. Respond `{ due, sent, skipped, failed }` and log the same line for Vercel logs.

In dev (`NEXT_PUBLIC_ENV_VERSION=dev`): reads `mockStore`, and every recipient is replaced with `FOLLOW_UP_TEST_RECIPIENT`. If that var is missing, the route refuses to send (500 `missing_test_recipient`).

### Email — subject 「「{storeName}」還在頂讓嗎？」

Matches the user's prototype. From `Bezold 頂讓必售 <hello@bezold.com.tw>`, reply-to the same. Built by `lib/followUp/emailTemplates.ts` (pure functions, unit-tested) as **table-based HTML with inline styles** (mail clients drop `<style>`, flexbox and web fonts) plus a plain-text part. Max width 600 px, paper background `#f4f1e8`, ink `#1f1d1a`, accent `#b5432a`.

1. **Header** (dark band, `bgcolor="#1c1a17"` so the image blends in): BEZOLD + 「必售！頂讓創業平台」 as **one hosted PNG** `public/email/bezold-email-header.png`, cropped from the current logo `public/bezold-avatar-v2.png` (the text band with padding, about 984×362, shown at about 360 px wide so it stays sharp on retina; `alt="Bezold 必售！頂讓創業平台"`). The dark background is baked into the PNG, not transparent, so dark-mode clients that invert colors can't put it on white. Web fonts don't load in Gmail/Outlook, so it can't be live text.
2. Eyebrow 「BEZOLD 刊登狀態確認」. Heading 「「{storeName}」」 / accent line 「還在頂讓嗎？」.
3. 「{userName} 您好，」 (falls back to 「您好，」 when there's no name). 「為了讓買家看到的資訊都是正確的，我們每 30 天會跟您確認一次刊登狀態。點下面其中一個按鈕就好，不用登入。」
4. **Listing card** (dashed border), label 「您的刊登」, store name, then rows that skip any empty field:
   - Physical: 地區 `{city}{district}` · 坪數 `{areaPing} 坪` · 月租 `{monthlyRent}` · 頂讓金 `{price}`
   - Digital: 類型 `{digitalTypes}` · 平均月營收 · 經營年數 · 頂讓金
   - Money uses the site's existing formatters in `utils/store.ts` (萬, 面議, 免頂讓金, ranges). Link 「查看刊登頁 →」 → `/store/{storeId}`.
5. **Buttons**: primary 「還在頂讓 →」 → `/listing-check?t={token}&answer=still_selling`. Secondary 「已經頂讓了」 → `/listing-check?t={token}&answer=sold`.
6. Notes: 「※ 選「已經頂讓了」，刊登會**立即**改成「已頂讓」，之後不再寄確認信。」 (prototype said 盡快, but the change is immediate) and 「※ 沒有回覆的話，刊登會照常顯示。」
7. Rule, then 「資料有變動（租金、頂讓金、照片），也可以直接回信告訴我們。」 / 「Bezold 團隊」.
8. **Footer** (dark band): 「Bezold 必售！｜台灣店面頂讓媒合平台」, 「真實刊登 · 買賣直接聯絡」, links 頂讓指南 → `/store-guide` and 「LINE 客服：bezoldtw」 → `https://line.me/ti/p/~bezoldtw`, then 「不想再收到 Bezold 的通知，回覆「取消」即可」 (an admin pauses that store by hand).

No seller contact info and no other stores' data. The design prototype is `docs/listing-follow-up-prototype.html` (both emails plus the admin changes, mock data). Its email markup is the reference for the template.

Confirmation email after 已頂讓 (same shell, short body): 「「{storeName}」已標記為已頂讓，恭喜成交！如非本人操作，請直接回覆此信。」

### Answer page — `app/(new)/listing-check/page.tsx`

Server component, reads `searchParams.t` and `searchParams.answer` (`sold` / `still_selling` / absent). `robots: noindex, nofollow`. `/listing-check` is excluded from the sitemap and disallowed in `robots.ts`. Standard page shell (`LaunchBanner`, `SiteNav` with no active link, `SiteFooter`). The visual language matches the email: same card and buttons, built from `components/refactored/` primitives.

Opening the page never writes. The email button pre-selects an answer, so the seller makes **one** press here to confirm it. That press is what protects against mail scanners that open every link.

| State                                                         | Shows                                                                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valid, `answer=still_selling`                                 | Store card + one button 「確認：還在頂讓」, small link 「其實已經頂讓了」 (switches to the sold state)                                                  |
| Valid, `answer=sold`                                          | Store card + 「確認已頂讓？刊登會立即改成已頂讓，無法自行復原」 + 「確認已頂讓」 / 「其實還在頂讓」                                                     |
| Valid, no `answer`                                            | Store card + both buttons. 「已頂讓」 then asks for the same confirm as above (mirrors `ListingCard`)                                                   |
| Answered still selling                                        | 「收到！我們一個月後再跟您確認。」 + 「資料有變動？」 link to `/my-listings`                                                                            |
| Answered sold                                                 | 「恭喜成交！「{storeName}」已改成已頂讓。」 then the **頂讓回饋 form** (below) inline. After submit or 「略過」: 「謝謝您的回饋！」 + link to home      |
| Token missing / unknown / expired / used / store not approved | 「此連結已失效」 + 「登入後到我的刊登管理」 → `/login?redirect=/my-listings`. One message for every case, so it reveals nothing about which one it was. |

Interactive part is a client component `ListingCheckActions` that POSTs to the API.

### Answer API — `POST /api/listing-check`

Body `{ token: string, answer: "sold" | "still_selling" }`. Server re-validates everything (never trusts the page state). In a **Firestore transaction**:

1. Hash token → find follow-up doc. Reject if missing, `tokenUsed`, expired, or the store isn't `approved` → `410 { error: "link_invalid" }`.
2. `sold`: store `{ status: "sold", soldTime, soldVia: "follow-up-email", updateTime }`. Follow-up `{ tokenUsed: true, lastAnswer: "sold", lastAnswerTime }`.
3. `still_selling`: follow-up `{ tokenUsed: true, lastAnswer: "still_selling", lastAnswerTime }`. Store untouched.
4. Bad body → 400 `invalid_answer`.

After the transaction commits, `sold` sends the confirmation email (best-effort: a failure is logged, not surfaced). The response returns `{ answer, storeName }`.

**No GA on `/listing-check`.** The URL carries the token, and gtag attaches the full URL to every hit, so `getAnalyticsClient()` returns null on that path. No page view, no custom events, and gtag never loads there. Answers are recorded in Firestore and shown in admin instead. The page also sets `referrer: no-referrer`.

### 頂讓回饋 form — shared component

`app/(new)/_components/SoldFeedbackForm/` (`index.tsx` + `SoldFeedbackForm.module.css`). It's used by two routes, but it's specific to the sell flow, so it doesn't go in `components/refactored/`. Its inputs reuse `FormField`, `Pill` and `Button` from there.

Title 「恭喜成交！花一分鐘跟我們分享經驗」, subtitle 「全部選填，只有 Bezold 團隊看得到」.

| Field                        | Input                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------- |
| 從刊登到頂讓成功，花了多久？ | Pills (single): 1 個月內 / 1–3 個月 / 3–6 個月 / 6 個月以上                     |
| 買家是從哪裡來的？           | Pills (single): 透過 Bezold / 其他頂讓平台 / 親友介紹 / 房東或仲介 / 其他       |
| 實際成交頂讓金               | Number input, suffix 「萬」, placeholder = listed price. Stored × 10 000 as NT$ |
| 您對 Bezold 的滿意度         | 5 tappable stars (1–5)                                                          |
| 有什麼建議或想對我們說的？   | Textarea, max 500, counter                                                      |

Buttons: 「送出」 (disabled until at least one field has a value) and text link 「略過」. Errors show inline as 「送出失敗，請重試」 and the form keeps what was typed. GA: `trackEvent("sold_feedback_submit", { via, has_comment })` / `sold_feedback_skip` fire on `/my-listings` only. On `/listing-check` analytics is off (see above).

**Where it appears**

- **Email path**: inline on `/listing-check` after the sold confirm (state table above).
- **`/my-listings` path**: `ListingCard`'s existing 「確認」 → `updateStoreStatus(sold)` succeeds → opens a dialog (`@radix-ui/react-dialog`, already a dependency) holding the same form. Closing the dialog = skip.

### Feedback API — `POST /api/sold-feedback`

One route, two ways to prove the caller is the seller:

- `{ token, ...fields }` (email path): hash → follow-up doc with `lastAnswer === "sold"`, and `lastAnswerTime` within **7 days**. The token is already used by then, which is expected. It authorizes feedback only, never another status change.
- `Authorization: Bearer <idToken>` + `{ storeId, ...fields }` (`/my-listings` path): `verifyUserToken`, and `store.user === uid`.
- Either way the store must be `sold`. Fields are parsed by pure `parseSoldFeedback(body)` in `utils/soldFeedback.ts` (enum check, price 0–100 000 萬, satisfaction 1–5, comment trimmed ≤ 500; any other key → 400). The doc is written with `create()` so a second submit → 409 `already_submitted`. All fields empty → 400 `empty_feedback`. Bad or expired auth → 410 `link_invalid` / 401.

### Admin

- **Approve**: wherever an admin sets `approved` (`app/admin/store/list/page.tsx`, `drafts/page.tsx`, `StoreDetailDrawer`), write `approvedTime: serverTimestamp()` when the store has none. Add an admin helper `approveStore(store)` in `firebase/clientUtils/store.ts`. The shared `updateStoreStatus` used by sellers stays as is.
- **`GET /api/admin/follow-ups`** (`verifyAdminToken`) → `{ [storeId]: { sentCount, lastSentTime, lastAnswer, lastAnswerTime, paused, lastError } }`.
- **`PATCH /api/admin/follow-ups/[storeId]`** `{ paused: boolean }` → upserts the doc (a store never emailed can be paused in advance).
- **Store list** (`app/admin/store/list/page.tsx`): new column 「追蹤信」 = `sentCount` (and 「已停止」 tag when paused, 「無信箱」 when `lastError === "no_email"`).
- **Store drawer** (`StoreDetailDrawer.tsx`): section 「追蹤信」 with sent count, last sent date, last answer + date, and an antd `Switch` 「自動寄送追蹤信」 (on = not paused). Sold-via-email stores show 「由追蹤信標記已頂讓 · YYYY/MM/DD」.
- **Feedback in the drawer**: for sold stores, section 「頂讓回饋」 with the five answers in Chinese labels, or 「賣家未填寫」. Data comes from `GET /api/admin/sold-feedback/[storeId]` (`verifyAdminToken`).
- **Sold Feedback page** (`app/admin/store/feedback/page.tsx`, new 「Sold Feedback」 item under Store Management in `components/AdminSidebar.tsx`), heading 「頂讓回饋」. Data comes from `GET /api/admin/sold-feedback` (`verifyAdminToken`), which returns every feedback doc newest first plus `soldStoreCount` (number of `sold` stores). The page has:
  - **Stat cards** computed from answered fields only: 回饋數 / 已頂讓店數 (fill rate), 透過 Bezold 成交 % (of feedback that answered buyer source), 平均滿意度, average 成交價 ÷ 刊登價 (feedback with a final price and a listed price > 0).
  - **Two bar charts**: 花了多久 and 買家來源 counts, each with an 「未填」 bar.
  - **Table**: 店名 + city, 標記方式 (追蹤信 / 我的刊登), 花了多久, 買家來源, 成交頂讓金 (with listed price and %), 滿意度 stars, 建議 (truncated), 填寫時間. Clicking a row expands the full comment with a link that opens the store in Store List's drawer (`/admin/store/list?store={id}`).
  - **Filters** (client-side): 買家來源, 標記方式, 填寫日期 range.
  - The listed price is snapshotted onto the feedback doc (`listedPrice`, `listedPriceNegotiable`) at submit time, so the ratio doesn't change if the store is edited later. 面議 / 免頂讓金 stores show no ratio.

## Commands

```bash
nvm use
npm run dev                         # http://localhost:3000
npm run build
npx eslint --no-eslintrc -c .eslintrc.json app lib utils firebase types   # lint inside a worktree
npm run test:unit                   # node --test tests/unit/*.test.ts
npm run test:rules                  # emulators, Java 21
npx prettier --write <changed files>

# trigger the cron locally (dev data, test recipient)
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/listing-follow-up
```

## Project Structure

```
vercel.json                                  → crons: /api/cron/listing-follow-up daily
types/FollowUp.ts                            → FollowUpDoc, FOLLOW_UP_ANSWER
types/SoldFeedback.ts                        → SoldFeedbackDoc, SOLD_DURATION, BUYER_SOURCE
types/Store.ts                               → + approvedTime, soldTime, soldVia
firebase/constants.ts                        → + COLLECTIONS.FOLLOW_UP, COLLECTIONS.SOLD_FEEDBACK
constant/soldFeedback.ts                     → Chinese labels for duration / buyer source
utils/followUp.ts                            → isFollowUpDue, followUpAnchor, pickRecipient (pure)
utils/soldFeedback.ts                        → parseSoldFeedback (pure)
lib/followUp/token.ts                        → createToken, hashToken (node crypto)
lib/followUp/emailTemplates.ts               → followUpEmail, soldConfirmationEmail (pure, inline-styled tables)
lib/email/brevo.ts                           → sendEmail({ to, subject, html, text }) via fetch
public/email/bezold-email-header.png         → header wordmark for mail clients
docs/listing-follow-up-prototype.html        → design prototype (emails + admin)
firebase/serverUtils/followUp.ts             → getFollowUps, findByTokenHash, recordSend, answerFollowUp (txn), setPaused
firebase/serverUtils/soldFeedback.ts         → createSoldFeedback, getSoldFeedback
app/api/cron/listing-follow-up/route.ts      → daily job
app/api/listing-check/route.ts               → POST answer
app/api/sold-feedback/route.ts               → POST feedback (token or member auth)
app/api/admin/follow-ups/route.ts            → GET summary map
app/api/admin/follow-ups/[storeId]/route.ts  → PATCH paused
app/api/admin/sold-feedback/route.ts         → GET all feedback + soldStoreCount
app/api/admin/sold-feedback/[storeId]/route.ts → GET one store's feedback
app/admin/store/feedback/page.tsx            → Sold Feedback page (stats, bars, table)
components/AdminSidebar.tsx                  → + Sold Feedback menu item
app/(new)/listing-check/page.tsx             → answer page (server)
app/(new)/listing-check/_components/ListingCheckActions.tsx + .module.css
app/(new)/_components/SoldFeedbackForm/      → shared feedback form
app/(new)/my-listings/_components/ListingCard.tsx → open feedback dialog after sold
app/admin/store/list/page.tsx                → 追蹤信 column, approveStore
app/admin/store/drafts/page.tsx              → approveStore
app/admin/store/_components/StoreDetailDrawer.tsx → 追蹤信 section + switch, 頂讓回饋 section
app/robots.ts                                → disallow /listing-check
tests/unit/followUp.test.ts                  → due logic, recipient, templates, token hash
tests/unit/soldFeedback.test.ts              → parseSoldFeedback
tests/rules/firestore.test.ts                → clients denied on mockFollowUp, mockSoldFeedback
docs/analytics-events.md                     → sold_feedback_submit/skip (/my-listings); /listing-check untracked
```

## Code Style

Follow the existing route-handler and `as const` patterns:

```ts
// utils/followUp.ts
const DAY_MS = 24 * 60 * 60 * 1000;
export const FIRST_FOLLOW_UP_DAYS = 60;
export const REPEAT_FOLLOW_UP_DAYS = 30;

// * the first email counts from first approval; stores approved before
// * approvedTime existed fall back to createTime
export const followUpAnchor = (
  store: Pick<Store, "approvedTime" | "createTime">,
) => store.approvedTime ?? store.createTime;

export const isFollowUpDue = (
  store: Pick<Store, "status" | "approvedTime" | "createTime">,
  followUp: FollowUpState | null,
  now: Date,
): boolean => {
  if (store.status !== STORE_STATUS.APPROVED) return false;
  if (followUp?.paused) return false;
  if (!followUp || followUp.sentCount === 0) {
    return (
      now.getTime() - followUpAnchor(store).getTime() >=
      FIRST_FOLLOW_UP_DAYS * DAY_MS
    );
  }
  const lastContact = latestDate(
    followUp.lastSentTime,
    followUp.lastAnswer === FOLLOW_UP_ANSWER.STILL_SELLING
      ? followUp.lastAnswerTime
      : null,
  );
  return (
    !lastContact ||
    now.getTime() - lastContact.getTime() >= REPEAT_FOLLOW_UP_DAYS * DAY_MS
  );
};
```

- Readable names (`followUp`, `store`, `event`), never single letters.
- `cn()` for conditional classes. CSS Modules for paint, Tailwind for layout, never both on one element. `text-decoration: none; color: inherit` on module-styled `<a>`.
- No `undefined` in Firestore writes. Use `""` / `null`.
- Prettier on every changed file.

## Testing Strategy

- **Unit (`tests/unit/followUp.test.ts`, `node --test`)**: `isFollowUpDue` table covering day 59 vs 60, fallback to createTime, paused, non-approved statuses, 29 vs 30 days after last send, a `still_selling` answer pushing the next email out, a sold answer. Also `pickRecipient` (user email → userInfo email → none), `hashToken` deterministic and `createToken` unique/43 chars, and templates containing the store name and link and no seller phone/LINE.
- **Unit (`tests/unit/soldFeedback.test.ts`)**: `parseSoldFeedback` accepts each valid enum, rejects unknown enums / extra keys / satisfaction 0 or 6 / negative price / 501-char comment, converts 萬 → NT$, and flags all-empty.
- **Rules (`tests/rules/firestore.test.ts`)**: `assertFails` for a signed-in seller and for an anonymous client reading or writing `mockFollowUp/{id}` and `mockSoldFeedback/{id}`. Plus `assertFails` for a seller writing `approvedTime` / `soldVia` on their own store.
- **Manual end-to-end in dev** (mock data, `FOLLOW_UP_TEST_RECIPIENT` = the user's inbox): backdate a mock store's `approvedTime` by 61 days → curl the cron → email arrives → click 「還在頂讓 →」 → 確認 → reopen same link → 此連結已失效 → backdate `lastAnswerTime` 31 days → cron → new email → 已頂讓 → 確認 → store shows 已頂讓 on /store and admin, confirmation email arrives → fill the feedback form → submit → drawer shows it → submit again (e.g. replay the request) → 409. On `/my-listings`, mark another mock store sold → dialog opens → 略過 → nothing saved. Check the email in Gmail web + iOS Mail (light and dark). Then pause a store in admin → cron skips it. Run cron twice the same day → second run sends 0.
- `npm run build` passes. Before/after screenshots for the admin column/drawer and the new page per CLAUDE.md.

## Boundaries

- **Always**: send to `FOLLOW_UP_TEST_RECIPIENT` in dev. Store token hashes only. Re-validate on POST inside a transaction. Use `COLLECTIONS.*`. Keep seller contact out of the page and its payload (the page shows store name, photo and date only). Run unit + rules tests and prettier before each commit.
- **Ask first**: running the cron against **prod** data (`prodStore`) for the first time. The user triggers the first prod run, and Claude reports how many stores are due before anything sends. Also ask before adding npm dependencies, before changing `firestore.rules` beyond tests, and before back-filling `approvedTime` on existing stores.
- **Never**: email real sellers from dev or a worktree. Change store status on a GET. Log or return raw tokens. Edit rules/indexes in the Firebase console or deploy with `--force`. Commit `BREVO_API_KEY` / `CRON_SECRET`.

## Success Criteria

1. A store approved ≥ 60 days ago (by `approvedTime`, or `createTime` if absent) with no follow-up gets exactly one email on the next cron run. One at 59 days gets none.
2. The emailed link opens a page showing that store. Opening it changes nothing in Firestore.
3. 「已頂讓」 → 「確認」 sets the store to `sold` with `soldTime` and `soldVia: "follow-up-email"`. The store shows 已頂讓 publicly and in admin, and a confirmation email is sent.
4. 「還在頂讓」 leaves the store `approved` and the next email arrives ≥ 30 days after that answer, not sooner.
5. Reusing a link, using it after 30 days, using an older link after a newer email, or using a link for a non-approved store shows 「此連結已失效」 and writes nothing. A made-up `t` value does the same.
6. Admin store list shows 追蹤信 count per store. Switching 「自動寄送追蹤信」 off means the cron never emails that store again until switched back on.
7. Cron without the correct bearer token → 401, nothing sent. Two runs on one day → the second sends 0.
8. In dev every email goes to `FOLLOW_UP_TEST_RECIPIENT`. Without it, the cron refuses to send.
9. Seller and anonymous clients can't read/write `*FollowUp`, or write `approvedTime` / `soldTime` / `soldVia`. Covered by rules tests.
10. `npm run build`, `npm run test:unit`, `npm run test:rules` pass.
11. The email matches the prototype (header image, listing card, two buttons, footer) in Gmail web and iOS Mail. Each button opens `/listing-check` with that answer pre-selected, and one more press confirms it.
12. After confirming 已頂讓 from the email **or** `/my-listings`, the feedback form appears. Submitting saves one `*SoldFeedback` doc that the admin drawer shows. 略過 or an all-empty form saves nothing. A second submit for the same store → 409. A feedback token older than 7 days after the sold answer → 410.
13. Admin → Sold Feedback lists every submitted feedback newest first. The stat cards and bars match the rows (unanswered fields are excluded from averages and shown as 未填), and expanding a row links to that store in Store List.

## Open Questions

None. All resolved 2026-11-08:

- **Digital assets**: included. They get follow-up emails like physical stores, and the email shows their own rows (類型, 平均月營收, 經營年數).
- **Hosting**: the site runs on Vercel with Cron available (daily schedule).
- See Decisions: launch backlog (cap 20 for the launch week), sender name (`Bezold 頂讓必售`), header image (cropped from `bezold-avatar-v2.png`).
