# Tasks: Listing follow-up email + sold feedback

Spec: [`SPEC.md`](../SPEC.md) · Plan: [`tasks/plan.md`](plan.md) · Design: [`docs/listing-follow-up-prototype.html`](../docs/listing-follow-up-prototype.html)

Every task: acceptance criteria below + the matching SPEC section · verify with `npm run test:unit` (when it has tests), `npx tsc --noEmit`, `npx eslint --no-eslintrc -c .eslintrc.json <changed dirs>`, prettier on changed files, and the manual check · one local commit (no push until the PR checkpoint).

---

## PR 1 — follow-up email loop

### Task 1: Types, collections, `approvedTime` stamping, mapper fixes, rules tests

**Description:** Add the data shapes and make admin approvals record when a store first went live, so every later task has something to read.

**Acceptance criteria:**

- [x] `types/FollowUp.ts`, `types/SoldFeedback.ts` per SPEC (incl. `listedPrice`, `listedPriceNegotiable`). `Store`/`StoreDoc` gain `approvedTime`, `soldTime`, `soldVia`. `COLLECTIONS.FOLLOW_UP` and `COLLECTIONS.SOLD_FEEDBACK` (mock/prod).
- [x] Approving in Store List (single + bulk) writes `approvedTime: serverTimestamp()` only when the store has none. Re-approving keeps the original.
- [x] Client `storeConverter` and server mappers (`mapDocsToStores`, `getStoreById`) turn `approvedTime`/`soldTime` into `Date` (or leave absent).
- [x] `tests/rules/firestore.test.ts`: member/seller/admin can't read or write `mock|prodFollowUp` and `mock|prodSoldFeedback`. `tests/rules/stores.test.ts`: a seller can't write `approvedTime`, `soldTime` or `soldVia` on their own store.

**Verification:** `npm run test:rules` · `npm run build` · dev: approve a pending mock store in admin → Firestore shows `approvedTime`; re-approve after edit → unchanged; open `/store/[id]` and the admin list without errors.

_Done. `StoreBaseForm` only ever creates pending or draft stores, so Store List is the only place that approves; the create form was left untouched._

**Dependencies:** None
**Files:** `types/FollowUp.ts`, `types/SoldFeedback.ts`, `types/Store.ts`, `firebase/constants.ts`, `firebase/clientUtils/store.ts`, `firebase/serverUtils/store.ts`, `app/admin/store/list/page.tsx`, `app/admin/store/create/StoreBaseForm.tsx`, `tests/rules/*.test.ts`
**Scope:** M (types are tiny; the real changes are 4 files + tests)

### Task 2: Due logic + recipient + token (pure) with unit tests

**Description:** The rules that decide who gets an email and the link token, as pure, tested functions.

**Acceptance criteria:**

- [x] `utils/followUp.ts`: `followUpAnchor`, `isFollowUpDue`, `nextFollowUpDate`, `pickRecipient({ userEmail, userInfoEmail })`, `parseMaxPerRun`, `isLinkUsable`. Alias-free imports.
- [x] `lib/followUp/token.ts`: `createToken()` (32 random bytes, base64url, 43 chars), `hashToken(token)` (sha256 hex), `isWellFormedToken`.
- [x] `tests/unit/followUp.test.ts` covers the SPEC table: day 59/60, createTime fallback, paused, non-approved statuses, 29/30 days after the last send, a `still_selling` answer pushing the next email, sold, recipient fallbacks, token uniqueness/length, hash determinism.

**Verification:** `npm run test:unit`
**Dependencies:** 1
**Files:** `utils/followUp.ts`, `lib/followUp/token.ts`, `tests/unit/followUp.test.ts`
**Scope:** S

### Task 3: Email templates + Brevo client + header PNG

**Description:** Turn the prototype's email markup into template functions and a sender.

**Acceptance criteria:**

- [x] `lib/followUp/emailTemplates.ts`: `followUpEmail(store, links)` and `soldConfirmationEmail(store, meta)` return `{ subject, html, text }`, matching the prototype. Physical/digital rows skip empty fields. Money uses the site formatters (passed in as strings so the module stays alias-free). All store text HTML-escaped.
- [x] `lib/email/brevo.ts`: `sendEmail({ to, subject, html, text })` → Brevo `POST /v3/smtp/email`, sender `Bezold 頂讓必售 <hello@bezold.com.tw>`. Throws with Brevo's error message on non-2xx.
- [x] `public/email/bezold-email-header.png` cropped with `sharp` from `public/bezold-avatar-v2.png` (text band + padding, dark `#1c1a17` background kept). **The user approves the preview before it's saved.**
- [x] Unit tests: subject/heading contain the store name; both answer links carry the token and answer; no phone/LINE in the output; `<script>` in a store name comes out escaped.

