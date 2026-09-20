# 岳陽樓跨輪記憶審查

日期：2026-09-21

## 判定：PASS（本波契約）

指定原始檔、diff 與聚焦測試中未發現阻擋本波交付的問題。此判定僅涵蓋跨輪記憶、修正紀錄及其介面產生邏輯，不代表正式站、真實瀏覽器或全站教學成效驗收；不重新給全站分數。

## 範圍與契約核對

只讀 `src/adventure-continuity.js`、`src/adventure.js`、`src/adventure-ui.js`，以及 `tests/adventure-continuity.test.js`、`tests/adventure-save.test.js`、`tests/adventure-ui.test.js` 與相關 diff。未修改工程檔，未部署。

| 契約 | 證據 | 結果 |
| --- | --- | --- |
| 首輪三位具名、教學虛構居民 | `CONTINUITY_RESIDENTS` 與首輪 UI；林安、周禾、許木均標示教學虛構 | 通過 |
| 完成主決策及後續安排才形成跨輪線索 | `previous()` 選最近的前輪決策紀錄，再檢查 followup；未完成來源不向更舊紀錄回溯 | 通過 |
| 四種前輪組合呈現不同記憶與新線索 | 四個 branch 的 clue 不同；居民記憶包含主決策與後續安排；測試遍歷四組 | 通過 |
| 原文證據與學生修正理由 | branch 綁定 `evidenceLines` 原句選項，理由供人工討論；不自動評理解或品德 | 通過 |
| optional reflection 嚴格存檔 | 可不含 reflection；若存在則要求精確欄位、當輪 round、匹配來源 branch、白名單 evidence、1–600 字非空理由 | 通過 |
| 存檔還原與竄改拒絕 | save 測試驗證城市還原及 branch 竄改拒絕；schema 測試涵蓋欄位、round、來源、篇章、空白及長度 | 通過 |
| 草稿保留及文字跳脫 | 訪查與切篇仍保留兩欄、失敗仍保留、換城市隔離、特殊 HTML 字元跳脫 | 通過 |
| 重玩清除當輪修正並明示 | reset 刪 reflection；UI 刪該輪草稿；操作按鈕前及修正區均說明清除／先匯出 | 通過 |
| 12 筆裁剪不使已存修正來源失效 | 最近未完成來源不借古老完成輪；另以 20 輪完成流程檢查先存修正再新增當輪決策的裁剪邊界 | 通過 |

## 執行證據

```text
node --test tests/adventure-continuity.test.js tests/adventure-save.test.js tests/adventure-ui.test.js
19 tests / 19 pass / 0 fail
```

另以一次性 Node 腳本執行 20 輪：每輪先寫修正（首輪除外）、訪查、主決策、後續安排、重玩；每一階段呼叫 `validateAdventure`。結果：

```json
{"rounds":20,"reflectionBeforeDecisionValidated":19,"boundedHistory":12,"result":"PASS"}
```

這項額外檢查針對 history 裁剪的新風險，未擴大為全套測試。

## 教學差距與驗證限制

1. 新增的是「情境新線索＋指定原文再解讀」。四組使用既有原文選項的不同配對，並非每次重玩出現從未讀過的新原文；不宜宣稱已實現無限新文本探索。
2. 分支提示以「若原先認為……」提出可能迷思，沒有分析學生前輪實寫理由；這是固定教學鷹架，不是個人化概念診斷。保留人工討論的說明合理。
3. 修正為選填且不影響決策／領獎，但修正區摘要未直接標「選填」。可在後續輕量文案調整明示，減少學生以為必填；不構成本波功能阻擋。
4. UI 測試使用 render 字串與模擬事件，未驗證真實 DOM 焦點、手機長選項、實際外層 input 事件接線或儲存裝置失敗回復。需由根代理既有瀏覽器／整合驗證補足，不能稱本報告已完成真人驗收。
5. 草稿是介面記憶體狀態，重新整理會消失；只有明確儲存的本輪最近修正會進城市存檔。現有提示已交代，並非跨輪作品歷程典藏。

## 下一步

根代理完成本波整合與瀏覽器驗證後，依既有授權決定發布。本審查沒有部署，也沒有修改契約外功能。
