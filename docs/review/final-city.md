# 城市模擬最終獨立複評

- 審查日期：2026-09-16（Asia/Taipei）。
- 審查基準：`4f47c4ab8058c0594c8eb3c967cdb5eb9a44dcdc` 工作樹；根代理正在處理 E04/E21，本報告沒有審查其未提交修改。
- 比較起點：原 `city.md`／`city.json` 的 `a6a7504`，不是以 ledger 的 verified 狀態代替驗證。
- 本次僅擁有本報告；未改程式、ledger，未跑全套、build、瀏覽器或部署。

## 結論

**23 項 PASS、2 項 NEEDS_WORK、0 項 EVIDENCE_GAP；暫不准予城市領域放行。**

25 項功能 acceptance 都有直接可重播證據，且本輪聚焦 101／101 通過。但 C09、C10 的沙盒行為與原逐項模式契約不符，需修正模式邊界或提供先前已核准的例外契約。這兩項不是測試失敗，而是現有測試把契約外行為當成正確結果。

## 逐項判定

下表的測試檔皆位於 `tests/`；所有 ledger C 項列出的證據檔均確認存在。亦抽讀各里程碑 README 與直接 Chrome 文字輸出；歷史輸出只用於佐證當時操作，不把舊數值當本次 HEAD 現況。

| ID | 判定 | acceptance 實際涵蓋 |
|---|---|---|
| C01 | PASS | city-finance：建屋／路／搬移／升級／擴建缺款不改資料；成功扣一次；四格較貴；prepare 失敗回滾。 |
| C02 | PASS | city-finance：實際 Town .25／1 秒跑720秒維護相同，更多落成設施較貴，重結算不重扣；暫停不 tick 由執行結構保證。 |
| C03 | PASS | finance＋growth：空屋零人口稅；同貨不重售；20％單筆稅高於10％，三項需求及真正移入降低。 |
| C04 | PASS | sanitation：三日欠款容量75／50／25％，水與清運實際不足；調稅回正恢復100％，拆除及政策仍可使用。 |
| C05 | PASS | growth：純住宅／商業／作坊／均衡四情境方向不同；增加過剩類型後該需求下降並提供原因。 |
| C06 | PASS | growth：首 tick 不填滿；.05／1秒相同時間均4人；低需求留空屋且不囤移入爆量。 |
| C07 | PASS | growth：短期無家不走；寬限後有限移出；安置與工作恢復取消倒數；聊天與事件引用清理可存讀。 |
| C08 | PASS | employment：近職缺優先、可達現職保留、隔離不配對、斷路寬限及重接補缺。 |
| C09 | NEEDS_WORK | 人力功能通過：同60秒0／1／4人產量0／1／3；零人不耗原料。沙盒也被施加比例，違反逐項 mode_contract，詳下。 |
| C10 | NEEDS_WORK | 採買功能通過：到店耗一件、冷卻防重算、缺貨／離店不成交。沙盒也耗貨及建立需求狀態，違反逐項 mode_contract。 |
| C11 | PASS | trade-logistics：12件初始進口128文逐批對帳；價差、部分進口與零資金；成交收入回商業，市府只收稅。 |
| C12 | PASS | trade-logistics：真實移動同12件三級更快；建置及維護增加；三級封頂，運輸者數量及ID不重複。 |
| C13 | PASS | roads：起始引道可走；移除唯一道路隔離、重鋪恢復；隔離阻止移入及職缺；沙盒自動接路保留。 |
| C14 | PASS | roads：12位同路徑真 Town.move，小路5人大路10人通過；道路升級不改建物占地，會車保有分列。 |
| C15 | PASS | logistics-safety：隔離訪客兩輪零成交；接通仍需實際到門口才成交；路中斷及目標刪除亦不遠端交易。 |
| C16 | PASS | commerce：庫存足但零店員不賣；到場即恢復；離場關店；遊客使用相同規則。此為原列 defect，可兩模式修正。 |
| C17 | PASS | water-service：有限供水12／16、超距及斷路不足；新增水井恢復；落成前不供水；建設與日維護扣款。 |
| C18 | PASS | sanitation：人口及完成生產增加負荷；足量清運穩定；斷路逐日惡化、重接改善；分步與存讀不重結算。 |
| C19 | PASS | fire-service：同注入值無巡守損60、有巡守12；真停工停業；預警／付費取消／免費恢復且保留人貨；固定日序可重播。 |
| C20 | PASS | healthcare：同衛生有員工藥鋪恢復較快；休業／病假／離店／受損不照護；容量及重疊分配有界；真缺勤返工。 |
| C21 | PASS | education：沿路覆蓋漸進10點／日、未覆蓋零、100封頂；固定原料人力較早完成成品；病假及斷路停止。 |
| C22 | PASS | pollution：真正完成產出才排放，近高遠低；停產90秒減半；相同人口住宅環境／需求改善；搬拆不瞬間清零。 |
| C23 | PASS | garden-services：首近園提升宜居與需求，隔離及遠園較低；權重遞減、20封頂；升級、欠款及重安置有因果。 |
| C24 | PASS | tier-functions：所有圖錄占地逐級能力及維護一致；三級比二級真產能／交易增加；五級封頂不扣款；UI使用共同能力表。 |
| C25 | PASS | wellbeing：五分項獨立有界、固定權重精確重算；服務取消及污染下降分數；真實移出倒數、改善取消及移入速率。 |

