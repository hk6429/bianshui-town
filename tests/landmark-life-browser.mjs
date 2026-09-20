import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const out='evidence/landmark-life';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:5183');await page.waitForFunction(()=>window.__townDebug);
await page.evaluate(async()=>{
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());
 const {Town}=await import('/src/simulation.js'),{addResident}=await import('/src/city-growth.js'),{LANDMARK_LIFE,scheduleLandmark}=await import('/src/landmark-life.js'),ui=await import('/src/landmark-life-ui.js'),{patchPanel}=await import('/src/panel-dom.js');
 const t=new Town();t.city.expansion=3;t.journey.literary=Object.fromEntries(Object.values(LANDMARK_LIFE).map(s=>[s.quest,{step:4,note:'',activity:{stage:3,selection:[],visited:[]}}]));
 t.place('home',[{x:-1,z:0}],true,'residence');addResident(t,t.buildings[0]);
 const square=(x,z)=>[{x,z},{x:x+1,z},{x,z:z+1},{x:x+1,z:z+1}];
 t.place('garden',[{x:0,z:-1}],true,'pond');t.place('garden',square(0,0),true,'yueyangTower');const b=t.buildings.at(-1);t.place('garden',square(-3,0),true,'moonTerrace');const moon=t.buildings.at(-1);
 for(const venue of [b,moon]){for(let j=0;j<50;j++)t.tick(1);scheduleLandmark(t,venue.id);t.time=t.journey.landmarks.active.at;for(let i=0;i<160&&t.journey.landmarks.active;i++)t.tick(1);}
 const panel=document.createElement('div');panel.id='landmark-harness';panel.style='position:fixed;inset:0;z-index:99999;overflow:auto;background:#eee9dc;padding:12px;box-sizing:border-box';document.body.append(panel);
 const render=()=>patchPanel(panel,ui.landmarkLifeHTML(t,b));panel.addEventListener('input',ui.captureLandmarkDraft);panel.addEventListener('click',e=>ui.handleLandmarkAction(e,{change:action=>{const draft={...t,journey:structuredClone(t.journey)};if(!action(draft))return false;Town.restore({...t.toJSON(),journey:draft.journey});t.journey=draft.journey;return true;},toast:message=>{window.lastLandmarkMessage=message;},render}));render();window.landmarkHarness={t,b,render,restore:()=>Town.restore(t.toJSON())};
});
const readiness=await page.evaluate(()=>({buildings:window.landmarkHarness.t.buildings.map(b=>[b.design,b.id]),visits:window.landmarkHarness.t.journey.landmarks?.visits,history:window.landmarkHarness.t.journey.landmarks?.history}));assert(readiness.visits?.moonTerrace?.count,'real moon event must complete before comparing');
const harness=page.locator('#landmark-harness');await harness.locator('[data-landmark-action="connect"][data-choice="0"]').click();assert.match(await page.evaluate(()=>window.lastLandmarkMessage),/20–400/);
await harness.locator('[data-landmark-draft="quote"]').check();await harness.locator('[data-landmark-draft="otherQuote"]').check();
const note='岳陽樓寫超越個人的憂樂，望月臺由個人思念轉為對遠人的祝福，兩者關懷對象有別。';await harness.locator('textarea').fill(note);await page.evaluate(()=>window.landmarkHarness.render());assert.equal(await harness.locator('textarea').inputValue(),note);
await harness.locator('[data-landmark-action="connect"][data-choice="0"]').click();assert.match(await page.evaluate(()=>window.lastLandmarkMessage),/已儲存/);
const saved=await page.evaluate(()=>window.landmarkHarness.restore().journey.landmarkConnections.yueyangTower);assert.equal(saved.note,note);assert.equal(saved.other,'moonTerrace');assert(saved.quote&&saved.otherQuote);
await harness.locator('[data-landmark-action="tomorrow"]').click();assert.equal(await page.evaluate(()=>window.landmarkHarness.restore().journey.landmarks.active.phase),'scheduled');
await page.screenshot({path:out+'/mobile-comparison.png'});assert(await harness.evaluate(el=>el.scrollWidth<=el.clientWidth));assert.deepEqual(errors,[]);
await writeFile(out+'/result.json',JSON.stringify({scope:'isolated UI module with real Town.tick and schema-backed persistence; not full main inspector',mobile:390,realVisits:await page.evaluate(()=>window.landmarkHarness.t.journey.landmarks.visits),comparison:saved,errors},null,2));await browser.close();console.log('landmark UI harness: quotes, draft rerender, comparison persistence, schedule, 390px overflow passed');
