# 對話框名稱及單屋選取驗收

## U12
- 全部16個dialog皆綁定唯一標題id，DOM讀回見dialog-labels.json。author-work及literature在開啟前填入實際作品名。
- 本次原先缺標籤的五個dialog，逐一由正常UI開啟並回讀完整無障礙樹：gallery、help、production、blueprints、literature。literature實際顯示〈觀書有感〉其一。沒有以靜態文字代替動態作品名稱。
- 未做真人讀屏軟體聽讀；證據為Chrome無障礙樹及唯一標題參照。

## U13
- main共用urban.footprint，選取快取包含建築id及占地。單屋只一格，四格合建完整四格；所屬街坊僅以小卡文字補充。
- v4隔離城選柳蔭人家3（中間）後換杏花人家2（左邊），紅褐框只框一屋且隨切換移動：single-house.png、neighbour-selected.png。four-cell.png為方塘書院四格占地。
- 拆除提示明寫這一棟、占地1格及同街坊其他屋保留；確認拆除杏花人家2後，清單仍有柳蔭人家3及汴水人家4：demolish-target.txt、after-demolition.txt。
- 所有操作在fixture唯讀測試城，不覆寫正式進度。沒有部署。

6項urban聚焦、249項全套回歸與build通過。build仍有既知bundle大小警告。
