import {MORE_LITERARY_QUESTS} from './literary-quest-data.js';
// Mission scenes are adaptations; progress is committed through the journey transaction.
export const LITERARY_QUESTS={
 ...MORE_LITERARY_QUESTS,
 yueyang:{name:'岳陽樓',title:'先天下之憂',author:'范仲淹〈岳陽樓記〉',note:'宋代文學地景意象；此模型不是宋樓精確復原，亦不是現存清代樓的測繪模型。',source:'https://www.yueyang.gov.cn/ml/content_51560.html',requirement:'完成一座民居、一座作坊及一座義倉',steps:[
 {title:'滕子京來信：先安百姓',text:'政通人和，百廢具興。乃重修岳陽樓，增其舊制。',prompt:'洪水退後，鎮庫只夠先辦一件事。如何安排？',choices:['先辦登樓盛宴','先安置居民、恢復糧食供應','先停止一切公共事務'],answer:1,hint:'注意文章先寫政通人和、百廢具興，再寫重修。',result:'修樓計畫先列入居民安置與糧食保障。這是依文意改編的治理情境。'},
 {title:'登臨：陰雨與晴日',text:'陰風怒號，濁浪排空。\n春和景明，波瀾不驚。\n去國懷鄉，憂讒畏譏。\n心曠神怡，寵辱偕忘。',prompt:'替兩幅登臨畫面選擇合適的情感配對。',choices:['雨景—喜悅；晴景—憂懼','兩種景色都只表達思鄉','雨景—憂懼；晴景—喜悅'],answer:2,hint:'遷客騷人的感受隨景物改變；留意陰風與春和的差別。',result:'雨景與晴景兩幅遊記完成。'},
 {title:'修樓之意：先憂後樂',text:'不以物喜，不以己悲。\n先天下之憂而憂，後天下之樂而樂。',prompt:'古仁人的胸懷與前面的遷客騷人有何不同？',choices:['關懷天下，不只隨個人遭遇悲喜','從此不可以感到快樂','先做苦差事才能領獎'],answer:0,hint:'關注「天下」與「己」的對照。',result:'取得先憂後樂讀訪印記。'}]},
 kaifeng:{name:'開封府',title:'堂前辨真偽',author:'包公故事〈鍘美案〉',note:'後世公案戲曲改編；人物證詞是遊戲摘要，不是宋代案件實錄。府署為宋式意象，非史蹟測繪復原。',source:'https://www.cnpoc.cn/cnpoc/gjkt/200902/6c805a74b1f8470caf3a3f7dcebfa15b.shtml',requirement:'完成一座民居及一處商鋪',steps:[
 {title:'秦香蓮陳情',text:'【遊戲改編證詞】秦香蓮：陳世美是我的丈夫，赴京後未歸。\n街坊：我只聽人說駙馬沒有妻兒。',prompt:'此刻最合理的處理是什麼？',choices:['相信身分較高的人','區分當事人陳述與傳聞，再查證','只聽街坊傳聞就結案'],answer:1,hint:'陳述也是待查資訊；傳聞不能代替查證。',result:'案卷已分列當事人陳述與街坊傳聞。'},
 {title:'公堂查問',text:'【遊戲改編案卷】陳世美否認與秦香蓮的婚姻關係。\n秦香蓮提出婚姻與子女的陳述；案情另涉及韓琪追殺。',prompt:'哪一組查證最能推進案件？',choices:['比較兩人的衣服與官位','詢問誰比較受歡迎','交叉查證婚姻關係與追殺經過'],answer:2,hint:'找可以支持或反駁案件主張的線索，而非評比身分。',result:'案卷列出兩條獨立查證方向；尚不能只憑一方陳述定案。'},
 {title:'權勢關說',text:'【遊戲改編情境】有人要求因駙馬身分停止追查。\n包公請你留下辦案原則。',prompt:'如何回應最符合這條故事的公正主題？',choices:['查證後說明主張、證據與理由，不因身分停止','高官一定有罪','只要故事結局已知，就不必查證'],answer:0,hint:'公正不等於預設有罪；仍須查證與說理。',result:'取得堂前辨真偽讀訪印記。'}]},
 printing:{name:'活字印書坊',title:'讓文章走進千家',author:'沈括《夢溪筆談》〈活板〉',note:'依活字工序製作的教學工坊；畢昇是技術人物，沈括是記錄者。本版印製為任務活動，尚未加入書籍商品交易。',source:'https://zh.wikisource.org/zh-hant/夢溪筆談/卷十八',requirement:'完成一座作坊及一座村塾、鎮學、書院或縣學',steps:[
 {title:'畢昇的字模',text:'用膠泥刻字，薄如錢脣，每字為一印，火燒令堅。',prompt:'把字模製作程序排正確。',choices:['刻泥字 → 燒製變硬 → 排版','先印刷 → 刻泥字 → 燒製','排版 → 印刷 → 才刻字'],answer:0,hint:'先有可用的字模，才能組成印版。',result:'泥字工序卡完成，取得可重複使用的字模。'},
 {title:'訂單取捨',text:'若止印三二本，未為簡易；若印數十百千本，則極為神速。',prompt:'哪一張訂單最能發揮文中活板的優勢？',choices:['只印一本，每次都重新製字','大量印製同一篇作品','不排版直接壓紙'],answer:1,hint:'比較前期排版準備與大量重複印刷。',result:'接下小鎮文學選本的批次印製委託。'},
 {title:'兩版交替',text:'一板印刷，一板已自布字。此印者才畢，則第二板已具，更互用之。',prompt:'甲板正在印刷，乙板應安排什麼？',choices:['空等甲板印完','拆掉甲板正在使用的字','同時排好下一版，完成後交替'],answer:2,hint:'「更互」是交替使用，減少下一批的等待。',result:'文學選本試印完成，取得活字工序讀訪印記。'}]}
};
export const LANDMARK_QUEST={yueyangTower:'yueyang',kaifengCourt:'kaifeng',movableTypeHall:'printing',zuiwengPavilion:'zuiweng',virtueLotus:'lotus',redcliffBoat:'redcliff',oilSchool:'oil',creekLotus:'creek',lanternMarket:'lantern',moonTerrace:'moon'};
export function questEntry(t,id){return t.journey?.literary?.[id]||{step:0,note:''};}
export function requirements(t,id){
 const built=t.buildings.filter(b=>b.stage>=3),has=f=>built.some(f);
 const rules={yueyang:[['民居',b=>b.type==='home'],['作坊',b=>b.type==='work'],['義倉',b=>b.design==='granary']],kaifeng:[['民居',b=>b.type==='home'],['商鋪',b=>b.type==='shop']],printing:[['作坊',b=>b.type==='work'],['學堂',b=>['villageSchool','townSchool','academy','countySchool'].includes(b.design)]]};
 const home=['民居',b=>b.type==='home'],garden=['園圃',b=>['garden','scholarGarden','orchard'].includes(b.design)],pond=['池塘',b=>b.design==='pond'],pavilion=['臨泉亭',b=>b.design==='pavilion'];
 Object.assign(rules,{zuiweng:[home,pavilion,garden],lotus:[pond,garden],redcliff:[['河津碼頭',b=>b.design==='dock'],pond],oil:[['商鋪',b=>b.type==='shop'],['作坊',b=>b.type==='work']],creek:[pond,pavilion],lantern:[['三處商鋪',()=>built.filter(b=>b.type==='shop').length>=3],garden],moon:[home,['遞鋪',b=>b.design==='postStation'],garden]});
 return (rules[id]||[]).map(([name,f])=>({name,ok:has(f)}));
}
export function answerQuest(t,id,step,answer){
 const q=LITERARY_QUESTS[id],entry=questEntry(t,id);
 if(!Object.hasOwn(LITERARY_QUESTS,id)||!Number.isInteger(step)||entry.step!==step||!q.steps[step]||q.steps[step].answer!==answer)return false;
 t.journey.literary??={};t.journey.literary[id]={...entry,step:step+1};return true;
}
export function saveQuestNote(t,id,note){
 if(!Object.hasOwn(LITERARY_QUESTS,id)||typeof note!=='string'||note.length>400)return false;
 const e=questEntry(t,id);if(e.note===note)return false;
 t.journey.literary??={};t.journey.literary[id]={...e,note};return true;
}
export function unlockQuest(t,id){
 const q=LITERARY_QUESTS[id],e=questEntry(t,id);
 if(!Object.hasOwn(LITERARY_QUESTS,id)||e.step!==q.steps.length||requirements(t,id).some(r=>!r.ok))return false;
 t.journey.literary[id]={...e,step:q.steps.length+1};return true;
}
export function literaryLock(t,design){const id=LANDMARK_QUEST[design];return id&&questEntry(t,id).step!==LITERARY_QUESTS[id].steps.length+1?`請先完成「宋韻任務・${LITERARY_QUESTS[id].title}」解鎖圖樣`:null;}
