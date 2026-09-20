# 選關與 Google 雲端存檔（Turso＋Cloudflare）

## 本輪已完成

- 十關選關畫面：目標、城鎮設施前置、閱讀3段／操作3段／地標落成、進度與篩選。空城首次開啟選關；已存在城市保留原進度，可從「選關畫面」進入。所有關卡共用一座城市，不會因換關重置。
- Cloudflare Pages Functions `/api/*`：Google ID token簽章、issuer、audience與nonce驗證；HttpOnly／Secure／SameSite=Strict工作階段Cookie；登入、登出、自己的雲端存檔讀寫。
- Turso專用資料庫 `bianshui-town`、`town_saves`表已建立。主鍵為經驗證Google sub，不以使用者自行提交的帳號查詢。
- 伺服器保存整個城市JSON（上限2 MB，驗證既有存檔schema）；SQL條件更新保護版本，兩裝置衝突回409，不覆蓋新版。
- UI登入後先讀取雲端資訊；上傳需確認；下載沿用既有「預覽→確認→保留復原點→取代」流程。手動成功存一次後可開啟每2分鐘自動備份；登出、讀取其他存檔、備份失敗會停止自動備份。
- 不使用Firebase；Turso token與session密鑰僅存在Cloudflare秘密綁定及git忽略的本機`.dev.vars`。

## Google 登入設定（已啟用）

沿用 Google Cloud 專案 `cap-exam-hub-20260816`，獨立網頁用戶端 `Bianshui Town Web`；不共用題庫或書齋的用戶端 ID。已核對 JavaScript 來源：

- `https://bianshui-town.pages.dev`
- `https://bianshui-town.netlify.app`

Cloudflare 生產綁定已設定 `GOOGLE_CLIENT_ID`、`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`SESSION_SECRET`。Google Identity Services 僅使用基本登入身分；不需要 Google Client Secret。秘密值保留於 Cloudflare 及 git 忽略的 `.dev.vars`，不可改成 VITE_ 變數。

Netlify 透過 `netlify.toml` 將同源 `/api/*` 代理至 Cloudflare，兩站共用同一份 Turso 雲端存檔，各自保留本機進度與登入 Cookie。

## 驗證與證據

- `npm test`：390/390通過，包含SQLite實際SQL、帳號隔離、nonce、偽造token、Origin限制、衝突與登出。
- `npm run build`成功；`wrangler pages functions build`成功。
- Turso遠端測試資料實際寫入、讀回、拒絕過期版本，測試列已刪除。
- 選關桌面／390px、正確進入指定篇章、篩選、未設定登入停用：`evidence/stage-select/`。
- 2026-09-20 已用真實 Google 帳號在兩站完成瀏覽器登入；Cloudflare 儲存版本 1、重新讀回、雲端預覽，以及 Netlify 從空城確認載入 68 處建築／110 位居民皆成功。這是同一台電腦的兩個網站來源測試，未宣稱另一台實體裝置已驗證。

官方設定依據：[Google用戶端設定](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)、[伺服器驗證Google ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)、[Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)。

## 2026-09-20上線狀態

選關與API已部署：Cloudflare `e148da4c`；Netlify `6aafc8282630daa64f6f46fa`。兩站各5個JS/CSS SHA256與dist相符，兩站 `/api/config` 均明確回傳 `configured:false`。正式Cloudflare站桌面／390px選關、指定篇章跳轉、篩選及未設定登入停用皆通過。證據：`evidence/stage-select/release.json`、`production/result.json`與截圖。Google登入尚待Client ID，不是完整登入完成宣告。


## 2026-09-20 Google 登入啟用

Cloudflare 部署 `32d11d8a` 已啟用 OAuth。兩站 `/api/config` 回傳 `configured:true`，使用專用用戶端 ID。既有靜態檔未修改，Netlify 透過既有 API 代理立即生效。

- 主站實際登入、上傳、遠端重新讀取成功（版本 1）。
- 備援站實際登入、讀到同一份版本 1，從 0 處建築載入為 68 處建築、110 位居民。
- 主站現有本機城市未被雲端覆蓋；自動備份未擅自開啟。
- 聚焦測試：`node --test tests/cloud-api.test.js tests/stage-select.test.js`，2/2 通過。
- 部署及瀏覽器操作摘要：`evidence/google-login/release.json`。
