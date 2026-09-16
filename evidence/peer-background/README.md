# E04／E21 瀏覽器補驗

## E04 兩個真正分頁
使用 tests/save-peer-harness.html，兩個獨立 Chrome tab，共用隔離鍵 bianshui-peer-proof-2219，皆先載入空城，實際呼叫正式 Town 與 SaveStore。
- A 建民居並儲存成功，B 建工坊再儲存回報 conflict。
- conflict.json：共用主檔只有民居，branch:A 民居、branch:B 工坊，兩版保留。
- A 記錄主檔字串，關閉 B（beforeunload 再呼叫save），A讀回after-close.json：sharedUnchanged=true，兩版仍存在。
- 本測試用真實兩分頁／storage event／beforeunload，UI是專用測試頁。正式main的衝突對話與版本選單另有 evidence/r1/cross-tab.txt/png。兩組證據共同涵蓋契約，不將測試頁冒稱遊戲主畫面。

## E21 真正AudioContext
使用 tests/audio-background-harness.html，正式 createRuntime、Town、Soundscape，點擊開啟音訊；只對這個測試tab暫時將CDP focus emulation設為false，實際切到另一頁，再返回。記錄audio.json/png。
- 背景26877.6ms，render callback次數增加0。
- 城市JSON unchanged=true，離開／返回elapsed同為8.91。
- 真實AudioContext state=running，master GainNode由0.1876465降到0。
- 返回第一幀dt=0、elapsed仍8.91，沒有追趕。
- 是音訊節點量測，沒有宣稱真人聽覺測試；測試頁已恢復focus emulation並關閉（批次後半發生工具kernel reset，inventory確認音訊頁已關閉）。

只新增測試證據，未改production程式。E03磁碟城市匯入仍待：獨立遊戲頁匯出已成功落盤Downloads/汴水小鎮.json，80964bytes。檔案chooser.setFiles回報Not allowed，需要Chrome擴充套件允許存取檔案網址；已向使用者請求完成設定，未自行擴大權限。正式網站仍8758181。
