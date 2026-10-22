# Implementation Plan: 店家照片瘦身

Spec: [`SPEC.md`](../SPEC.md) · Tasks: [`tasks/todo.md`](todo.md)

## Overview

2026-10-22 Google Cloud 預算通知觸發 100%，原因最可能是訪客直接從 Firebase Storage 下載原圖（`prodStore/` 522 檔、490 MB）。分三個 PR：

1. **PR 1 `image-backfill`**：共用參數 `constant/image.ts` + 腳本 `scripts/shrink-store-images.mjs`（試跑、轉檔、還原）。每張大圖轉成新的 `.webp`，店家文件的 `images` 換成新路徑，原圖暫時留著。先在 `mockStore` 完整跑過，再單店試轉正式資料並驗證 LINE / Facebook 預覽，最後跑全部。
2. **PR 2 `upload-resize`**：`utils/image.ts` 的 `resizeImageFile()`，接在 `uploadStoreImageByFile` 裡，上傳時在瀏覽器先縮圖，檔名加短 id 避免撞名。上線後再跑一次 backfill，補中間這段時間上傳的照片。
3. **PR 3 清理模式**：全部轉完約 4 週後，把原圖搬到 `backup/`，`prodStore/` 只留正在用的檔案。

## Architecture Decisions

- **新檔 + 更新 Firestore，不覆寫原檔**：檔名和內容一致（`.webp` 就是 WebP），每個 Storage 物件都不會被覆寫。新上傳的照片也是 `.webp`，新舊資料一致。代價是網址會變，所以原圖保留 4 週，讓 Google / LINE / Facebook 的快取有時間更新。
- **以店家文件為單位處理**：只處理 `images` 裡實際用到的照片；Firestore 用 transaction 更新，順序不變，**不寫 `updateTime`**（已售出列表靠它排序，店家頁顯示「更新」日期）。
- **原圖留在原路徑到清理為止**：還原只要把路徑換回去、刪掉新檔，不用搬任何東西。新檔的 metadata 記下 `sourcePath`，腳本靠它判斷「已經轉過」和「怎麼還原」。
- **清理模式延後到 PR 3**：4 週內用不到，現在寫會讓 PR 1 變大，而且還沒有正式資料轉完的經驗。
- **先做 backfill，再做上傳縮圖**：省最多錢的是既有的 490 MB；最大的風險（LINE 預覽能不能顯示 WebP）只能用正式店家驗證，而結果決定兩個模組共用的 `IMAGE_OUTPUT_TYPE`。
- **試跑也真的轉檔（在記憶體裡）**：正式資料的試跑是唯讀的，寫入前就能拿到真實的處理後總大小。
- **腳本直接 import `constant/image.ts`**：已確認 Node 24.21 可以從 `.mjs` import `.ts`，參數只有一份。
- **上傳新檔一律 `ifGenerationMatch: 0`**：已確認 `@google-cloud/storage` 6.12 支援 `preconditionOpts`；名稱被佔用時寫入失敗，不會蓋掉任何東西。
- **新檔帶 `firebaseStorageDownloadTokens`**：Admin SDK 上傳不會自動產生 token，沒有 token 的話 server 端 `getDownloadURL` 會失敗，退回每次都不同的 signed URL。

## Dependency Graph

```
constant/image.ts (image-settings)
    │
    ├── scripts/shrink-store-images.mjs
    │       試跑 → 轉檔 → 還原 → mockStore 驗證 → 單店試轉 + LINE 驗證 → 全部正式資料 → （4 週）→ 清理
    │                                                        │
    │                                          決定 IMAGE_OUTPUT_TYPE
    │                                                        │
    └── utils/image.ts → firebase/clientUtils/image.ts（uploadStoreImageByFile）
                              ├── /sell、/my-listings（StoreImageUpload.tsx，不用改）
                              └── /admin/store/edit/[storeId]/image（不用改）
```

## Task List

### Phase 1: `image-backfill`（PR 1）

- [ ] Task 1: 共用參數 + 腳本試跑模式
- [ ] Task 2: 轉檔模式（新檔 + Firestore transaction）
- [ ] Task 3: 還原模式

### Checkpoint A: mockStore 驗證完成

