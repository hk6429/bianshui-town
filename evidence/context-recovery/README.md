# E19 繪圖中斷復原

實作：runtime 新增可恢復的 suspend/resume；webglcontextlost 立即停止模擬、render、音效，保留驗證後的城市快照並阻擋編輯。webglcontextrestored 在 Three.js 重新初始化 GPU 後重新提交既有 CPU 場景，重設時間基準再續跑。10 秒逾時顯示匯出／保留進度重新載入；存檔衝突不強制覆寫。復原過程 throw 走既有安全快照錯誤介面。原本模擬暫停狀態維持。

依據：[Khronos WEBGL_lose_context](https://registry.khronos.org/webgl/extensions/WEBGL_lose_context/)；本機 Three.js WebGLRenderer.js onContextRestore 會呼叫 initGLContext，保留 CPU 場景物件並重新上傳 GPU 資源。

Chrome 執行 tests/context-recovery-harness.html，使用 v8 fixture，未操作正式存檔：11 個檢查通過，涵蓋真實擴充失效、1.2 秒零城市變更／零 render、恢復當下全量 JSON 相同、恢復後繼續模擬及暫停操作、第二次失效 10.5 秒提示、遲到復原及保留暫停。browser.txt、restored.png 為回讀證據。第八項輸出是存在的按鈕元素物件，表示兩個操作均存在；不代表已在本次點擊匯出或重新載入。

Node 聚焦 8 項通過，另含背景復原不啟動、重複事件只恢復一次、stale callback 不更新、rebuild 失敗永久停止與 dispose 清理。全套及 build 見同目錄輸出。這些證據不代表所有驅動程式或硬體都會成功恢復；失敗／逾時路徑保留資料與手動操作。
