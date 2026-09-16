# 文化收藏 O13–O16

- 6個新案例，48聚焦與288全套通過，最終build成功。
- 真實tickLiterati落筆產生世界收藏，reading保持undefined；只有markRead加入一個作品印記。兩個醉翁亭記入口共用ouyang鍵，九個不同篇章不刷次數。
- Little Pond測試：未讀/未落成不通過，工坊回饋來源不符，池塘通過，不扣錢且明示非史實原址。notes不同作品獨立、400字封頂、HTML跳脫、地標拆除歷史保留。選集限三篇不同已讀作品，可重編；schema拒絕重複、未來時間、未知鍵、不成立選集及過長內容。儲存失敗保留原資料。
- Chrome：作品清單初始全未讀，依序開京瓦伎藝、小池、觀書有感後僅三篇有印記；工坊錯配→瓦舍配對成功（match-note.txt）；兩份短箋及不同自選地景顯示於anthology.txt，重複小池無法編選，改為三篇不同後「一城書香」成立。小池重開回顯短箋與園景（reopened-note.txt），蘇軾全文入口同樣留下印記（author-entry.txt）。
- 初次Chrome載入抓到WORKS循環初始化錯誤；已把WORKS/SOURCE_WORK抽到純資料reading-collection-data.js，schema只引用純資料。測試檔先匯入UI模組再Town涵蓋該載入順序，修正後Chrome互動及最終全套/build通過。
- 閱讀印記只表示開啟站內全文或節錄，不宣稱讀完整原作。心得為玩家文字，個人自選地景不等於來源配對；配對另外驗DESIGNS.source。
- UI沒有更動既有史料文字與連結，本批不新增歷史主張。自動操作證據不等同使用者人工驗收。測試頁已關閉。
