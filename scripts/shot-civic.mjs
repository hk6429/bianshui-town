import {chromium} from '@playwright/test';
const [,,out]=process.argv;
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({viewport:{width:1280,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await p.goto('http://127.0.0.1:4173/?storage-test=1',{waitUntil:'networkidle'});
await p.waitForTimeout(2200);
await p.click('#demo-btn');await p.waitForTimeout(2500);
const info={};
// catalog
await p.click('#tools-toggle');await p.waitForTimeout(300);
await p.click('#blueprints-btn');await p.waitForTimeout(600);
info.filters=await p.$$eval('[data-design-filter]',e=>e.map(x=>x.textContent));
await p.click('[data-design-filter="civic"]');await p.waitForTimeout(400);
info.civicCards=await p.$$eval('#blueprint-grid h3',e=>e.map(x=>x.textContent));
await p.screenshot({path:`${out}/10-catalog-civic.png`});
await p.click('[data-design-filter="school"]');await p.waitForTimeout(300);
info.schoolCards=await p.$$eval('#blueprint-grid h3',e=>e.map(x=>x.textContent));
await p.click('[data-plan="villageSchool"]');await p.waitForTimeout(600);
const c=await p.$('#world');const r=await c.boundingBox();
await p.mouse.click(r.x+r.width*0.30,r.y+r.height*0.72);await p.waitForTimeout(2000);
info.modeHint=await p.textContent('#mode-hint');
await p.screenshot({path:`${out}/11-school-built.png`});
// shrine
await p.click('#tools-toggle');await p.waitForTimeout(200);
await p.click('#blueprints-btn');await p.waitForTimeout(400);
await p.click('[data-design-filter="shrine"]');await p.waitForTimeout(300);
await p.click('[data-plan="earthShrine"]');await p.waitForTimeout(500);
await p.mouse.click(r.x+r.width*0.62,r.y+r.height*0.70);await p.waitForTimeout(2500);
await p.screenshot({path:`${out}/12-shrine-built.png`});
// data layers
await p.click('#layer-toggle');await p.waitForTimeout(300);
info.layers=await p.$$eval('[data-layer]',e=>e.map(x=>x.textContent));
await p.click('[data-layer="water"]');await p.waitForTimeout(1600);
await p.screenshot({path:`${out}/13-layer-water.png`});
await p.click('[data-layer="garden"]');await p.waitForTimeout(1600);
await p.screenshot({path:`${out}/14-layer-garden.png`});
// budget tabs
await p.click('#hud-treasury');await p.waitForTimeout(600);
info.tabs=await p.$$eval('.budget-tabs [role="tab"]',e=>e.map(x=>x.textContent));
await p.click('#tab-service');await p.waitForTimeout(400);
await p.screenshot({path:`${out}/15-budget-service.png`});
await p.click('#tab-money');await p.waitForTimeout(300);
info.land=await p.textContent('#land-summary');
info.summary=await p.textContent('#budget-summary');
await p.screenshot({path:`${out}/16-budget-money.png`});
info.errors=errs;
console.log(JSON.stringify(info,null,1));
await b.close();
