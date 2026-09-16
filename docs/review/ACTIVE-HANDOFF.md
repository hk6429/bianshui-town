# 城市經營重整 — 下一階段交接

> 以下歷史紀錄以文末最新交接為準；舊「全部100項才部署」已由使用者改為分批發布。

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

## 新階段起點：C23園景宜居
- 基準2a7cd45。按住家步道可達距離、級數、維護效率計算各園景效益，再以1/2遞減權重與總20上限防堆疊。需求、人口目標與入住候選接上空間效益。無新增存檔欄位，待聚焦/Chrome驗證。

## 最新交接：C23園景宜居里程碑（2026-09-16）
- 40 verified / 5 implemented / 55 open；13/13聚焦、222/222全套、build、Chrome控制距離/疊園與真三維升級效益已驗證。evidence/gardens，未部署。
- garden-services.js：home→garden commuteDistance，range24+4×(tier-1)、base8+2×(tier-1)、linear distance falloff、serviceEfficiency；非utility、ready且未damaged。對每home按效益降序/(2**i)累加，cap20。
- gardenReport依住戶max1權重平均，managed需求round(avg)；targetPopulation改成2+jobs+min4,floor(avg/5)，取代舊任意遠園gardenHomes計數。homes安置/入住排序pollutionAt-gardenBenefit。sandbox不套用demandModifier。
- main home/garden小卡與finance-summary，無新存檔欄位。控制首近園6.667、第二10、第三11.333，隔離0；ChromeUI花100升一園二級，range24→28、住宅11.3→13.2。
- 下一獨立階段C24五級功能：先讀ledger與現有tierOf/jobCapacity/homeCapacity/production/commerce契約，將外觀級數接到全類型實際功能、成本與可驗證上限。C25及O/U/E全部保留，最後四領域複評後才部署。

## 新階段起點：C24五級功能與共同能力表
- 基準a949860。building-tiers新增TIER_RULES/buildingStats，住宅每級增加1人（四格2人）、作坊每級+25%基礎產能、商鋪每級+1店員；所有公共服務既有範圍/容量與維護費收斂至共同表。
- 保留舊level/footprint基底；UI現在/下級用同一能力函式與實際upgradePreview顯示，待聚焦/full/browser驗證。

## C24驗證交接：切換至收尾階段
- 共用能力表與商鋪真交易節流已實作，尚未標記C24 verified、未提交/部署。
- 兩輪回歸失敗原因已定位：舊urban.test期待4/8，實際新tier2為5/10（已更新）；新增訪客fixture漏visible（已補），不是放寬schema。新nextSaleAt保存交易間隔且拒絕超出elapsed+12秒。
- 下一階段以聚焦測試重新驗證合法fixture及拒絕未來交易時間，成功後才全套；再完成Chrome二級→三級preview/扣款/能力與商鋪吞吐量操作證據。README/ledger/evidence說明、GitHub推送尚待。

## 最新交接：C24功能完成、UI收尾待驗（2026-09-16）
- 工作樹基於a949860，C24未commit；40 verified / 6 implemented / 54 open。最新聚焦27/27、全套229/229、build通過（runtime最後build後僅修正test fixture）。evidence/tier-functions。
- TIER_RULES集中：住宅基底level/footprint保留，單格每級+1、四格每級+2；work基底倍率×[1,1.25,1.5,1.75,2]；shop jobs2..6、每店員銷售seconds12/10/8/6/4，實際間隔seconds/presentWorkers數。
- sellAtShop共用於residentPurchase與life.tickVisitors，managed nextSaleAt保存間隔，sandbox不節流；schema b.nextSaleAt optional num且<=elapsed+12。測試已驗同店員20秒二級賣5/三級賣6，居民/訪客不可同時超賣、讀檔不重置交易冷卻。
- buildingStats同時供water/cleaning/fire/medical/education/garden容量、距離、維護。city-finance.upgradeCost用tierRule.upgradeFactor，dailyUpkeep用stats；main buildingTools現在/下級顯示buildingAbility/upkeep與外觀TIER_DETAILS，upgradePreview符合home/work level=2轉換。
- 已更新舊urban.test新tier2住宅5人、四格10人；初次失敗保留initial-regression.txt。新增測試fixture漏visible已修正，沒有改弱schema。
- 下一新階段：建立tests/tier-functions-harness.html，用正式Town/upgradeBuilding構建二三級對照、保存隔離城；Chrome真三維操作升級，驗preview與扣款/維護/容量一致及五級不能再升。尚須README、evidence README、ledger verified、handoff、commit/push。測試頁建好之後再開Chrome，勿在驗收途中修改HTML觸發HMR重載。
- 仍未部署；C25和O/U/E及最後四領域複評都必須完成。不要將本輪implemented當verified。

