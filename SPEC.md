# Spec: Admin Store Analytics

## Objective

Give admins per-store traffic numbers inside the admin dashboard, so they can see
which listings get attention and which don't, without opening the GA4 console.

**User:** Bezold admins (Firebase `admin` custom claim). Not sellers, not public.

**Approved UI:** mockup option D, which has two surfaces backed by one data source:

1. **Store List** (`/admin/store/list`): add two cumulative columns.
2. **Store Analytics** (`/admin/store/analytics`, new): period view with trends.

### User stories

- As an admin scanning the store list, I see each store's **總瀏覽數** and
  **累計聯絡點擊率**, so I can spot strong and weak listings at a glance.
- As an admin, I hover a click rate and see the raw counts (`點擊 47 / 看到 316 次`),
  so I can tell whether the sample is large enough to trust.
- As an admin, I click a live store's 總瀏覽數 and land on Store Analytics with
  that store's daily trend already expanded.
- As an admin on Store Analytics, I switch between 7 / 30 / 90 days and compare
  each store with the previous period of the same length.

### Data definitions

| Metric              | Definition                                                                                                      | Window                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 總瀏覽數            | `screenPageViews` on `/store/{storeId}`                                                                         | `2026-07-04` (page-view tracking start) → yesterday    |
| 累計聯絡點擊率      | `contact_gate_click` ÷ `contact_gate_view` event counts on `/store/{storeId}`                                   | `2026-09-19` (contact-gate tracking start) → yesterday |
| 瀏覽 (period)       | `screenPageViews`                                                                                               | last N full days (N = 7 / 30 / 90), ending yesterday   |
| 不重複訪客 (period) | `activeUsers`                                                                                                   | same                                                   |
| 較前期              | `(current − previous) ÷ previous` views; `—` when previous is 0                                                 | previous N days immediately before                     |
| 會員聯絡 (period)   | `seller_contact_phone` / `_line` / `_threads` event counts (signed-in members tapping unlocked contact buttons) | same; counted from the day the events shipped          |
| 聯絡點擊率 (period) | period `contact_gate_click` ÷ period `contact_gate_view`                                                        | same                                                   |
| 近 N 天趨勢         | daily `screenPageViews`, zero-filled, oldest → newest                                                           | same                                                   |

- The contact gate is shown only to **logged-out** visitors, so both rates cover
  logged-out visitors only. The UI says so in tooltips.
- A rate whose denominator is 0 renders `—`, never `0%`.
- Store ID comes from `pagePath` matching `^/store/([^/]+)/?$`. Query strings are
  not part of `pagePath`. Other paths are ignored.
- Traffic is filtered to `hostName` = hostname of `NEXT_PUBLIC_APP_URL`, so dev
  and prod never mix:
  - `npm run dev`: `.env.development` sets `http://localhost:3000`, so the
    filter is `localhost`. That host already has real traffic (1,838 views and
    34 contact-gate events at the time of the connection test).
  - Vercel production: `https://www.bezold.com.tw` (confirmed from the live
    canonical URL and sitemap), so the filter is `www.bezold.com.tw`.
  - Staging `dev.bezold.com.tw` (Vercel-protected) shows little or no data,
    which is expected.
  - The apex `bezold.com.tw` 308-redirects to `www`, so it never appears in GA4.

## Tech Stack

- Next.js 14 App Router, TypeScript 5.2, React 18, Ant Design 5, Tailwind 3,
  CSS Modules. All of these already exist in the repo.
- Firebase Admin SDK (existing) for `verifyAdminToken`.
- **New dependency:** `@google-analytics/data` (GA4 Data API v1beta Node client).
- No chart library. Sparkline and line chart are small hand-written SVG
  components, as in the mockup.

## Setup (outside the codebase, done by Vincent)

Steps 1–3 were done and verified on 2026-10-10 with a connection test, which
returned per-store page views and contact-gate events.

1. ✅ In Google Cloud (project `bezold`), enable **Google Analytics Data API**.
2. ✅ In GA4 → Admin → Property access management, add
   `firebase-adminsdk-5nzk4@bezold.iam.gserviceaccount.com` as **Viewer**.
3. ✅ Copy the **Property ID** (`416623451`) into `GA4_PROPERTY_ID` in `.env`
   and `.env.development`. The reporting timezone is GMT+08:00 台灣時間.
4. ⬜ In Vercel → Project → Settings → Environment Variables, add
   `GA4_PROPERTY_ID=416623451` for **Production**. Do this before the PR is
   merged. `NEXT_PUBLIC_APP_URL` is already `https://www.bezold.com.tw` there.

Credentials reuse the existing Firebase Admin service account
(`serverServiceAccountConfig` in `firebase/configs.ts`). No new key file is needed.

## Commands

