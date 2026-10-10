# Tasks: Admin Store Analytics

Plan: [`tasks/plan.md`](plan.md) · Spec: [`SPEC.md`](../SPEC.md)

Every task is done only when:

- Prettier has run on the changed files.
- `npm run lint` is clean.
- The conventions in `CLAUDE.md` and the spec Boundaries are followed.

No commits until the user reviews.

---

## Phase 1: Data path

### Task 1: Constants, types and the pure transform

**Description:** Define the shared contract and the logic that turns raw GA4
rows into `StoreAnalyticsResponse`. No network calls yet.

**Acceptance criteria:**

- [x] `constant/storeAnalytics.ts` defines:
  - `RANGE_OPTIONS = [7, 30, 90]` and `RangeDays`
  - `PAGE_VIEW_TRACKING_START = "2026-07-04"`
  - `CONTACT_GATE_TRACKING_START = "2026-09-19"`
  - `CONTACT_GATE_EVENTS`
  - `ANALYTICS_CACHE_SECONDS = 3600`
- [x] `types/StoreAnalytics.ts` matches the spec's API contract and is
      re-exported from `types/index.ts`.
- [x] `lib/analytics/storeAnalyticsTransform.ts`:
  - parses store IDs with `^/store/([^/]+)/?$` and ignores other paths
  - sums duplicate paths (e.g. with and without a trailing slash)
  - zero-fills `daily` to exactly `days` entries, oldest → newest
  - fills `allTime`, `current` and `previous` from the five report row sets

**Verification:**

- [x] `npm run build` passes (type-check).
- [x] A throwaway scratchpad script feeds sample rows and prints the result.
      Check trailing-slash merge, the zero-filled `daily`, missing-event stores
      and an ignored `/store-list` path. The script is not committed.

**Dependencies:** None

**Files:** `constant/storeAnalytics.ts`, `types/StoreAnalytics.ts`,
`types/index.ts`, `lib/analytics/storeAnalyticsTransform.ts`

**Scope:** M

---

### Task 2: GA4 client, cached fetch and the admin route

**Description:** Install the SDK, build the five-report batch request, cache it
for one hour per range, and expose it at
`GET /api/admin/store-analytics?range=` behind `verifyAdminToken`.

**Acceptance criteria:**

- [x] `@google-analytics/data` is added to `package.json`. The client uses
      `serverServiceAccountConfig` credentials with the REST fallback.
- [x] The route returns:
  - 200 with the documented shape for 7 / 30 / 90
  - 400 for an invalid range
  - 401 / 403 via `verifyAdminToken`
  - 503 when `GA4_PROPERTY_ID` is unset
  - 502 on a GA4 error, logged server-side
- [x] The hostname filter is derived from `NEXT_PUBLIC_APP_URL`. A repeat
      request within an hour does not hit GA4.

**Verification:**

- [x] `npm run build` passes and the GA4 package bundles. If it doesn't,
      **stop and ask** before touching `next.config.js`.
- [x] Dev server plus browser pane, signed in as admin, calling `authedFetch`:
  - `range=30` → 200, with localhost store IDs present
  - `range=5` → 400
  - no token → 401
- [x] Temporarily unset `GA4_PROPERTY_ID` → 503, then restore it.
- [x] The server log shows one GA4 call for two consecutive requests.

**Dependencies:** Task 1

**Files:** `package.json` / `package-lock.json`, `lib/analytics/ga4Client.ts`,
`lib/analytics/fetchStoreAnalytics.ts`,
`app/api/admin/store-analytics/route.ts`

**Scope:** M

---

### ✅ Checkpoint A: Data path

- [x] `npm run lint` and `npm run build` are clean.
- [x] The API returns real localhost data in the spec shape, and every status
      code is verified.
- [x] **Review with the user before starting the UI.**

---

## Phase 2: Store List

### Task 3: Hook, ClickRate and the Store List columns

**Description:** Fetch analytics on the Store List and add the 總瀏覽數 and
累計聯絡點擊率 columns. The deep link comes later, in Task 6.