**Verification:** `npm run test:unit` · a dev script sends one real email of each template to `FOLLOW_UP_TEST_RECIPIENT` → check in Gmail web + iOS Mail.
_Done. Both templates were sent through Brevo to the test inbox on 2026-11-08 and accepted. The Gmail and iOS Mail look is checked at Checkpoint B; the header image loads from production, so it only appears after deploy. Row formatting lives in `lib/followUp/listingRows.ts`, which uses the site formatters._

**Dependencies:** 1
**Files:** `lib/followUp/emailTemplates.ts`, `lib/email/brevo.ts`, `public/email/bezold-email-header.png`, `tests/unit/followUp.test.ts`
**Scope:** M

### Task 4: `/listing-check` page — read-only states

**Description:** The page the email opens, showing the right state for a token. No writes yet.

**Acceptance criteria:**

- [x] `firebase/serverUtils/followUp.ts`: `findFollowUpByTokenHash(hash)` returns the doc + store, or null.
- [x] `app/(new)/listing-check/page.tsx` renders the prototype's states for `answer=sold` / `answer=still_selling` / no answer / invalid (missing, unknown, expired, used, store not approved → one 「此連結已失效」 message). Standard page shell, `noindex`, no seller contact in the payload.
- [x] `app/robots.ts` disallows `/listing-check`. Not in the sitemap.

**Verification:** dev: hand-seed a `mockFollowUp` doc with a known token's hash → open each URL variant and compare with the prototype at desktop + 375 px. Opening it changes nothing in Firestore.
_Done. The page is one client component, `ListingCheck`, with every state including the POST wiring (the API lands in task 5), plus `LinkInvalid`. Dates are Taipei time (`formatTaipeiDate`). Analytics is switched off on this path because the URL carries the token. Checked on dev with seeded tokens: valid physical and digital stores, expired, malformed and missing tokens, desktop and 375 px. No GA requests went out._

**Dependencies:** 1, 2
**Files:** `firebase/serverUtils/followUp.ts`, `app/(new)/listing-check/page.tsx`, `app/(new)/listing-check/_components/ListingCheckView.tsx` + `.module.css`, `app/robots.ts`
**Scope:** M

### Task 5: Answer API + confirm actions + confirmation email

**Description:** Make the confirm buttons work.

**Acceptance criteria:**

- [x] `POST /api/listing-check` `{ token, answer }` runs the SPEC transaction. Sold sets store `status/soldTime/soldVia/updateTime` and the follow-up answer fields. Still-selling sets the follow-up only. Both mark the token used. Invalid → 410 `link_invalid`, bad body → 400.
- [x] `ListingCheck` (client, built in task 4) posts and shows the success states. No GA on this page.
- [x] Sold sends `soldConfirmationEmail` after commit (best-effort, logged on failure).
- [x] `docs/analytics-events.md` notes that `/listing-check` is untracked, and why.

**Verification:** dev: answer still-selling → store unchanged, reopen → 失效. New token → answer sold → store `sold` on `/store/[id]` + admin, confirmation email arrives. Double-submit (two tabs) → one wins, the other gets 410.
_Done. Checked on dev: 還在頂讓 leaves the store untouched and kills the link. 已頂讓 sets sold, `soldTime` and `soldVia`, the store page renders, and the confirmation email sends without errors. Three simultaneous POSTs on one token gave one 200 and two 410s. A bad answer gets 400; an unknown token gets 410. Recipients come from `resolveSellerRecipients` (user doc, then Auth email, then listing contact), and dev always delivers to `FOLLOW_UP_TEST_RECIPIENT` via `lib/followUp/delivery.ts`._

**Dependencies:** 3, 4
**Files:** `app/api/listing-check/route.ts`, `firebase/serverUtils/followUp.ts`, `lib/followUp/listingRows.ts`, `docs/analytics-events.md`
**Scope:** M

### Checkpoint A

- [ ] `npm run test:unit`, `npm run test:rules`, `npm run build` pass
- [ ] Both answers work end to end from a hand-seeded token

### Task 6: Cron route, kill switch, dry run, `vercel.json`

**Description:** Send the emails automatically.

**Acceptance criteria:**

