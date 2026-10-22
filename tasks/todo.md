# Tasks: 店家照片瘦身

Plan: [`tasks/plan.md`](plan.md) · Spec: [`SPEC.md`](../SPEC.md)

每個任務都要先滿足以下條件才算完成：

- 修改過的檔案都跑過 `npx prettier --write`
- `npx eslint --no-eslintrc -c .eslintrc.json --ext .ts,.tsx app components constant types utils hooks lib firebase` 沒有新的錯誤
- `npm run build` 通過（worktree 先暫時 symlink 主 checkout 的 `.env`，結束後刪除）
- 遵守 CLAUDE.md（`constant/` 與 `utils/` 分工、`COLLECTIONS`、`cn()`、變數命名完整）
- 腳本在 worktree 裡用 `--env-file=../../../.env`
- 任何對 `prodStore` 加 `--write` 的執行都要先問你
- 「SPEC #Tn」指 SPEC.md Testing Strategy 表的測試編號

---

## Phase 1: `image-backfill`（PR 1）

### Task 1: 共用參數 + 腳本試跑模式

**Description:** 新增 `constant/image.ts`（`IMAGE_MAX_EDGE`、`IMAGE_QUALITY`、`IMAGE_SKIP_BYTES`、`IMAGE_OUTPUT_TYPE`、`IMAGE_SETTINGS_TAG`），加 `sharp` devDependency，新增 `scripts/shrink-store-images.mjs` 的唯讀部分：解析參數、逐家讀店家文件的 `images`、判斷略過原因（`missing` / 已轉過 / 已在門檻內 / 轉完變大）、在記憶體裡真的轉檔、算出新檔名（含撞名時的 `-2`），印出每張照片的前後大小和總摘要。這一步完全不寫入。

**Acceptance criteria:**

- [x] 沒有 `--prefix` 就報錯退出；`--prefix` 只接受 `mockStore`、`prodStore`；支援 `--only`
- [x] 沒有 `--write` 時不呼叫任何寫入 API（Storage 和 Firestore 都一樣）
- [x] 摘要包含：會處理數、各種略過數、店家文件參照的照片總 MB（處理前 → 處理後）
- [x] 參數從 `constant/image.ts` import，腳本裡沒有重複的數字

**Verification:**

- [x] `mockStore` 試跑（SPEC #T7）：數字合理；跑前跑後 Storage 物件的 generation、店家文件的 `images` 和 `updateTime` 完全相同
- [x] `prodStore` 試跑（唯讀）：記下處理後總大小，確認 ≤ 120 MB（Success Criteria 1）；如果不到，先回來討論參數 — 490.29 MB → 94.63 MB；299 張要轉、222 張已在門檻內、1 張轉完變大；新檔 p95 0.33 MB、最大 0.53 MB
- [x] lint、build 通過

**Dependencies:** None

**Files likely touched:**

- `constant/image.ts`
- `scripts/shrink-store-images.mjs`
- `package.json`、`package-lock.json`

**Estimated scope:** M

### Task 2: 轉檔模式

**Description:** 加上 `--write`：上傳新檔（`ifGenerationMatch: 0`、`contentType`、新的 `firebaseStorageDownloadTokens`、`sourcePath`、`shrunk`、`originalBytes`）→ 用 transaction 重新讀店家文件，把舊路徑換成新路徑（順序不變、只寫 `images`）→ 舊路徑已經不在 `images` 時跳過並刪掉剛上傳的新檔。原圖不動。同時最多 4 張；有 failed 時 exit code 為 1。

**Acceptance criteria:**

- [x] 店家文件 `images` 換成新的 `.webp` 路徑、順序不變、`updateTime` 和其他欄位不變
- [x] 原圖仍在原路徑；新檔有 token，server 端 `getDownloadURL` 拿得到穩定網址
- [x] 不會覆寫任何既有的 Storage 物件

**Verification:**

- [x] `mockStore --write`（SPEC #T8）：抽 3 家店比對跑前跑後的店家文件，只有 `images` 的路徑不同 — 35 家全比對：5 家只有 `images` 改變、順序不變，0 家有其他欄位改變
- [x] 本機 dev（`NEXT_PUBLIC_ENV_VERSION=dev`）打開首頁、`/store-list`、2 個店家頁、my-listings、admin 店家 drawer：照片都正常、清楚，封面沒變 — 首頁、`/store-list`、3 個店家頁的照片網址都回 200 `image/webp`；my-listings、admin drawer 需要登入，改用它們實際呼叫的 Storage metadata API 確認新檔可讀、有 token
- [x] 再跑一次 `mockStore --write`（SPEC #T9）：全部略過、0 寫入
- [x] lint、build 通過 — 只改 `scripts/`，不在 lint 範圍、不影響 build；Checkpoint A 再整體跑一次
- [x] 處理期間賣家刪照片：轉檔時另一個程序刪掉 `photo.png`，腳本記為「removed」、刪掉它的新檔，其他路徑照常替換

