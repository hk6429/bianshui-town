# C09／C10／O17 修正複評

日期：2026-09-16

## 結論

**C09 PASS、C10 PASS、O17 PASS。** 本次檢查指定三個原碼檔與對應測試的目前 git diff，依 `final-city.md` 與 `final-octalysis.md` 所列原契約複評。未發現仍阻擋這三項放行的缺陷；此結論不擴及全專案、正式站或真人操作驗收。

| 項目 | 判定 | 修正與直接證據 |
|---|---|---|
| C09 人力模式邊界 | PASS | `tickProduction` 僅 managed 乘上 `staffingRatio`；sandbox 乘數為 1，既有 `presentWorkers` 至少一人門檻保留。聚焦測試確認 managed 四人產量高於一人、零人不生產也不耗料；sandbox 一人與四人產量相同、零人不生產。 |
| C10 居民消費模式邊界 | PASS | `residentPurchase` 在非 managed 模式立即回傳 false，早於庫存、交易及居民需求狀態寫入。managed 消費與防重複測試通過；sandbox 測試比對完整序列化狀態，確認沒有副作用。`shopIsOpen`、`sellAtShop` 及遊客流程未被此 diff 改寫；另以真實 `tickLife` 在兩模式各驗證無店員不成交、到場恢復成交、離場重新關店，皆通過。 |
| O17 到場才記錄說書 | PASS | `residentActivity` 同時要求 active、story、參與名單、eventSlot，以及距離小於 0.1，與 `stories.js` 實際到場公差一致。真實事件引擎測試重現一人到場、另一人在路上、集合期限到；未到者僅記 travel，到場後才記 story。既有重複觀察不加分及活動歷史測試也通過。 |

## 執行證據

根代理既有輸出已回讀：`/tmp/review-fix-red.txt` 為 15 tests／11 pass／4 fail；`/tmp/review-fix-green.txt` 為 15 tests／15 pass／0 fail。前者四個失敗正對應 sandbox 消費、sandbox 生產、未到場活動分類與未到場說書印記。

本次獨立執行：

```sh
node --test tests/employment.test.js tests/commerce.test.js tests/resident-relationships.test.js tests/story-history.test.js
```

結果：**19 tests／19 pass／0 fail**，約 550 ms。

另以 `node --input-type=module` 執行兩模式遊客邊界檢查：建立 Town、住宅、商鋪與一件布匹，安排 browse 遊客，依序切換店員不在場／到場／離場，檢查 `shopIsOpen`、庫存與 `sold.cloth`。輸出：

```text
sandbox: visitor closed/open/closed PASS
managed: visitor closed/open/closed PASS
```

## 範圍與限制

- 本次僅新增本複評報告；未改 source、測試、ledger 或既有審查報告。
- 未執行全套測試、build、瀏覽器或跨裝置驗證。
- 遊客雙模式額外檢查是本次直接執行證據，尚未新增為版本庫內的永久測試；既有 commerce 遊客測試目前使用 managed fixture。這不阻擋本次功能放行，可由根代理決定是否補永久回歸案例。
