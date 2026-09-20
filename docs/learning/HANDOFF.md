# 學習優化：第二波交接（2026-09-20）

## 目標

依完整八項學習提案完成並部署。目標仍 active；正式網站尚未更新。PLAN.md 定義完整範圍。

## 已完成

第一波：learning-content.js（十關內容）、learning.js（資料）、learning-ui.js（學生）、save-schema.js optional學習資料、stage-select目標。
第二波：
- classroom.js：十關指定課堂場景、前置設施/道路、sandbox，key `bianshui-classroom-v1:<quest>` 與原城完全分開。URL `?classroom=kaifeng&support=story`，main啟動自動開該關，banner回原城。各关單元測試確認需求、道路與存檔有效。
- learning-reports.js：有界且嚴格的學生報告/教師回饋schema、同id只保留更新報告、最多40人、卡點按學生非按次數統計；回饋匹配學生ID+版本時間+原文字。
- learning-reports-ui.js：獨立dialog按鈕，學生稱呼/JSON匯出；教師指定關卡支援/連結、批次匯入、班級備份匯出匯入、原文與理由查看、對最新作品人工判讀及回饋匯出。明示本機彙整、非即時同步、非防作弊成績。
- 匯入回饋保存在本機（最多30份），學生作品介面會顯示並帶入回饋欄，後續修改稿保留回饋與修改原因。
- class模式的選關「Google」按鈕改為學習紀錄入口，避免誤顯登入未設定；main禁用課堂雲端存城以保護正式帳號城市。

## 驗證

- 修正第一波瀏覽器腳本reload入口，`tests/learning-browser.mjs` 已通過（support、注音、錯答、提示保草稿、前進、兩版作品、遷移、reload、390px）。evidence/learning/student。
- `tests/classroom-reports-browser.mjs`已通過：assignment、課堂、原城存檔不被課堂寫入、JSON作業匯出、教師匯入、回饋匯出、學生讀取、回到作品回饋自動帶入、390px。evidence/learning/classroom；已看mobile截圖。
- `node --test tests/learning.test.js tests/learning-reports.test.js tests/classroom.test.js tests/literary-quests.test.js tests/save-schema.test.js` 59/59。
- `git diff --check`通過。
- browser最近成功後又小改了classroom選關帳號入口（改到report），此小項尚待下波整合檢查。

## 尚未完成／下一波必須處理

1. 低年級目前主題符號＋文字，須增加真正場景圖像支援。
2. 國中完整段落脈絡：現在沿用原有節錄；可补作品脈絡導讀/段落連結，保留官方全文來源；不能宣稱已提供全文。
3. 隔次已有兩題不同生活遷移題，仍須增加原文回憶不同題目，把記得課文與能應用分開。
4. 時間處理與學習記錄delayed語意驗證加強；clock backwards記錄不能變成無法存檔。
5. 教師人為評語輸入有機制，但無中央教師認證；UI已說明來源由提供者填寫。不能稱自動雲端全班追蹤。
6. 舊`tests/literary-ten-browser.mjs`及`tests/literary-browser.mjs`的`data-answer`要改到新證據/理由契約，不能繞過新功能。十關操作/五級不能回歸。
7. UI `learning-transfer`提交後variant按reviews.length自動切下一題（可能讓最新回饋與新題混在一起），須調整保留当前variant並明確區分回饋。
8. 舊直接data-answer分支已無按鈕，可移除orphan import/handler（確認沒有其他入口依賴）。
9. 新增學習記錄實際cloud API roundtrip（本機/隔離測試）與學習schema防偽欄位、檔案過大/原紀錄保留等。
10. 更新README過時「Google待設定」，最終測試/build/雙站部署/readback；可沿用現有Cloudflare/Turso與OAuth，不用Firebase，不要另建服務。
11. 學習成果測試尚未涉及真正國小/國中學生，不可宣稱提升學力。跨實體裝置也仍待使用者實測。

## 下一波起手

`pwd` + git status +本handoff。Vite5192原session31932仍可用（本波GET200確認），不要重啟除非確實停止。
留意最新main changes TDZ：stageUI callback用後宣告的const learningReports，在使用者點擊時才執行所以可行；初始classroom只開literaryUI，不觸發該callback。
先做上列缺口，最後才全套release。瀏覽器圖片在evidence/learning可view_image檢視。

工作區：/Users/naichengchen/projects/bianshui-town，main，無子代理。目標不可在這個里程碑標complete。

## 第三波整合接續

故事示意圖、段落脈絡、原文回憶與作品 SVG 卡已實作。十關瀏覽器與學生瀏覽器通過；目前補作品卡下載、報告時鐘倒退處理並做最終整合。尚未部署。下一步：全套單元測試、教師操作、雙站部署及正式讀回。