- [ ] SPEC #T7–T10 通過；lint、build 通過
- [ ] 和你 review → commit、開 PR 1

### Phase 2: 正式資料

- [ ] Task 4: 單店試轉 + LINE / Facebook 預覽驗證（**需要你在手機上分享**）
- [ ] Task 5: 全部正式資料轉檔

### Checkpoint B: 正式資料完成

- [ ] 參照照片總大小 ≤ 120 MB、所有路徑都存在、正式站沒有破圖（SPEC #T12）
- [ ] 實際數字寫進 PR 1；記下完成日期，4 週後做 Phase 4

### Phase 3: `upload-resize`（PR 2）

- [ ] Task 6: 上傳時縮圖 + 不撞名的檔名
- [ ] Task 7: 例外情況（小圖、GIF/SVG、解碼失敗、轉完變大、不支援 WebP 編碼、EXIF 方向）

### Checkpoint C: 上傳縮圖上線

- [ ] SPEC #T1–T5 通過；lint、build 通過；和你 review → commit、開 PR 2
- [ ] iPhone Safari 實機上傳（SPEC #T6，**需要你測**）
- [ ] 上線後 `prodStore` 試跑 → 經你同意後轉檔，補處理中間上傳的照片
- [ ] 一週後看 Billing Reports（Success Criteria 5）

### Phase 4: 清理（PR 3，Task 5 完成約 4 週後）

- [ ] Task 8: 清理模式 + 正式資料清理

### Checkpoint D: 完成

- [ ] `prodStore/` 只剩正在使用的檔案；`backup/prodStore/` 有所有原圖（Success Criteria 3）

## Risks and Mitigations

| Risk                                                                  | Impact | Mitigation                                                                                                        |
| --------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| LINE 分享預覽不顯示 WebP og:image                                     | 高     | Task 4 單店試轉就驗證；失敗就 `--rollback`，改 `IMAGE_OUTPUT_TYPE` 為 JPEG 後再試轉                               |
| Firestore 更新出錯，店家頁破圖或封面順序改變                          | 高     | transaction 只換路徑、保留順序；mockStore 先驗證所有讀照片的頁面；單店試轉；原圖還在，`--rollback` 可以立刻還原   |
| 不小心寫到 `updateTime`，已售出列表順序和「更新」日期跑掉             | 中     | 只寫 `images`；T7、T8 比對跑前跑後的 `updateTime`                                                                 |
| 處理期間賣家刪除照片，腳本把路徑加回去                                | 中     | transaction 裡重新讀 `images`，舊路徑不在就跳過並刪掉新檔                                                         |
| 舊網址被 Google / LINE / Facebook 快取，清理後變成破圖                | 中     | 原圖保留 4 週才清理；清理前抽查 Search Console 的圖片和 LINE 預覽是否已更新                                       |
| LINE / Facebook 快取舊預覽，T11 看不出新圖                            | 中     | Facebook 用 Sharing Debugger「Scrape Again」；LINE 用 Page Poker 清快取，或分享帶 query string 的網址             |
| 本機 dev 實際連到正式 Firestore，上傳測試寫進正式資料                 | 中     | 會寫入的瀏覽器測試前，先確認 `NEXT_PUBLIC_ENV_VERSION=dev`（`.env.development` 預設是 prod）                      |
| 內建瀏覽器沒有選檔上傳的工具                                          | 低     | 用 chrome-devtools MCP 的 `upload_file` 測 T1–T5；測試圖用 sharp 產生在 scratchpad                                |
| Safari 的 canvas 不支援 WebP 編碼                                     | 低     | `blob.type` 不是 webp 就改 JPEG；T6 用 iPhone 實機確認                                                            |
| Vercel preview 不確定連哪一組資料，T6 在 preview 上傳可能寫進正式資料 | 低     | T6 之前先確認 preview 的 `NEXT_PUBLIC_ENV_VERSION`；如果是 prod，就用自己的測試刊登上傳、測完刪除，或等上線後再測 |

## Open Questions

- Task 4 要用哪一家正式店家試轉？建議挑一家**你自己的刊登或已售出、流量低**的店，照片原圖偏大，效果最明顯（例如 `4fy20TpARRzvSzLt3N4F`，5 張共 28.9 MB）。
