# 城市清單與資訊小卡驗收

- U08：可依名稱、編號、類型搜尋；所有建築與居民皆列入，重名以 ID 區分。Chrome 以 Tab、輸入 #11、Enter 開啟李小滿；民居篩選及望河雙閣選取皆顯示正確資訊。無障礙樹有名稱與標題；未宣稱真人讀屏軟體驗收。
- U09：panel-patch.txt 保留 20 次動態更新的同一操作節點、焦點、捲動，以及居民重排後的同一節點。live-focus.json 為實際城市 11:30 至 12:43，升級按鈕焦點與 scrollTop 599.0908813476562 均相同。
- U10：資訊卡有固定關閉鈕；Escape 與手機尺寸 390×844 按鈕關閉後 inspector.hidden=true、焦點回 world。closeInspector 同步清除選取、跟隨和外框。
- U11：明確選取居民後焦點 person-name、市井見聞開啟後 life-heading；見聞關閉回 life-btn。pointermove 僅更新 hovered，未呼叫 focusInspector；鍵盤进入浮動卡會固定目前對象，避免滑鼠移動替換內容。
- focused-tests.txt 4/4；full-tests.txt 249/249；build.txt 成功。既知 bundle >500 kB 警告保留。
- 手機是 Chrome 視窗尺寸驗證，非實機。工具列遮住小卡下部仍屬 U14 等待辦，未宣稱全部手機版面通過。未部署。
