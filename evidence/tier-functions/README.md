# C24 五級建築功能驗收

## 共用契約
- building-tiers.js的TIER_RULES/buildingStats集中定義：住宅單格每級+1人、四格+2人；精製作坊1.5倍基底×[1,1.25,1.5,1.75,2]，四格2倍基底；商鋪店員2..6、每店員服務間隔12/10/8/6/4秒。
- 同表供應所有公共服務容量/範圍及維護費。dailyUpkeep、升級報價、實際升級與UI preview使用共同資料。原有level/footprint基底保留。
- 經營模式sellAtShop統一居民及訪客真交易，nextSaleAt記錄下一服務時間；存檔驗證不可超過elapsed+12。離場、病假、缺貨或休業不交易。自由營造不節流。
- 五級不能再升；四格擴建保留等級與住戶貨物。單格容量上限8、四格16，不超過既有143格地圖的1144居民存檔界限。

## 驗證
- `node --test tests/tier-functions.test.js tests/tiers.test.js tests/city-finance.test.js tests/commerce.test.js tests/urban.test.js`：27/27。
- `npm test`：229/229；build通過，大套件警告仍待效能項目。初次回歸因舊urban測試預期二級住宅4/四格8人，更新新契約5/10；失敗原始輸出保留initial-regression.txt。新fixture漏visible已補，schema沒有放寬。
- 全圖錄/占地/一至五級逐項驗證preview=actual、能力和維護逐級增加、成功扣款一次、六級不扣款；住宅真正入住5→6且供水容量一致。商鋪真正指派3→4員工。
- Chrome控制頁tests/tier-functions-harness.html：同4人6.5秒，二級尚未完工、三級完成1陶器；同2人20秒，二級售5、三級售6（browser-output.txt）。控制頁只推進指定模組，未冒充整個城市正常運行20秒。
- Chrome三維住宅二→三：金庫18920→18740（180文），容量5→6，維護4→6；其後四級7人/8文、五級8人/10文且升級按鈕0個（home-before/after/five.txt/png）。
- Chrome三維作坊二→三：18200→17840（360文），1.875→2.25倍，維護12→18（work-after.txt）。商鋪二→三：17840→17570（270文），店員3→4、服務10→8秒、維護8→12（shop-after.txt）。
- 隔離測試城使用20000文測試初始金庫，正式小鎮未變更；屬代理Chrome驗收，非真人玩家。所有測試分頁已關閉。

## 未完成範圍
- C25與其餘O/U/E及最終四領域複評仍必要；本次不部署。
