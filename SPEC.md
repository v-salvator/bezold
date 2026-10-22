# Spec: 店家照片瘦身

## Objective

2026-10-22 Google Cloud 預算通知連續觸發 50%、100%。最可能的原因是 Firebase Storage 的對外流量：`next.config.js` 設定 `images.unoptimized: true`，訪客直接從 `bezold.appspot.com`（US multi-region）下載原圖。`prodStore/` 有 522 個檔案、共 490 MB，平均 0.94 MB，最大 7 MB；一個店家頁 5 張圖就是 16–29 MB。

目標是讓訪客下載的照片變成原本的 1/5～1/10，而且之後新上傳的照片不再是原圖：

1. **既有照片**：每張超過門檻的照片轉成新的 `.webp` 檔（最長邊 1600px），把店家文件的 `images` 換成新路徑。原圖先留在原路徑，等快取更新後再搬到 `backup/`。
2. **新上傳照片**：賣家（`/sell`、`/my-listings` 編輯）和管理員（`/admin/store/edit/[storeId]/image`）上傳前，在瀏覽器裡先縮圖、轉成 `.webp`。

使用者是訪客（看得更快、站方付更少流量費）、賣家和管理員（上傳流程不變，只是檔案變小）。

### Capability Map

| Module id        | 負責                                                                                 | 依賴             |
| ---------------- | ------------------------------------------------------------------------------------ | ---------------- |
| `image-settings` | 共用的編碼參數（最長邊、品質、略過門檻、輸出格式）                                   | —                |
| `image-backfill` | 一次性 Node 腳本：轉出新的 `.webp` → 更新 Firestore 路徑；可還原；之後把原圖搬到備份 | `image-settings` |
| `upload-resize`  | 瀏覽器端上傳前縮圖，接在 `uploadStoreImageByFile` 裡                                 | `image-settings` |

Build order：`image-settings` → `image-backfill` → `upload-resize`

backfill 先做：490 MB 的既有照片是費用大宗，而且最大的風險（LINE 預覽能不能顯示 WebP）要靠一家正式店家試轉才驗證得了。這個結果決定兩個模組共用的輸出格式，越早知道越好。`upload-resize` 上線後再跑一次 backfill，補處理中間這段時間上傳的照片（腳本可以重跑）。`image-settings` 只有一個常數檔，和 `image-backfill` 放在同一個 PR。

## Tech Stack

- Next.js 14（App Router）· TypeScript · Firebase JS SDK 10（`firebase/storage`）· Firebase Admin 11（`@google-cloud/storage` 6.12）
- 瀏覽器端：原生 `createImageBitmap` + `<canvas>` + `canvas.toBlob`，**不加套件**
- 腳本端：Node 24（`.nvmrc`，可以直接 import `.ts`）+ **`sharp`（新增 devDependency，只給腳本用）**

## Commands

```bash
nvm use
npm install -D sharp

# 格式化、lint、build（每個任務完成前都要跑）
npx prettier --write <changed files>
npx eslint --no-eslintrc -c .eslintrc.json --ext .ts,.tsx app components constant types utils hooks lib firebase
npm run build

# backfill：預設只試跑，加 --write 才會寫入；--prefix 必填，不從環境變數推斷
node --env-file=.env scripts/shrink-store-images.mjs --prefix mockStore
node --env-file=.env scripts/shrink-store-images.mjs --prefix mockStore --write
node --env-file=.env scripts/shrink-store-images.mjs --prefix mockStore --write --rollback --only <storeId>
node --env-file=.env scripts/shrink-store-images.mjs --prefix prodStore                         # 唯讀試跑
node --env-file=.env scripts/shrink-store-images.mjs --prefix prodStore --write --only <storeId>  # 單店試轉
node --env-file=.env scripts/shrink-store-images.mjs --prefix prodStore --write
# 約 4 週後（Phase 4）
node --env-file=.env scripts/shrink-store-images.mjs --prefix prodStore --cleanup --write
```

worktree 裡沒有 `.env`，跑腳本時用 `--env-file=../../../.env`（主 checkout 的檔案）。

## Project Structure

```
constant/image.ts                → 新增：IMAGE_MAX_EDGE、IMAGE_QUALITY、IMAGE_SKIP_BYTES、IMAGE_OUTPUT_TYPE、IMAGE_SETTINGS_TAG
scripts/shrink-store-images.mjs  → 新增：backfill 腳本（試跑 / 轉檔 / 還原 / 清理），從 constant/image.ts 讀參數
utils/image.ts                   → 新增：resizeImageFile(file) — 瀏覽器端縮圖（轉換資料的函式放 utils/）
firebase/clientUtils/image.ts    → 修改：uploadStoreImageByFile 上傳前呼叫 resizeImageFile，檔名加短 id，明確設定 contentType
package.json                     → 修改：devDependencies 加 sharp
```