- [x] `GET /api/cron/listing-follow-up`: bearer `CRON_SECRET` (else 401). Sends nothing unless `FOLLOW_UP_ENABLED=true` (returns `{ disabled: true }`). The dry run works with the switch off. In dev, refuses without `FOLLOW_UP_TEST_RECIPIENT` and sends only there.
- [x] Loads approved stores + follow-ups + recipients (`getUsersByIds`). Picks due stores oldest-first, caps at `FOLLOW_UP_MAX_PER_RUN` (default 100; a non-numeric or < 1 value falls back to 100), sends, then writes `recordSend` (new token hash, count +1). Failures write `lastError`. Missing email → `lastError: "no_email"`, not counted. Responds and logs `{ due, sent, skipped, failed }`.
- [x] `?dryRun=1` returns the due list (id, name, recipient domain) and writes nothing.
- [x] `vercel.json` schedules `0 2 * * *`. `maxDuration = 60`.

**Verification:** dev with `FOLLOW_UP_ENABLED=true`: backdate a mock store's `approvedTime` 61 days → dry run lists it → real run sends one email to the test inbox → second run sends 0. No secret → 401. Flag off → nothing sent.
_Done. Checked on dev: no or wrong secret gives 401, the switch off gives `{disabled:true}`, and the dry run lists due stores with recipient domains only. A real run sent 2 (both to the test inbox) and marked 3 「無信箱」. A second run sent 0. The selection logic is `planFollowUpRun` (unit-tested: oldest first, cap, no-email stores don't use the cap). Env vars are documented in CLAUDE.md._

**Dependencies:** 2, 3, 5
**Files:** `app/api/cron/listing-follow-up/route.ts`, `firebase/serverUtils/followUp.ts`, `vercel.json`, `SPEC.md` (env table)
**Scope:** M

### Task 7: Admin — follow-up API, 追蹤信 column, drawer section + pause switch

**Description:** Admins can see what was sent and stop it.

**Acceptance criteria:**

- [x] `GET /api/admin/follow-ups` (summary map) and `PATCH /api/admin/follow-ups/[storeId]` `{ paused }` (upsert), both `verifyAdminToken`.
- [x] Store List: 追蹤信 column (count, last send date, 已停止 / 無信箱 tags, 「—」 before the first email), matching the prototype.
- [x] Drawer: 首次上架 row, 追蹤信 section (sent, last sent, last answer, next send, switch, no-email warning, sold-via-email note).
- [x] Toggling the switch persists and the cron skips paused stores.

**Verification:** dev: column and drawer match the prototype for the mock cases. Pause a due store → dry run no longer lists it. Before/after screenshots.
_Done. Checked on dev while signed in as admin: the column shows counts, last send, 已停止 / 無信箱 / 寄送失敗, and 「—」 before the first email. The drawer shows sent, last sent, last answer, next send (overdue reads 已到期), the pause switch, the no-email warning, and the sold-via-email note. Pausing persists, the cron dry run skips the paused store, and it picks it up again once unpaused. Before/after screenshots happen at PR time._

**Dependencies:** 1, 6
**Files:** `app/api/admin/follow-ups/route.ts`, `app/api/admin/follow-ups/[storeId]/route.ts`, `firebase/serverUtils/followUp.ts`, `app/admin/store/list/page.tsx`, `app/admin/store/_components/StoreDetailDrawer.tsx`
**Scope:** M

### Checkpoint B — PR 1

- [ ] Full dev loop from SPEC → Testing Strategy (minus feedback) passes
- [ ] Email checked in Gmail web + iOS Mail
- [ ] Before/after screenshots for admin list + drawer, and screenshots of the new `/listing-check` page
- [ ] **The user reviews → push → PR 1**

---

## PR 2 — sold feedback

### Task 8: `parseSoldFeedback` + `POST /api/sold-feedback` (token path) + server utils

**Description:** Accept and store feedback from the email path.

**Acceptance criteria:**

- [ ] `utils/soldFeedback.ts` `parseSoldFeedback(body)` per SPEC (enums, 萬 → NT$, 1–5, ≤ 500 chars, extra keys rejected, all-empty flagged). `constant/soldFeedback.ts` holds the Chinese labels.
- [ ] `POST /api/sold-feedback` with `{ token, … }`: valid only if the follow-up's `lastAnswer` is sold, within 7 days, and the store is sold. `create()` → 409 on a second submit. Snapshots `storeName`, `listedPrice`, `listedPriceNegotiable`, `soldVia`.
- [ ] `tests/unit/soldFeedback.test.ts` per SPEC.

**Verification:** `npm run test:unit` · dev: curl with a fresh sold token → 201. Again → 409. All-empty → 400. A token answered 8 days ago → 410.
**Dependencies:** 5
**Files:** `utils/soldFeedback.ts`, `constant/soldFeedback.ts`, `firebase/serverUtils/soldFeedback.ts`, `app/api/sold-feedback/route.ts`, `tests/unit/soldFeedback.test.ts`
**Scope:** M

### Task 9: `SoldFeedbackForm` + inline on `/listing-check`

**Description:** The form from the prototype, shown after the sold confirm.

**Acceptance criteria:**

- [ ] `app/(new)/_components/SoldFeedbackForm/` matches the prototype (pills, 萬 input with listed-price hint, stars + label, textarea + counter). 送出 is disabled until something is filled. 略過 is a link. Inline error keeps the input.
- [ ] Built from `components/refactored/` primitives where they fit. CSS Modules for paint, Tailwind for layout only.
- [ ] `/listing-check` sold success shows it. Submit → thanks state, skip → 恭喜成交 state. No GA here (analytics is off on `/listing-check`).

**Verification:** dev, desktop + 375 px, compared with the prototype: submit saves one doc, skip saves none.
**Dependencies:** 8
**Files:** `app/(new)/_components/SoldFeedbackForm/index.tsx` + `.module.css`, `app/(new)/listing-check/_components/ListingCheck.tsx`
**Scope:** M

### Task 10: `/my-listings` dialog + member-auth path

**Description:** Same form after a seller marks sold themselves.

**Acceptance criteria:**

- [ ] `POST /api/sold-feedback` also accepts `Authorization: Bearer <idToken>` + `{ storeId, … }`: `verifyUserToken`, `store.user === uid`, store sold. `soldVia: "my-listings"`.
- [ ] `ListingCard`: after 「確認」 succeeds, a Radix dialog opens with the form. Close = skip. Submit → toast 「謝謝您的回饋！」.

**Verification:** dev, signed in as a mock seller: mark sold → dialog → submit → doc saved. Another store → close → nothing saved. Another seller's storeId → 403.
**Dependencies:** 9
**Files:** `app/api/sold-feedback/route.ts`, `app/(new)/my-listings/_components/ListingCard.tsx` (+ `.module.css`)
**Scope:** S

### Checkpoint C

- [ ] Both seller paths save feedback once. Skip saves nothing. Replay → 409.
- [ ] `test:unit`, `test:rules`, build pass

### Task 11: Admin drawer 頂讓回饋 section

**Acceptance criteria:**

- [ ] `GET /api/admin/sold-feedback/[storeId]` (`verifyAdminToken`).
- [ ] Drawer shows the five answers with labels, the listed price and %, stars, comment, time, or 「賣家未填寫」, for sold stores only.

**Verification:** dev: sold mock store with and without feedback, compared with the prototype.
**Dependencies:** 8
**Files:** `app/api/admin/sold-feedback/[storeId]/route.ts`, `firebase/serverUtils/soldFeedback.ts`, `app/admin/store/_components/StoreDetailDrawer.tsx`
**Scope:** S

### Task 12: Sold Feedback admin page + sidebar item

**Acceptance criteria:**

- [ ] `GET /api/admin/sold-feedback` → all feedback, newest first, plus `soldStoreCount`.
- [ ] `app/admin/store/feedback/page.tsx`: 4 stat cards, 2 bar charts with 未填, table with expandable rows linking to `/admin/store/list?store={id}`, client-side filters (買家來源, 標記方式, date range). 面議/免頂讓金 show no ratio.
- [ ] `components/AdminSidebar.tsx`: 「Sold Feedback」 under Store Management. Store List opens the drawer from `?store=`.

**Verification:** dev with ~6 seeded feedback docs: the numbers match a hand count, filters narrow the table and stats, and the row link opens the right drawer.
**Dependencies:** 11
**Files:** `app/api/admin/sold-feedback/route.ts`, `firebase/serverUtils/soldFeedback.ts`, `app/admin/store/feedback/page.tsx`, `components/AdminSidebar.tsx`, `app/admin/store/list/page.tsx`
**Scope:** M

### Checkpoint D — PR 2

- [ ] Full SPEC Testing Strategy passes, including feedback
- [ ] Screenshots: form (both paths), drawer section, Sold Feedback page
- [ ] **The user reviews → push → PR 2**

---

## Launch (the user, after PR 2 is merged)

- [ ] Vercel env: `BREVO_API_KEY`, `CRON_SECRET`, `FOLLOW_UP_ENABLED=false`
- [ ] Prod dry run → Claude summarizes due / no-email counts
- [ ] Decide on the backlog, then `FOLLOW_UP_ENABLED=true`