## 最新交接：C24五級經營能力里程碑（2026-09-16）
- 41 verified / 5 implemented / 54 open；27/27聚焦、229/229全套、build、Chrome真三維home/work/shop升級與五級封頂通過。evidence/tier-functions；尚未部署。
- Chrome住宅二→三18920→18740，容量5→6、維護4→6；升五級8人/10文、沒有升級鈕。作坊二→三18200→17840，1.875→2.25倍/維護12→18；商鋪二→三17840→17570、員工3→4、服務10→8秒/維護8→12。
- 控制頁相同4工匠6.5秒二級未完成、三級1陶器；相同2店員20秒二級5售、三級6售。公設能力bindings與所有圖錄級數已用節點測試核對。
- README新增共用五級能力表並校正歷史版本容量敘述。僅新增測試HTML與文件，未再改上一階段通過229項的runtime。
- 下一獨立階段C25整體幸福度/宜居：先讀ledger契約，再整合已存在水/衛生/健康/教育/污染/園景/就業/供貨/稅率的可解釋指標與實際生活結果，不能僅新顯示數字。所有O/U/E及最後四領域複評保留，全100完成後才部署。

## 新階段起點：C25民生滿意
- 基準efbead7。住房20/就業15/採買15/服務25/環境25加權0–100，保留分項原因；住宅需求使用共同滿意分數一次，取代原先各服務直接需求加減。
- 低於65連續600秒進入遷出候選，改善即清除，沿用每人口評估最多一人；hardship.dissatisfied可選保存。待因果測試、既有契約回歸與Chrome。

## C25核心回歸交接
- 共用滿意門檻原放wellbeing.js導致某些入口循環依賴TDZ，已移至不依賴其他模組的wellbeing-rules.js。新遷入測試也補上實際公共道路，原失敗是測試城未接外路。
- 下一收尾階段須聚焦測試成功後才跑全套，再做Chrome個人展開分項/改善服務/取消低滿意倒數。舊pollution/garden直接demandModifier已移除，服務只透過滿意度進入住宅需求。

## 最新交接：C25核心完成、瀏覽器收尾待驗（2026-09-16）
- 工作樹基於efbead7，尚未commit；41 verified / 6 implemented / 53 open。41/41聚焦、235/235全套、build通過，evidence/wellbeing。不要標記C25 verified，還缺UI證據、README與推送。
- wellbeing.js：各居民parts保留key/name/score/weight/reason。住房20（容量/住戶）、就業15（工作落成未受損且路可達）、採買15（needsSatisfiedUntil）、服務25、環境25。服務=供水40+衛生20+健康20+醫療10+教育5+巡守5；醫療健康100代表無需照護，否則須assigned。環境clamp(80-pollution*.8+garden)。空城中立50。
- 報告avg與managed demandModifier=round((avg-50)*.6)；cityDemand只套此共同服務分數，不再重複加water/hygiene/pollution/garden modifiers，稅率與基本住房/工作壓力仍獨立。garden平均仍參與有限targetPopulation。
- GRACE.dissatisfied=600，閾值65放leaf wellbeing-rules.js避循環初始化。tickPopulation每15秒，低於65累加，>=65清0；600秒可遷出且每census至多1人。與其他住房/就業/供貨hardship共享流程。save-schema hardship.dissatisfied optional0..600，舊檔從0累加。
- 個人卡新增details，summary顯示滿意分數，展開有五分項分數/權重/原因；不要把所有文字塞person-action。finance-summary顯示全城滿意與低分人數。
- 已刪pollutionReport/gardenReport的舊demandModifier避免假修正值；同步相關tests與pollution-harness文字。舊README還有直接扣30與園景加需求等敘述，下一階段必須更新為納入共用滿意分數。
- 固定情境：乾淨有住家/工作/日用品、無水服務=50、環境80→總82.5；home.waste40、pollution100→57.5。600秒在其他三項hardship均0時確實遷出；585秒補水提升至67.5，下一census清倒數且不遷出。相同人口/職缺/供水，較好滿意在15秒有新住戶、不良組仍2人。
- 初次回歸揭露WELLBEING_GRACE循環TDZ與新移入fixture缺公共道路，已修，initial-regression.txt保留。不要改變import順序掩蓋TDZ，leaf已解決。
- 下一階段建立wellbeing-harness：兩固定不良城先推進39次census到585秒，一座補井一座不補，下一census對照遷出/倒數清除；個人details在真三維卡展開、總覽分數讀回，存隔離鍵避免動正式存檔。完成後README/evidence/ledger/handoff、commit/push。
- 原100與最終四領域複評範圍不變，未部署；C25之後接O/U/E待辦，需要從ledger選下一 bounded milestone。

