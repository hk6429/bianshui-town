# U06 / U07 營造預覽驗收

## 共用規則
- construction-plan.js的placementIssue同時供Town.canPlace與previewPlan使用；grid-rules.js只保存邊界及類型，不建立循環初始化依賴。
- constructionPlan產生四格轉型、圖樣、實際建築姓名及占地；Town.place直接使用相同結果建立資料。預覽不修改城市或消耗ID/金庫。
- gardenMergeGroups供mergeGardens與預覽共同使用。道路透過publicSquares計算新成廣場；合併花園標示另納入的既有格數。
- 主畫面canPlan同時更新符號、理由、結果與費用；submitPlan先檢查該契約，滑鼠／觸控／鍵盤均不能提交顯示禁止的草稿。

## 測試證據
- 聚焦11/11，全套247/247，build通過，保留既知bundle超500kB警告。
- 每張圖錄與可用占地逐一比較預測名稱和實際place結果；固定情境比較四格1棟與直線4棟、道路廣場、既有3花園合併、搬移自我占地及他屋障礙。
- 禁止原因測試包含建築、道路、越界、不相連、圖樣尺寸與金庫不足，失敗後城市資料不變。
- Chrome隔離空城、暫停08:02：選「雅居小樓」，斜拉得到四合雅宅/4格/1棟/480文；確認後0→1棟，2400→1920文。square-preview.txt/png、square-built.txt。
- 再選相同圖樣、直拉4格，預覽雅居小樓/4格/4棟/480文；確認後1→5棟，1920→1440文。line-preview.txt/png、line-built.txt。
- Chrome占用X-6/Z1顯示已有雅居小樓；X2/Z2顯示已有道路；四格起點X2/Z2指出X3/Z2越界。occupied.txt、road-obstacle.txt、outside.txt。
- 越界時按Enter仍5棟/1440文，rejected-submit.txt。文字可讀，不依顏色判別。
- 未改正式存檔，未部署，百項及最終四領域複評仍須完成。
