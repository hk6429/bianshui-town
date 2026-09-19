import {chromium} from '@playwright/test';
const [,,out]=process.argv;
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1280,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('http://127.0.0.1:4173/?storage-test=1',{waitUntil:'networkidle'});
await p.waitForTimeout(2000);await p.click('#demo-btn');await p.waitForTimeout(2200);
await p.click('#tools-toggle');await p.waitForTimeout(300);
await p.click('#blueprints-btn');await p.waitForTimeout(500);
for(const f of ['home','shop','work']){await p.click(`[data-design-filter="${f}"]`);await p.waitForTimeout(400);await p.screenshot({path:`${out}/40-catalog-${f}.png`});}
await p.click('[data-design-filter="all"]');await p.waitForTimeout(400);
const svgs=await p.$$eval('.blueprint-card svg',e=>e.map(x=>x.innerHTML));
console.log(JSON.stringify({cards:svgs.length,unique:new Set(svgs).size,errs},null,1));
await b.close();
