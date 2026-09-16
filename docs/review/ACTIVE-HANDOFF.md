# 城市經營重整 — 第一里程碑已完成：四專家評量

## 完整目標（仍 active）
以模擬城市2000城市循環為參照，四專家評量100項，全部修正、複評、部署。不可把評量完成誤稱目標完成。

## 已交付
- 四位獨立 AI 評量代理 city_expert / octalysis_expert / ux_expert / engineering_expert 均已結束；每位25項，共100個唯一ID，見 ledger.json / LEDGER.md。
- 城市6/30；UX11/30；工程9/30；八角八驅力3/3/6/5/3/2/4/1，不加總。皆有證據與限制，並非四位真人。
- root 已反查並要求改正 U07 假陽性。其餘邊界與去重記錄見 LEDGER.md。
- baseline a6a7504，56/56 測試通過。原始碼本里程碑尚未修改；完成項 0/100。
- 正式站目前實讀為空鎮0人/0建築/0街坊（以本輪實讀為準，不推測變更原因），不可沿用前次26/26/12狀態，不可替使用者恢復或填入示範。

## 下一里程碑 R1
先修可靠性與實際物流故障，使用新工程代理、最小 brief，不續用這四位審查代理。
建議可並行兩個有界任務：
1. 存檔schema/恢復模組 E01–E12/E25：先 pure codec + store，擁有新模組及測試；main.js / simulation.js 整合由root完成。明確依舊fixture逐版遷移，保持合法路徑，拒絕超大/異常/保留鍵。
2. 物流小包 C15/E23/E24：life.js 和 production.js 及聚焦測試，修遠端售貨、貨物歷史上限、96件上限；勿動財政或員工新機制。
root 準備共用UI接點、失敗復原、跨分頁與import/export整合，逐項補ledger證據。

## 後續工作包
見 IMPLEMENTATION-CONTRACT.md，C-A/C-B/O-A/O-B/U/V 均仍必須完成；不可略過財政、服務、目標而只做UI。

## 驗收紀律
每包聚焦測試先行；在里程碑結束做適合整合測試，建立handoff後換新階段。全100項verified才最終部署；有證據不等於證據足夠，逐條查 acceptance。要重查實際live agents/session，不能由此文字推定仍在跑。
