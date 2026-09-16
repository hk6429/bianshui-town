# 城市經營重整 — 下一階段交接

## 完整目標
以模擬城市2000為參照，四位 AI 專家（含八角遊戲化）評量100項，全部修正、逐項驗收、四領域複評、部署及正式讀回。目標 active；不得把本里程碑當全部完成。

## 權威檔案
- ledger.json / LEDGER.md：20 verified、5 implemented（E01/E02/E03/E04/E21）、2 in_progress（C03/C04）、73 open。
- IMPLEMENTATION-CONTRACT.md：仍保留財政/需求/就業/物流/服務/文化/遊戲化/UX 全範圍。
- city / octalysis / ux / engineering 評量檔：四位 AI 已完成，不是四位真人；不要重用舊評量代理做工程。

## 已完成里程碑
- V10 誇張五級建築與重置鍵已在正式站，source 6e121e3。
- R1 aa59cf4：schema、存檔復原/隔離/跨頁、真實到店成交、貨物上限與有限歷程。evidence/r1。
- 固定步進 9e1fe9f：30/60/120Hz、等量1×/4×狀態一致；背景取消畫面。evidence/runtime。
- 執行錯誤 7c36141：每秒安全快照、例外停止、不覆寫、匯出/讀回。evidence/recovery。
- 顯示防線 883c0fc：HTML 跳脫、E07/E11/E16 完整資料驗收。evidence/content-safety。
- 本輪：town-edit.js 草稿交易、main 編輯全接線、復原時間確認；E15/E17 verified。evidence/town-edit。全套138/138，build成功。

## 本輪實作注意
- editTown 先 clone→edit→validate→prepare→persist，成功才發布draft；prepare失敗原城不改，scene reset後重繪原城。
- main applyUrban 回傳原edit結果（place為block、其他布林），同步新的recovery point，保留undo snapshot。
- undo按鈕先顯示整城回捲契約與時間，確認後才復原。
- DEV query edit-fault=refresh 限 fixture/storage-test，正式dist無注入文字。
- Chrome 已驗新建5→6、確認復原6→5及故障維持5並提示。測試分頁皆已關閉。

## 下一個有界階段
1. 補 E01–E04 實際存檔UI驗收：損壞兩次autosave及離頁、遷移失敗backup、匯出再匯入、兩頁各編輯與離頁。
2. E21 實際 AudioContext 靜音待補（已有背景渲染0/資料不變）。
3. E18/E19/E20 GPU釋放、WebGL復原、局部場景更新；之後進C-A財政/供需/就業，不可一直只做小UI。
4. 按剩餘城市、八角、UX契約繼續，最後用新的四領域評量工作階段複評。

## 狀態及規則
- 專案 /Users/naichengchen/projects/bianshui-town，main，GitHub hk6429/bianshui-town；Cloudflare手動發布，尚未部署本次重整。
- 正式 https://bianshui-town.pages.dev/；本機127.0.0.1:5173。隔離鍵 bianshui-town-test-v1，勿改正式使用者城鎮。
- CUA瀏覽器若CDP timeout，可讀原生Chrome AX；不要重開測試。前背景測試要暫時關測試頁focus emulation，結束還原。
- 每里程碑記錄證據並建立新工作階段；此輪為progress，不需blocked或complete。

## 最新：C-A 財政底座（2026-09-16）
- 前輪 bd5e334 為progress；本輪新增 city-finance.js / finance-ui.js，schema與toJSON升9。
- main 首次new/重置 mode managed、2400文；無參數engine Town維持sandbox供既有fixture/測試，舊v1–8遷移亦sandbox。示範UI明示free並設sandbox。
- quote/charge 直接接 Town.place / urban road/move/upgrade/expand；editTown保護存檔與金錢一起commit。demolish回收25%基本建材。
- settleBudget 每日人口稅/維護；saleTax實際成交一次，禁止已售貨重售；稅率0–20可在收支面板設定。
- C01/C02 verified，C03/C04 in_progress：稅負反向需求係數未接RCI；赤字未實作公共服務效率衰退。
- 財政全套146/146，build成功，Chrome確認2400→2280單次扣120、稅率21拒絕、切sandbox資金不重填。evidence/city-finance。
- 下一包優先 C05–C10：RCI、分批遷入/遷出、可達就業、人力產能、居民真採買；把taxDemand接到需求，並在C17–C25服務包完成C04衰退。仍保留E01–E04/E18–E21與O/U待辦，不漏項。