## 必修：C09／C10 模式契約

原 `city.json` 每項明列：「新增城市經營機制只在 management 模式啟用；sandbox 維持既有自由建造與行為。真正交易／尋路缺陷兩模式都修正。」C09／C10 原分類為 feature_gap，並非 defect。

### C09

- 原碼 `src/production.js:67` 無條件乘 `staffingRatio(t,b)`。
- `tests/employment.test.js:9` 的 production fixture 使用 `new Town()`，即 sandbox。
- 本輪直接 Node 重現：相同沙盒作坊、泥料3件、60秒，1位到場產1件、4位產3件。此改變了原沙盒只需至少1人即可全速的行為。
- 最小修法：人力比例只作用 managed；sandbox 保留「至少一位健康到場」門檻與舊產速。保留 C08 尋路、C16 店員修正。新增模式對照測試並把 C09 功能 fixture 改 managed。

### C10

- 原碼 `src/commerce.js:14–19` 沒有 managed guard；`src/simulation.js` 每 tick 對所有居民呼叫。
- `tests/commerce.test.js:3` setup 同樣是 sandbox。
- 本輪直接 Node 重現：sandbox、12時、人在有店員商鋪內，1件布匹，residentPurchase 回 true，庫存1→0、sold.cloth=1。
- 最小修法：新居民耗貨／需求狀態僅 managed；sandbox 不套用新增居民消費。保留既有訪客與 C16 店員規則；以雙模式測試確認。

若後續已核准更精確的模式契約允許這兩項共用，須附原始決策證據再改判，不可單純改文件迎合既有程式。

## 依原 rubric 評分

0＝無機制；1＝狀態文字；2＝單向；3＝輸入代價結果閉環及驗證；4＝容量／失效／恢復；5＝另有平衡情境與真人操作。

| 維度 | 分數 | 判斷 |
|---|---:|---|
| 財政經營 | 4/5 | 支出、稅、貿易分帳、欠款與恢復有實際驗證。 |
| 分區供需 | 4/5 | 需求、漸進人口、寬限移出、服務限制及恢復。 |
| 就業與消費 | 3/5 | 完整因果已成立；兩項模式相容邊界需修。 |
| 道路與物流 | 4/5 | 玩家接路、失聯復原、真運輸與容量投資。 |
| 公共服務 | 4/5 | 有限覆蓋、缺勤、欠款、損害、恢復與存讀。 |
| 環境與成長 | 4/5 | 產出污染、園景遞減、分級及可解釋滿意回饋。 |

**合計23／30，約76.7／100**（原6／30）。修復模式問題後，可依同尺規複核到24／30；未做真人與完整長期平衡，不給5分。

## 本輪驗證與限制

實際執行：

```sh
node --test tests/city-finance.test.js tests/city-growth.test.js tests/employment.test.js tests/commerce.test.js tests/trade-logistics.test.js tests/roads.test.js tests/logistics-safety.test.js tests/water-service.test.js tests/sanitation.test.js tests/fire-service.test.js tests/healthcare.test.js tests/education.test.js tests/pollution.test.js tests/garden-services.test.js tests/tier-functions.test.js tests/wellbeing.test.js
```

結果：101 tests，101 pass，0 fail。輸出暫存 `/tmp/final-city-focused.txt`。

- 本輪沒有真人遊玩、瀏覽器、正式站讀回或完整五情境長期平衡驗證；歷史代理 Chrome 文字輸出不等同真人。
- 抽讀財政／需求／赤字／就業／物流／道路／防火／醫療／教育／污染／園景／分級／滿意直接輸出，非只看 README 的結論。
- 早期 README 記錄當時未完成的後續項目是歷史狀態；本輪以 HEAD 程式與聚焦結果判定，不因舊 TODO 誤判未完成。
- 本報告只給 C 領域放行意見，不能代表四領域100項完成或已部署。
