# 最終 UX 與無障礙複評

- 審查日期：2026-09-16。
- 審查 HEAD：`4f47c4a`；指定 production 基準：`8758181`。本輪沒有重新開啟正式站，不把本機證據視為正式站逐項重驗。
- 範圍：原 `ux.md` 尺度、`ux.json` U01–U25，以及 ledger 所列實作與證據；沒有改程式或 ledger。
- 結論：**25 PASS／0 NEEDS_WORK／0 EVIDENCE_GAP；UX 有界修正可放行。** PASS 表示既定修正契約獲原碼、測試與既有 Chrome 證據支持，不表示真人讀屏或實體手機認證。

## 評分（沿用原規準）

| 面向 | 原分 | 複評 0–5 | 理由 |
|---|---:|---:|---|
| 城市資訊辨識 | 2 | 4 | 全鎮搜尋清單、實體選取及四類用途標籤已具備。 |
| 營造操作與預覽 | 2 | 4 | 共用規則揭露實際產物與障礙；觸控保留草稿、可微調、明確確認。 |
| 鍵盤與輔助技術 | 1 | 4 | 場景專屬快捷鍵、鍵盤營造、清單替代及 AX 名稱／狀態可查。 |
| 手機與短螢幕 | 2 | 4 | 390×600、600×390 閱讀面板與管理操作有證據；主要控制為 44px。 |
| 焦點與面板 | 2 | 4 | 小卡節點保留、標題焦點、直接關閉及對話框名稱完整。 |
| 視覺可讀與回饋 | 2 | 4 | 字級、紙底對比、200%文字、減少動態、通知回看完成。 |

六面向等權：**24/30，換算 80/100**。原分 11/30。原規準的 5 分要求實際跨裝置與輔助技術證據；現有 Chrome 模擬及 AX 樹不滿足該門檻，因此不給滿分。

## 逐項判定

證據路徑均相對專案根目錄；同組 README 用於理解操作順序，另核對原碼及原始輸出，不以 ledger 的 verified 作結論。

