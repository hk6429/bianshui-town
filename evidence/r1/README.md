# R1 可靠性與物流證據

日期：2026-09-16。隔離測試鍵 bianshui-town-test-v1；未操作正式小鎮存檔。

- tests.txt：npm test，109/109 通過。
- build.txt：npm run build 成功；既有 bundle 大於 500 kB 警告。
- tests/logistics-safety.test.js：隔離店鋪不成交、接通實際到店才成交；10000 次貨物轉移維持 32 筆歷程；95 件進貨只補到 96，守恆成立。
- tests/save-schema.test.js：42 項 schema 案例，含方法保護、巢狀驗證、座標/重疊、非有限值、資源上限。
- tests/restore-continuity.test.js：存讀不改位置/路線/下一步；非法 dt 不改任何狀態。
- Chrome CUA：由 harness 建立 26 建築/26 居民，損壞主檔後出現復原對話框；選上一有效版本，成功讀回 26/26。
- Chrome CUA：重置為 0/0，重新整理，存檔管理仍列重置前 26/26，確認後實際回復 26/26；reset-restored.txt/png 為結果。
- Chrome CUA：第二個隔離分頁遇到第一頁自動儲存，顯示衝突/停止覆寫，列表保留各分頁版本；cross-tab.txt/png 為結果。

## 尚需補驗
E01 完整兩次自動存檔及離頁、救援下載；E02 遷移失敗情境；E03 真正檔案下載再匯入；E04 兩頁各編輯及離頁；E07 新增 100 個 ID；E11 改名/轉貨完整深參照；E16 全城序列化精確比較。這些標 implemented，不以部分畫面當完整驗收。
E25 只有輸入驗證，渲染端第二道防線待補。
分頁每次載入獨立 UUID，避免複製分頁共用 owner；歷史分頁備份尚未有清理介面。
重置先寫入成功再替換記憶體；匯入先 Town.restore 成功再寫入存檔。

所有 100 項完成前，不以本次局部里程碑部署取代全目標。
