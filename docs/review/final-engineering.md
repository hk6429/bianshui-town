# 工程 E01–E25 最終獨立複評

日期：2026-09-16。評量原始基準 `a6a7504`；本輪檢視 HEAD `4f47c4a` 與已存在的未提交補驗檔。正式部署基準仍為 `8758181`，本報告不宣稱新版已發布。只寫本報告，沒有修改 source、ledger 或其他代理檔案。

## 判定

**依 engineering.json 原始接受條件：25 PASS、0 NEEDS_WORK、0 EVIDENCE_GAP。** PASS 表示指定缺陷／有界契約已有實作及相應證據，並非整體工程滿分、跨裝置驗收或真人驗收。E03 的原生檔案選擇器端到端補驗仍未完成，詳見下方；原始契約與後來加嚴的測試願望分開判定。

重新執行 12 個直接相關測試檔，**90/90 通過，0 失敗**；未跑全套、build 或新一輪瀏覽器。瀏覽器結論是核對已落盤的自動 Chrome 操作、輸出與測試頁原始碼，不是本人／使用者人工操作驗收。

## 沿用原 0–5 分規準

0＝未有可用能力；1＝核心流程存在但常見失敗無防護；2＝基本流程可用、資料邊界或故障復原不足；3＝主要失敗可處理且有聚焦測試；4＝有長時間、遷移與故障注入證據；5＝另具量化效能預算及持續回歸證據。

| 面向 | 原分 | 複評 | 理由及上限 |
|---|---:|---:|---|
| 存檔耐久與復原 | 1 | 4 | 壞檔、有效備份、重置重載、雙分頁／離頁均有證據；磁碟下載已存在，原生選檔及真跨裝置仍有限制。 |
| 資料驗證與完整性 | 1 | 4 | 白名單、巢狀結構、幾何／參照／ID、舊版遷移預算、100筆配置器及10000次流轉均有測試；未有普遍效能預算或 fuzz 持續回歸。 |
| 模擬一致性 | 2 | 3 | 真 Town 的30/60/120Hz及等量4×全快照一致；屬60秒有界證據，非長時間所有互動輸入重播。 |
| 編輯失敗保護 | 2 | 3 | detached transaction、15種操作／故障組合與整城快照復原；未有長時間隨機編輯／儲存失敗壓力。 |
| GPU與長時間資源 | 2 | 4 | 100次建拆／雨景／重置資源穩定，WebGL失效復原、67棟局部更新有證據；165–859ms含render更新不支持60fps，最終匿名program仍1。 |
| 安全與故障可見性 | 1 | 3 | 輸入與DOM雙防線、tick/render故障可見及安全匯出；不是全面安全稽核或跨硬體故障保證。 |

總分 **9/30 → 21/30**（原六面向等權加總）。項目修復通過率與成熟度分數是不同尺度；不能把25項PASS換算成5/5。

## 逐項核對

下表路徑皆相對專案根目錄。共用實作 `src/save-schema.js`、`src/save-store.js`、`src/save-ui.js`、`src/simulation.js` 均已檢視。

