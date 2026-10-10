# Implementation Plan: Admin Store Analytics

Source of truth: [`SPEC.md`](../SPEC.md). Approved UI: mockup option D.
Tasks are tracked in [`tasks/todo.md`](todo.md).

## Overview

Add per-store GA4 metrics to the admin in two places:

- **Store List** gets two cumulative columns: 總瀏覽數 and 累計聯絡點擊率.
- **Store Analytics** is a new page with period KPIs, a ranking, and a sortable
  table whose rows expand into a daily trend chart.

Both read one admin-only endpoint, `GET /api/admin/store-analytics?range=7|30|90`.
That endpoint makes one cached GA4 `batchRunReports` call.

## Dependency Graph

```
@google-analytics/data (npm)
        │
constant/storeAnalytics.ts ── types/StoreAnalytics.ts
        │                          │
        └──── lib/analytics/storeAnalyticsTransform.ts (pure)
                         │
          lib/analytics/ga4Client.ts + fetchStoreAnalytics.ts (cached)
                         │
          app/api/admin/store-analytics/route.ts
                         │
                hooks/useStoreAnalytics.ts
                    │                 │
     ClickRate component      Store Analytics page shell (sidebar, toolbar, KPIs)
          │                           │
   Store List columns          ViewsRanking + StoreAnalyticsTable + Sparkline
          │                           │
          └──── deep link ──── expandable row + ViewsLineChart (?store=)
```

## Architecture Decisions

- **REST transport for the GA4 client** (`new BetaAnalyticsDataClient({ fallback: true })`).
  The default gRPC transport keeps a socket open. The connection test showed
  this: the script printed its results and then never exited. gRPC also brings
  protobuf/bundling friction in Next.js serverless functions, and REST avoids
  both. If the build still fails to bundle the package, add it to
  `experimental.serverComponentsExternalPackages` in `next.config.js`. That is a
  one-line config change, and I will report it before making it.
- **Pure transform layer.** `storeAnalyticsTransform.ts` takes plain row arrays
  (`{ dimensions: string[]; metrics: number[] }`) and returns
  `StoreAnalyticsResponse`. The SDK types stay inside `fetchStoreAnalytics.ts`.
  There is no test runner, so the transform is checked once with a throwaway
  scratchpad script that feeds it sample rows (nothing is committed for this).
- **Cache at the fetch layer.** `unstable_cache(fetchFn, ["store-analytics"], { revalidate: 3600 })`,
  keyed by `range`. Only successful results are cached: thrown errors are not
  cached, so a GA4 outage recovers on the next request.
- **One hook, two pages.** `useStoreAnalytics(range)` wraps `authedFetch` with
  `useAdminAuth().idToken`. It returns `{ data, loading, error, refetch }`, which
  matches the page-level `useState` style already used in `store/list`.
- **Store Analytics lives under `app/admin/store/analytics/`.** It inherits the
  existing sidebar layout, and `useAdminMenuKey` resolves it to `store-analytics`
  without changes.
- **Store metadata comes from `getStores()`** (client Firestore), the same source
  as Store List. Analytics are joined by `store.id`. Stores without GA4 rows show
  0 / `—`.
- **The deep link is built last.** The Store List link to `?store={id}` is added
  only once the target page can expand that row, so no task ships a link to a
  missing page.

## Phases

### Phase 1: Data path (highest risk first)

GA4 bundling, credentials in a serverless route, and report shape are where this
can fail. They are proven before any UI.

1. Constants, types and the pure transform
2. GA4 client, cached fetch and the admin route

**Checkpoint A:** the API returns the real shape from localhost data. Every
status code behaves as specified. The build is clean.

### Phase 2: Store List

3. `useStoreAnalytics` hook, `ClickRate`, and the two Store List columns

**Checkpoint B:** the Store List shows real numbers, degrades gracefully when the
API fails, and the drawer and bulk actions still work.

### Phase 3: Store Analytics page

4. Page shell: sidebar item, URL-driven toolbar, KPI row
5. Ranking card and table with sparklines
6. Expandable row with line chart, plus the `?store=` deep link from Store List

**Checkpoint C:** the full flow of option D works end to end in the browser.

### Phase 4: Hardening and docs

7. Loading, error and empty states on both pages
8. Docs: `docs/analytics-events.md`, `CLAUDE.md`
9. Spot-check numbers against the GA4 console, then prepare the PR (screenshots)

**Checkpoint D:** every SPEC success criterion is ticked, and the work is ready
for your review. Nothing is committed until you say so.

## Risks and Mitigations

| Risk                                                                                                              | Impact | Mitigation                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| `@google-analytics/data` fails to bundle in Next 14 route handlers                                                | High   | REST fallback transport. If still broken, `serverComponentsExternalPackages` (ask first). Proven in Task 2 before any UI. |
| `FIREBASE_SERVER_PRIVATE_KEY` newline format differs between local `.env` and Vercel                              | Med    | Normalise with `.replace(/\\n/g, "\n")` (same as the connection test). Verify on a Vercel preview before merge.           |
| GA4 row limit or quota surprises with 90-day daily rows (~124 stores × 90 days ≈ 11k rows)                        | Low    | `limit: 100000` per report. One batch call per range per hour.                                                            |
| `pagePath` variants (trailing slash, encoded IDs) split one store into two rows                                   | Med    | Normalise in the transform with the `^/store/([^/]+)/?$` regex and sum duplicates. Check in Task 1 with sample rows.      |
| Local dev reads **prod** collections (`.env.development` has `ENV_VERSION=prod`) while GA4 filters to `localhost` | Low    | Expected: localhost traffic was on real store pages. Documented in SPEC. Numbers will be small but real.                  |
| `unstable_cache` serialises the result; non-JSON values break it                                                  | Low    | The response is plain JSON (numbers, strings, arrays) by design.                                                          |
| Store List gets slower                                                                                            | Med    | Analytics load in parallel after the list renders. The columns show a skeleton and never block the table.                 |

## Parallelization

This is a single-agent, sequential plan. Tasks 4–6 share one page and table, and
Task 3 depends on the hook, so splitting across agents would only add
coordination. Task 8 (docs) could run alongside Task 7 if wanted.

## Open Questions

None. The spec's open questions are resolved. The one thing to watch is the
`next.config.js` change (see Architecture Decisions), which I will raise if
Task 2 needs it.