## 立即交接：C08/C09 尚未提交（本輪出現兩次整合失敗，已換階段）
- HEAD 0834261，新增 employment.js/tests/employment.test.js，修改 simulation/production/save-schema/logistics-safety.test；所有本輪工作尚未commit/push。
- BFS可達職缺按距離，保留合理現職，失聯60秒寬限；人力倍率為到場/容量，乘建築規模。
- 第一個全套失敗：舊貨運歷程測試stub僅1名工匠，20秒未達新配方時間；改4名代表滿編，維持原貨運斷言。
- 第二個全套失敗：schema新增future jobLostAt檢查時漏了for(const a of list)。已補回，49項employment/logistics/schema聚焦全部通過。
- evidence/employment/failed-before-schema-fix.txt是歷史失敗；focused-after-fix.txt才是最新聚焦成功。
- 下一階段第一步跑全套與build，再實際UI查看人力狀態或保存可重播模擬證據；確認C08/C09契約後才標verified、commit/push。勿將C05–C07/C10遺漏。
- 最新 ledger 20 verified / 7 implemented / 2 in_progress / 71 open。完整goal active，不是blocked。

## 最新交接：就業與採買里程碑放行（2026-09-16）
- 上述未提交與失敗紀錄為歷史；本輪 152/152 全套與 build 通過，Chrome 模組驗收 8 格近職／32 格遠職、人力 0/1/3 產出、店員到場及真實庫存成交通過。
- C08/C09/C10/C16 verified；最新帳本 24 verified / 5 implemented / 2 in_progress / 69 open，100 項目標仍 active。
- employment.js、commerce.js 及 main/life/production/schema/simulation 整合完成，證據 evidence/employment。
- 下一個獨立工作階段 C05–C07：單一 RCI 需求、按時間移入、長期失業與無家遷出；接入 C03 稅負需求。不可只改數字或測試，必須真實影响人口與玩家回饋。
- C04 服務衰退、E01–04/E18–21、O/U 全部保留；百項完成並四領域複評後才部署，正式站仍 V10。

## 最新交接：城市成長里程碑（2026-09-16）
- 前輪 74b8012 就業／採買已推送。這輪 C03/C05/C06/C07 完成聚焦驗收；最新 28 verified / 5 implemented / 1 in_progress / 66 open。
- city-growth.js 建立 RCI、每15秒人口配額、優先安置、三種長期困境有限遷出；城市經營生效，自由營造維持舊入住方式，面板明示。需求目前園景是服務來源，C17–25 公共服務尚待。
- demography 頂層可選存檔欄位；hardship 居民可選欄位。舊檔從目前elapsed起算，不追算遷出。save版本仍9。
- 160/160 全套、build通過；實際遊戲 0→4 人、凍結時間稅率10→20令需求80/-40/-16→50/-70/-46；手機發現並修正收支面板橫向超出。證據 evidence/city-growth。
- 財政測試唯一前置調整：明確seed2人代替第一tick自動入住，稅額斷言未降低。其餘 sandbox 舊測試維持。
- 下一個有界工作階段優先 C11–C14：玩家路網／公私路接續、有限物流容量及補貨成本，連結需求與經濟。讀各 ledger acceptance 後實作；C04 服務衰退保留到公設包。
- 全部 O/U、E01–04/E18–21 待辦不省略；百項與最終四領域複評完成才發布。正式站仍 V10，不部署尚未完整驗收的重整版。

