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

## 立即交接：C08/C09 尚未提交（本輪出現兩次整合失敗，已換階段）
- HEAD 0834261，新增 employment.js/tests/employment.test.js，修改 simulation/production/save-schema/logistics-safety.test；所有本輪工作尚未commit/push。
- BFS可達職缺按距離，保留合理現職，失聯60秒寬限；人力倍率為到場/容量，乘建築規模。
- 第一個全套失敗：舊貨運歷程測試stub僅1名工匠，20秒未達新配方時間；改4名代表滿編，維持原貨運斷言。
- 第二個全套失敗：schema新增future jobLostAt檢查時漏了for(const a of list)。已補回，49項employment/logistics/schema聚焦全部通過。
- evidence/employment/failed-before-schema-fix.txt是歷史失敗；focused-after-fix.txt才是最新聚焦成功。
- 下一階段第一步跑全套與build，再實際UI查看人力狀態或保存可重播模擬證據；確認C08/C09契約後才標verified、commit/push。勿將C05–C07/C10遺漏。
- 最新 ledger 20 verified / 7 implemented / 2 in_progress / 71 open。完整goal active，不是blocked。

## 最新交接：就業與採買里程碑放行（2026-09-16）
- 上述未提交與失敗紀錄為歷史；本輪 152/152 全套與 build 通過，Chrome 模組驗收 8 格近職／32 格遠職、人力 0/1/3 產出、店員到場及真實庫存成交通過。
- C08/C09/C10/C16 verified；最新帳本 24 verified / 5 implemented / 2 in_progress / 69 open，100 項目標仍 active。
- employment.js、commerce.js 及 main/life/production/schema/simulation 整合完成，證據 evidence/employment。
- 下一個獨立工作階段 C05–C07：單一 RCI 需求、按時間移入、長期失業與無家遷出；接入 C03 稅負需求。不可只改數字或測試，必須真實影响人口與玩家回饋。
- C04 服務衰退、E01–04/E18–21、O/U 全部保留；百項完成並四領域複評後才部署，正式站仍 V10。

## 最新交接：城市成長里程碑（2026-09-16）
- 前輪 74b8012 就業／採買已推送。這輪 C03/C05/C06/C07 完成聚焦驗收；最新 28 verified / 5 implemented / 1 in_progress / 66 open。
- city-growth.js 建立 RCI、每15秒人口配額、優先安置、三種長期困境有限遷出；城市經營生效，自由營造維持舊入住方式，面板明示。需求目前園景是服務來源，C17–25 公共服務尚待。
- demography 頂層可選存檔欄位；hardship 居民可選欄位。舊檔從目前elapsed起算，不追算遷出。save版本仍9。
- 160/160 全套、build通過；實際遊戲 0→4 人、凍結時間稅率10→20令需求80/-40/-16→50/-70/-46；手機發現並修正收支面板橫向超出。證據 evidence/city-growth。
- 財政測試唯一前置調整：明確seed2人代替第一tick自動入住，稅額斷言未降低。其餘 sandbox 舊測試維持。
- 下一個有界工作階段優先 C11–C14：玩家路網／公私路接續、有限物流容量及補貨成本，連結需求與經濟。讀各 ledger acceptance 後實作；C04 服務衰退保留到公設包。
- 全部 O/U、E01–04/E18–21 待辦不省略；百項與最終四領域複評完成才發布。正式站仍 V10，不部署尚未完整驗收的重整版。