## 使用者追加：升級外觀再誇張與重置鍵
- 基準 efbead7；保留未提交 C25 工作樹，這個有界階段只改外觀、級數說明與驗證。C25 的最新需求中立基準已改為65（不是舊交接的50），41聚焦/235全套/build通過，尚待UI收尾。
- 追加金邊寬簷、分級牌樓與高階連廊；確認既有重置確認/復原流程。百項總目標保持，未達發布門檻不得部署。

## 外觀追加里程碑完成
- evidence/grand-tiers：三級金邊雙重牌樓、四級雙塔連廊、五級三重金瓦牌樓及金柱冠球。既有外觀聚焦3/3、build、Chrome同視角比較通過。
- 重置取消1棟16人；確認0棟0人；重新整理再由存檔管理救回1棟16人。未碰正式存檔、未部署。C25未提交改動保留；下一階段回C25 UI及README收尾，不可將百項標完成。

## 最新交接：C25民生滿意完成（2026-09-16）
- 42 verified / 5 implemented / 53 open。五分項及共同需求/遷出規則已驗證，完整城市領域C01–C25通過各自驗收，並非整個百項完成。
- 校正舊交接：空城中立65；round((average-65)*.6)。控制低57.5修正-4，補水67.5修正+2；39次到585，再一次未改善遷出1/改善保留2倒數0。真三維正常污染衰減後68.4，個人卡與總覽一致。
- 41聚焦/235全套/build已通過；本階段只補Chrome與文件。evidence/wellbeing。外觀追加已獨立提交e863a14，本C25收尾另提交。
- 下一階段由ledger選O/U/E待辦；保留全部100項與最後四專家複評後部署條件。未部署。

## 新階段：U01/U02/U03/U19 鍵盤與取消
- 基準3ccf3b1；加入可聚焦場景、格點游標、Enter提交、探索平移，滑鼠與鍵盤共用提交。快捷鍵僅場景焦點生效，提供可見取消按鈕。驗證包含邊界/非法放置、原生按鈕Space及真瀏覽器純鍵盤營造。

## 最新交接：U01/U02/U03/U19鍵盤與取消完成（2026-09-16）
- 46 verified / 5 implemented / 49 open。9聚焦/238全套/build、Chrome鍵盤移2格Enter建屋、占地阻擋不扣款、Esc及390×844取消、Tab+Space開圖錄且不切暫停已驗證。evidence/keyboard。
- src/scene-keyboard.js純輸入路由和stepCursor；場景外快捷鍵不攔截。canvas tabindex0+描述，主畫面入口與取消鈕。Enter/Space重複keydown不反覆提交；方向鍵/WASD在營造移格，探索pan，界限保留。
- main原pointerup提交提取submitPlan供滑鼠與鍵盤共用。焦點模式鍵盤移格scene.focusAt，選圖錄/road/搬移後focusScene；pointerdown切回滑鼠控制。cancelBuild清drag/down/pinned/hovered、探索、預覽，僅UI不改城。
- 已完成C25提交3ccf3b1。未部署；仍須O01–25、其餘U及E開放項和最後四專家複評。
- 下一獨立階段建議U04/U05：觸控多指取消草稿、單指抬起先預覽/確認/取消，再與鍵盤共享commit。需先查pointerdown/move/up與OrbitControls觸控機制；不可把手機尺寸測試當實機多指驗證。亦須處理取消後pointerup不得提交。

