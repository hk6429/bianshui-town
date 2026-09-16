# U01 / U02 / U03 / U19 鍵盤與取消驗收

## 實作
- 場景canvas可聚焦，有操作說明；場景快捷鍵只接受場景本身為事件target，尊重IME和修飾鍵。Enter/Space長按不重複提交或切換。
- 方向鍵/WASD：營造時在地圖邊界內移格；探索時平移鏡頭並保留觀看角度。Enter沿用滑鼠submitPlan與交易式editTown；四格圖錄、道路及搬移都沿用plannedCells/canPlan。
- Esc及可見「取消營造」共用cancelBuild，取消草稿、清除預覽、回探索且不寫城市資料。手機可直接點選。

## 證據
- 聚焦9/9，全套238/238，build通過；既知bundle超500kB警告仍在。tests/scene-keyboard.test.js驗證原生控制不被攔截、重複鍵/IME、四向游標與邊界，以及鏡頭平移保留offset及邊界。
- Chrome隔離城先暫停：場景鍵盤2→右→右，游標X2/Z0/1格/120文。preview.png。Enter後建築3→4、金庫2000→1880；同格再次Enter仍4棟/1880文。Esc回探索，取消鈕及預覽消失。built-and-cancelled.txt。
- 探索Left/Up/Right/Down四向操作後回中心X8/Z0，保持13:26、4棟及1880文；再Left中心X4/Z0，panned.png。未改城市資料。
- 從場景以8次Tab到宋韻營造，Space正常開圖錄；Esc關閉後仍「繼續」（使用者原本暫停），時間仍13:26。native-space-open.txt / native-space-retains-pause.txt。
- 390×844視窗：公共營造選青石小路，有可見取消鈕與占地框；點取消回探索、預覽消失，4棟/1880文不變。mobile-road-draft.png、mobile-cancelled.txt/png。這是Chrome手機尺寸驗證，不宣稱實機多指手勢已通過；U04/U05仍待。
- 尚未部署，百項及四領域最後複評條件不變。
