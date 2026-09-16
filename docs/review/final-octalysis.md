# 八角遊戲化最終評量：O01–O25

- 日期：2026-09-16。
- 審查 HEAD：`4f47c4ab8058c0594c8eb3c967cdb5eb9a44dcdc`；根代理提供 production 基準 `8758181`，本代理未獨立回讀正式站。
- 採八角遊戲化觀點的 AI 審查，非 Yu-kai Chou 本人或官方認證。依本專案 `octalysis.md` 自訂強度規準，沒有另創品質總分。
- 契約：逐項核對 `octalysis.json` 的 acceptance；ledger 的 verified 僅作索引，未當作完成證據。
- 結論：**24 PASS、1 NEEDS_WORK、0 EVIDENCE_GAP；O17 修正前不放行「25 項全數完成」的聲明。** PASS 指指定行為有原碼、聚焦測試及已有操作證據支持，不等於本代理重新操作 UI、真人好玩度驗收或正式站驗收。

## 本輪實際驗證

核讀九組功能模組、UI 接線、相關 save-schema、九支測試，以及 ledger 指定 evidence 中的 README、測試摘要與 UI 文字紀錄。歷史圖片確認檔案存在，但未以此冒稱本輪視覺驗收。未跑全套、build 或瀏覽器；未修改原碼或 ledger。

```sh
node --test tests/journey.test.js tests/commissions.test.js tests/building-life.test.js tests/place-identity.test.js tests/reading-collection.test.js tests/resident-relationships.test.js tests/council-exploration.test.js tests/story-history.test.js tests/journey-summary.test.js
```

本輪輸出：**tests 50 / pass 50 / fail 0**，約 609 ms。額外邊界重現發現 O17 的既有測試未覆蓋情境，見下節。

## 逐項判定

下表路徑均以專案根目錄為準；測試列指本輪已重新執行的指定測試，UI 列指既有自動瀏覽器紀錄。

