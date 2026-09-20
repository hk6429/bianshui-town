# 宋韻文學營造：完成範圍與證據

目標：後續全部完成後再部署一次。這份文件取代前幾輪待辦清單；首批歷史紀錄仍見 literary-quests-handoff.md，不代表本版狀態。

## 任務對照

| 任務 | 可玩內容 | 落成後／書寫成果 |
|---|---|---|
| 岳陽樓 | 災後物資分配、晴雨情感配對、復建順序 | 居民登樓議事、登樓遊記；三層黃瓦盔頂參照現存清代形制 |
| 開封府 | 三方訪查、陳述／傳聞與兩線索配對、判案順序 | 公堂調解；街坊借罐糾紛三方資料與查證原則、判案摘要 |
| 醉翁亭 | 空間排序、四季配對、遊園步道 | 居民四季遊園、遊園記 |
| 愛蓮池 | 植物／人格、特徵／德行、步道路徑 | 觀蓮讀訪、觀蓮小札 |
| 赤壁文舟 | 夜航路徑、主客問答、變與不變配對 | 夜間居民共讀、夜航遊記；四格內文舟水景 |
| 活字印書坊 | 獨立字模排字、製版順序、兩版交替 | 紙墨→書籍→書肆真實商品鏈、印書共讀、工序手記 |
| 賣油翁技藝坊 | 注油工序、態度順序、學徒技巧配對 | 學徒觀摩、技能練習手記；不靠手速 |
| 溪亭荷塘 | 情節順序、小舟路徑、動詞意象 | 荷塘遊記、鷗鷺荷塘示意圖與自寫回憶頁 |
| 元夕燈市 | 燈匠／樂師／攤販訪查、感官配對、詞句找人 | 夜間燈會與居民到場，燈市尋訪記 |
| 東坡望月臺 | 情緒排序、書信詞句配對、送信路徑 | 夜間賞月、寄遠方的書信 |

## 共通契約與直接證據

- 三段閱讀＋三個操作＋非循環設施前置才解鎖；排序、配對、配額、訪查、路徑均驗真實選擇，不是單一完成鍵。錯答不扣鎮庫、不改真實城市。`tests/literary-activities.test.js`、`tests/literary-quests.test.js`。
- 30個操作隨城鎮存檔保存；非法路徑／材料／重複內容拒絕，失敗存檔回滾，舊圖樣與既有地標保留。`tests/literary-activities.test.js`、`tests/book-economy.test.js`、`tests/landmark-life.test.js`。
- 十任務逐條瀏覽器完成閱讀、操作、解鎖、短箋，重載比對；390px無橫向溢位。`tests/literary-ten-browser.mjs`、`evidence/literary-ten/result.json`。
- 預覽／建造／搬移共用岳陽樓臨水與十地標道路規則；拒絕不扣錢／不移位，舊內陸建物讀回不失效。`tests/landmark-placement.test.js`。
- 紙墨實際卸貨、配送、工人到場、印書、推車、書肆成交由完整Town.tick驅動，含來源、守恆、滿倉、缺料、斷路、拆除與防重複售出。`tests/book-economy.test.js`；`tests/v4.test.js`保留全部配方實際售出斷言。
- 十地標有實際路網旅行、18秒出席、取消與重訪記錄；天氣、其他街頭活動、病假、存檔重載皆涵蓋。每人每日最多2點學力、無金錢獎勵。`tests/landmark-life.test.js`。
- 五級依配套／延伸閱讀／跨日服務／跨作品引文短箋逐段解鎖；所有型態五級模型不同。真實進程：`tests/landmark-life.test.js`；模型／成本：`tests/tiers.test.js`、`tests/tier-functions.test.js`（模型用預先合格fixture，不冒充真實解任務）。
- 主程式資訊卡排程、實際Town.tick出席、1→5逐級升級、雙引文短箋、草稿切換、390px、城市檔案匯出／匯入及重載排程：`tests/literary-inspector-browser.mjs`、`evidence/literary-inspector/result.json`。使用預先解鎖小鎮與受控遊戲時鐘；非真人從空城長時間遊玩。
- 十種書寫提示、圖文回憶與輸入文字安全：`tests/literary-journal.test.js`；圖文頁由上述主介面測試填寫並截圖。
- 岳陽樓史料與照片、模型年代界線：`docs/landmark-history.md`；實際模型截圖：`evidence/literary-history/`。不是宋樓精確復原或建築史專家鑑定。

## 最終本機驗證

2026-09-20：`npm test` **388/388通過**，`npm run build`成功；十任務瀏覽器與主資訊卡自動操作通過。建置產物與正式站相符的結果另記 `evidence/literary-release/release.json`。

## 部署狀態

本機驗證完成，待本輪正式部署／讀回記錄落盤後更新此段。部署目標：Cloudflare Pages bianshui-town main、Netlify bianshui-town。先驗證帳號、推送GitHub，再部署同一份dist，逐一比對正式站JS/CSS的SHA256與首頁入口；不將資源讀回稱為真人驗收。
