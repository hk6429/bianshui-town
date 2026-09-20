# 學習優化完成交接（2026-09-20）

## 已完成與部署

完整八項學習設計已實作；實作提交 3949da0（含先前 fea6b60），已推送 origin/main。

- Cloudflare：https://bianshui-town.pages.dev/ ，部署 b538b7b1。
- Netlify：https://bianshui-town.netlify.app/ ，部署 6aaffd652d703b1a2ff78642。
- 同一份 dist 發布；正式 HTML 與所有入口 JS/CSS 的 SHA-256 比對一致，兩站 /api/config configured=true。

## 功能

十關目標、三種閱讀支援、故事示意圖、關鍵詞注音、朗讀、段落選讀脈絡、證據句與理由、提示／錯答紀錄、岳陽樓預測反思、原文回憶／遷移、隔日練習、作品版本與 SVG 卡、獨立課堂場景、教師指定任務與檔案往返判讀。

## 驗證證據

- 全套405／405；最後僅調整學習摘要的遷移分類，受影響的13項再測通過。
- build 與 Functions bundle 成功。
- 本機學生、教師與十關瀏覽器均通過（含390px與原城市隔離）。
- 正式兩站教師檔案往返通過；Cloudflare學生流程、SVG作品卡下載、課堂選關到學習紀錄入口通過。
- evidence/learning/production-readback、production-cloudflare、production-netlify、production-student、production-stage。
- 新學習資料經 SQLite API 測試保存並原樣讀回；本次沒有重做真人Google登入或跨實體裝置登入。

## 使用與限制

教師入口：營造與工具 → 學習紀錄與教師看板 → 選關／閱讀支援 → 建立課堂連結。
學生先讀、選證據、寫理由，再做活動／修改作品；教師以檔案匯入彙整與回傳評語。
教師資料是本機彙整、非即時全班雲端；開放文字需人工判讀。15–20分鐘與學力提升均未經真實學生研究，不可宣稱已證實。
未要求額外新功能；正式發布工作完成。
