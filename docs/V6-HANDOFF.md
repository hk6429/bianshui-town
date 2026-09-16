# V6 文人行旅

## 變更
- 五位文人：蘇軾、李清照、辛棄疾、范仲淹、歐陽修。沿路移動、停步書寫、展卷與再出發；雨天收筆、深夜歇息。
- 3D 姓名、服色、書案、紙筆與雨傘；名冊定位、鏡頭跟隨、作品閱讀與五篇不重複收藏。
- 宋詞全文、文章節錄及原文來源；明示跨年代文學演出。
- 存檔版本 6，舊版遷移保留原有居民、建築與貨物。

## 驗證
- npm test：41/41 通過，包括作者道路、收藏唯一性、雨天／夜間／暫停、舊存檔與道路重建、鏡頭移動及停止跟隨；既有貨運等測試未退化。
- npm run build：通過；既有大於 500 kB 的主 bundle 警告仍在。
- Chrome 實際操作：李清照定位與 74% 落筆書案；蘇軾定位、跟隨、移動到茶坊後展卷；名冊由 0/5 到 2/5；閱讀聲聲慢與岳陽樓記；390×844 手機閱讀與關閉；手動雨天收筆。Console errors 0。
- 發現並修正手機 modal 超寬問題；重驗後內容折行、關閉按鈕可見。
- 證據：evidence/v6/desktop-writing.png、follow-start.png、follow-later.png、collection.txt、mobile-reading.png、mobile-rain.png、tests.txt、build.txt。
- 隔離場景 ?fixture=v6 僅開發環境使用，不覆寫玩家存檔；未重置既有正式小鎮。

## 限制與後續
- 固定五篇經核對作品；沒有即時 AI 生成詩詞或作者語音。跨年代同遊不代表歷史事件。
- 本次為代理操作 Chrome 實測，非使用者本人驗收。
- 正式部署與回讀證據於 release.json 記錄。

## 正式版放行
- Cloudflare Pages deployment：7dd236a0；source commit：c04034c。
- https://bianshui-town.pages.dev/ 的 7 個檔案 SHA-256 均與 dist 相同。
- Chrome 正式站驗證舊存檔 26 位居民／26 處建築／12 處街坊保留；文人陸續抵達、蘇軾撐傘、定位與跟隨、代表作閱讀皆可操作；console errors 0。
- 正式畫面：production-follow.png、production-reading.png。