## 新階段U04/U05觸控草稿
- 基準00cca8f。PointerGesture追蹤主指標及多指封鎖，全部抬起前不得重啟；touch/pen抬起保留草稿，方向鈕微調、確認時重新驗證再共用submitPlan。桌面可選同一預覽模式。待因果測試及瀏覽器驗收。

## 最新交接：U04/U05觸控草稿完成（2026-09-16）
- 48 verified / 5 implemented / 47 open。13聚焦/242全套/build、Chrome觸控事件兩種抬指順序零新增、單指草稿微調/取消/確認及390×844版面通過。evidence/touch-plans。
- PointerGesture primary/active/blocked：第二指加入封鎖至所有抬起；cancel保留active以擋晚到up；lostcapture若已正常end則無效。canvas所有主鍵指標capture，保留OrbitControls雙指縮放。
- main pendingPlan暫存占地，touch/pen或勾precise-build的mouse在up後預覽，方向鈕或鍵盤箭頭微調，confirmPendingPlan重新canPlan再submitPlan。確認完成清pending並更新keyboardCursor，阻止重複確認；模式切換/失焦/隱藏取消。
- 待確認隱藏舊scene-instructions，完成後不用舊金庫提示。手機CSS :has待確認時隱藏view-controls避免遮字，取消/完成自動恢復。
- CUA的CDP.send允許Input.dispatchTouchEvent，已查官方protocol JSON參數。可在專用隔離頁以已見空地座標發touchStart/touchMove/touchEnd；touchMove保留單一touchPoint會釋放另一指。測試不是實機人工手勢，切勿混稱。
- 下一獨立階段U06/U07：統一營造預覽的禁止原因及實際合建名稱/格數/棟數，需對照Town.place/dragCells/DESIGNS sizes及四格自動轉換；目前canPlan只回布林及generic原因，仍有待修。
- 仍未部署，O01–25及其餘U/E全部保留，最後四領域複評條件不變。

## 新階段U06/U07可解釋營造預覽
- 基準4df516e。placementIssue共用占地檢查，constructionPlan共用名稱與四格轉型；previewPlan說明障礙/費用/名稱/格數/棟數。園景合併抽出gardenMergeGroups供真合併與預測共同使用。待完整回歸，特別檢查Town.place資料契約與存檔。

## 最新交接：U06/U07營造預覽完成（2026-09-16）
- 50 verified / 5 implemented / 45 open。11聚焦/247全套/build與Chrome同張雅居圖樣斜拉1座四合雅宅、直拉4棟雅居及障礙文字均通過。evidence/plan-preview。
- grid-rules TYPES/bounds純常數；simulation保留re-export，避免變動其他import。construction-plan placementIssue共用canPlace與預覽；constructionPlan依nextId先產實際name/design/footprint，Town.place採同規格再扣款建資料。
- heritage.gardenMergeGroups抽出原合併次序；urban.mergeGardens與previewPlan共用，三舊花園+一新格可預告合併。road preview用publicSquares預告新增廣場。
- main.canPlan現在更新文字/符號/具體障礙座標/名稱/格數/棟數/費用；submitPlan先驗canPlan後才editTown，避免紅框仍提交。未改存檔格式。
- Chrome08:02暫停、空城：方形4格1棟2400→1920，直線4格4棟總1→5／1920→1440；已有屋/道路/四格越界能讀確切座標，禁止Enter不扣款。全部storage-test，未部署。
- 下一獨立階段U08/U09/U10/U11：可搜尋城市物件清單與小卡焦點/關閉（切實體、局部數字更新勿破壞focus/scroll）。需先查inspectorContent與renderInspector，保留hover不搶焦點。O01–25及其餘U/E與四專家最後複評仍待。

## 新階段U08/U09/U10/U11城市物件與小卡焦點
- 基準da5962f。城市清單提供名稱/類型/編號搜尋與ID選取；小卡內容改patchPanel保留互動DOM及scroll，外層保留關閉鈕；只有明確選取才focusHeading。待單元/Chrome動態焦點與手機關閉驗證。

