import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const out='evidence/literary-inspector';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:5183');await page.waitForFunction(()=>window.__townDebug);
await page.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
const fixture=await page.evaluate(async()=>{
 const {Town}=await import('/src/simulation.js'),{squareCells}=await import('/src/heritage.js'),{addResident}=await import('/src/city-growth.js'),{LANDMARK_LIFE}=await import('/src/landmark-life-data.js');
 const t=new Town();t.city.expansion=3;t.city.rank=5;t.city.treasury=10000000;
 t.journey.literary=Object.fromEntries(Object.values(LANDMARK_LIFE).map(s=>[s.quest,{step:4,note:'',activity:{stage:3,selection:[],visited:[]}}]));
 t.place('home',[{x:-1,z:0}],true,'residence');const home=t.buildings.at(-1);for(let i=0;i<4;i++)addResident(t,home);
 t.place('garden',[{x:0,z:-1}],true,'pond');
 if(!t.place('garden',squareCells({x:0,z:0}),true,'yueyangTower'))throw Error('fixture tower failed');const tower=t.buildings.at(-1).id;
 t.place('garden',[{x:2,z:0}],true,'granary');
 if(!t.place('garden',squareCells({x:-3,z:0}),true,'moonTerrace'))throw Error('fixture moon failed');const moon=t.buildings.at(-1).id;
 return {data:t.toJSON(),tower,moon};
});
async function tool(id){if(await page.locator('#inspector').isVisible())await page.locator('#close-inspector').click();if(!await page.locator(id).isVisible())await page.locator('#tools-toggle').click();await page.locator(id).click();}
async function importCity(data){await tool('#save-manager-btn');await page.locator('#save-file').setInputFiles({name:'literary-city.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});await expect(page.locator('#save-message')).toContainText('驗證通過');await page.locator('#save-apply').click();await expect(page.locator('#save-manager')).not.toBeVisible();}
async function select(id){await tool('#city-list-btn');await page.locator(`[data-object-kind="building"][data-object-id="${id}"]`).click();await expect(page.locator('#inspector')).toBeVisible();}
await importCity(fixture.data);await select(fixture.tower);
const panel=page.locator('#inspector');await expect(panel.locator('[data-manage="upgrade"]')).toBeDisabled();
async function event(id,nextDay=false){
 await select(id);await panel.locator(`[data-landmark-action="${nextDay?'tomorrow':'schedule'}"]`).click();
 assert.equal(await page.evaluate(()=>window.__townDebug.town().journey.landmarks.active.phase),'scheduled');
 // Controlled game clock; all travel, attendance and rewards run through real Town.tick.
 await page.evaluate(()=>{const t=window.__townDebug.town();t.time=t.journey.landmarks.active.at;for(let i=0;i<180&&t.journey.landmarks.active;i++)t.tick(1);});
 const last=await page.evaluate(()=>window.__townDebug.town().journey.landmarks.history[0]);assert.equal(last.success,true,last.summary);return last;
}
await event(fixture.tower);await expect(panel.locator('[data-manage="upgrade"]')).toBeEnabled();await panel.locator('[data-manage="upgrade"]').click();
assert.equal(await page.evaluate(id=>window.__townDebug.town().building(id).tier,fixture.tower),2);
await panel.locator('summary').filter({hasText:'三級：延伸閱讀'}).click();await panel.locator('[data-landmark-action="reflect"][data-choice="0"]').click();
await panel.locator('[data-manage="upgrade"]').click();assert.equal(await page.evaluate(id=>window.__townDebug.town().building(id).tier,fixture.tower),3);
await event(fixture.tower,true);await panel.locator('[data-manage="upgrade"]').click();assert.equal(await page.evaluate(id=>window.__townDebug.town().building(id).tier,fixture.tower),4);
await event(fixture.moon);await select(fixture.tower);
await panel.locator('[data-landmark-draft="quote"]').check();await panel.locator('[data-landmark-draft="otherQuote"]').check();
const note='岳陽樓由自身憂樂轉向天下百姓，望月臺從離別思念走向共同祝福，兩篇都超越眼前處境，但關懷對象不同。';
await panel.locator('textarea').fill(note);
await select(fixture.moon);await select(fixture.tower);assert.equal(await panel.locator('textarea').inputValue(),note);
await page.setViewportSize({width:390,height:844});await panel.locator('[data-landmark-action="connect"][data-choice="0"]').click();
assert.equal(await page.evaluate(()=>window.__townDebug.town().journey.landmarkConnections.yueyangTower.note),note);
await panel.locator('[data-manage="upgrade"]').click();assert.equal(await page.evaluate(id=>window.__townDebug.town().building(id).tier,fixture.tower),5);
assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth));await panel.locator('.landmark-comparison').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/mobile-tier5.png'});
await page.locator('#close-inspector').click();await tool('#save-manager-btn');const pending=page.waitForEvent('download');await page.locator('#save-export').click();const download=await pending;await download.saveAs(out+'/city.json');await page.locator('[data-close="save-manager"]').click();
const exported=JSON.parse(await readFile(out+'/city.json','utf8'));await importCity(exported);await select(fixture.tower);
assert.equal(await page.evaluate(id=>window.__townDebug.town().building(id).tier,fixture.tower),5);
assert.equal(await page.evaluate(()=>window.__townDebug.town().journey.landmarkConnections.yueyangTower.note),note);
await panel.locator('[data-landmark-action="tomorrow"]').click();
await page.reload();await page.waitForFunction(()=>window.__townDebug);const saved=await page.evaluate(()=>window.__townDebug.snapshot());assert.equal(saved.journey.landmarks.active.phase,'scheduled');assert.equal(saved.buildings.find(b=>b.id===fixture.tower).tier,5);
await tool('#literary-quests-btn');await page.locator('[data-quest="creek"]').click();
await page.locator('#literary-note').fill('興盡而晚歸，誤入與爭渡帶出驚喜；鷗鷺飛起使荷塘回憶更有聲音與動感。');await page.locator('[data-note]').click();await expect(page.locator('.literary-journal-page')).toContainText('鷗鷺');await page.locator('.literary-journal-page').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/creek-recollection.png'});
assert.deepEqual(errors,[]);await writeFile(out+'/result.json',JSON.stringify({scope:'full main inspector; pre-unlocked fixture, actual UI upgrades/events/import/export, controlled real Town.tick',passed:true,tiers:[1,2,3,4,5],checks:['blocked upgrade','actual resident visits','reflection','two-day service','two quotes and draft preserved','390px comparison and tier5','file import/export','reload scheduled event','illustrated creek journal'],visits:saved.journey.landmarks.visits,errors},null,2));await browser.close();console.log('Full main inspector checks passed');
