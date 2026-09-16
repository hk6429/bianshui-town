# 城市編輯交易與復原契約

2026-09-16；基準 883c0fc。

## E17
- editTown 在 detached Town 上編輯，完整驗證後 prepare，再 persist；以上任一步失敗均不發布 draft。
- main.js 的新建、示範、搬移、鋪路/移除道路、升級/擴建、拆除、復原均走此邊界。原物件與原存檔在 prepare 成功前不變。
- prepare 的 3D 場景可能部分更新，失敗即重設模型，下一幀使用原城；重設也失敗才進既有 E22 安全復原。
- 新建、道路、搬屋、升級、拆除各注入 refresh/render/storage 故障，共 15 個測試；原城 JSON、roads 與 disk 均相同。另驗證拒絕操作不 prepare/persist、成功只寫一次。
- Chrome 實際點選空地，DEV refresh 注入產生「操作未完成，原小鎮與進度仍保留。」並維持 8 人/5 建築/5 街坊；failed-edit.txt/png。
- 正式 dist 不含編輯故障注入文字，僅 DEV fixture/storage-test 可使用。

## E15
- 復原按鈕先開確認視窗，列出整城回復的第幾日/時分與已經過的模擬秒數；明示居民/貨物也回到該點。
- 單元測試搬屋後模擬 60 秒，復原整份快照等於所列操作前狀態。
- Chrome 新建 5→6 棟，復原確認列第 1 日 09:56、其後約 6 秒；確認後回復 5 棟，見 undo-confirm.txt/png、undo-result.txt。
- 確認後正常模擬繼續，因此結果截圖時鐘可比回復點略晚。

## 放行
138/138 測試、build 成功，既有 bundle >500 kB 提示。原始碼推送後仍不提前部署，完整目標尚待其餘項與四領域複評。
