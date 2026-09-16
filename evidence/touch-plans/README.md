# U04 / U05 觸控營造驗收

## 行為與邊界
- PointerGesture追蹤每個pointerId，只有主指標可改草稿；第二根手指加入即封鎖，直到所有手指抬起。不會在第一指抬起後誤把第二指視為新單指。
- 觸控／筆抬起只保留pendingPlan；四向微調保持形狀，確認重新canPlan後共用submitPlan。重複確認因pendingPlan已清除而無效。取消、模式切換、pointercancel、lostpointercapture與離開分頁不提交。
- 滑鼠可勾預覽；預設原放開提交保留。鍵盤Enter遇待確認草稿時確認該草稿，不使用舊鍵盤座標。
- 真機觸控筆及不同作業系統未人工實測；本輪是Chrome原生觸控事件模擬與390×844版面驗證。

## 驗證
- 聚焦13/13、全套242/242、build通過；bundle超500kB警告仍在。
- 節點測試：單主指標、非主指標及右鍵無效、兩種抬指順序與第三指交錯、取消後晚到pointerup、新手勢可恢復、四格草稿平移不變形。
- Chrome透過CUA提供的CDP能力送Input.dispatchTouchEvent，使用瀏覽器真正的觸控→pointer事件及OrbitControls處理，不以隱藏城市狀態注入代替。介面依官方[Input定義](https://github.com/ChromeDevTools/devtools-protocol/blob/master/json/browser_protocol.json)。
- 桌面尺寸原生touch：X-5/Z0抬起保留4棟/1880文；向右微調X-4/Z0，確認後5棟/1760文。confirmed.txt。
- 雙指按下及拉開後，先放第一指、再放第二指：仍5棟/1760文，沒有確認草稿。反序放開亦相同。pinch-first-up.txt、pinch-second-up.txt。單元測試另驗第三指交錯及取消事件。
- 手機390×844：X-4/Z-4草稿抬起不扣款，微調再取消維持5棟/1760文。mobile-cancelled.txt。最後版本再次微調並確認後6棟/1640文，確認鈕消失，縮放控制恢復。mobile-preview.png、mobile-confirmed.txt/png。
- UI驗收發現舊鍵盤座標和舊金庫提示殘留，已改為待確認時只讀草稿，提交後顯示完成；手機縮放鈕遮文已修。最終截圖文字及按鈕完整可見。
- 全部使用storage-test隔離城，未改正式存檔、未部署。
