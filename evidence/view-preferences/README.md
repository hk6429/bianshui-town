# 減少動態與建築用途標籤 U18/U20

4/4聚焦測試與build通過。直接使用TownScene.updateFollow與WeatherScene.update驗證：減少動態一次定位、之後鏡頭不追蹤；雨線停止更新但城鎮資料不變；偏好自動/覆寫與四類文字用途。

Chrome原生介面實際切換減少動態並開關標籤；用CDP Emulation.setEmulatedMedia模擬prefers-reduced-motion:reduce，auto選項回顯「目前：減少動態（依系統）」。撤除模擬後回完整動態，未改作業系統設定。核心時間在關閉視窗後繼續流動。

labels-on.png：混合街坊同時可辨識民居、商鋪、作坊、園景公設，圖例不遮品牌；開啟標籤時預設收合額外工具，可按營造與工具重開。labels-off.png：取消後標籤與圖例隱藏。偏好於重新開啟隔離fixture頁保留。

瀏覽器連線曾逾時，改用原生Chrome選到既有分頁後成功，未重啟Chrome或開新profile；測試結束撤銷媒體模擬並關閉測試頁。畫面證據為自動操作，不是人工讀屏測試。