```bash
nvm use                                  # Node 24 per .nvmrc
npm install @google-analytics/data       # one-time, new dependency
npm run dev                              # http://localhost:3000/admin/store/list
npm run lint                             # ESLint (next/core-web-vitals)
npm run build                            # type-check + production build
npx prettier --write <changed files>     # after every file change
```

## API Contract

`GET /api/admin/store-analytics?range=30`

- Auth: `Authorization: Bearer <idToken>` checked by `verifyAdminToken`.
  Returns 401 or 403 otherwise. The client uses `authedFetch`.
- `range` ∈ `7 | 30 | 90`. Default is `30`. Any other value returns 400.
- Server-side cache: `unstable_cache`, keyed by `range`, `revalidate: 3600`.
- `GA4_PROPERTY_ID` missing → 503 `{ error: "Analytics not configured" }`.
  GA4 error → 502 `{ error: "Analytics unavailable" }`, logged server-side.

```ts
// types/StoreAnalytics.ts
export interface StoreAnalyticsCounts {
  views: number;
  gateViews: number;
  gateClicks: number;
}

export interface StoreAnalyticsEntry {
  allTime: StoreAnalyticsCounts;
  current: StoreAnalyticsCounts & { visitors: number; daily: number[] };
  previous: StoreAnalyticsCounts;
}

export interface StoreAnalyticsResponse {
  range: {
    days: 7 | 30 | 90;
    startDate: string; // YYYY-MM-DD, in GA4 property timezone
    endDate: string;
  };
  generatedAt: string; // ISO timestamp of the cached fetch
  stores: Record<string, StoreAnalyticsEntry>; // keyed by storeId; absent = no traffic
}
```

One `batchRunReports` call (5 reports, the API maximum). Each report is filtered by
`hostName` (exact match) and by `pagePath` starting with `/store/`. Each sets
`limit: 100000`.

| #   | Dimensions              | Metrics                          | Date ranges              | Extra filter               |
| --- | ----------------------- | -------------------------------- | ------------------------ | -------------------------- |
| 1   | `pagePath`, `date`      | `screenPageViews`                | current                  | —                          |
| 2   | `pagePath`              | `screenPageViews`, `activeUsers` | current, previous        | —                          |
| 3   | `pagePath`, `eventName` | `eventCount`                     | current, previous        | `eventName` in gate events |
| 4   | `pagePath`              | `screenPageViews`                | `2026-07-04` → yesterday | —                          |
| 5   | `pagePath`, `eventName` | `eventCount`                     | `2026-09-19` → yesterday | `eventName` in gate events |

GA4 response rows are converted into `StoreAnalyticsResponse` by **pure functions**
in `lib/analytics/storeAnalyticsTransform.ts`. These functions take no SDK
objects; they accept plain row arrays. That keeps the logic readable and
testable later.

## UI Requirements

### Store List (`app/admin/store/list/page.tsx`)

- Fetch `range=30` once `idToken` is available. The response's `allTime` drives
  the new columns. The store list renders immediately and the analytics columns
  fill in when ready. Each cell shows a small antd `Skeleton.Input` or `—`
  while loading.
- **總瀏覽數** column (right-aligned, sortable):
  - Number format: `toLocaleString()`.
  - For `approved` stores with views > 0, it is a link to
    `/admin/store/analytics?store={id}`. The click must **not** open the row
    drawer (`stopPropagation`).
  - Header tooltip: `自 2026-07-04 開始追蹤起累計`.
- **累計聯絡點擊率** column (right-aligned, sortable by rate):
  - Small bar + percentage (1 decimal).
  - antd `Tooltip` on the cell: `點擊 {clicks} / 看到 {views} 次`.
  - Header tooltip: `累計點擊解鎖 ÷ 累計看到聯絡區（僅未登入訪客），自 2026-09-19 起累計`.
  - `—` when `gateViews` is 0.
- Stores missing from `stores` show `0` views and `—` rate.
- If the request fails, both columns show `—` and a single non-blocking
  `message.warning("成效資料暫時無法載入")` appears. Everything else on the page
  keeps working.
- `scroll.x` grows to fit the two extra columns.

### Store Analytics (`app/admin/store/analytics/page.tsx`, new)

- Sidebar: add **Store Analytics** (`key: "store-analytics"`) under Store
  Management in `components/AdminSidebar.tsx`. The route lives under
  `app/admin/store/`, so it inherits the existing sidebar layout, and
  `useAdminMenuKey` resolves it to `store-analytics`.
- **URL params are the source of truth:** `range` (default `30`) and `store`
  (expanded row). Changing the range updates the URL with `router.replace`.
- **Toolbar:**
  - Status `Select` (default 已上架; options: all four statuses + 所有狀態).
  - City `Select` (所有城市 + cities present in the store list).
  - `Segmented` 7 天 / 30 天 / 90 天.
  - Caption: `與前一期比較`.
