# 第二階段交接：正式發布準備

使用者要求1+2+3：課堂試玩包、學生引導、即時班級功能。

## 已完成
- Google／Cloudflare／Turso沿用既有設定。班級碼、老師派任務、學生以暱稱加入、指定關卡提交、人工回饋、改稿與提交歷史。
- 權限隔離、最多10班／60生／20任務／30次提交、原子版本衝突、不可覆蓋舊回饋、關閉入班與收件。
- 每15秒背景同步提交摘要與常見卡點，保留教師正在輸入的評語。
- 每份雲端任務獨立本機存檔，原城市不動；無帳號仍可本機學習／檔案交作業。
- 新手完成清單、下一步捷徑、可收起／重看的說明、手機橫向選關、作業入口。
- public/classroom-playtest.html：教師流程、國小／國中任務單、觀察表及列印；另有CSV。

## 證據
- 全套407／407通過；最後的摘要隱私與權限／原雲端／課堂5項聚焦再測通過。
- tests/classroom-cloud-browser.mjs雙角色完整流程通過；使用真實handler與SQLite，Google驗證是測試替身，不稱真人師生登入驗收。
- 背景輪詢、回饋帶入、提交第2版、回看第1版、390px、PDF產生通過；已看手機截圖。
- tests/learning-browser.mjs學生原有流程迴歸通過。
- 建置與Functions bundle通過。Turso已執行002遷移，讀回確認四張learning資料表存在。

## 已部署與正式讀回

- 實作提交：96edc3e，已推送 GitHub main。
- Cloudflare：8782dab9；https://bianshui-town.pages.dev/
- Netlify：6ab00a1352c77d2e4bf1f3c0；https://bianshui-town.netlify.app/
- 兩站入口JS／CSS與CSV逐檔SHA-256相符。試玩包正文相符；Netlify另外附加既有HUD工具列腳本，已逐字確認差異。
- 正式390px新手引導、下一步、班級登入入口與試玩包通過；未登入GET班級列表／POST建立班級均401，Google config configured=true。
- 證據：evidence/classroom-cloud/production/result.json、screenshots；可重現腳本tests/classroom-production.mjs。

三項功能實作及部署完成。真實師生Google帳號、跨實體裝置與學生學習成效仍未實測；不要把隔離身分的自動測試稱為真人驗收。
