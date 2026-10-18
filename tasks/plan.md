# Implementation Plan: SEO 健檢修正

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md) · 健檢報告: [`docs/seo-audit-2026-10-18.html`](../docs/seo-audit-2026-10-18.html) · 對比度對照: [`docs/contrast-before-after.html`](../docs/contrast-before-after.html)

## Overview

依照 SPEC 的 capability map，把 SEO 健檢和 Search Console 找到的問題分成 4 個模組，每個模組一個分支、一個 PR：

1. `seo-metadata`：canonical、OG、店家頁 description 與索引規則、404、sitemap、標題、結構化資料，以及之後每次上線都能重跑的 `npm run seo:audit`。
2. `store-list-payload`：`/store-list` 只送出 approved 店家、平行簽圖、刪除 `/api/stores`、首屏圖片 priority。
3. `headings-a11y`：h1、對比度 token、「04」看不見的 bug、landmark 與 heading 層級。
4. `stable-image-urls`：改用 Firebase 下載網址，公開列表只解析封面圖。

共 16 個任務、4 個檢查點。

## Architecture Decisions

- **驗證腳本最先做**：`scripts/seo-audit.mjs` 是後面每個任務的驗收工具。先對正式站跑一次，確認它抓得到已知的問題（canonical、description 重複、500），之後才能拿它證明「修好了」。
- **metadata 依頁面類型垂直切分**：先做 helper（`pageMetadata()`）並套用到 `/faq`、`/sell` 兩頁，跑通驗證腳本，再推廣到其他靜態頁。店家頁、sitemap 各自獨立成任務。每個任務做完，`seo:audit` 就會少一類失敗。
- **`--skip` 讓模組可以分開驗收**：h1 由 `headings-a11y` 負責，「HTML 裡沒有非公開狀態」由 `store-list-payload` 負責。前面的模組用 `--skip h1,status` 驗證自己的項目，最後一個檢查點不帶 `--skip`，必須 0 個失敗。
- **`getStores` 用選項參數擴充，不改預設行為**：`{ statuses, coverOnly }` 都是選用參數，admin 的 3 個呼叫點不傳，行為完全不變。過濾在記憶體中進行，不新增 Firestore `where`，也就不需要新的 composite index。
- **sitemap 的 `in` 查詢**：`where("status", "in", [approved, sold])` 是單一欄位查詢，不需要 composite index。
- **圖片網址最後做**：Firebase 下載網址每張圖都要一次網路請求，會影響 TTFB。所以要等 `store-list-payload` 把簽圖改成平行、並量好基準值之後再做，同時加上「公開列表只解析封面圖」來抵銷。開始前先跑唯讀抽查，確認沒有 token 的物件比例。
- **對比度掃描用瀏覽器 console 片段**：計算對比度需要 computed style，Node 的 `fetch` 做不到。沿用健檢時的掃描片段，透過 Chrome DevTools 在本機頁面上執行，不另外加到 repo。
- **分支與 PR**：依照你的流程，每個模組做完先停下來等 review，再 commit 和開 PR；PR 合併後，下一個有依賴的模組再從 main 開分支。`headings-a11y` 沒有依賴，可以在 PR 1 等 review 的期間進行。`SPEC.md`、`tasks/`、`docs/` 跟著 PR 1 一起 commit。

## Dependency Graph

```
scripts/seo-audit.mjs ──────────────────────────────── Task 1（所有任務的驗收工具）
  │
  ├─ constant/seo.ts + utils/seo.ts + layout.tsx ─── Task 2（/faq、/sell 先套用）
  │     ├─ 其他靜態頁 pageMetadata ────────────────── Task 3、Task 4
  │     └─ 店家頁 metadata / 404 ──────────────────── Task 5
  │           └─ 店家頁 JSON-LD ───────────────────── Task 6
  └─ sitemap、登入頁、blog 標題 ────────────────────── Task 7
        │
        ▼  PR 1 合併
  getStores({ statuses }) + 平行簽圖 ─────────────── Task 8（量 TTFB 基準）
  刪除 /api/stores ───────────────────────────────── Task 9
  StoreCard priority ─────────────────────────────── Task 10
        │
        ▼  PR 2 合併
  抽查下載 token（唯讀）──────────────────────────── Task 14 ─ 你決定是否繼續
  getImageByPath 下載網址 + 快取 ─────────────────── Task 15
  coverOnly ─────────────────────────────────────── Task 16

  （獨立）h1 ── Task 11；對比度 token ── Task 12；landmark / heading 層級 ── Task 13
```

## Task List

詳細的驗收條件與驗證方式見 [`tasks/todo.md`](todo.md)。

### Phase 1: `seo-metadata`（PR 1）