## 最新交接：貿易與貨棧里程碑（2026-09-16）
- 前輪98ac613為progress。C11/C12已完成，最新30 verified / 5 implemented / 1 in_progress / 64 open，goal active。
- trade.js：city.trade，600初始周轉金，首次12件船貨付128；進口先受資金/庫存上限約束，成交記gross revenue，市府只得tax，商戶回補net。有限ledger60列，UI12列；schema驗總餘額與每列數量/單價。
- logistics.js：city.logisticsLevel 1–3，300/600升級費、額外維護0/6/12；porters2/3/4、load1/2/3；oxen1/2/3、load3/5/7。life實際spawn與transfer接入，貨物守恆、唯一ID及封頂驗證。
- 同12件同路線送店一級373.00秒、三級128.35秒。166/166全套、build、Chrome升級/封頂/reload成功。evidence/trade-logistics。
- 下一個獨立工作階段必須處理C13/C14（尚open）：managed取消跨街坊自動BFS但保留門前步道；起始公共路需接玩家道路；拆唯一外聯→隔離、重鋪→恢復；大路容量接入實際traffic，寬路吞吐高於小路且占地不變。
- 注意道路幾何：地塊中心c*4，建築門前perimeter在±2；roadNodes十字半徑2，publicRoads主幹x12，最右可建地x2中心8，外緣10距主幹2單位。需要明確公共接點，不可用任意最近路瞬移跨隔離。
- production.deliveryPlan目前不篩可達，首選孤立點可能卡整輛牛車；tickCraftCarts可能遇返家失敗仍帶貨，C13階段一起驗。
- 正式仍V10；百項全部修正、逐項驗收及四領域複評後才部署。

## 立即交接：C13/C14 道路整合，工作樹尚未提交（2026-09-16）
- HEAD7337a0a；本輪為progress，新增road-network.js/tests/roads.test.js，多個simulation/production/life/urban/traffic/UI檔修改。帳本30 verified / 7 implemented / 1 in_progress / 62 open。
- managed新城publicWorks初始(2,2)lane；公共支線(10,8)→(16,8)銜接，street blocks只perimeter，跨街坊不自動BFS。sandbox自動連通仍保留。setCityPolicy切換mode立即重建路網。
- roadAnchor managed只取1.01單位內道路，roadReachable連通分量WeakMap按Set identity/revision/size快取，避免每個貨車每tick完整BFS。publicAccess接貨棧(12,8)；新移入必須publicAccess。
- move空route僅在實際門口才到站；send失敗clearroute；deliveryPlan跳隔離；牛車/腳夫實際到站才卸；loaded cart找可達shop、失敗保留貨。urban.refresh不再將所有cart瞬移home，保存destination重新規劃。
- 大路同向行人按ID分兩列，原基礎速度不變；roadCapacity讀publicWorks avenue；道路grade升級差額25/格，11秒12人小路5人大路10人通過。
- 第一次整合失敗是舊managed fixture未鋪必要道路、初始道路維護增加1；已更新相關fixtures及明確費用斷言。第二次僅rehousing fixture拆home後work也失聯；補work connector(-5,1)，最新city-growth+roads 14/14通過。依兩次整合失敗規則，此處建立handoff換下一工作階段，不在此輪繼續全套。
- tests/city-growth helper now為-6..1,z2鋪橫路及(-6,1)豎路；tests/trade-logistics送店情境明確鋪(0,1),(0,2),(1,2)，更新後一級267.25秒/三級93.10秒，先前373/128為舊路線歷史，不要混用。
- 下一階段先處理兩個已知風險：src/literati.js rerouteLiterati仍全域nearestRoad/nearestgoal可能跨隔離；trafficMotion遇vehicle時offset=.85覆蓋wide雙列可能重疊。以roadAnchor/實際goal與分列offset修正並加聚焦驗證。
- 然後補公共營造UI對大路容量/經營需自鋪的說明，跑完整tests/build、Chrome或正式模組harness斷路→隔離→重鋪與大路吞吐，才把C13/C14標verified並commit/push。
- 證據evidence/road-network。沒有部署；完整100項及最終4領域複評目標active，不可標complete/blocked。

## 最新交接：C13/C14 道路里程碑放行（2026-09-16）
- 上段未提交／未完成驗收為歷史。這輪修好literati改道與wide會車offset，20/20聚焦、174/174全套、build及Chrome模組+實際三維拆路重鋪皆通過。
- literati nextDestination只選可達場所；斷路無roadAnchor不移動、不收作品；重鋪恢復。寬路遇車仍維持.65/.95兩列。玩家公共營造明示手動接路、價格/差額、雙列。
- 實際3D：點唯一外聯路拆除→住宅標未接外路；重鋪扣20→住宅恢復接通。evidence/road-network/3d-* 與 reconnected* 保存。測試tab已關閉、未改正式存檔。
- 最新帳本32 verified / 5 implemented / 1 in_progress / 62 open。完整goal仍active，不部署重整版。
- C01–03/C05–16 已verified，城市剩C04+C17–25；下一個有界階段讀ledger並做公共服務/宜居，優先供水、衛生與防火（C17–19），把C04赤字服務衰退接到真實效率。之後醫療/教育/污染/公園/分級等；不要遺漏O/U與E01–04/E18–21。
- managed新Town預設一格publicWorks(2,2)lane，不能再假設空城道路0或維護0。新版v9存檔fields沿用，模式切換重建道路；舊v1–8仍sandbox，不追扣舊城成本。