- **KPI row** (4 antd `Card`s), computed over the filtered stores:
  - 總頁面瀏覽 (+ 較前期)
  - 刊登數
  - 平均每間瀏覽
  - 聯絡解鎖點擊 (+ 較前期)
- **瀏覽數排行** card: horizontal bars for the top 10 filtered stores by period
  views. Each row shows the store name, a bar scaled to the top store, and the
  value. A native `title` holds the full name and value.
- **各商店成效** antd `Table` with these columns:
  - 店名 (with `城市 · 類別` underneath)
  - 近 N 天趨勢 (sparkline)
  - 瀏覽
  - 較前期 (▲ green / ▼ red / `—`)
  - 不重複訪客
  - 聯絡點擊率 (period)

  The 瀏覽, 較前期 and 聯絡點擊率 columns are sortable. Default sort: 瀏覽 descending.

- **Expandable rows** (antd `expandable`, one row open at a time):
  - Left side: daily-views line chart for the selected range. It has a hover
    crosshair and a tooltip showing `M/D · N 次瀏覽`.
  - Right side:
    - 總瀏覽數 (all-time)
    - 本期瀏覽 + 較前期
    - 本期聯絡 `看到 X → 點擊 Y`
    - 上架日 (`createTime`)
- Arriving with `?store={id}`: that row is expanded, highlighted, and scrolled
  into view. If the store isn't in the current filter (e.g. it is sold), the
  status filter switches to 所有狀態 first.
- **Footer caption:** `資料來自 GA4，約延遲 24–48 小時 · 更新於 {generatedAt 相對時間}`.
- **Loading state:** antd `Spin` / skeleton cards. **Error state:** antd
  `Alert type="error"` with the server's message and a 重試 button.
- **Out of scope for v1:** the 需關注 (low-traffic) flag.

## Project Structure

```
app/api/admin/store-analytics/route.ts      → GET handler: auth, range parsing, cached fetch
lib/analytics/ga4Client.ts                  → BetaAnalyticsDataClient from serverServiceAccountConfig (server-only)
lib/analytics/fetchStoreAnalytics.ts        → builds the 5 reports, calls batchRunReports, wraps unstable_cache
lib/analytics/storeAnalyticsTransform.ts    → pure row → StoreAnalyticsResponse functions
constant/storeAnalytics.ts                  → tracking start dates, RANGE_OPTIONS, CACHE_SECONDS, gate event names
types/StoreAnalytics.ts                     → response types (re-exported from types/index.ts)
hooks/useStoreAnalytics.ts                  → client fetch hook: { data, loading, error, refetch }
app/admin/store/list/page.tsx               → + two columns
app/admin/store/analytics/page.tsx          → new page (client component)
app/admin/store/analytics/_components/
  AnalyticsKpiRow.tsx                       → 4 KPI cards
  ViewsRanking.tsx (+ .module.css)          → top-10 horizontal bars
  StoreAnalyticsTable.tsx                   → antd Table + expandable detail
  ViewsLineChart.tsx (+ .module.css)        → SVG line chart with hover tooltip
  Sparkline.tsx                             → tiny SVG polyline
  ClickRate.tsx (+ .module.css)             → bar + % (+ optional count tooltip); also used by Store List
components/AdminSidebar.tsx                 → + Store Analytics menu item
docs/analytics-events.md                    → + "Admin reporting" section (setup, metric definitions)
CLAUDE.md                                   → + GA4_PROPERTY_ID under Environment
```

`ClickRate` is used by both admin pages, so it lives in the analytics
`_components` folder and the Store List page imports it from there. It is
admin-only, which is why it does not go in `components/refactored/`.

## Code Style

Follow the existing admin route pattern (`app/api/admin/buyer-profiles/route.ts`)
and the repo conventions:

```ts
// app/api/admin/store-analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { getCachedStoreAnalytics } from "@/lib/analytics/fetchStoreAnalytics";
import { RANGE_OPTIONS, type RangeDays } from "@/constant/storeAnalytics";

export async function GET(req: NextRequest) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  const rangeParam = Number(new URL(req.url).searchParams.get("range") ?? 30);
  if (!RANGE_OPTIONS.includes(rangeParam as RangeDays)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }
  if (!process.env.GA4_PROPERTY_ID) {
    return NextResponse.json(
      { error: "Analytics not configured" },
      { status: 503 },
    );
  }

  try {
    const analytics = await getCachedStoreAnalytics(rangeParam as RangeDays);
    return NextResponse.json(analytics);
  } catch (fetchError) {
    console.error("[store-analytics] GA4 request failed", fetchError);
    return NextResponse.json(
      { error: "Analytics unavailable" },
      { status: 502 },
    );
  }
}
```