`StoreImageUpload.tsx`、admin 圖片頁、店家頁、列表頁都不用改：它們都從店家文件的 `images` 讀路徑，執行時才換成網址。

## 模組規格

### `image-settings`

```ts
// constant/image.ts
// * shared by the browser upload resize and scripts/shrink-store-images.mjs —
// * keep erasable-only TS (no enums / path aliases) so Node can import it
export const IMAGE_MAX_EDGE = 1600;
export const IMAGE_QUALITY = 80; // 0–100; canvas.toBlob takes IMAGE_QUALITY / 100
export const IMAGE_SKIP_BYTES = 300 * 1024;
export const IMAGE_OUTPUT_TYPE = "image/webp";
// * written to each converted object, e.g. "webp-1600-q80"
export const IMAGE_SETTINGS_TAG = `${IMAGE_OUTPUT_TYPE.split("/")[1]}-${IMAGE_MAX_EDGE}-q${IMAGE_QUALITY}`;
```

- 檔案已經「最長邊 ≤ `IMAGE_MAX_EDGE` 而且 ≤ `IMAGE_SKIP_BYTES`」就不處理。
- 輸出格式集中在 `IMAGE_OUTPUT_TYPE`。如果 LINE 預覽測試失敗，改成 `image/jpeg`，副檔名跟著變成 `.jpg`。

### `image-backfill`

`scripts/shrink-store-images.mjs`。以 **Firestore 店家文件**為單位處理（`--prefix` 同時是 Firestore collection 和 Storage 資料夾名稱），只處理店家文件 `images` 裡實際用到的照片。

| 參數              | 說明                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `--prefix <name>` | 必填，`mockStore` 或 `prodStore`                                     |
| `--write`         | 沒加就只試跑：在記憶體裡真的轉檔，列出實際的前後大小，不寫入任何東西 |
| `--only <id>`     | 只處理某一個店家                                                     |
| `--rollback`      | 還原模式（見下方）                                                   |
| `--cleanup`       | 清理模式（見下方，Phase 4 才用）                                     |

**轉檔模式**（預設），每家店：

1. 讀店家文件的 `images`。每個路徑判斷：
   - 物件不存在 → 略過，記為 `missing`
   - 物件 metadata 已有 `sourcePath`（已經是轉好的檔）→ 略過
   - 已在門檻內 → 略過，路徑不變
2. 下載 → sharp：`.rotate()`（套 EXIF 方向）→ `.resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })` → 依 `IMAGE_OUTPUT_TYPE` 輸出 `.webp({ quality: 80 })` 或 `.jpeg({ quality: 80, mozjpeg: true })`。轉出來比原檔大就略過。
3. **新檔名**：同資料夾、`<原檔名去副檔名>.webp`。如果這個名稱已經存在（例如 `IMG_1.jpg` 和 `IMG_1.png` 都在，或原檔本來就是 `.webp`），改成 `<名稱>-2.webp`、`-3`…
4. **上傳新檔**：`contentType: IMAGE_OUTPUT_TYPE`，custom metadata 帶 `firebaseStorageDownloadTokens: randomUUID()`（server 端 `getDownloadURL` 需要 token）、`sourcePath: <原路徑>`、`shrunk: IMAGE_SETTINGS_TAG`、`originalBytes`。用 `ifGenerationMatch: 0`，不會覆蓋已存在的物件。
5. **更新 Firestore**（transaction）：重新讀店家文件，把 `images` 裡的舊路徑換成新路徑，**順序不變**（第一張仍是封面）。**只寫 `images`，不寫 `updateTime`**（`getSoldStores` 用它排序、店家頁顯示「更新」日期）。transaction 裡發現某個舊路徑已經不在 `images`（賣家剛好刪掉了），就跳過那一張並刪除剛上傳的新檔。
6. 原圖**不動**，留在原路徑。

**還原模式**（`--rollback`，可搭配 `--only`）：對店家文件裡每個帶 `sourcePath` 的路徑，如果原圖還在原路徑（或在 `backup/<sourcePath>`，就先複製回來），用 transaction 把路徑換回 `sourcePath`，再刪除轉好的檔。用在單店試轉失敗、或任何轉完發現有問題的時候。

**清理模式**（`--cleanup`，Phase 4，約 4 週後）：對店家文件裡每個帶 `sourcePath` 的路徑，把原圖複製到 `backup/<sourcePath>`、確認存在後，刪除原路徑的原圖。之後 `prodStore/` 只剩正在使用的檔案。