## 最新交接：U08/U09/U10/U11完成
- 54 verified / 5 implemented / 41 open。4聚焦、249全套、build通過；城市清單精確ID選取、20次DOM更新及重排、真城市11:30→12:43焦點和scroll保留、390×844關閉返回均驗證。evidence/city-directory。
- DOM證據應使用disableDiffing:true，否則第二次快照可能只留「無變化」，本次已重存完整person/journal/harness證據。
- 下一有界階段U12–U17：dialog名稱、選取範圍、手機遮擋/尺寸/對比；先查逐項契約。手機小卡下半部目前被底部工具列遮住，需修正。
- 原百項及四專家最終複評目標保持，尚未部署。

## 新階段U12/U13名稱與選取範圍
- 基準42dc8d7。先完成所有dialog標題綁定及實際建築占地框線；後續U14–U17版面另作有界階段。單屋框線改共用urban.footprint，cache含建築ID與占地，避免同街坊切換或擴建仍沿用舊框。

## 最新交接：U12/U13完成
- 56 verified / 5 implemented / 39 open。6聚焦/249全套/build通過。五個缺名dialog逐一UI開啟保存AX，16個標題唯一參照讀回；單屋框、同街坊切換、四格框及拆除鄰屋保留通過。evidence/selection-dialogs。
- U14–U17尚未修改。建議短螢幕小卡用全畫面可捲動層並抬高z-index，關閉sticky且不被底工具列遮擋；提高字級/不透明紙底與對比、44px觸控鍵。必驗600×390、390×600與200%文字放大、對比實算及問號/縮放/暫停/倍率各鍵。
- Browser fill空字串曾未清空search，需實際getAX核對；native Cmd+A BackSpace已清空。單次CDP導航後timeout可取新AX再操作，不盲目重啟。
- 未部署，全部100項及四領域最後複評仍未完成。

## 最新交接：U14–U17完成
- 60 verified / 5 implemented / 35 open。9聚焦/249全套/build通過；evidence/readable-ui保存短視窗、200%字級、對比及獨立按鈕UI證據。未部署。
- readable-ui.css於style.css後匯入；原font-size/font shorthand px改rem並最低.75rem，正文.875rem。保留Chrome預設root20px，200% root40px；不改存檔。
- compactUI判定width<=850或height<=700或large-text；工具折疊、aside獨立全畫面，關閉sticky，背景controls visibilityhidden。mode-hint在extra-tools外且is-building時顯示，cancel-build在compact-actions。
- 不可用body.dataset.mode：既有querySelectorAll(data-mode)會把body當營造按鈕，導致冒泡點擊執行setMode；已改is-building class，實際驗證展開/收合與預覽。
- Chrome viewport set390×600實際355×545；以429×660與660×429校準到390×600/600×390，務必讀innerWidth/Height；已reset。瀏覽器DOM沙盒沒有checkVisibility，改逐祖先computedStyle display/visibility/opacity。
- 對比最低日/夜/說明5.64，圖錄4.79，小卡6.13。以opaque祖先底色計算，排除裝飾題字/停用鈕，沒有低於4.5的採樣。
- 下一階段建議U18、U20–U25仍依ledger驗收，不能因本次CSS可能改善而提前標完成。U23原.top-actions .quiet#concepts-btn仍有高specificity display:none，須明確加可見入口。O01–25及E開放與5待補驗亦保留，最後四領域複評後部署。
- 全畫面小卡僅明確點選/清單選取才出現；compactUI抑制hover預覽，避免移鼠即遮住全城。桌面一般尺寸保留hover。

## 新階段U21–U25操作狀態
- 基準0d004d3。施工role/value與visible百分比、貨物aria-pressed/controls、手機工具中的概念畫卷、暫停aria-pressed、session30則通知回看。U18與U20場景層待下階段。