| ID | 判定 | 對照原契約的證據／限制 |
|---|---|---|
| E01 | PASS | `evidence/save-browser/flow.json`：26秒涵蓋兩次自動存檔、iframe離頁後原壞字串與backup不變；`rescue-file.json`及save-store測試證明救援原文。load阻擋、save拒寫鏈路存在。 |
| E02 | PASS | save-store僅decode成功的舊資料進backup；flow.json實際選上一有效版本還原人物／貨物／建築。主檔驗證／遷移例外在main進recovery阻擋；沒有獨立瀏覽器「有效schema但遷移throw」注入，該支由catch及儲存阻擋測試支持。 |
| E03 | PASS | 真save-ui匯出Blob → File/DataTransfer → 實際onchange → 預覽／確認；flow.json驗證建築人物economy相等、錯格式及version999拒絕且原城不動。另獨立讀取Downloads實檔：80964bytes、format=bianshui-save、v9、26建築／26居民／12貨物。`evidence/save-browser/disk-export.json`另具SHA256及正式decode→validate→restore後三群資料精確一致。原生chooser工具Not allowed，尚無磁碟檔原生選取或跨裝置實測；見專節。 |
| E04 | PASS | `evidence/peer-background/conflict.json`：真兩Chrome分頁A民居/B工坊各自保存分支，B衝突不覆寫；`after-close.json`為關閉B後sharedUnchanged=true且兩分支仍在。正式存檔UI另有r1/cross-tab。不是只有模擬storage。 |
| E05 | PASS | schema明確欄位白名單、cloneJSON拒絕保留鍵與存取器；save-schema測試tick／unexpected／constructor／JSON __proto__均拒絕。restore雖仍Object.assign，但輸入先完整白名單驗證及深複製，不能注入方法。 |
| E06 | PASS | schema逐版本必要life/stories/weather/economy/literati等，巢狀必填及列舉驗證；save-schema錯型別／缺欄／未知mode案例皆拒絕並含欄位路徑。 |
| E07 | PASS | 城市與貨物各命名空間unique及nextId上界比較；save-contracts實際新增100棟及住戶仍唯一並可restore，重複／低配置器測試拒絕。 |
| E08 | PASS | references驗占地邊界、重疊、街坊類型、四格方形及中心、道路重疊；save-schema含非法幾何及合法半格中心案例。 |
| E09 | PASS | 數值有限性、範圍、配方variant0–2、born時間等明確驗證；負time/speed、NaN/Infinity及variant999拒絕，time/elapsed/speed零值保留。 |
| E10 | PASS | 原文2MB、深度24、node300000、陣列／文字／route／lot上限；舊版cargo先合計至1024再遷移。save-schema的cargo1e9、超大people/route/原文均有界拒絕；未宣稱任意裝置毫秒級預算。 |
| E11 | PASS | cloneJSON深複製；save-contracts模擬100步、改人物屋名、轉貨及修改trail後，輸入整份快照deepEqual且trail不同參照。 |
| E12 | PASS | restore的rebuildRoads({preserveRoutes:true})；restore-continuity驗存讀整份快照與下一固定步一致，失效路線才修復。 |
| E13 | PASS | runtime固定0.05秒累積步進；runtime.test真Town於30/60/120Hz前景60秒及4×15秒完整toJSON相等；每幀最多計入0.25秒、4×20步。 |
| E14 | PASS | tick首行拒非有限、非正及大於60的dt，先於任何修改；restore-continuity驗NaN/±Infinity/負值/1e9均完全不變。 |
| E15 | PASS | `evidence/town-edit/undo-confirm.txt`明示回復日時、經過秒數及居民貨物一併回捲；town-edit測試搬屋後60秒整份恢復指定快照。這是明示整城回捲，非只撤銷建築。 |
| E16 | PASS | save-store持久reset key；save-contracts重置、新SaveStore、建屋及兩次自動存後仍deepEqual原城，r1/reset-restored提供實際UI重載及還原。 |
| E17 | PASS | editTown在detached Town上修改，驗證、prepare、persist後才發布；town-edit故障注入保持原模型／磁碟相等；main失敗重新同步原城，failed-edit.txt有可理解錯誤。 |
| E18 | PASS | disposeTree依資源身分辨共享／專屬並去重釋放；cycles-100.txt的100次樣本geometry154/texture5/program7穩定。disposed.txt幾何1101→0、紋理18→0，program10→1；不宣稱程序記憶體或所有GPU program歸零。 |
| E19 | PASS | context-recovery停止runtime、capture、10秒逾時提示、restore重建／resume；browser.txt真WEBGL_lose_context 11項含資料不變及恢復互動。逾時按鈕在該測試僅驗存在，不冒稱已點擊。 |
| E20 | PASS | scene.sync按建築簽章及道路／花草簽章更新；scene-sync/browser.json 67棟中其餘66棟identity不變、施工只換目標且道路未重建，共18檢查。更新含render約165–859ms，僅證明重建範圍縮小。 |
| E21 | PASS | runtime隱藏cancel、mute/onHide、回前景reset；peer-background/audio.json背景26877.6ms渲染0、整城不變、真AudioContext gain0、恢復第一幀dt0。音訊節點量測，不是真人聽覺評測。 |
| E22 | PASS | runtime頂層捕捉、永久停止不重試；RecoveryPoint保留已驗深快照、main故障後禁止save。recovery.test注入tick/render，evidence/recovery實際安全快照下載及重載。安全點間隔1秒，非逐幀無損復原。 |
| E23 | PASS | logistics-safety真transfer10000次，trail≤32、來源／製作／最新位置保留、trailOmitted正確、單貨JSON<1800字元且守恆。 |
| E24 | PASS | logistics-safety驗95只補1至96、96再進貨不變，boat cargo及imported/accounted一致；目前用剩餘容量限制。 |
| E25 | PASS | schema拒market.trades／lot.id惡意字串；content-html正式renderer完整跳脫文字與屬性。content-safety/browser.txt實際DOM img/script=0、事件屬性=0、惡意原文呈文字且合法資料正常。 |