**Conventions:**

- Readable names (`storeId`, `event`, `value`), never single letters.
- `cn()` for conditional classes.
- CSS Modules for paint and Tailwind for layout, never both on one element.
- Data transforms go in `lib/` or `utils/`; static lookups and dates go in
  `constant/`.
- Comments only where the _why_ isn't obvious, matching the surrounding density.
- Run Prettier on every changed file.

## Testing Strategy

There is no test framework, and none will be added (decision recorded).
Verification is:

1. `npm run lint` and `npm run build` pass with no new warnings.
2. **API checks** (dev server, browser pane, `authedFetch` from an admin session):
   - no token → 401
   - non-admin → 403
   - `range=5` → 400
   - `range=30` → 200 with the documented shape
   - a second call is served from cache (no new GA4 request in the server log)
   - unset `GA4_PROPERTY_ID` → 503 and the UI degrades as specified
3. **UI checks** in the browser pane:
   - list columns, tooltips and sorting
   - link → expanded row
   - range switch updates the URL and data
   - filters
   - expand and collapse
   - chart hover
   - loading and error states

   Screenshots go in the PR.

4. **Spot-check numbers:** compare 2–3 stores against the GA4 console (Reports →
   Pages and screens filtered to the same path, hostname and date range).

## Boundaries

- **Always:**
  - Gate the route with `verifyAdminToken`.
  - Keep GA4 calls and credentials server-only.
  - Filter by hostname.
  - Render `—` for zero denominators.
  - Run Prettier.
  - Work in the worktree branch and open a PR.
  - Stop for review before committing.
- **Ask first:**
  - Any dependency beyond `@google-analytics/data`.
  - Changing tracked events or `AnalyticsTracker` / `trackEvent`.
  - Firestore schema or write changes.
  - Changing existing Store List columns or behaviour beyond the two new columns.
  - Adding a test framework.
- **Never:**
  - Call GA4 from the browser or expose `GA4_PROPERTY_ID` / credentials through
    `NEXT_PUBLIC_*`.
  - Send analytics from `/admin` pages.
  - Store analytics in Firestore.
  - Commit `.env*`.
  - Expose seller contact info (`userInfo`) in the new endpoint.

## Success Criteria

- [ ] `GET /api/admin/store-analytics` returns the documented shape for `range`
      7 / 30 / 90. It returns 400 / 401 / 403 / 502 / 503 exactly as specified.
- [x] Repeat requests within an hour reuse the cached result (one GA4 batch call
      per range per hour).
- [x] Store List shows 總瀏覽數 and 累計聯絡點擊率 for every store, with
      `0` / `—` for stores without traffic.
- [x] The rate cell shows `點擊 X / 看到 Y 次` on hover. Sorting works on both
      new columns.
- [x] Clicking 總瀏覽數 on a live store opens `/admin/store/analytics?store={id}`
      with that row expanded and in view, and does not open the drawer.
- [x] A GA4 failure never blocks the Store List.
- [x] Store Analytics shows KPI cards, a top-10 ranking and a sortable table
      with sparklines. Each row can expand to a line chart with a hover tooltip.
- [x] The range switch updates the URL, the data and the 較前期 values. Status
      and city filters update the KPIs, ranking and table together.
- [ ] Numbers for 2–3 spot-checked stores match the GA4 console for the same
      range and hostname.
- [x] `npm run lint` and `npm run build` pass.
- [x] `docs/analytics-events.md` and `CLAUDE.md` document the new env var,
      setup steps and metric definitions.

> Verification notes (2026-10-10):
>
> - Shape and 200 / 400 / 401 / 503 were verified live. 403 (signed in, not an
>   admin) and 502 (GA4 error) were only reviewed in code: 403 comes from the
>   existing `verifyAdminToken`, and 502 couldn't be triggered because all
>   three ranges were already cached.
> - Numbers were cross-checked with independent per-store GA4 `runReport`
>   queries, which matched exactly. They were not compared in the GA4 console
>   UI.

## Resolved Decisions

1. **Verifying in dev:** use localhost traffic on mock stores. localhost already
   has views and contact-gate events, so the UI can be checked in dev without a
   prod override.
2. **Hosting:** Vercel. `unstable_cache` persists in Vercel's data cache, so the
   1-hour cache holds across requests.
3. **GA4 property timezone:** GMT+08:00 台灣時間. "yesterday" and the tracking
   start dates are Taipei dates.
4. **Hostname source:** the hostname of `NEXT_PUBLIC_APP_URL`. No extra env var
   is needed (see Data definitions).
5. **Credentials:** reuse the Firebase Admin service account. **Testing:** no
   test framework. **Menu label:** Store Analytics. **需關注 flag:** out of v1.
