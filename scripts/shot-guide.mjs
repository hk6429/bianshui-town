import {chromium} from 'playwright';
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1280,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:4173/?storage-test=1');
await p.waitForTimeout(1800);
const s=await p.$('#welcome button');if(s)await s.click();
await p.waitForTimeout(1200);
// 蓋一片房子與商鋪，看屋頂顏色
await p.evaluate(()=>{const t=window.__townDebug.town();t.city.treasury=1e8;
 const put=(type,x,z,d)=>t.place(type,[{x,z}],true,d);
 put('home',-4,0,'bambooHome');put('home',-3,0,'terraceHome');put('home',-2,0,'plumHome');
 put('shop',0,0,'tea');put('shop',1,0,'bookshop');put('work',2,0,'dragonKiln');put('garden',-1,0,'well');
 for(const bl of t.buildings)bl.stage=3;});
await p.waitForTimeout(2500);
await p.screenshot({path:'/tmp/roofs.png'});
// 手冊
await p.click('#handbook-btn');await p.waitForTimeout(600);
await p.screenshot({path:'/tmp/handbook.png'});
await p.click('#close-handbook');await p.waitForTimeout(300);
// 雙擊民居開圖錄
await p.evaluate(()=>document.getElementById('blueprints').close());
await p.click('[data-mode="shop"]');await p.waitForTimeout(400);
console.log('first click opens catalog?',await p.evaluate(()=>document.getElementById('blueprints').open));
await p.click('[data-mode="shop"]');await p.waitForTimeout(700);
console.log('catalog open:',await p.evaluate(()=>document.getElementById('blueprints').open),errs);
await p.screenshot({path:'/tmp/catalog.png'});
await b.close();