- [x] Task 1: SEO 驗證腳本 `npm run seo:audit`
- [x] Task 2: metadata helper，修正 `/faq`、`/sell` 的 canonical 與 OG
- [x] Task 3: `/store-guide`、`/store-list`、`/blog` 改用 `pageMetadata()`
- [x] Task 4: 法律頁與 `/policy/editor-pick` 改用 `pageMetadata()` / `BASE_OPEN_GRAPH`
- [x] Task 5: 店家頁 description、標題、索引規則、404
- [x] Task 6: 店家頁 JSON-LD：SoldOut、面議不輸出 Product、絕對網址 fallback
- [x] Task 7: sitemap 收錄 sold、移除登入頁；登入頁 noindex；blog 文章標題

### Checkpoint A: `seo-metadata` 完成

- [x] `npm run seo:audit -- --skip h1,status` 0 個失敗
- [ ] Vercel preview 通過 Rich Results Test（SPEC 測試 T5、T18）
- [ ] review 後 commit、開 PR 1

### Phase 2: `store-list-payload`（PR 2，PR 1 合併後）

- [x] Task 8: `getStores` 狀態過濾與平行簽圖，`/store-list` 只取 approved
- [ ] Task 9: 刪除 `GET /api/stores`
- [ ] Task 10: 首屏 StoreCard 加 priority

### Checkpoint B: `store-list-payload` 完成

- [ ] `seo:audit -- --skip h1` 0 個失敗；TTFB 與 HTML 大小達標
- [ ] admin 列表行為不變
- [ ] review 後 commit、開 PR 2

### Phase 3: `headings-a11y`（PR 3，可與 Phase 1、2 並行）

- [ ] Task 11: 店家頁與 `/store-list` 的 h1
- [ ] Task 12: 對比度 token、深色區塊 accent、「04」標籤
- [ ] Task 13: `<main>`、nav `<li>`、heading 層級

### Checkpoint C: `headings-a11y` 完成

- [ ] 5 頁對比度掃描 0 處不足；Lighthouse 無障礙 ≥ 95
- [ ] review 後 commit、開 PR 3

### Phase 4: `stable-image-urls`（PR 4，PR 2 合併後）

- [ ] Task 14: 唯讀抽查沒有下載 token 的物件（gate）
- [ ] Task 15: `getImageByPath` 改用下載網址，加上快取與退回機制
- [ ] Task 16: 公開列表只解析封面圖

### Checkpoint D: 全部完成

- [ ] 本機 `npm run seo:audit`（不帶 `--skip`）0 個失敗
- [ ] review 後 commit、開 PR 4
- [ ] 全部上線後對正式站跑 `seo:audit` 與 Lighthouse；約 4 週後回到 Search Console 確認 SPEC 的追蹤指標

## Risks and Mitigations

| 風險                                              | 影響 | 緩解                                                                                                     |
| ------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| Worktree 的 dev / start 會讀到**正式資料**        | 高   | 所有驗證只讀；不在本機操作任何會寫入的流程（上傳、改狀態）。抽查腳本只呼叫 `getMetadata`                 |
| `getDownloadURL()` 每張圖一次網路請求，拖慢 TTFB  | 中   | 放到最後做；先有 Task 8 的基準值；搭配 10 分鐘快取與 coverOnly；驗收條件是 TTFB ≤ 基準值的 110%          |
| 有些物件沒有下載 token                            | 中   | Task 14 先抽查；超過 10% 就停下來討論；程式一律退回簽名網址，不會壞圖                                    |
| `notFound()` 在 `generateMetadata` 與頁面中的行為 | 低   | Task 5 用 curl 確認狀態碼是 404，並確認 `error.tsx` 沒有攔截                                             |
| h2 → h1、h5 → h3 造成字級改變                     | 中   | 樣式都在 CSS module 的 class 上；Task 11、Task 13 在 390px 和 1280px 做改前改後截圖比對                  |
| accent 變深影響品牌觀感                           | 低   | 已經用對照頁確認過色票；Task 12 再截一次圖比對                                                           |
| sitemap 加入 sold 後，Google 收錄很多已售出頁面   | 低   | sold 的 priority 設為 0.4、`monthly`；Search Console 資料顯示 sold 頁面本來就有搜尋流量                  |
| Rich Results Test 需要公開網址                    | 低   | 用 PR 的 Vercel preview 網址；如果 preview 有密碼保護，改成上線後再驗                                    |
| Worktree 沒有 `.env`，`next lint` 也會衝突        | 低   | build 時暫時 symlink 主 checkout 的 `.env`，結束後刪除；lint 用 `eslint --no-eslintrc -c .eslintrc.json` |

## Open Questions

目前沒有。Task 14 的抽查結果出來後，可能需要你決定是否補 token。