**Acceptance criteria:**

- [x] `hooks/useStoreAnalytics.ts` returns `{ data, loading, error, refetch }`
      and is exported from `hooks/index.ts`.
- [x] `ClickRate` renders a bar + 1-decimal %, with an optional `Tooltip`
      showing `點擊 X / 看到 Y 次`, or `—` when there are no gate views.
- [x] Both columns are sortable, right-aligned and have the header tooltips from
      the spec. Stores without data show `0` / `—`.
- [x] While loading, the cells show a skeleton. On error, the cells show `—`
      plus one `message.warning`. The table, drawer, bulk actions and delete all
      still work.

**Verification:**

- [x] `npm run build` passes.
- [x] Browser check on `/admin/store/list`:
  - real numbers appear
  - sorting works on both columns
  - the tooltip shows the counts
  - row click still opens the drawer
- [x] Simulate an API failure (temporarily unset `GA4_PROPERTY_ID`): the list
      still renders and a warning appears.

**Dependencies:** Task 2

**Files:** `hooks/useStoreAnalytics.ts`, `hooks/index.ts`,
`app/admin/store/analytics/_components/ClickRate.tsx` (+ `.module.css`),
`app/admin/store/list/page.tsx`

**Scope:** M

---

### ✅ Checkpoint B: Store List

- [x] Lint and build are clean.
- [x] The Store List shows correct numbers, and a GA4 failure doesn't block it.
- [x] Screenshot for the user.

---

## Phase 3: Store Analytics page

### Task 4: Page shell (sidebar, URL-driven toolbar, KPI row)

**Description:** Create `/admin/store/analytics` with the sidebar entry, the
filters, the range switch backed by `?range=`, and the four KPI cards.

**Acceptance criteria:**

- [x] "Store Analytics" appears under Store Management, is highlighted on this
      route, and navigates correctly.
- [x] The range `Segmented` (7 / 30 / 90) reads and writes `?range=` with
      `router.replace`. The default is 30, and invalid values fall back to 30.
- [x] The status filter (default 已上架) and city filter change the KPI cards:
  - 總頁面瀏覽 + 較前期
  - 刊登數
  - 平均每間瀏覽
  - 聯絡解鎖點擊 + 較前期

**Verification:**

- [x] `npm run build` passes.
- [x] Browser check:
  - switching the range updates the URL and refetches
  - a reload keeps the range
  - filters change the KPIs
  - the sidebar highlight is correct

**Dependencies:** Task 3 (hook)

**Files:** `components/AdminSidebar.tsx`, `app/admin/store/analytics/page.tsx`,
`app/admin/store/analytics/_components/AnalyticsKpiRow.tsx`

**Scope:** M

---

### Task 5: Ranking card and table with sparklines

**Description:** Add the top-10 瀏覽數排行 bars and the 各商店成效 table.

**Acceptance criteria:**

- [x] The ranking shows the top 10 filtered stores by period views. Bars are
      scaled to the top store, and full values appear on hover.
- [x] The table columns are:
  - 店名 with `城市 · 類別` underneath
  - 近 N 天趨勢 sparkline
  - 瀏覽
  - 較前期 (▲ / ▼ / `—`)
  - 訪客
  - 聯絡點擊率
- [x] 瀏覽, 較前期 and 聯絡點擊率 are sortable, with 瀏覽 descending by default.
- [x] The ranking and table respond to the same filters and range as the KPIs.

**Verification:**

- [x] `npm run build` passes.
- [x] Browser check:
  - the numbers match the KPI totals
  - sorting works
  - the sparkline length matches the range (7 / 30 / 90 points)

**Dependencies:** Task 4

**Files:** `_components/ViewsRanking.tsx` (+ `.module.css`),
`_components/StoreAnalyticsTable.tsx`, `_components/Sparkline.tsx`,
`app/admin/store/analytics/page.tsx`

**Scope:** M

---

### Task 6: Expandable trend row and deep link

**Description:** Expanding a row (one at a time) shows the daily line chart and
the side stats. `?store={id}` expands, highlights and scrolls to that row. The
Store List 總瀏覽數 links there.

