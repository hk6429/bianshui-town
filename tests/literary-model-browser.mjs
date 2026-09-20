import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const out='evidence/literary-history';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.TEST_CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on('pageerror',e=>console.error('PAGEERROR',e.message));
await page.goto('http://127.0.0.1:5183');await page.waitForFunction(()=>window.__townDebug);
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
await browser.close();