| ID | 判定 | 驗收核對與證據 |
|---|---|---|
| O01 | PASS | `journey.js:visionConditions/chooseVision`：安居有住宅及居民兩條，文風改為文化地景及落筆；切換只改 vision。`journey.test.js` 第一案；`evidence/journey-foundation/browser.txt` 顯示文風實際條件。 |
| O02 | PASS | `refreshGuide/inspectResident/reviewJourney/setGuide` 明確四階段，等待不替代居民卡觀察，可略過再開。`journey.test.js` 狀態案及真實空 Town 四步案；browser.txt 的 4／4。空城端到端測試使用沙盒 Town，並非城市經營全部前置需求的 UX 驗收。 |
| O03 | PASS | `milestones/claimMilestone` 三類條件及 locked/ready/claimed 分離，領章只一次。`journey.test.js` 三類里程碑案例；browser.txt 同時顯示已完成及未達成。 |
| O04 | PASS | `commissions.js:respondCommission/commissionReply` 真實居民 ID、場所落成/距離/通路條件，婉拒不改財政，居民卡接線 `main.js`。`commissions.test.js`；`evidence/commissions/resident-card.txt` 顯示具名感謝。 |
| O05 | PASS | 茶坊與園景共用同一委託但不同 solution，測試各走接取、施工、完成；`commissionCards` 明列採用解法。`commissions.test.js` 前兩案；completed.txt 實際顯示園景案。茶坊案 UI 使用共用 render，既有操作紀錄未另外拍一輪茶坊完成。 |
| O06 | PASS | active→withdrawn→active，無到期或扣分；測試比較財政、建物、文集完全不變。`commissions.test.js` 撤回案；commissions/README.md 記錄 UI 婉拒、撤回及重接流程。 |
| O07 | PASS | `building-life.js:upgradeUse` 與 `urban.js:upgradeBuilding` 在城市經營＋引導挑戰時阻擋未使用建物，符合後可升；沙盒或關閉挑戰保留自由升級。`building-life.test.js` 前兩案；upgrade-gate.txt。目前兩開關的優先規則應保留說明，不能簡稱任何「挑戰開啟」都限制升級。 |
| O08 | PASS | 藍圖及真實 `Town.tick` 共用 `residentBuildingAction`，茶坊與書院活動不同；公設另明示服務非到場。`building-life.test.js` 藍圖及真實茶坊案例；blueprints.txt。 |
| O09 | PASS | `recordConstruction/useSnapshot/constructionHTML` 只比較變動建物的前後瞬間，不造因果；無人明示此刻尚無。`building-life.test.js` 對照及儲存失敗案；comparison.txt。此為瞬間快照，非到訪累計。 |
| O10 | PASS | `place-identity.js:renameTown` 拒絕空白/過長；`main.js:updateUI` 與成果對照回顯。`place-identity.test.js` 首案；names.txt 顯示柳岸小城。 |
| O11 | PASS | 建物 ID 定位及 originalName 保留，當前目的地 action 同步；另一茶坊不動。`place-identity.test.js` 兩茶坊案；names.txt 顯示建物與居民目的地同名。 |
| O12 | PASS | 書籤依 ID 各自增刪，搬移後定位新座標，拆除後失效且停用；`place-identity-ui.js` 跳轉接 focus。`place-identity.test.js` 雙書籤案；bookmarks.txt、demolished.txt。 |
| O13 | PASS | `markRead` 只由作品開啟接線呼叫，與 literati.collected 分離；同篇不重複。`reading-collection.test.js` 真實落筆案；author-entry.txt。印記明示僅開啟全文或節錄，未假稱讀完原作。 |
| O14 | PASS | `landscapeMatch` 查來源、落成及已讀，工坊不符可重試，池塘配小池通過並明示非史實原址。`reading-collection.test.js` 小池案；match-note.txt 提供另一路實際 UI 來源配對。 |
| O15 | PASS | 每篇獨立 note/landscape，400 字上限，textarea.value 與 HTML 跳脫；`reading-collection-ui.js:visit` 正確回顯。`reading-collection.test.js` 獨立筆記案；anthology.txt、reopened-note.txt。 |
| O16 | PASS | `curateAnthology` 強制三篇不同且已讀，可重編，`anthologyHTML` 顯標題/作品/地景。`reading-collection.test.js` 策展案；anthology.txt。 |
| O17 | **NEEDS_WORK** | 不重複累積及不衰退成立，但 active 說書的未到場居民會誤算「觀察說書」。`resident-relationships.js:5` 未查實際到場，違反以實際不同日常推進的契約；下節有獨立重現。既有六案仍全過。 |
| O18 | PASS | `watchResident/watchedResident` 以居民 ID 定位，移除單人不清掉另一人，離鎮停用且保留最後行程。`resident-relationships.test.js` 雙人及離鎮案；two-residents.txt、follow.txt、removed-one.txt。 |
| O19 | PASS | `council-exploration.js` 缺園景提出，採納後須落成且無損才完成，忽略不改財政。`council-exploration.test.js` 前兩案；journey-summary/council-complete.txt 實際拆除、採納、新建、回應流程。 |
| O20 | PASS | 世界 tick 不寫 seenStories；`main.js:130` 明確去街口才 observeStory，須 active 且有人到場。探索冊給天候/時段/場所線索。`council-exploration.test.js` 真實事件案；exploration-after-visit.txt。此項的到場檢查正確，與 O17 不同。 |
| O21 | PASS | `story-data.js` 依瓦舍/商鋪分兩支，`stories.js` 同時改變敘述與時長 28／12 遊戲秒，history 記原因。`story-history.test.js` 真實雙場地案；past-events.txt 顯示分支原因。 |
| O22 | PASS | history 最近24場，記實際 attendees，不補造舊檔人名；UI 明示已散場、補訪不重演。`story-history.test.js` 到場/界限案例；past-events.txt、revisit.txt。圖為通用地點示意，非當時畫面擷取。 |
| O23 | PASS | setJourneyMode 只切旅程開關，保留建物、領章、引導；原建造及閱讀入口不受此開關攔截。`journey.test.js` 開關案；mode-off.txt。城市經營模式與旅程模式是兩個維度。 |
| O24 | PASS | shortGoals 提供已有居民即時觀察與需施工的民居，先說明等待，不設現實期限。`journey.test.js` 目標/四步案例；browser.txt 顯示觀察已完成。空城仍須先迎接住戶，UI 已明說。 |
| O25 | PASS | `sessionSummary` 用唯一鍵且只計本次新增，反覆讀不寫資料；`main.js:97` 暫停且不重置。`journey-summary.test.js` 三案；recap.txt 各一筆、paused.txt 顯示已暫停。 |

## 必修：O17 未到場卻獲得說書日常印記

**嚴重度：medium。** `src/resident-relationships.js:5` 把 active 說書的所有 participants 都視為說書中，但 `src/stories.js:38–40` 允許集合時間到、只有部分居民到場時開演。其餘居民仍可能趕路。`observeResident` 第14行因此寫入錯誤日常，`familiarity` 第19行再增加熟識分數。這不是「重複點擊刷分」，而是活動種類判定不實。

以下是本輪實際執行的聚焦邊界重現：使用真實 Town 與事件引擎，人工安排一到場、一未到場的合法集合情境；**不是自然遊玩或瀏覽器錄影證據**。

