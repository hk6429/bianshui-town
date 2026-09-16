# E22 執行錯誤復原

2026-09-16；基準 9e1fe9f。

## 實作
- runtime 捕捉 tick/render/visibility callback 的例外，停止且不自動重試，取消排程與靜音。
- 每秒保留一次通過完整 schema 驗證的深複製快照；失敗 frame 不取代復原資料。
- 故障後 save（含 beforeunload）立即返回，不把部分改壞的狀態寫回原存檔。
- 錯誤對話框提供匯出安全快照、寫回快照並重新載入；其餘介面 inert，Escape 不會隱藏故障。
- 重新載入會丟失安全快照後的尚未確認進度，介面已說明，不宣稱無損逐幀復原。

## 驗證
- tests/recovery.test.js 分別注入 tick 部分改壞人物座標、render 例外；僅通知一次、無後續排程、背景/返回不重試、不覆寫原存檔，快照可 Town.restore。
- 測試快照時間間隔、深複製、不接受無效新快照。
- Chrome fixture=v8&runtime-fault=tick 出現安全暫停對話框；點匯出下載到 Downloads/汴水小鎮-安全復原.json。
- 下載實檔 37639 bytes，經 SaveStore.preview + Town.restore 成功，5 建築/8 居民；不是只檢查成功提示。
- Chrome 點重新載入，回到可操作 fixture=v8。
- Chrome storage-test=1&runtime-fault=render（隔離鍵）亦出現故障面板；復原後讀回 26 建築/26 居民，見 restored.txt/png。未更改正式小鎮。
- tests.txt：115/115；build.txt：成功，仍有既有 bundle >500 kB 提示。
- 正式 dist 檢查不含測試錯誤注入文字；注入只供 DEV 的 fixture 或 storage-test。

## 邊界
本包不涵蓋 WebGL 初始化失敗與 context lost（E19）、城市編輯交易（E17）、完整城市財政/服務/遊戲化。正式發布仍待 100 項全數完成與四領域複評。