共通規則：

- 同時最多處理 4 張照片；店家之間依序處理。
- 最後印出摘要：處理數、略過數（依原因分類）、失敗數、店家文件裡參照的照片總 MB（處理前 → 處理後）。只要有失敗，exit code 就是 1。
- 列出時排除 `backup/`。不在任何店家文件裡的 Storage 物件不處理。

### `upload-resize`

`resizeImageFile(file: File): Promise<File>`，處理規則：

| 輸入                                                            | 結果                                         |
| --------------------------------------------------------------- | -------------------------------------------- |
| 一般 JPEG / PNG / WebP，超過門檻                                | 縮到最長邊 ≤ 1600px，輸出 WebP（品質 80）    |
| 瀏覽器不支援 WebP 編碼（`toBlob` 回傳的 `blob.type` 不是 webp） | 改用 `image/jpeg`、同品質                    |
| 已經在門檻內                                                    | 原檔不動                                     |
| 解碼失敗（例如桌機 Chrome 選了 HEIC）                           | 原檔不動，照舊上傳（**不擋使用者**）         |
| `image/gif`、`image/svg+xml`                                    | 原檔不動（避免動畫或向量圖被壓成單張點陣圖） |
| 轉出來比原檔還大                                                | 用原檔                                       |

- 用 `createImageBitmap(file, { imageOrientation: "from-image" })`，套用 EXIF 方向，手機直拍不會變橫的。
- canvas 重繪會去掉 EXIF（包含 GPS），賣家照片不再外流拍攝位置，這是附帶的好處。
- **檔名**：`uploadStoreImageByFile` 存成 `<原檔名去副檔名>-<6 碼短 id>.<實際格式副檔名>`。轉檔後不同副檔名的照片會撞名（`IMG_1.jpg`、`IMG_1.png` 都變成 `IMG_1.webp`），而 `arrayUnion` 遇到相同路徑不會新增，第二張會默默蓋掉第一張。
- 呼叫 `uploadBytes` 時帶 `{ contentType: resizedFile.type }`。
- 選檔後的預覽和現在一樣用原檔；只在按下上傳時縮圖，沿用現有的 `uploading` 狀態，不新增 UI。

## Code Style

沿用專案現有寫法：`// *` 註解、完整變數名稱、轉換資料的函式放 `utils/`、靜態值放 `constant/`。

```ts
// utils/image.ts
import {
  IMAGE_MAX_EDGE,
  IMAGE_QUALITY,
  IMAGE_SKIP_BYTES,
  IMAGE_OUTPUT_TYPE,
} from "@/constant/image";

const PASSTHROUGH_TYPES = ["image/gif", "image/svg+xml"];

// * shrink a photo before it reaches Storage; any failure returns the
// * original file so a seller is never blocked from uploading
export const resizeImageFile = async (file: File): Promise<File> => {
  if (PASSTHROUGH_TYPES.includes(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }
  // ...scale, toBlob(IMAGE_OUTPUT_TYPE), fall back to image/jpeg
};
```

## Testing Strategy

專案沒有測試框架，這次也**不新增**。驗證方式：