## 使用者要求暫停（不再驗收）
- 最新指令：先暫停，不要再驗收；待明確繼續才恢復。不得把此狀態當技術blocked或目標完成。
- HEAD0d004d3已推送；帳本仍60 verified /5 implemented /35 open。U21–U25有未提交修改：notices.js、operation-state.test.js、content-html/main/index/readable-ui及evidence/operation-state。5聚焦通過，新階段未做全套/build、未全部UI驗收，不得標通過。
- 手機390×600畫卷開關、主動暫停true/時鐘10:43保留，證據mobile-gallery及pause-gallery已存。fixture v8暫停下於0,0建柳蔭人家21；再次Enter出現具體占地失敗原因，尚未保存歷時通知證據。清單搜尋施工中只一筆；尚未點入確認progress。貨物選取亦未補UI證據。
- 若續作先查工作樹，無須重作已完成60項。停止時已reset瀏覽器viewport，恢復原始尺寸。

## 最新交接：使用者繼續，U21–U25收尾（2026-09-16）
- 使用者已明確說「繼續」，先前暫停解除。部署策略改成一批修改、一次重點檢查、部署、一次正式讀回。
- 本批U21–25已完成；65 verified /5 implemented /30 open。5聚焦與build通過，Chrome施工/貨物切換及篩選/通知延遲回看及修正位置/保留暫停；沿用未變的手機畫卷既有證據。沒有重跑全站驗收。
- 新增lot詳細標題關聯及空篩選文字；時間狀態只變動時寫DOM，明示主動暫停與閱讀暫停。
- 下一個有界階段：U18減少動態、U20場景用途標籤；之後O01–25及E18–20，保留E01–04/E21待補驗與最終四領域複評。不得把本批部署說成百項完成。

## 立即交接：U18/U20已實作，瀏覽器連線待恢復
- 基準e68a4da；上一階段操作狀態部署成功：https://ba7eadef.bianshui-town.pages.dev，正式站讀回相符，evidence/release-e68a4da。
- 本輪新增view-preferences.js與building-labels.js。系統動態偏好auto/reduce/full，獨立localStorage鍵，不改城鎮存檔；減少動態停止雨線、裝飾與人物肢體擺動，禁用OrbitControls慣性，follow僅定位一次，核心行走與時間不變。
- 畫面設定提供四類文字標籤，DOM跟隨3D建物投影，不攔截手勢，圖例可關。label高度依模型identity快取Box3，移除已拆建物。尚須畫面確認遮擋/堆疊與切換。
- 聚焦4/4、build與diff check通過；沒有全套重跑。本批尚未提交、未部署；ledger65 verified /7 implemented /28 open。
- CUA createBrowserTab以及接回getTab各30秒逾時並kernel reset；getState成功證明測試分頁610004139存在，URL http://127.0.0.1:5173/?fixture=v8&storage-test。不要再開同一測試或重啟服務。下一工作階段先讀browser-troubleshooting，或切原生Chrome AX檢視，勿直接把timeout當頁面失敗。
- 下一步只補U18系統reduce及手動override、U20混合街坊標籤開關與佈局。若通過，再更新ledger/README、commit/push並部署一次。其後進八角遊戲化O01–25及E18–20，保留E01–04/E21待補驗，百項仍未完成。

## 最新交接：U18/U20完成
- 67 verified /5 implemented /28 open，UX全25項完成。4聚焦、build及Chrome系統reduce/手動選項/標籤開關與混合街坊實景通過，evidence/view-preferences。
- 原生Chrome AX能用；先選到測試分頁後CDP也恢復，可用setEmulatedMedia且已clear。不得再把前一段逾時當未解阻礙。
- 開標籤時body.labels-visible收合extra-tools，tools-toggle仍可開；修正圖例top160避免壓住品牌。localStorage獨立bianshui-view-preferences-v1不動城鎮檔。
- 下一個獨立工作階段進八角遊戲化，優先O01/O02/O03/O23/O24/O25願景與引導底座。全部O01–25仍open；工程E18–20待實作，E01–04/E21待補驗。不得把全UX完成當全部100項完成。