**Acceptance criteria:**

- [ ] The expanded row shows the line chart, with a crosshair and a
      `M/D · N 次瀏覽` tooltip, plus:
  - 總瀏覽數
  - 本期瀏覽 + 較前期
  - 本期聯絡 看到 → 點擊
  - 上架日
- [ ] `?store={id}` expands that row, highlights it and scrolls it into view. If
      the store is outside the current status filter, the filter switches to
      所有狀態.
- [ ] On the Store List, 總瀏覽數 is a link for `approved` stores with views > 0,
      and clicking it does **not** open the drawer.

**Verification:**

- [ ] `npm run build` passes.
- [ ] Browser check:
  - click a list link → the analytics page shows the right row expanded
  - hovering the chart works
  - switching the range redraws the chart
  - a sold store's link (if any) switches the filter

**Dependencies:** Task 5

**Files:** `_components/ViewsLineChart.tsx` (+ `.module.css`),
`_components/StoreAnalyticsTable.tsx`, `app/admin/store/analytics/page.tsx`,
`app/admin/store/list/page.tsx`

**Scope:** M

---

### ✅ Checkpoint C: Option D end to end

- [ ] Lint and build are clean.
- [ ] Full flow in the browser: list → link → expanded trend → range switch →
      filters.
- [ ] Screenshots for the user. **Review before hardening.**

---

## Phase 4: Hardening and docs

### Task 7: Loading, error and empty states

**Description:** Make both pages behave well when data is slow, missing or
failing.

**Acceptance criteria:**

- [ ] Store Analytics shows skeleton cards while loading.
- [ ] On an error, it shows an `Alert` with the server message and a 重試 button
      that calls `refetch`.
- [ ] When the filters leave no stores, it shows an `Empty` state.
- [ ] The footer caption shows `資料來自 GA4，約延遲 24–48 小時 · 更新於 {relative generatedAt}`.

**Verification:**

- [ ] Browser check with the dev server:
  - throttle the network → skeletons appear
  - unset `GA4_PROPERTY_ID` → error alert, and 重試 recovers after restoring it
  - filter to a city with no stores → empty state

**Dependencies:** Task 6

**Files:** `app/admin/store/analytics/page.tsx`, the components touched above
as needed

**Scope:** S

---

### Task 8: Documentation

**Description:** Record the new env var, the setup steps and the metric
definitions.

**Acceptance criteria:**

- [ ] `docs/analytics-events.md` has an "Admin reporting" section covering:
  - the endpoint and caching
  - metric definitions and tracking start dates
  - the hostname filter
  - the GA4 / Cloud setup steps
- [ ] The `CLAUDE.md` Environment section mentions `GA4_PROPERTY_ID` (server
      only).

**Verification:**

- [ ] Read-through: the definitions match `SPEC.md` and the code constants.

**Dependencies:** Task 2 (can run alongside Task 7)

**Files:** `docs/analytics-events.md`, `CLAUDE.md`

**Scope:** S

---

### Task 9: Number spot-check and PR preparation

**Description:** Confirm that the numbers match GA4, then prepare the PR.

**Acceptance criteria:**

- [ ] For 2–3 localhost stores, the period views and the gate counts match GA4
      (Reports → Pages and screens / Events, filtered to the same path,
      hostname and dates).
- [ ] Before/after screenshots are ready for the PR. The PR description links
      SPEC.md and notes the Vercel env step (`GA4_PROPERTY_ID` for Production).

**Verification:**

- [ ] The comparison table is recorded in the PR description.
- [ ] `npm run lint` and `npm run build` pass one final time.

**Dependencies:** Tasks 7, 8

**Files:** none (PR only)

**Scope:** S

---

### ✅ Checkpoint D: Complete

- [ ] Every Success Criterion in `SPEC.md` is ticked.
- [ ] **Stop for user review.** Commit and push only when the user says so.
- [ ] Before merge, the user adds `GA4_PROPERTY_ID=416623451` to Vercel
      Production.
