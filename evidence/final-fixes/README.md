# 四專家複評後的三項修正

- C09：managed 才按到場比例計算產能；sandbox 至少一人保留全速。
- C10：新增居民消費只在 managed；兩模式遊客仍遵守到場店員門檻。
- O17：說書開始後，居民實際到達 eventSlot 才獲得說書日常印記。
- red.txt：修正前15項中4失敗，皆為這三項缺陷的直接重現。
- focused.txt：修正後15/15；獨立複評19/19及雙模式遊客驗證見 docs/review/final-fixes.md。
- tests.txt：全套319/319；build.txt：成功，仍有既有大chunk警告。
- browser.txt：目前修正後正式模組的Chrome隔離整合頁，驗證0/1/4人產出0/1/3、無店員不賣、到場消費、防重複及存讀需求狀態。並非真人三維操作。