## 新階段起點：C17 住宅供水（2026-09-16）
- 前輪只有 V10 線上外觀再確認，對百項目標屬 no progress。現以 HEAD0771f72 乾淨工作樹接續 C17。
- 本階段只負責水井建設／路程與容量分配／住宅入住與供水指標／UI 與驗證；C04/C18/C19 留在下一服務階段，不宣稱一併完成。
- 維持 100 項全部完成與最終四領域複評後才部署。水井用 garden 類中的 utility 設施，排除休閒園景加成；所有費用沿用共同報價，容量與距離按級數增長。

## 最新交接：C17 供水里程碑（2026-09-16）
- water-service.js 依 commuteDistance 的實際路程分配；每井12×tier人，四格48×tier；範圍24+4×(tier-1)。先現有人再空位，augmenting path避免交疊水井把唯一可達住宅餓死。
- 新 well design 屬 garden utility，模型為井欄／轆轤／水桶，一格與四格、五級皆有；共用garden建設100/格與維護3/格×tier。isUtility排除休閒園景加成與遊園目的地。
- cityDemand 加供水子項：人口>=2時供水滿意度0→100映射-12→+12。初住2人可自備水，之後新移入必須 waterReport.home.available>0；重新安置原有住戶仍優先。sandbox不限制。
- 公共營造有直接水井按鈕，圖錄也可選；住宅／水井卡與收支總覽顯示供水。全部derived，未新增save欄位。
- 7/7供水聚焦、181/181全套、build、Chrome真3D住宅讀回／水井升級／點建扣款通過。evidence/water-service；沒有部署。
- 33 verified / 5 implemented / 1 in_progress / 61 open。C17已verified，C04仍待真赤字效率，C18–25、O/U與未完成E不可省略。
- 下一新工作階段接C18衛生，並設計C19防火與C04共用服務效率。衛生須人口+實際生產負荷、清運容量、逐日累積/恢復；不是只畫圖示。不要把本供水滿意度當完整C25幸福度。

## 新階段起點：C18 衛生與 C04 欠款服務衰退
- 基準fb2f44f，前輪為progress。根代理直接接衛生清運，並把C04效率接入既有水井與新增清運院。
- 新增 building.waste/pendingWaste、person.health、city.sanitationDay可選白名單；restore舊檔從目前日開始不追算。每日結算，sandbox不累積；切換模式重設衛生游標及待結算生產量。
- 本階段驗收重點為人口與真生產負荷、容量/可達清運、逐日健康與需求影響、存檔重讀一致、連續赤字效率與正常收入恢復。C19未納入本階段完成宣稱。

## 最新交接：C18/C04 衛生與欠款里程碑（2026-09-16）
- 35 verified / 5 implemented / 60 open；C04、C18已verified。189/189全套、23/23聚焦、build、Chrome模組逐日及真3D讀回通過。evidence/sanitation；沒有部署。
- public-services.js提供isUtility(well/cleaningYard)、serviceEfficiency：managed欠款75→50→25%，非負金庫立即恢復。waterReport分配量乘效率；清運同乘。
- sanitation.js每日按time/24結算，city.sanitationDay游標，人口1/人+真成品2/件；work.pendingWaste累積到下一日，building.waste最多1000。有限容量residual flow接commuteDistance，沿路可達才清；清運模型/圖錄/公共按鈕/衛生UI已接。
- 每居民health0–100，居住/工作髒污負荷逐日降、乾淨每日+5；目前不影響缺勤，留C20醫療。cityDemand衛生0–100轉需求-20..0。健康與衛生不是完整C25。
- save v9新增optional building.waste/pendingWaste、person.health、city.sanitationDay（不可未來日）；舊檔從當日開始。sandbox不累積待廢料；模式切換重設日/清待量、不抹既有髒污/健康。
- settleBudget多日負餘額計數修正為真正連續欠款日，避免高估；新測試涵蓋。
- 下一獨立階段C19防火：固定種子/可注入事件、窯坊密度風險、可達巡守容量、受損/停工與明確恢復。沿用serviceEfficiency讓赤字影響巡守。勿讓火災無預警清空城市。
- 後續C20藥鋪容量/員工/健康與缺勤、C21教育、C22污染、C23園景、C24全建築分級、C25幸福度；全部O/U/E待辦和最終四領域複評仍必要，百項完整完成後才部署。