## 最新交接：城鎮旅程底座完成（2026-09-16）
- 本批 O01/O02/O03/O23/O24 verified；72 verified /5 implemented /23 open。尚有28項未完成，百項目標持續；O25階段結語未完成。
- journey.js / journey-ui.js：三願景各兩個真實條件、可略過重開的四步引導、三類唯一紀念章、可關閉再開啟挑戰、兩個明示等待條件的短程目標。
- journey為版本9存檔的可選欄位，內部version1；舊檔沿用constructor預設。變更先驗證與持久化，失敗不發布。挑戰與財政managed/sandbox分開，預設關閉，不封鎖原有建造及閱讀。
- 7個旅程聚焦測試通過，包括空鎮真實施工與入住走完四步；加入最後一個案例前全套262/262與build通過。Chrome確認文風切換、主動居民觀察後4/4、唯一領章、關閉後保留進度。證據evidence/journey-foundation。
- 本階段只部署一次並正式讀回，不重跑全面UI驗收。下一獨立里程碑O04–O06居民具名委託、替代選擇與無懲罰撤回。其餘O、E18–20及E01–04/E21待補驗與四領域最終複評保留。

## 最新交接：O04–O06居民委託完成（2026-09-16）
- 上輪ca25cdb已部署，正式站首頁/JS/CSS相符，evidence/release-ca25cdb。該輪分類為progress。
- 本輪75 verified /5 implemented /20 open。新增commissions.js，具名居民需求、茶坊或園景兩解法、婉拒/撤回/重接及居民卡回應。實際住處六格直線範圍（以建築中心）、道路可達、落成且未受損；garden排除公設與說書棚，兩案明示於UI。
- 可選journey.commissions，最多64份、一名居民一份，完成歷史保留姓名/場所名稱/ID/elapsed，不要求歷史對象仍存在。離鎮active顯示暫停，可放下。commitJourney先持久化再發布；無金錢或倒數懲罰。
- 56聚焦、270全套、build成功；Chrome婉拒→茶坊未達disabled→放下→園景完成→居民卡感謝→回到同份委託。evidence/commissions；測試分頁關閉。
- 下一個獨立階段O07–O09：自願升級條件、營造生活預覽與改建成果對照。仍有O10–22/O25及E18–20未實作，E01–04/E21待補驗；最後四領域複評未做。百項goal保持active，不把本批當全案完成。

## 最新交接：O07–O09建築成長完成（2026-09-16）
- 上輪ff09432部署https://1bcd6d7f.bianshui-town.pages.dev並正式讀回一致，屬progress；evidence/release-ff09432。
- 本輪78 verified /5 implemented /17 open。building-life.js共用居民動作/預覽，upgradeUse要求managed＋challenge才生效，住戶/到場工人/園景停留/既有服務報告；sandbox自由升級。
- recordConstruction在main applyUrban交易內、persist前執行，只記結構改變；undo傳record:false。journey.construction可選，at/targets/label/before，前後只比較涉及建物，活動最多32類。歷史target可被拆除，不驗目前存在。
- 6個新案例，聚焦20/20。新增最後茶坊/供水案例前275全套；之後只精準化零人措辭及移除orphan import，聚焦與build通過。Chrome茶坊/書院預覽、自由升級、0→0對照、managed挑戰阻擋未使用園景；evidence/building-life。
- 下個有界階段O10–O12：城鎮命名、建物命名、地點書籤。其餘O13–22/O25、工程E18–20及E01–04/E21待補驗，最終四領域複評仍保留。完整goal active。

## 最新交接：O10–O12私房地圖完成（2026-09-16）
- 上輪6da6ced部署https://5c82315f.bianshui-town.pages.dev並讀回相符，evidence/release-6da6ced，分類progress。
- 本輪81 verified /5 implemented /14 open。place-identity(.js/-ui.js)提供townName、建物name+originalName、bookmarks最多16份，名稱1–24字，空白/過長/控制字元拒絕。journey可選townName/bookmarks；building可選originalName，仍version9。
- 城鎮名概況/成果卡回顯，品牌不改。建物改名經applyUrban(record:false)交易，活躍目的地文字同步，不改歷史日記。升級/移動保留name，原型originalName跟隨升級；園景合併保留主ID名，其餘書籤明示失效。
- 66聚焦、282全套通過；之後手機CSS修正最長名稱擠壓與圖層遮擋，最終build成功，mobile.png。Chrome兩書籤各別跳轉、移除一筆保留另一筆、拆除後失效，names.txt居民目的地新名。測試頁關閉、viewport還原。
- 下個有界階段O13–O16文化收藏：主動閱讀、地景配對、個人心得、三篇策展。O17–22/O25、E18–20與E01–04/E21待補驗、最終四領域複評仍待。完整goal active。
