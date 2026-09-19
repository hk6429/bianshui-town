# JS 拆 chunk（解 500 kB 警告）

新增 `vite.config.js`，以 `manualChunks` 把 three.js 拆成三個 vendor chunk；應用程式碼留在 index。

| chunk | 大小 | gzip |
|---|---|---|
| index（應用） | 284.40 kB | 110.08 kB |
| three（renderer/module） | 324.29 kB | 78.00 kB |
| three-core | 172.50 kB | 47.76 kB |
| three-addons（OrbitControls、BufferGeometryUtils） | 22.93 kB | 5.35 kB |

拆前單檔 561 kB。拆後 `npm run build` 不再出現 chunk 大於 500 kB 提醒；index.html 對三個 vendor chunk 加 modulepreload。

驗證：`npm test` 319/319；`vite preview` 以本機 Google Chrome 載入 `/?storage-test=1`，四個 JS 全部載入、無 requestfailed、console error 0、canvas 存在，截圖 `smoke.png`。