**Dependencies:** Task 1

**Files likely touched:**

- `scripts/shrink-store-images.mjs`

**Estimated scope:** S

### Task 3: 還原模式

**Description:** 加上 `--rollback`：對店家文件裡每個帶 `sourcePath` 的路徑，確認原圖存在（不在原路徑但在 `backup/<sourcePath>` 就先複製回來）→ transaction 換回 `sourcePath` → 刪除轉好的檔。

**Acceptance criteria:**

- [x] 還原後店家文件的 `images` 和轉檔前完全相同（含順序）
- [x] 轉好的 `.webp` 被刪除；原圖仍在
- [x] 還原後再跑轉檔模式，結果和第一次相同

**Verification:**

- [x] `mockStore --write --rollback --only <id>`（SPEC #T10）：和 Task 2 前存下的店家文件比對完全相同；本機 dev 店家頁照片正常
- [x] 同一家店再轉一次，頁面正常
- [x] 原圖已搬到 `backup/` 時：還原會先複製回原路徑，download token 和原本相同
- [x] lint、build 通過

**Dependencies:** Task 2

**Files likely touched:**

- `scripts/shrink-store-images.mjs`

**Estimated scope:** S

### Checkpoint A: mockStore 驗證完成

- [x] SPEC #T7–T10 通過（測試用的 `shrink-fixture` 店家和檔案已刪除；`mockStore` 其他 5 家店維持轉好的狀態）
- [ ] 和你 review；通過後 commit（連同 `SPEC.md`、`tasks/`）並開 PR 1

---

## Phase 2: 正式資料

### Task 4: 單店試轉 + LINE / Facebook 預覽驗證

**Description:** 你選一家正式店家（見 plan 的 Open Questions），經你同意後執行 `--prefix prodStore --write --only <storeId>`。確認正式站店家頁照片正常，再請你在 LINE 和 Facebook 分享這家店的網址，確認預覽圖有出現。結果決定 `IMAGE_OUTPUT_TYPE`。

**Acceptance criteria:**

- [ ] 正式站這家店的店家頁、列表卡片照片正常
- [ ] LINE 和 Facebook 分享預覽都有圖（SPEC #T11）
- [ ] 如果任何一邊沒有圖：經你同意後 `--rollback --only <storeId>` → `IMAGE_OUTPUT_TYPE` 改成 `image/jpeg` → `mockStore` 重跑 Task 2、3 的驗證 → 再試轉這家店一次

**Verification:**

- [ ] 正式站店家頁照片的回應 `Content-Type` 是 `IMAGE_OUTPUT_TYPE`、大小 ≤ 400 KB
- [ ] Facebook Sharing Debugger「Scrape Again」顯示預覽圖
- [ ] LINE 聊天室分享網址（必要時加 `?v=1` 避開快取）顯示預覽圖（**你在手機上看**）

**Dependencies:** Checkpoint A

**Files likely touched:**

- `constant/image.ts`（只有改成 JPEG 時）

**Estimated scope:** XS

### Task 5: 全部正式資料轉檔

**Description:** 先存一份 `seo:audit` 基準，經你同意後執行 `--prefix prodStore --write`。記錄實際的處理前後總大小，確認正式站沒有破圖。

**Acceptance criteria:**

- [ ] 0 個 failed；參照照片總大小 ≤ 120 MB，p95 ≤ 400 KB（Success Criteria 1）
- [ ] 所有店家文件的 `images` 都指向存在的物件（Success Criteria 2）

**Verification:**

- [ ] 正式站首頁、`/store-list`、5 個店家頁照片都正常（SPEC #T12）
- [ ] `npm run seo:audit -- https://www.bezold.com.tw` 結果和基準一樣
- [ ] 再跑一次 `prodStore` 試跑：全部略過

**Dependencies:** Task 4

**Files likely touched:** 無（只執行腳本）

**Estimated scope:** XS

### Checkpoint B: 正式資料完成

- [ ] 實際數字（處理數、前後總大小、p95）寫進 PR 1 描述
- [ ] 記下完成日期，4 週後做 Phase 4

---

## Phase 3: `upload-resize`（PR 2）

### Task 6: 上傳時縮圖 + 不撞名的檔名