```js
import {Town} from './src/simulation.js';
import {tickStories} from './src/stories.js';
import {residentActivity,observeResident,familiarity} from './src/resident-relationships.js';
const t=new Town(); t.demo();
for(let i=0;i<1000&&!t.stories.active;i++)t.tick(.05);
const e=t.stories.active;
const [a,b]=e.participants.map(id=>t.people.find(p=>p.id===id));
[a.x,a.z]=a.eventSlot; a.route=[];
b.x=b.eventSlot[0]+5; b.z=b.eventSlot[1];
b.route=[[b.x,b.z],b.eventSlot]; b.action='趕去聽一段說書';
t.elapsed=e.deadline; tickStories(t); observeResident(t,b.id);
console.log({phase:e.phase,action:b.action,
 distance:Math.hypot(b.x-b.eventSlot[0],b.z-b.eventSlot[1]),
 classification:residentActivity(t,b),seen:familiarity(t,b.id).seen});
```

實際輸出：`phase: active`、`action: 趕去聽一段說書`、`distance: 5`、`classification: story`、`seen: [story]`。

**必修建議：** 說書分類須確認該居民本人已到 eventSlot，與 stories 的到場公差一致；未到場交由原 travel 分支。補「一人到場、另一人仍在路上、集合期限到」測試，驗未到場者不獲 story、到場後才獲得，且重複觀察不加分。修後重跑 resident-relationships 與 story-history 聚焦測試；不要求為此重跑全部測試。

## 八核心驅力評分

沿用原規準：0 無機制、1–2 弱提示、3–4 可用但被動、5–6 玩家行動有持續回饋、7–8 多條有意義的自主回饋循環；9–10 須有多樣深度及實測支持。本輪均保留 **±2 分** 不確定性，不以測試數量換算遊戲樂趣。

| 驅力 | 基準→本輪 /10 | 判斷 |
|---|---:|---|
| CD1 使命與意義 | 3→6 | 三願景連到真實城鎮條件，文化配對能把讀文轉成地景辨識；目前仍以短清單為主，玩家是否產生個人使命未訪談。 |
| CD2 成長與成就 | 3→6 | 四步引導、唯一里程碑、使用門檻、選集與階段回顧成立；只有三枚核心里程碑，長期成長較淺。 |
| CD3 創意發揮與回饋 | 6→7 | 自由建造加上兩解委託、前後快照、個人心得與選集，行動及回饋多樣；比較只顯瞬間使用，難觀察長期成效。 |
| CD4 所有權與擁有 | 5→7 | 城鎮/地標命名、書籤、作品印記與自編選集形成個人作品感；收藏仍很容易靠逐篇開啟完成。 |
| CD5 社會影響與連結 | 3→5 | 具名委託、名冊、熟識與議事有回應，但委託高度同質，一個場所能滿足多人；O17 分類錯誤降低關係紀錄可信度。 |
| CD6 稀缺與迫切 | 2→2 | 時段天候形成輕度等待，短目標可自行選擇；沒有現實倒數或登入壓力。低分符合慢遊定位。 |
| CD7 未知與好奇 | 4→5 | 探索冊與場地分支增加追尋理由，歷史補訪支持探索；仍三類輪轉，分支主要為說書長短，未知內容深度有限。 |
| CD8 損失與避免 | 1→1 | 委託可撤回、事件可補訪、階段可停止，未增加錯失壓力。此分僅評 O 領域，不把另外的城市財政/災害整體算入。 |

**總評：可自主停留的文化城市沙盒已形成完整短循環，但尚不足以稱為深度關係或長期經營遊戲。** 不加總八分：CD6/CD8 高分不是本作目標。沒有玩家訪談、長期停留或反覆自願遊玩證據，不給9–10。

### 體驗優點

- 「建設—觀察—選擇—回顧」能走完，資料不是以同一計數冒充多套系統。
- 文化內容隨時可讀，讀訪、個人心得及來源配對分開，不把點開當閱讀理解。
- 無每日簽到、付費抽取、假人類排行或離線懲罰；可以明確結束本次觀察。

### 體驗限制與非阻擋建議

- `journey-ui.js:14` 將回顧、議事、探索、對照、最多八位居民委託放在願景與首輪引導前，面板較長。新玩家找到下一步的容易度仍須真人測試。
- 居民目前共用「街坊歇腳處」委託，熟識是分類計數而非個別故事；不要宣稱每位居民有獨特劇情。
- 兩種模式分開合理，但升級要同時開城市經營及引導挑戰；UI 文案應持續明確呈現這個條件。
- 多數既有 Chrome 紀錄是本機 `fixture=v8&storage-test`，有助驗證操作，不能代替 production 完整新手遊玩或存檔耐久驗收。

## 放行決定與下一步

目前 **NEEDS_WORK**：先修 O17、補邊界測試並完成短回查，方可把 O01–O25 宣稱全部完成。其餘24項在本次契約範圍內可放行；正式站與跨裝置驗收由根代理另列證據，不能由本報告代替。
