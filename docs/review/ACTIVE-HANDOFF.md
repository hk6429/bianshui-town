# 城市經營重整 — R1 整合檢查點

完整目標仍 active：四專家 100 項評量後全數修正、複評、部署。本次只有 R1，不可宣稱全目標完成。

## 已實作並推送
- 存檔 schema 白名單、尺寸與參照驗證；42 項聚焦測試。
- 存檔備份、重置復原點、匯入預覽、損壞隔離及跨分頁衝突 UI。
- 保留有效行走路線；限制非法 tick；舊版物流目的地遷移修正。
- 遊客實際到店才成交；貨物軌跡上限 32、未加工貨物上限 96。
- 重置先成功寫入新存檔，再替換畫面中的小鎮；失敗保留原小鎮。
- 新增 tests/save-harness.html，僅操作隔離的 bianshui-town-test-v1。

## 驗證
- 上次整合 npm test：109/109。修正後完整重跑仍為 109/109。
- npm run build 成功，既有單包大於 500 kB 警告。
- Chrome 隔離存檔復原、重置後重載還原、跨分頁衝突已實測，見 evidence/r1。
- ledger：10 verified / 7 implemented / 1 in_progress / 82 open；未完成契約保留待補驗。

## 目前狀態與風險
- R1 提交 aa59cf4 已推送 GitHub main；正式站仍為 V10。
- 誇張五級外觀及重置鍵已在 6e121e3 上線，不需重做。
- r1_save_schema / r1_logistics 已完成有界工作；下一包使用新工作階段。
- 固定時間步進、GPU 資源、整體城市財政服務與遊戲化均未完成。
- 每次載入使用獨立 UUID；分頁備份清理介面待規劃。
- 所有 100 項 verified 才做本次重整的最終部署。

## 下一個有界階段
先完成 evidence/r1/README.md 所列 R1 餘下驗收與 E25 渲染防線；再處理 E13 固定步進。不要直接展開全部城市系統。正式站 Chrome 本輪可開啟且有重置鍵；CLI 直讀回應 403，未用它判定網站故障。

## 固定步進里程碑（2026-09-16）
- src/runtime.js / tests/runtime.test.js / tests/runtime-harness.html 已新增，main.js 改由 runtime 驅動畫面。
- E13 verified：30/60/120 Hz 及等量 1×/4× 的全城 JSON 一致。
- E21 implemented：背景取消排程、靜音 callback、回前景不補跑；Chrome 切頁實測渲染 0、資料不變。實際 AudioContext 靜音待補驗。
- 最新全套 112/112，build 成功，證據 evidence/runtime。
- 最新 ledger 為 11 verified / 8 implemented / 1 in_progress / 80 open。
- CUA CDP 讀取遊戲曾 timeout 兩次，改原生 Chrome AX 成功；測試已關閉、焦點模擬已還原。不因此標任務 blocked。
- 下一階段：R1 剩餘驗收、E25 渲染防線、E22 執行錯誤復原；尚未動城市財政與服務。
