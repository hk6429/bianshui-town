# 八角優化交接

## 範圍與分工

基準9b669c4。使用者要求專家優化八項朝9分。adventure_design完成十關資料與模型，adventure_ui完成漸進介面，root完成小隊與整合，獨立review列在INDEPENDENT-REVIEW.md。

## 已實作

- 十關三角色線索、時間／援助取捨、居民後果、後續守護、唯一收藏、最近12次決策履歷。
- 初始先呈現使命與居民，舊選關折疊；局部更新保留閱讀草稿、390px與鍵盤支援。
- 2–4人互補小隊、各人選原文與理由、互相回應後共同結論、版本快照、老師查看與學生隊別隔離。
- drafts帳號與任務隔離、登入切換在途read失效、保存貢獻不刪結論或在途新文字。
- adventure optional city save、舊檔兼容、collection需要對應閱讀／作品證據；超過90嘗試優先移除錯答而保留已通過證據。

## 證據

- 426項單元測試通過。
- 十關閱讀／場景／地標迴歸通過。
- 真SQLite＋真handler的小隊三角色瀏覽器通過，Google身分僅測試替身。
- 冒險完整閱讀→作品→後續安排→收藏→reload→重玩保留收藏通過。
- 專家UI390px四路徑、keyboard、草稿、固定頁首避讓通過，screenshots在evidence/gamification。
- 獨立評審確認B1/B2草稿問題修正，B3履歷上限已明示；設計仍不得宣稱八項9。

## 尚待

最終reserve路徑已完成：兩方案均消耗剩餘資源，保障不同居民。最終聚焦20/20、build與Pages Functions build通過。正式Turso migration003已完成，三張小隊表讀回存在。獨立複評7/8/8/8/7/6/6/5，無新增發布阻擋。接續push、雙站部署與readback；目前未宣稱達9。