| ID | 判定 | 核對結果與主要證據 |
|---|---|---|
| U01 | PASS | `sceneCommand` 限定 canvas；兩次移格、Enter 共用提交、Esc 取消有 keyboard 組紀錄，現行聚焦測試通過。 |
| U02 | PASS | `TownScene.pan` 四向平移保留鏡頭 offset 且限制邊界；`tests/scene-keyboard.test.js` 與 keyboard/README 四向操作紀錄一致。 |
| U03 | PASS | 非 canvas target 完全不攔截 Space；`native-space-open.txt` 焦點在關閉圖錄，README 保留原暫停狀態；原生控制聚焦測試通過。 |
| U04 | PASS | `PointerGesture` 多指封鎖直到全放開；pointerup 非 owner 不提交。兩種抬指順序、第三指與取消聚焦測試及 pinch-first-up/second-up 紀錄支持零新增。 |
| U05 | PASS | 抬指形成 pendingPlan，微調不變形、確認重新驗證並清空草稿；`touch-plans/mobile-preview.png` 實見微調／確認控制，mobile-confirmed 紀錄支持提交一次。 |
| U06 | PASS | `previewPlan` 與 canPlan 提供文字障礙，提交前再次驗證；現行測試區分建築、道路、越界、形狀、金庫不足；operation-state/construction AX 實見座標及已有屋名。 |
| U07 | PASS | 親讀 square-preview.png：四合雅宅、4格、1棟；line-preview.png：雅居小樓、4格、4棟。現行全圖錄預覽與 place 比對測試通過。 |
| U08 | PASS | `cityEntries` 收集全部建築／居民，支援類型及 ID 查詢；person-keyboard.txt 顯示李小滿與 person-name 焦點；清單選取導向對應小卡。 |
| U09 | PASS | `patchPanel` 依管理動作／建築與居民 ID 保留節點及 scrollTop；live-focus.json 11:30→12:43 同升級按鈕、scrollTop 599.09 不變。 |
| U10 | PASS | `closeInspector` 清除 pinned／hovered／跟隨／選框並回 canvas；手機關閉證據與固定關閉按鈕相符。 |
| U11 | PASS | 明確選取呼叫 focusInspector；hover 不呼叫。person-keyboard.txt 焦點 person-name，journal-focus.txt 焦點 life-heading。 |
| U12 | PASS | 原五個 dialog 的 AX 證據有標題；本輪 HTMLParser 另查目前 22 個 dialog 均有唯一且存在的 aria-labelledby 目標，沒有缺名參照。動態作品標題開啟前更新。 |
| U13 | PASS | 使用 footprint 選實際一棟；selection-dialogs 保留單屋、鄰屋及四格截圖與只拆目標的文字結果，街坊資訊另置於小卡。 |
| U14 | PASS | `readable-ui.css` 短視窗為 inset 8px 可捲動面板；親讀 600x390-actions.png，管理及關閉可見；390×600 搬移取消及橫向升級證據支持可達。 |
| U15 | PASS | 核心標籤至少 .75rem，正文 .875rem；200-percent-metrics.json 為 root40px／正文35px、scrollWidth=clientWidth=370、焦點升級按鈕。 |
| U16 | PASS | 紙底不透明，文字色覆寫；day/night/help/blueprint/card 有 computedStyle 與比值資料，所列最低 5.64／5.64／5.64／4.79／6.13，皆達 4.5。 |
| U17 | PASS | 常用控制 CSS 至少44×44；touch-targets.json 各中心命中自身，約43.991px是瀏覽器縮放小數值；control-actions.json 與縮放圖提供獨立操作證據。限 Chrome 手機尺寸。 |
| U18 | PASS | 系統 reduce 與覆寫策略、一次定位後停止平滑跟隨、停雨線及裝飾動作有實作；本輪 view-preferences 測試通過；system-reduce.txt 有系統模式回顯。 |
| U19 | PASS | 可見取消與 Esc 共用 cancelBuild，setMode 清草稿／預覽，無 editTown；keyboard 手機道路取消及 readable-ui 搬移取消證據支持無資料改動。 |
| U20 | PASS | `BuildingLabels` 建立隨鏡頭投影的四類文字標籤；親讀 labels-on.png 混合用途可辨識，labels-off 證據及可切換程式支持隱藏。 |
| U21 | PASS | `constructionProgress` 有具名 progressbar、0–100 數值且 aria-live=off；construction.txt 真實 AX progress indicator 0 與文字百分比。 |
| U22 | PASS | `renderLot` 統一 aria-pressed，篩選後重新挑有效貨物；cargo-keyboard.txt #11木材唯一選中，cargo-filter.txt #10泥料與詳細標題一致。 |
| U23 | PASS | gallery-entry 綁同一開啟函式；mobile-gallery 圖及 pause-gallery.json 的390×600前後狀態、返回 gallery-entry 焦點支持手機開關。 |
| U24 | PASS | syncPauseButton 分開使用者暫停與閱讀暫停，pressed 反映前者；pause-gallery.json 開關視窗後維持 true 及相同時間。 |
| U25 | PASS | toast 進 NoticeHistory，上限30則且無5秒刪除；notices-after-delay.txt 仍有失敗座標／屋名，corrected-location 紀錄支持移格後成功。 |

## 本輪驗證與限制

- ledger 的 U 項引用共 **86 個相異證據檔**，本輪確認全部存在且非空；不是把檔案存在當作驗收，另核對上表所列重點內容。
- 執行 `node --test tests/scene-keyboard.test.js tests/pointer-gesture.test.js tests/plan-preview.test.js tests/view-preferences.test.js`：**16/16 通過**，無跳過。
- 本輪未跑全套、build、瀏覽器或正式站；依分工由根代理負責正式站讀回。
- 早期部分 `.txt` 僅儲存 AX 差異，單檔不能獨立重建完整畫面。例如 square-preview.txt 沒有完整預覽文案，因此 U07 同時核對兩張預覽截圖與當前預覽／實際營造比對測試。
- 既有證據跨多個修正里程碑，不能宣稱每張截圖來自 HEAD 或目前 production；本輪以最新原碼與聚焦測試核對功能未撤回。部署資產一致性與正式 UI 確認須由根代理提供。
- 無實體 iOS／Android、真人 VoiceOver／NVDA 聽讀；AX 可及樹證據支持名稱與狀態，不等同真人輔助技術體驗驗收。
- 未發現 U01–U25 契約內必須阻止放行的具體缺陷；上述證據邊界須保留於最終交付，不能把 25 PASS 寫成所有裝置與輔助技術全部通過。
