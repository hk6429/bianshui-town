# 選關與 Google 雲端存檔（Turso＋Cloudflare）

## 本輪已完成

- 十關選關畫面：目標、城鎮設施前置、閱讀3段／操作3段／地標落成、進度與篩選。空城首次開啟選關；已存在城市保留原進度，可從「選關畫面」進入。所有關卡共用一座城市，不會因換關重置。
- Cloudflare Pages Functions `/api/*`：Google ID token簽章、issuer、audience與nonce驗證；HttpOnly／Secure／SameSite=Strict工作階段Cookie；登入、登出、自己的雲端存檔讀寫。
- Turso專用資料庫 `bianshui-town`、`town_saves`表已建立。主鍵為經驗證Google sub，不以使用者自行提交的帳號查詢。
- 伺服器保存整個城市JSON（上限2 MB，驗證既有存檔schema）；SQL條件更新保護版本，兩裝置衝突回409，不覆蓋新版。
- UI登入後先讀取雲端資訊；上傳需確認；下載沿用既有「預覽→確認→保留復原點→取代」流程。手動成功存一次後可開啟每2分鐘自動備份；登出、讀取其他存檔、備份失敗會停止自動備份。
- 不使用Firebase；Turso token與session密鑰僅存在Cloudflare秘密綁定及git忽略的本機`.dev.vars`。

## 尚缺：真正 Google 登入設定

Google OAuth網頁用戶端ID尚未提供，因此 `/api/config` 明確回傳 `configured:false`，登入按鈕停用。本輪**不能稱Google登入或跨裝置真人登入已驗收**。

1. 在既有／新Google Cloud專案建立OAuth「網頁應用程式」用戶端，設定應用程式名稱與聯絡信箱。
2. Authorized JavaScript origins至少包含：
   - `https://bianshui-town.pages.dev`
   - `https://bianshui-town.netlify.app`（備援站若也啟用登入）
   - 本機測試可另列 `http://localhost:8789`；正式允許Origin清單不預設納入本機。
3. 把公開的OAuth Client ID設定為Cloudflare Pages秘密綁定 `GOOGLE_CLIENT_ID`。本方案採Google Identity Services按鈕＋ID token，不需要把Google Client Secret放進前端，也不使用Firebase。
4. 確認測試／正式發布範圍與OAuth consent screen後重新部署，登入一次，再跨兩個瀏覽器實測上傳、讀取與版本衝突。這是最後尚待完成的外部接線。

已設定Cloudflare生產綁定：`TURSO_DATABASE_URL`、`TURSO_AUTH_TOKEN`、`SESSION_SECRET`。`.env.example`列出名稱；不要把值改成VITE_變數。Netlify以`netlify.toml`將同源`/api/*`代理至Cloudflare，不另建資料庫。

## 驗證與證據

- `npm test`：390/390通過，包含SQLite實際SQL、帳號隔離、nonce、偽造token、Origin限制、衝突與登出。
- `npm run build`成功；`wrangler pages functions build`成功。
- Turso遠端測試資料實際寫入、讀回、拒絕過期版本，測試列已刪除。
- 選關桌面／390px、正確進入指定篇章、篩選、未設定登入停用：`evidence/stage-select/`。
- 真正Google帳號登入仍待Client ID設定，測試用注入Google verifier不代表已完成Google OAuth實測。

官方設定依據：[Google用戶端設定](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid)、[伺服器驗證Google ID token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)、[Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)。