## 新階段起點：C19 防火巡守
- 基準14af813，前輪C18/C04為progress。本輪根代理直接完成C19，保留百項與最終複評範圍。
- 日與建築ID決定的可重現抽樣；30秒預警、一日最多一處，前兩日免事件。巡守範圍/容量受道路、級數與欠款影響。
- 非毀城事件：受損停工/停業，住戶貨物保留；可付費處置或倒數免費整修。待因果測試與Chrome操作證據。

## 最新交接：C19 防火巡守里程碑（2026-09-16）
- 36 verified / 5 implemented / 59 open，197/197全套、8/8聚焦、build、Chrome真3D預警定位/付費排除/修復已驗證。evidence/fire-service；未部署。
- fire-service.js：fireRisk由近鄰與窯坊數計，固定fireDraw(day,id)，前兩日免、一日最多一處30秒預警。patrolCoverage按風險排序/commuteDistance/8或32×tier×serviceEfficiency有限容量；受巡守概率×.25、損害12，無巡守60。
- 受損停tickProduction、shopIsOpen；住宅健康扣2/10。保留資產/貨物/居民。damage×2秒免費修復，或damage×占地文立即修；預警處置20文。sandbox凍結事件且免費修復，UI明示。
- fire-scene.js在scene.sync模型上加預警標記/受損灰煙，signature加fireWarningAt/fireDamage。全域fire-alert可定位事件；inspect卡與收支摘要顯示巡守/修復；公共營造新增firePost，一格/四格/5級。
- city.fireDay、building.fireWarningAt/fireDamage/fireRepairAt可選v9欄位；schema要求damage與repairAt成對且不同時warning。restore舊檔從當日開始。clearFire即時清除作坊停工文字（真瀏覽器發現並修正）。
- 下一獨立階段C20醫療：沿用person.health，營業且到場員工的herbShop才供醫療，有限容量+可達範圍，在同衛生下更快恢復，健康影響缺勤與真產能；參考commerce.shopIsOpen與employment.presentWorkers，避免醫療自我依賴造成停擺。
- C21教育/C22污染/C23園景/C24全類型分級/C25幸福度，以及所有O/U/E待辦與最後四領域複評仍未完成；百項全部完成後才部署。

## 新階段起點：C20 藥鋪醫療與病假
- 基準3271993，前輪防火為progress。本輪藥鋪需shopIsOpen與健康店員到場，依住家可達路程及同時照護名額分配，優先低健康。
- 健康<40病假返家，presentWorkers與真產能排除病假；醫療每30秒回8點，40可返工，不解除工作指派。待聚焦與瀏覽器驗收。

## 最新交接：C20 藥鋪醫療里程碑（2026-09-16）
- 37 verified / 5 implemented / 58 open；C20已verified，204/204全套、18/18醫療/就業/成長聚焦、build、Chrome真3D醫療/病假/返工證據通過。evidence/healthcare；沒有部署。
- healthcare.js：只有herbShop與shopIsOpen、健康到場人力；每店員每級4人，四格8人，同時照護slots。依home→clinic commuteDistance 24+4×(tier-1)，低health優先，augmenting path交疊重新分配；每dt health+=8/30，cap100，sandbox不結算。
- employment.onSickLeave(t,p) managed且health<40；presentWorkers排除病假。production改用presentWorkers，原staffingRatio同一依據。simulation病假優先返家並保留work，停止街頭活動，health>=40恢復排程。
- main居民小卡顯示health floor與照護/病假；residentCondition加入健康低警訊，修掉穩定文字矛盾。藥鋪卡/收支總覽/圖錄說明已接。存檔沿用person.health，沒有新增欄位。
- 真3D蘇安健康36居家病假→60，日誌09:00返坊09:20燒製、13:39再燒製。這是正常town.tick，非只有harness數字變動。
- 下一新階段C21書院教育：按遊戲日漸進、有界學力，書院可達與容量，影響相關工匠真產能；不可瞬間滿級或只顯示數字。需要ledger契約再讀。
- 城市餘C21–25，所有O/U和未驗E仍必要；最後四領域複評與全100完成後才部署。

