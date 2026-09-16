# 城市經營重整 — 下一階段交接

## 完整目標
以模擬城市2000為參照，四位 AI 專家（含八角遊戲化）評量100項，全部修正、逐項驗收、四領域複評、部署及正式讀回。目標 active；不得把本里程碑當全部完成。

## 權威檔案
- ledger.json / LEDGER.md：20 verified、5 implemented（E01/E02/E03/E04/E21）、2 in_progress（C03/C04）、73 open。
- IMPLEMENTATION-CONTRACT.md：仍保留財政/需求/就業/物流/服務/文化/遊戲化/UX 全範圍。
- city / octalysis / ux / engineering 評量檔：四位 AI 已完成，不是四位真人；不要重用舊評量代理做工程。

## 已完成里程碑
- V10 誇張五級建築與重置鍵已在正式站，source 6e121e3。
- R1 aa59cf4：schema、存檔復原/隔離/跨頁、真實到店成交、貨物上限與有限歷程。evidence/r1。
- 固定步進 9e1fe9f：30/60/120Hz、等量1×/4×狀態一致；背景取消畫面。evidence/runtime。
- 執行錯誤 7c36141：每秒安全快照、例外停止、不覆寫、匯出/讀回。evidence/recovery。
- 顯示防線 883c0fc：HTML 跳脫、E07/E11/E16 完整資料驗收。evidence/content-safety。
- 本輪：town-edit.js 草稿交易、main 編輯全接線、復原時間確認；E15/E17 verified。evidence/town-edit。全套138/138，build成功。

## 本輪實作注意
- editTown 先 clone→edit→validate→prepare→persist，成功才發布draft；prepare失敗原城不改，scene reset後重繪原城。
- main applyUrban 回傳原edit結果（place為block、其他布林），同步新的recovery point，保留undo snapshot。
- undo按鈕先顯示整城回捲契約與時間，確認後才復原。
- DEV query edit-fault=refresh 限 fixture/storage-test，正式dist無注入文字。
- Chrome 已驗新建5→6、確認復原6→5及故障維持5並提示。測試分頁皆已關閉。

## 下一個有界階段
1. 補 E01–E04 實際存檔UI驗收：損壞兩次autosave及離頁、遷移失敗backup、匯出再匯入、兩頁各編輯與離頁。
2. E21 實際 AudioContext 靜音待補（已有背景渲染0/資料不變）。
3. E18/E19/E20 GPU釋放、WebGL復原、局部場景更新；之後進C-A財政/供需/就業，不可一直只做小UI。
4. 按剩餘城市、八角、UX契約繼續，最後用新的四領域評量工作階段複評。

## 狀態及規則
- 專案 /Users/naichengchen/projects/bianshui-town，main，GitHub hk6429/bianshui-town；Cloudflare手動發布，尚未部署本次重整。
- 正式 https://bianshui-town.pages.dev/；本機127.0.0.1:5173。隔離鍵 bianshui-town-test-v1，勿改正式使用者城鎮。
- CUA瀏覽器若CDP timeout，可讀原生Chrome AX；不要重開測試。前背景測試要暫時關測試頁focus emulation，結束還原。
- 每里程碑記錄證據並建立新工作階段；此輪為progress，不需blocked或complete。

## 最新：C-A 財政底座（2026-09-16）
- 前輪 bd5e334 為progress；本輪新增 city-finance.js / finance-ui.js，schema與toJSON升9。
- main 首次new/重置 mode managed、2400文；無參數engine Town維持sandbox供既有fixture/測試，舊v1–8遷移亦sandbox。示範UI明示free並設sandbox。
- quote/charge 直接接 Town.place / urban road/move/upgrade/expand；editTown保護存檔與金錢一起commit。demolish回收25%基本建材。
- settleBudget 每日人口稅/維護；saleTax實際成交一次，禁止已售貨重售；稅率0–20可在收支面板設定。
- C01/C02 verified，C03/C04 in_progress：稅負反向需求係數未接RCI；赤字未實作公共服務效率衰退。
- 財政全套146/146，build成功，Chrome確認2400→2280單次扣120、稅率21拒絕、切sandbox資金不重填。evidence/city-finance。
- 下一包優先 C05–C10：RCI、分批遷入/遷出、可達就業、人力產能、居民真採買；把taxDemand接到需求，並在C17–C25服務包完成C04衰退。仍保留E01–E04/E18–E21與O/U待辦，不漏項。
