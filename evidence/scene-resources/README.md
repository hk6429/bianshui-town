# E18 繪圖資源所有權與釋放

- scene-resources.js 使用 WeakSet 身分區分共享資源；clone 不繼承共享身分。disposeTree 收集且去重 geometry、material array 與各 texture 欄位，包含 Line／Sprite。scene/goods 共用快取於最後 TownScene.dispose 釋放，重置期間不釋放共享材質；光暈紋理由場景所有者釋放。
- 建築、文人、攤販、生活場景與貨物清理統一使用 disposeTree。相同 cells/color 的預覽保留物件 identity，位置或顏色改變才重建。
- Node focused.txt 6 項通過（含全部建築五級）；tests.txt 全套 313 通過，build.txt 成功。完整卸載的最後修正另跑 disposal-tests.txt 3 項及瀏覽器聚焦測試，沒有重跑無關的百次循環。
- Chrome tests/scene-resources-harness.html 跑 2 次暖機及 100 次實際循環：demo 城鎮實際建立、預覽同位置重用與換位置、強制雨景／雨傘、拆除全部房屋、重置成同一空城。100 個 samples 全部是 geometry=154、texture=5、program=7，共享材質最後仍可 render。原始 cycles-100.txt 保留，不修改失敗文字。
- 原測試完整卸載額外發現 texture=1、program=4：修正太陽 shadow.dispose 與共享資源應在 renderer.dispose 之前釋放。此改動僅於完整卸載發生，不影響已完成的 100 次建拆與重置路徑。
- 最後聚焦完整卸載：disposed.txt／disposed.png，1101 geometry、18 texture 清為 0、0；program 從 10 降至 1。Three.js 說明內部資源可能在 info 持續顯示；本機 WebGLShadowMap 的內部 depth material 與 WebGLPrograms.dispose 的 shader cache 路徑符合此現象，但未直接識別該匿名 program，故不宣稱所有 GPU 程式均為零。共享 cache 的釋放次序與最後 owner 清空另由單元測試確認。
- [Three.js 官方資源釋放說明](https://threejs.org/manual/en/how-to-dispose-of-objects.html)。本項證明指定重複操作的資源穩定，不等於所有瀏覽器的程序記憶體歸零。
