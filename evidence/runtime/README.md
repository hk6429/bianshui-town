# 固定步進與前背景執行證據

2026-09-16；基準 260fb60。完整目標仍 active。

## E13 聚焦驗收通過
- tests/runtime.test.js 使用真正 Town.demo，分別於 30/60/120 Hz 執行 60 秒，整份 toJSON deepEqual。
- 30/60 Hz、4×、15 秒結果等同 1×、60 秒。
- 固定 0.05 秒步進；每畫面最多計入 0.25 秒前景時間，4× 最多 20 次，避免長停頓造成無限補跑。
- 暫停清除未滿一步的餘額；更換城市及回前景重設時鐘。

## E21 已實作，待實際音訊補驗
- createRuntime 集中 request/cancelAnimationFrame；背景取消待執行畫面、時鐘歸零、呼叫靜音及存檔。
- 排程測試驗證背景渲染次數 0、城市不變、殘留 callback 不執行、回前景第一幀不追趕、重複 visibility 不重複排程。
- Chrome 實際切頁：browser-background.txt 顯示背景畫面更新 0，城市資料不變 true，靜音呼叫 1，離開與返回 elapsed 皆 119.660。
- 測試使用正式 runtime + Town 的隔離 harness，無 localStorage。遊戲 fixture=v8 的畫面與 UI 亦可由原生 Chrome 存取。
- CUA 焦點模擬會讓 document.hidden 維持 false；本次僅對測試頁暫時取消 Emulation.setFocusEmulationEnabled，測試後還原並關閉分頁。沒有更改正式頁設定。
- 尚未實測 AudioContext 音量歸零或聽覺靜音；故 E21 不標 verified。

## 放行
- tests.txt：112/112 全數通過。
- build.txt：成功，既有 >500 kB bundle 提示。
- 尚未部署；100 項全部完成後才做整體複評與正式發布。