## E03 判定邊界

原契約是「匯出再匯入保留建築、貨物與人物；錯格式及未支援版本回報原因且保持原城」。上述真實input handler往返已直接覆蓋，加上可攜下載檔已獨立確認存在，因此判PASS。不是用mock SaveStore替代應用匯入流程，也沒有把工具權限受阻說成產品缺陷。

但仍未完成**把磁碟上的同一檔案經原生檔案選擇器選回**；更沒有兩台裝置驗證。若最終發布另採「原生chooser全鏈」加嚴門檻，該額外門檻目前應列EVIDENCE_GAP，須補原生選檔成功輸出才能宣稱完成。現有測試匯入的是相同城市，未另外用先改成不同城市再匯入的UI場景；實際prepare／replace程式與測試可證資料替換路徑，但這個更強的視覺場景尚未驗證。

## 未阻擋原契約、仍須誠實保留的限制

1. 沒有所有裝置、瀏覽器、GPU驅動的覆蓋；所有Chrome結果均為自動操作／harness，不稱真人驗收。
2. 67棟一次更新含render達165–859ms，尚無60fps或互動延遲預算保證；原E20只要求identity保留與記錄耗時，故不倒扣成未修。
3. GPU完整卸載尚有1個未識別program；100輪循環穩定及幾何／紋理歸零已有證據，不能擴大為所有GPU資源完全歸零。
4. 存檔分支長期清理／容量策略不在25項契約，歷史branch累積仍應另立後續工作；現有quota失敗會回報，不支持永久無限儲存的說法。
5. 舊證據README中的「尚未完成」反映當時里程碑；E04/E21以peer-background最新證據為準，E03依上節保留工具限制。尚未用新版production回讀替代本機實作證據。

## 本輪可重播聚焦驗證

```sh
node --test tests/save-schema.test.js tests/save-store.test.js tests/restore-continuity.test.js tests/save-contracts.test.js tests/logistics-safety.test.js tests/runtime.test.js tests/town-edit.test.js tests/scene-resources.test.js tests/scene-sync.test.js tests/context-recovery.test.js tests/recovery.test.js tests/content-html.test.js
```

結果：90 tests、90 pass、0 fail，約1.50秒。原始本輪輸出 `/tmp/bianshui-final-engineering-tests.txt`；此暫存檔不算永久發布證據，命令及結果已納入本報告。獨立讀取Downloads/汴水小鎮.json亦已完成；未寫入或改動使用者存檔。
