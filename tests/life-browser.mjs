import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.text().includes('mergeGeometries'))errors.push(m.text());});
await mkdir('evidence/v2',{recursive:true});
try{
await page.goto('http://127.0.0.1:5173');await page.waitForFunction(()=>window.__townDebug);
assert.equal((await page.evaluate(()=>window.__townDebug.sound())).state,'not-started');
await page.locator('#demo-btn').click();
await page.locator('#sound-btn').click();await page.waitForFunction(()=>window.__townDebug.sound().state==='running'&&window.__townDebug.sound().enabled);
await page.locator('#life-btn').click();await page.locator('[data-focus="bridge"]').click();
await page.waitForFunction(()=>window.__townDebug.snapshot().life.boat.mast===0&&window.__townDebug.snapshot().life.boat.z>-19,{},{timeout:20000});await page.keyboard.press('Space');
const bridge=await page.evaluate(()=>window.__townDebug.snapshot());assert.equal(bridge.life.boat.mast,0);await page.screenshot({path:'evidence/v2/01-bridge.png'});
await page.waitForFunction(()=>window.__townDebug.sound().gain<.005);
await page.locator('#speed-btn').click();await page.locator('#speed-btn').click();await page.keyboard.press('Space');await page.locator('[data-focus="dock"]').click();
await page.waitForFunction(()=>window.__townDebug.snapshot().life.porters.some(a=>a.carrying>0),{},{timeout:45000});await page.keyboard.press('Space');
const dock=await page.evaluate(()=>window.__townDebug.snapshot());await page.screenshot({path:'evidence/v2/02-unloading.png'});
await page.keyboard.press('Space');await page.locator('[data-focus="town"]').click();
await page.waitForFunction(()=>window.__townDebug.snapshot().life.dock.delivered>0,{},{timeout:45000});await page.keyboard.press('Space');
const trade=await page.evaluate(()=>window.__townDebug.snapshot());assert(trade.life.socialCount>0);
await page.screenshot({path:'evidence/v2/03-town.png'});
const a=await page.evaluate(()=>window.__townDebug.screenLife(4001));await page.mouse.click(a.x,a.y);await page.waitForFunction(()=>document.querySelector('#inspector').textContent.includes('牛車'));
await page.screenshot({path:'evidence/v2/04-cart-inspection.png'});
await page.locator('#light-toggle').click();await page.keyboard.press('Space');
await page.waitForFunction(()=>window.__townDebug.snapshot().people.every(p=>p.current===p.home)&&window.__townDebug.snapshot().life.visitors.every(v=>!v.visible),{},{timeout:45000});await page.keyboard.press('Space');
await page.locator('#reset-view').click();await page.screenshot({path:'evidence/v2/05-night.png'});
await page.locator('#sound-btn').click();assert.equal((await page.evaluate(()=>window.__townDebug.sound())).enabled,false);
await page.setViewportSize({width:390,height:844});await page.waitForFunction(()=>document.querySelector('#life-panel').hidden);await page.screenshot({path:'evidence/v2/06-mobile.png'});
for(const selector of ['.toolbar','#sound-btn','#life-btn']){const fits=await page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;});assert(fits,selector+' overflows mobile');}
assert.equal(errors.length,0,errors.join('\n'));
const result={passed:true,errors,checks:['audio opt-in','audio mutes on pause','bridge lowering mast','porters carry cargo','ox cargo delivered','dialogue occurs','ox inspectable','residents and visitors return at night','mobile controls fit'],bridge:{mast:bridge.life.boat.mast,z:bridge.life.boat.z},dock:{cargo:dock.life.boat.cargo,carrying:dock.life.porters.map(p=>p.carrying)},trade:{delivered:trade.life.dock.delivered,chats:trade.life.socialCount},render:await page.evaluate(()=>window.__townDebug.renderInfo())};
await writeFile('evidence/v2/browser-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}catch(e){await page.screenshot({path:'evidence/v2/failure.png'});console.error('PAGE_ERRORS',errors);throw e;}finally{await browser.close();}
