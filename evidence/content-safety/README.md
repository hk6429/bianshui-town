# 存檔顯示防線與補驗

2026-09-16；基準 7c36141。前一輪是有效進展，本輪延續 R1 驗收。

## E25
- 原本只在輸入 schema 拒絕 market.trades、lot.id 惡意字串，本次新增獨立顯示防線。
- src/content-html.js 統一跳脫貨物 ID（文字與屬性）、貨物標籤、攤販名稱/地景/ID/交易數字；main.js 使用相同正式渲染函式。
- 其他讀檔數值進入 HTML 的庫存、卸貨、送貨與居民/建築按鈕 ID 也加上跳脫。
- tests/content-html.test.js 覆蓋引號突破屬性、img onerror、script 及合法貨物/交易呈現；save-schema.test.js 原有惡意欄位拒絕測試仍通過。
- Chrome 實際 DOM：img/script 節點 0、事件屬性 0、原文作文字 true、正常貨物顯示 true。不是只查產生的字串，見 browser.txt/png。

## E07
- 原有重複 ID／低 nextId 拒絕測試，加上 restore 後真正新增 100 棟建築及產生住戶。
- 城市所有 blocks/buildings/people/carts ID 唯一，nextId 大於所有已使用 ID，結果可再次 restore。

## E11
- 復原後模擬 100 次、改居民與屋名、轉移實際貨物及修改巢狀 trail。
- 原始整份快照 deepEqual，trail 亦確認非共用參照。

## E16
- 真正 Town.demo 推進 600 步後 checkpoint，重置，換新的 SaveStore 代表重新載入。
- 新城建屋並自動儲存兩次後，reset candidate 還原整份 toJSON 與舊城 deepEqual。
- 配合先前 Chrome 真正重置/重載/還原的 evidence/r1/reset-restored.txt/png，補完完整資料相等契約。

## 放行與剩餘
- tests.txt：120/120 通過；build.txt 成功，既有大於 500 kB 提示。
- 本次無新增套件、未操作正式存檔、未部署。
- E01/E02/E03/E04/E21 仍為已實作待補驗；城市財政、服務、八角遊戲化及 UX 尚待依 100 項契約推進。
