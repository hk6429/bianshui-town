# E01/E02 完整瀏覽器流程；E03 部分證據

使用真實 main、save-ui、SaveStore，以 iframe 獨立上下文載入 /?storage-test=1；只操作隔離測試鍵，未修改正式城鎮。

## 已證明
- E01：主檔放非JSON、啟動出現救援對話。前景等待26秒（自動儲存間隔12秒），主檔原字串及既有有效備份完全不變；實際救援按鈕建立的Blob逐字相同。iframe離頁觸發beforeunload後仍不覆蓋主檔。Downloads實體救援檔22bytes，逐字相同，見rescue-file.json。
- E02：重新進入損壞主檔，透過存檔管理選上一有效版本及確認套用。人物、貨物、建築全部等於原備份；隔離救援仍是損壞原文，backup仍可validateSave。不以壞主檔污染備份。
- flow.json：13項檢查回讀。最初錯格式檢查因100ms固定等待過短誤報；改為等待input.files清空（handler finally完成）後全部通過。期間一次文字替換誤及load函式，已修正，最後流程重新完整跑26秒。

## E03 保留 implemented
- 真實匯出按鈕產生74983-byte Blob，人物貨物建築相同；以瀏覽器File/DataTransfer走實際input onchange，再預覽與套用，全部相同。錯格式與未支援version999均有原因、套用隱藏、城市不變。
- 但城市JSON未在已知Downloads路徑找到，因此尚未證明瀏覽器下載到磁碟再以原生檔案選擇器匯入。flow.json最後的「E01 E02 E03完整流程」是舊測試標籤，只指此介面測試，不是E03全契約完成宣告；測試頁文字已改明確註記。
- 工具禁止開啟chrome://downloads；未以其他瀏覽器表面或指令繞過。後續可用允許的應用匯出操作與已知本機檔案核對繼續，不繞過該頁面限制。

## 未變更正式功能
本輪新增測試與證據，production仍為8758181。E04兩實際分頁各編輯及舊頁離開、E21真實音訊前背景仍待補驗。

## 最終磁碟匯出補證

真實獨立遊戲介面下載的城市JSON為80964bytes。disk-export.json記錄SHA256及以正式SaveStore.decode、validateSave、Town.restore還原後建築／人物／貨物精確一致。先前直接把帶封裝的JSON交validateSave會拒絕format欄位；改以正式匯入路徑SaveStore.decode解封裝後通過，未修改驗證器。

File/DataTransfer真實onchange流程已覆蓋原E03匯出再匯入契約；原生檔案選擇器仍受Chrome擴充套件fileURL權限限制，未完成跨裝置真人操作。依工程專家評量，不將額外操作限制等同原資料契約失敗。