| #   | 驗證                                                                                                                                                                                         | 對應模組         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| T1  | 本機 dev（`NEXT_PUBLIC_ENV_VERSION=dev`，寫入 `mockStore`）在 `/sell` 上傳一張 4000×3000、約 5 MB 的 JPEG：Storage 裡是 `<名稱>-<id>.webp`，最長邊 ≤ 1600、≤ 400 KB，縮圖正常顯示            | `upload-resize`  |
| T2  | 同樣的流程在 admin 圖片頁再做一次                                                                                                                                                            | `upload-resize`  |
| T3  | 上傳一張已經很小的圖（< 300 KB、< 1600px）：內容原封不動                                                                                                                                     | `upload-resize`  |
| T4  | 上傳手機直拍、帶 EXIF 方向的照片：方向正確                                                                                                                                                   | `upload-resize`  |
| T5  | 上傳 `.heic`（桌機 Chrome）：照舊上傳原檔，沒有錯誤訊息；同一家店先後上傳 `a.jpg`、`a.png`，兩張都在                                                                                         | `upload-resize`  |
| T6  | iPhone Safari 實機上傳（**需要你用手機測**）：檔案變小，格式是 WebP 或 JPEG                                                                                                                  | `upload-resize`  |
| T7  | `mockStore` 試跑：數字合理；跑前跑後 Storage 物件的 generation 和店家文件的 `images`、`updateTime` 完全相同                                                                                  | `image-backfill` |
| T8  | `mockStore --write`：店家文件 `images` 換成 `.webp`、順序不變、`updateTime` 不變；原圖仍在；本機 dev 首頁、`/store-list`、店家頁、my-listings、admin drawer 照片都正常                       | `image-backfill` |
| T9  | `mockStore --write` 再跑一次：全部略過、0 寫入                                                                                                                                               | `image-backfill` |
| T10 | `mockStore --rollback --only <id>`：路徑換回原圖、轉好的檔被刪除、頁面正常；再轉一次也正常                                                                                                   | `image-backfill` |
| T11 | 單店試轉（`prodStore --write --only <storeId>`）後，在 LINE 和 Facebook 分享這家店的正式站網址，確認 WebP 的 og:image 有顯示。LINE 抓不到 localhost，所以一定要用正式站；失敗就 `--rollback` | `image-backfill` |
| T12 | 全部跑完後打開正式站首頁、`/store-list`、幾個店家頁確認沒有破圖；`npm run seo:audit -- https://www.bezold.com.tw` 結果和跑之前一樣                                                           | `image-backfill` |
| T13 | 清理模式先在 `mockStore` 跑：原圖移到 `backup/`、頁面照片正常；之後才跑 `prodStore`                                                                                                          | `image-backfill` |
| T14 | 每個 PR 都要通過 lint（0 錯誤）和 `npm run build`                                                                                                                                            | 全部             |

## Boundaries

- **Always**
  - backfill 先在 `mockStore` 完整跑過（轉檔、重跑、還原、清理），再碰 `prodStore`；正式資料先單店試轉，通過 T11 才跑全部
  - Firestore 只用 transaction 更新 `images`，順序不變；不寫 `updateTime` 或其他欄位
  - 新檔一律用 `ifGenerationMatch: 0` 上傳，不覆蓋任何現有物件
  - 刪除原圖之前，確認 `backup/` 裡的複本已經存在
  - 改過的檔案都跑 prettier；遵守 CLAUDE.md（`COLLECTIONS`、`utils/` vs `constant/`、完整變數名稱）
  - 本機瀏覽器測試會寫入資料時，先把 `NEXT_PUBLIC_ENV_VERSION` 改成 `dev`
- **Ask first**
  - 每一次對 `prodStore` 加 `--write`（包含單店試轉、還原、清理）
  - 刪除 `backup/` 裡的任何東西
  - 除了 `sharp` 以外再加任何套件
  - 動到 Storage rules 或 `next.config.js`
- **Never**
  - 在沒有備份的情況下刪除原圖
  - 覆寫任何現有的 Storage 物件
  - 寫入店家文件 `images` 以外的欄位
  - 因為圖片處理失敗就擋住賣家上傳
  - commit `.env` 或 service account 金鑰

## Success Criteria

1. 正式站店家文件參照的照片總大小從約 490 MB 降到 **≤ 120 MB**；轉好的檔最長邊都 ≤ 1600px，p95 大小 ≤ 400 KB。
2. 所有店家文件的 `images` 都指向存在的物件、順序不變、`updateTime` 不變；正式站首頁、`/store-list`、店家頁沒有破圖（T12）。
3. 清理後，`backup/prodStore/` 有每一張被替換原圖的複本，`prodStore/` 只剩正在使用的檔案。
4. 部署之後，從 `/sell` 或 admin 上傳一張 5 MB 的照片，進到 Storage 時 ≤ 400 KB（T1、T2）。
5. 一週內，Billing Reports 的 Cloud Storage 對外流量費用明顯下降（這項不卡 PR，部署後追蹤）。

## Open Questions

1. **LINE / Facebook 對 WebP og:image 的支援**：店家頁的 og:image 是第一張照片。如果 LINE 分享預覽不顯示 WebP，在台灣影響很大。T11 在跑全部正式資料之前，用一家正式店家試轉來驗證；失敗就 `--rollback`，把 `IMAGE_OUTPUT_TYPE` 改成 `image/jpeg`（同樣 1600px、品質 80，大約 250–400 KB），再試轉一次。
2. **原圖留在原路徑多久**：網址換了以後，Google、LINE、Facebook 會在幾天到幾週內重新抓。建議 **4 週**後再跑清理。在那之前，舊網址仍然能用，而且還原很簡單。
3. **Cache-Control**：這次不設定（之前建議的第 3 項）。如果第 5 項成功指標的流量費降得不夠多，再另外開一個 spec。
4. **`backup/` 保留多久**：建議清理後再穩定一個月，才決定是否刪除。刪除前會先問你。