## 插入里程碑：強化升級外觀與重置驗收（2026-09-16）
- 使用者再次要求誇張升級外觀與重置鍵。基準831f09f；先加強四、五級雙側塔樓及五級長幡，核對既有重置確認與復原。
- C21教育尚未實作；百項稽核與全部完成後部署的條件保留，本次不提前發布整批未完成改版。

## 最新交接：外觀強化與重置複驗完成
- 3/3分級聚焦測試、build通過；Chrome同尺度五級對照、取消/重置/重整後復原通過，evidence/tier-emphasis。
- 四級雙側重簷塔，五級三重簷金瓦雙塔與加大長幡。reset既有功能無須重寫。
- 百項進度不變37 verified / 5 implemented / 58 open，未部署。下一獨立階段回C21書院教育。

## 新階段起點：C21書院教育
- 基準6d78f7f。沿住家道路覆蓋、每級8個同時受教名額，低學力優先；每360遊戲秒增加10點，上限100。受損/斷路/病假停止，欠款減少名額。
- person.education可選欄位保存小數；不補離線日、不重置舊學力。到場健康工匠的平均學力提供0–20％真產能加成，自由營造不累積/不套用。待測試與Chrome驗證。

## 最新交接：C21書院教育里程碑（2026-09-16）
- 38 verified / 5 implemented / 57 open；9/9聚焦、210/210全套、build、Chrome因果對照與真三維學力增長通過，evidence/education。沒有部署。
- education.js涵蓋落成未受損academy，每級8slots、range24+4tier、欠款縮容；低學力優先augmenting assignment，病假/無家/斷路/已滿100排除。tickEducation每dt加10/360，持久education小數，不補離線。自由營造不結算。
- presentWorkers平均學力/100×.2乘入真production進度；離場與病假不加成。UI居民、作坊、書院、finance-summary已接。v9 person.education可選0–100；舊檔不需改版本。
- Chrome控制0→0.833→10.833→100；無覆蓋0。8.5秒滿學力陶器已完成，基準泥料12.75。正常三維蘇安10.9→12.7，4/8名額。
- 下一獨立階段C22污染：先讀ledger的fix與acceptance，新增工坊污染與距離暴露對健康/住宅需求的因果關係；避免與waste衛生重複計算/空有色塊。C23/C24/C25、其餘O/U/E及最終四領域複評仍必要。百項完成後才部署。

## 新階段起點：C22生產污染
- 基準1ef3257。真實成品完成才排放，陶器18/木器8/布匹14；三格內距離衰減、四格均分源強度，city.pollution地塊持久化且每90秒減半。
- 住宅暴露降低居住環境與住宅需求；污染保留於原土地，不隨建築搬走。與衛生髒污分開、不另重複扣健康。待測試與Chrome驗證。

## 最新交接：C22生產污染里程碑（2026-09-16）
- 39 verified / 5 implemented / 56 open；15/15聚焦、217/217全套、build、Chrome近遠/停工/真三維拆除恢復已驗證。evidence/pollution，未部署。
- pollution.js：每件真成品EMISSIONS=[18,8,14]，三格內1-distance/4，四格排放平均於四源格；city.pollution[{x,z,value}]143格上限、0–100、禁止重複格。tickPollution在tickProduction前，90秒半衰，保留原址，不跟隨搬移/拆除。sandbox凍結數值且不扣需求。
- home占地平均污染、environment100減污染；pollutionReport依home住戶數max1加權，全城home demand扣round(exposure*.3)，新入住/安置候選homes先按pollutionAt排序。與waste衛生分開，不重複扣健康。
- main home/work小卡與finance-summary已接；README公開規則。舊v9無pollution默認0，無需升版本。
- Chrome控制3陶器近40.5/遠0，停90秒20.25；真三維UI拆窯仍40.2，正常遊戲08:04→13:17降22，4人保留。中途修改測試HTML造成Vite重載（未重啟服務），污染持久化仍保留。不要在實測期間修改HTML以免干擾UI。
- 下一獨立階段C23園景效益：讀ledger契約，避免僅全圖有園即加成；需要有限距離/容量、重複園景遞減與實際宜居/造訪效果。C24/C25及O/U/E全部保留，最後四領域複評後才能部署。
