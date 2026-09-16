# 建築成長 O07–O09

- 20個聚焦案例通過，含6個building-life案例。全套275/275後只移除孤立import、將零人文字精確化為「此刻尚無居民到場使用」，並新增一個真實茶坊行為／供水覆蓋案例；聚焦重跑20/20，最終build成功。
- 升級在managed＋journey.enabled才要求使用。住宅實際住戶、工坊商鋪健康人員到場、園景居民在場、公設依既有服務報告。未通過不扣錢，sandbox或關閉challenge仍自由升級；擴建同樣適用。
- 所有藍圖活動/行為/委託都有文字。居民動作與預覽共用residentBuildingAction，委託共用commissionSolution。真實Town.tick茶坊客人與書院停留分別吻合預覽。教育覆蓋不是物理到場，文字明示。
- 最近營造只記錄結構變動，對象是新建/搬移/升級/拆除涉及ID。前快照永久保留，目前快照重開面板即計算；不把城市其他建築的人潮算進來，不作因果宣稱。儲存失敗不覆寫對照；undo還原原本快照。
- Chrome：blueprints.txt茶坊/書院不同生活預覽；自由營造升園景1→2；comparison.txt顯示該園景前後0人，未虛增；開challenge並轉managed，upgrade-gate.txt明示目前0人與升三級disabled。分頁已關閉。
- comparison.txt為零人措辭修訂前的實際畫面；最後文字改成「此刻尚無」，避免被解讀為永久使用歷史。本功能是兩個時間點快照，不記錄期間累計到訪。