**Description:** 新增 `utils/image.ts` 的 `resizeImageFile(file)`：`createImageBitmap(file, { imageOrientation: "from-image" })` → canvas 縮到最長邊 ≤ `IMAGE_MAX_EDGE` → `toBlob(IMAGE_OUTPUT_TYPE, IMAGE_QUALITY / 100)` → 回傳新的 `File`。`uploadStoreImageByFile` 上傳前呼叫它，存成 `<名稱>-<6 碼短 id>.<副檔名>`，並帶 `{ contentType }`。這個任務只處理主要路徑。

**Acceptance criteria:**

- [ ] `/sell` 上傳 4000×3000、約 5 MB 的 JPEG：Storage 裡是 `<名稱>-<id>.webp`，最長邊 1600、≤ 400 KB
- [ ] admin 圖片頁上傳同一張圖，結果相同
- [ ] 同一家店先後上傳 `a.jpg`、`a.png`，兩張都在 `images` 裡
- [ ] `StoreImageUpload.tsx` 和 admin 圖片頁不用改

**Verification:**

- [ ] 本機 dev（**先確認 `NEXT_PUBLIC_ENV_VERSION=dev`**）用 chrome-devtools MCP `upload_file` 測 SPEC #T1、#T2、#T5 撞名部分；測試圖用 sharp 產生在 scratchpad
- [ ] 上傳後縮圖顯示正常；測完刪除測試照片
- [ ] lint、build 通過

**Dependencies:** Task 4（輸出格式已確定）

**Files likely touched:**

- `utils/image.ts`
- `firebase/clientUtils/image.ts`

**Estimated scope:** S

### Task 7: 上傳縮圖的例外情況

**Description:** 補上 SPEC `upload-resize` 表格的其他情況：已在門檻內、`image/gif` / `image/svg+xml`、解碼失敗、轉完比原檔大 → 都回傳原檔；瀏覽器不支援 WebP 編碼（`blob.type` 不對）→ 改用 `image/jpeg`。任何例外都不能讓上傳失敗。

**Acceptance criteria:**

- [ ] 小圖（< 300 KB、< 1600px）內容原封不動（SPEC #T3）
- [ ] 帶 EXIF 方向的直拍照片方向正確（SPEC #T4）
- [ ] 無法解碼的檔案（假的 `.heic`）照舊上傳原檔，沒有錯誤訊息（SPEC #T5）
- [ ] GIF 原封不動

**Verification:**

- [ ] 本機 dev（`mockStore`）逐一上傳上述測試檔，在 Storage 確認結果；測完刪除
- [ ] 不支援 WebP 的路徑：在瀏覽器暫時讓 `toBlob` 回傳 PNG（devtools 覆寫 `HTMLCanvasElement.prototype.toBlob`），確認改存 JPEG
- [ ] lint、build 通過

**Dependencies:** Task 6

**Files likely touched:**

- `utils/image.ts`

**Estimated scope:** S

### Checkpoint C: 上傳縮圖上線

- [ ] 和你 review；通過後 commit、開 PR 2
- [ ] 確認 Vercel preview 連哪一組資料後，請你用 iPhone Safari 實機上傳（SPEC #T6）
- [ ] PR 2 上線後：`prodStore` 試跑 → 經你同意後轉檔，補處理中間上傳的照片
- [ ] 一週後看 Billing Reports 的 Cloud Storage 對外流量費用（Success Criteria 5）

---

## Phase 4: 清理（PR 3，Task 5 完成約 4 週後）

### Task 8: 清理模式 + 正式資料清理

**Description:** 加上 `--cleanup`：對店家文件裡每個帶 `sourcePath` 的路徑，把原圖複製到 `backup/<sourcePath>`、確認存在後刪除原路徑的原圖。先在 `mockStore` 跑，再經你同意後跑 `prodStore`。

**Acceptance criteria:**

- [ ] 原圖先有 `backup/` 複本才會被刪除
- [ ] 清理後頁面照片都正常；`--rollback` 仍可從 `backup/` 還原
- [ ] `prodStore/` 只剩正在使用的檔案（Success Criteria 3）

**Verification:**

- [ ] `mockStore --cleanup --write`（SPEC #T13）：`backup/mockStore/` 檔案數等於被替換的原圖數；本機 dev 頁面正常；對一家店跑 `--rollback` 確認能從備份還原，再轉回來
- [ ] 清理前抽查：LINE 預覽和 Google 搜尋結果裡的店家圖片已經是新網址
- [ ] `prodStore --cleanup --write` 後，正式站首頁、`/store-list`、5 個店家頁照片正常
- [ ] lint、build 通過

**Dependencies:** Checkpoint B + 4 週

**Files likely touched:**

- `scripts/shrink-store-images.mjs`

**Estimated scope:** S

### Checkpoint D: 完成

- [ ] 和你 review；通過後 commit、開 PR 3
- [ ] 一個月後決定是否刪除 `backup/`（刪除前先問你）
