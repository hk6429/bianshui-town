import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {LITERARY_QUESTS,LANDMARK_QUEST} from '../src/literary-quests.js';
const out='evidence/literary-ten';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:5183');await page.waitForFunction(()=>window.__townDebug);
await page.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>d.close());const t=window.__townDebug.town();t.city.mode='sandbox';t.city.expansion=3;for(const [i,type] of ['home','work','shop','shop','shop'].entries())t.place(type,[{x:-12+i*2,z:-8}],true);for(const [i,design] of ['granary','villageSchool','pavilion','garden','pond','dock','postStation'].entries())t.place('garden',[{x:-12+i*2,z:-6}],true,design);document.querySelector('#literary-quests-btn').click();});
for(const [id,q] of Object.entries(LITERARY_QUESTS)){
 await page.locator(`[data-quest="${id}"]`).click();for(const s of q.steps)await page.locator(`[data-answer="${s.answer}"]`).click();
 await page.locator('[data-unlock]').click();assert.match(await page.locator('#literary-status').textContent(),/已儲存/);
 await page.locator('#literary-note').fill(`${q.name}：引用與解釋`);await page.locator('[data-note]').click();
}
await page.screenshot({path:out+'/ten-desktop.png'});
await page.setViewportSize({width:390,height:844});await page.locator('[data-quest="lotus"]').click();await page.screenshot({path:out+'/ten-mobile.png'});assert(await page.locator('#literary-quests').evaluate(d=>d.scrollWidth<=d.clientWidth));
await page.reload();await page.waitForFunction(()=>window.__townDebug);const saved=await page.evaluate(()=>window.__townDebug.town().journey.literary);for(const [id,q] of Object.entries(LITERARY_QUESTS)){assert.equal(saved[id].step,4);assert.equal(saved[id].note,`${q.name}：引用與解釋`);}
await page.setViewportSize({width:1440,height:1000});
await page.evaluate(async()=>{
 document.querySelectorAll('dialog[open]').forEach(d=>d.close());
 const THREE=await import('/node_modules/.vite/deps/three.js'),{TownScene}=await import('/src/scene.js'),{LANDMARK_QUEST,LITERARY_QUESTS}=await import('/src/literary-quests.js');
 const cover=document.createElement('div');cover.id='model-evidence';cover.style='position:fixed;inset:0;z-index:99999;background:#f1eddd';document.body.append(cover);
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1440,1000);cover.append(renderer.domElement);renderer.setScissorTest(true);
 const ids=Object.keys(LANDMARK_QUEST);window.drawLiteraryGallery=tier=>{
  cover.querySelectorAll('p').forEach(p=>p.remove());
  ids.forEach((id,i)=>{const x=(i%5)*288,y=i<5?500:0;renderer.setViewport(x,y,288,500);renderer.setScissor(x,y,288,500);renderer.setClearColor(0xf1eddd);renderer.clear();const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xffffff,0x667454,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(6,12,8);scene.add(light);
   const b={design:id,x:0,z:0,type:'garden',stage:4,tier,variant:0,footprint:[{x:0,z:0},{x:1,z:0},{x:0,z:1},{x:1,z:1}]};const model=TownScene.prototype.buildHouse.call({},b);scene.add(model);const camera=new THREE.OrthographicCamera(-6,6,10.42,-10.42,.1,100);camera.position.set(12,14,17);camera.lookAt(0,1.5,0);renderer.render(scene,camera);model.traverse(o=>{o.geometry?.dispose();});
   const label=document.createElement('p');label.textContent=`${LITERARY_QUESTS[LANDMARK_QUEST[id]].name}｜${tier} 級`;label.style=`position:absolute;left:${x+12}px;top:${i<5?20:520}px;font:22px serif;color:#37422f`;cover.append(label);
  });
 };
 window.drawLiteraryGallery(1);
});
await page.screenshot({path:out+'/models-level1.png'});await page.evaluate(()=>window.drawLiteraryGallery(5));await page.screenshot({path:out+'/models-level5.png'});
assert.deepEqual(errors,[]);await writeFile(out+'/result.json',JSON.stringify({quests:Object.keys(LITERARY_QUESTS),passed:true,errors,checks:['10 quest UI reading and unlock paths','10 notes persist after reload','390px overflow','actual game models in level1 and level5 gallery']},null,2));await browser.close();console.log('Ten quest browser checks passed');
