import './style.css';
import * as THREE from 'three';
import {TownScene} from './scene.js';
import {Soundscape} from './sound.js';
import {Town,TYPES,dragCells,CELL} from './simulation.js';
const $=s=>document.querySelector(s),canvas=$('#world'),sound=new Soundscape();let journalOpen=false;
const icons={explore:'<circle cx="16" cy="16" r="10"/><path d="m20 12-3 7-5 2 3-7 5-2Z"/>',home:'<path d="m3 14 13-9 13 9M6 14v13h20V14M12 27v-9h8v9M2 16h28M8 11v-4h4"/>',shop:'<path d="M5 14v13h22V14M3 13l3-7h20l3 7M3 13c0 5 7 5 7 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 7 5 7 0M10 27v-8h6v8M21 19h3"/>',work:'<path d="m7 5 6 1 4 5-5 5-5-4-2-5 3 3 4-4-5-1ZM15 14l12 12-3 3-12-12M21 4l6 6-5 5M21 6l-5 6M7 21l-4 5 3 3 5-4"/>'};
for(const el of document.querySelectorAll('[data-icon]'))el.innerHTML=`<svg viewBox="0 0 32 32" aria-hidden="true">${icons[el.dataset.icon]}</svg>`;
let town=new Town(),scene,mode='explore',speed=1,paused=false,drag=null,down=null,pinned=null,hovered=null,lastUi=0,lastSave=0,toastTimer,following=null;
try{const saved=localStorage.getItem('bianshui-town-v1');if(saved)town=Town.restore(JSON.parse(saved));}catch{$('#save-status').textContent='存檔無法讀取 · 已開啟新小鎮';}
try{scene=new TownScene(canvas);}catch(error){$('#welcome').innerHTML='<h2>目前無法開啟 3D 場景</h2><p>請使用支援 WebGL 2 的瀏覽器，並開啟硬體加速後重新整理。</p>';console.error(error);throw error;}
if(town.buildings.length)$('#welcome').hidden=true;
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function save(){try{localStorage.setItem('bianshui-town-v1',JSON.stringify(town));$('#save-status').textContent='進度已留存';}catch{$('#save-status').textContent='儲存空間不足 · 本次進度未存';}}
function setMode(next){if(next!=='explore')stopFollowing();mode=next;drag=null;scene.clearGroup(scene.preview);document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});scene.controls.mouseButtons.LEFT=mode==='explore'?THREE.MOUSE.PAN:undefined;scene.controls.touches.ONE=mode==='explore'?THREE.TOUCH.PAN:undefined;$('#mode-hint').textContent=mode==='explore'?'自由探索 · 拖曳移動畫面，點選屋舍與居民':`${TYPES[mode]} · 點選放置，拖曳最多三格；道路只沿街坊外圍形成`;canvas.style.cursor=mode==='explore'?'grab':'crosshair';}
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{setMode(b.dataset.mode);$('#welcome').hidden=true;};
$('#start-btn').onclick=()=>{$('#welcome').hidden=true;setMode('home');toast('在草地上點一下，安放第一間民居');};
$('#demo-btn').onclick=()=>{town.demo();$('#welcome').hidden=true;setMode('explore');save();toast('歡迎來到汴水小鎮，點選屋舍看看誰在裡面');};
$('#pause-btn').onclick=()=>{paused=!paused;$('#pause-btn').textContent=paused?'▶':'Ⅱ';$('#pause-btn').classList.toggle('paused',paused);$('#pause-btn').setAttribute('aria-label',paused?'繼續':'暫停');};
$('#speed-btn').onclick=()=>{speed=speed===1?2:speed===2?4:1;$('#speed-btn').textContent=`${speed}×`;};
$('#light-toggle').onclick=()=>{town.time=Math.floor(town.time/24)*24+((town.time%24>=6&&town.time%24<19)?21:9);save();};
$('#zoom-in').onclick=()=>{scene.camera.zoom=Math.min(3.2,scene.camera.zoom*1.2);scene.camera.updateProjectionMatrix();};
$('#zoom-out').onclick=()=>{scene.camera.zoom=Math.max(.6,scene.camera.zoom/1.2);scene.camera.updateProjectionMatrix();};
$('#reset-view').onclick=()=>{stopFollowing();scene.resetView();};
$('#sound-btn').onclick=async()=>{try{const on=await sound.toggle();$('#sound-btn').setAttribute('aria-pressed',String(on));$('#sound-btn').setAttribute('aria-label',on?'關閉環境音':'開啟環境音');$('#sound-btn').classList.toggle('sound-on',on);toast(on?'風聲、水聲與市井日常，慢慢聽':'環境音已關閉');}catch(e){toast(e.message);}};
$('#volume').oninput=e=>sound.setVolume(Number(e.target.value)/100);
$('#life-btn').onclick=()=>{journalOpen=!journalOpen;if(journalOpen&&innerWidth<600)pinned=hovered=null;$('#life-btn').setAttribute('aria-expanded',String(journalOpen));updateJournal();};
$('#life-panel').onclick=e=>{if(e.target.closest('[data-story-focus]')){pinned=hovered=null;const event=town.stories.active;if(event){stopFollowing();const delta=new THREE.Vector3(...[event.center[0],0,event.center[1]]).sub(scene.controls.target);scene.camera.position.add(delta);scene.controls.target.set(event.center[0],0,event.center[1]);scene.camera.zoom=2.2;scene.camera.updateProjectionMatrix();if(innerWidth<600){journalOpen=false;updateJournal();}}return;}const btn=e.target.closest('[data-focus]');if(!btn)return;stopFollowing();const where={bridge:[18,-16],dock:[12,8],town:[-7,0]}[btn.dataset.focus];const delta=new THREE.Vector3(where[0],0,where[1]).sub(scene.controls.target);scene.camera.position.add(delta);scene.controls.target.set(where[0],0,where[1]);scene.camera.zoom=1.8;scene.camera.updateProjectionMatrix();if(innerWidth<600){journalOpen=false;updateJournal();}};
$('#concepts-btn').onclick=()=>$('#gallery').showModal();$('#help-btn').onclick=()=>$('#help').showModal();
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>document.getElementById(b.dataset.close).close();
$('#new-town').onclick=()=>$('#confirm-reset').showModal();
$('#confirm-new').onclick=()=>{stopFollowing();town=new Town();scene.reset();scene.resetView();pinned=hovered=null;journalOpen=false;updateJournal();$('#inspector').hidden=true;$('#welcome').hidden=false;$('#confirm-reset').close();$('#help').close();setMode('explore');save();};
function cellAt(e){const p=scene.atScreen(e.clientX,e.clientY);return p?{x:Math.round(p.x/CELL),z:Math.round(p.z/CELL)}:null;}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('pointerdown',e=>{stopFollowing();if(e.button!==0)return;down={x:e.clientX,y:e.clientY};if(mode!=='explore'){const c=cellAt(e);if(c){drag={start:c,cells:[c]};scene.outline([c],town.canPlace([c])?0x668856:0xb5644c);canvas.setPointerCapture(e.pointerId);}}});
canvas.addEventListener('pointermove',e=>{if(mode!=='explore'){const c=cellAt(e);if(!c)return;const cells=drag?dragCells(drag.start,c):[c];if(drag)drag.cells=cells;scene.outline(cells,town.canPlace(cells)?0x668856:0xb5644c);return;}if(!down)hovered=scene.pick(e.clientX,e.clientY);});
canvas.addEventListener('pointerup',e=>{if(e.button!==0)return;if(drag){const placed=town.place(mode,drag.cells);if(placed){$('#welcome').hidden=true;toast(`${drag.cells.length} 間${TYPES[mode]}已落地，工匠即將開工`);save();}else toast('請選擇未使用的草地；每次最多放置三格');drag=null;scene.clearGroup(scene.preview);}else if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5){pinned=scene.pick(e.clientX,e.clientY);hovered=pinned;}down=null;});
canvas.addEventListener('pointercancel',()=>{drag=null;down=null;scene.clearGroup(scene.preview);});
canvas.addEventListener('pointerleave',()=>{hovered=null;if(!drag)scene.clearGroup(scene.preview);});
window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.code==='Space'){e.preventDefault();$('#pause-btn').click();}if(['1','2','3','4'].includes(e.key))setMode(['explore','home','shop','work'][Number(e.key)-1]);if(e.key==='Escape'){stopFollowing();setMode('explore');pinned=hovered=null;}if(e.key.toLowerCase()==='q')scene.rotate(-Math.PI/8);if(e.key.toLowerCase()==='e')scene.rotate(Math.PI/8);});
window.addEventListener('resize',()=>scene.resize());window.addEventListener('beforeunload',save);document.addEventListener('visibilitychange',()=>{if(document.hidden){save();sound.update(town,true);}});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function formatTime(time){return `${String(Math.floor(time%24)).padStart(2,'0')}:${String(Math.floor(time%1*60)).padStart(2,'0')}`;}
function inspectorContent(panel,html){delete panel.dataset.person;if(panel.dataset.content!==html){panel.innerHTML=html;panel.dataset.content=html;}}
function stopFollowing(){following=null;if(scene)scene.follow(null);$('#follow-status').hidden=true;}
$('#stop-follow').onclick=()=>stopFollowing();
$('#inspector').onclick=e=>{
 const resident=e.target.closest('[data-resident]');if(resident){stopFollowing();pinned={kind:'person',id:Number(resident.dataset.resident)};renderInspector();return;}
 const follow=e.target.closest('[data-follow]');if(!follow)return;const id=Number(follow.dataset.follow);
 if(following===id)stopFollowing();else{setMode('explore');following=id;pinned={kind:'person',id};scene.follow(id);scene.camera.zoom=Math.max(scene.camera.zoom,1.8);scene.camera.updateProjectionMatrix();$('#following-name').textContent=`跟著${town.people.find(p=>p.id===id).name}過一天`;$('#follow-status').hidden=false;}
 renderInspector();
};
let outlined='';
function renderInspector(){
 const ref=pinned||hovered,panel=$('#inspector');if(ref&&innerWidth<600&&journalOpen){journalOpen=false;updateJournal();}if(!ref){panel.hidden=true;if(outlined){scene.clearGroup(scene.selection);outlined='';}return;}
 panel.hidden=false;
 if(ref.kind==='building'){
  const b=town.building(ref.id);if(!b){panel.hidden=true;return;}const block=town.blocks.find(g=>g.id===b.blockId),res=town.residents(b),workers=town.workers(b),inside=town.occupants(b),stages=['整地打基礎','木架搭建中','覆瓦砌牆中','已落成','生活漸豐'];
  inspectorContent(panel,`<div class="eyebrow">${TYPES[b.type]} · ${block.cells.length} 間共享街坊</div><h2>${escape(b.name)}</h2><div class="sub">${stages[b.stage]}${pinned?' · 已固定檢視':''}</div>${b.stage<3?`<div class="progress"><i style="width:${Math.min(100,(town.elapsed-b.born)/18*100)}%"></i></div><p>工匠正在${stages[b.stage]}，靜候新居落成。</p>`:`<hr><label>${b.type==='home'?'住在這裡':'在此工作'}</label><div>${(b.type==='home'?res:workers).map(p=>`<button class="tag" data-resident="${p.id}">${escape(p.name)} ↗</button>`).join('')||'<span class="sub">等候新朋友到來</span>'}</div>${b.type==='shop'?`<label>河運補貨</label><p>店內 ${b.stock||0} 件 · 店前 ${town.life.visitors.filter(v=>v.visible&&v.target===b.id&&!v.walking).length} 位來客</p>`:''}<label>此刻在場 · ${inside.length} 人</label><p>${inside.length?inside.map(p=>`${escape(p.name)} · ${escape(p.action)}`).join('<br>'):'目前無人在室內'}</p>`}<hr><div class="sub">${pinned?'點選空地取消固定':'點選屋舍可固定這張小卡'}</div>`);
  const code='b'+block.id;if(outlined!==code){scene.outline(block.cells,0xd1b57b,scene.selection);outlined=code;}
 }else if(ref.kind==='life'){
  const a=[...town.life.visitors,...town.life.porters,...town.life.oxen].find(a=>a.id===ref.id);if(!a){panel.hidden=true;return;}inspectorContent(panel,`<div class="eyebrow">${({ox:'牛車運送',porter:'碼頭腳夫',peddler:'挑擔行商',traveler:'過橋旅人',shopper:'趕集來客'})[a.kind]}</div><h2>${escape(a.name)}</h2><p>${escape(a.action)}</p><hr><label>此刻攜帶</label><p>${a.kind==='peddler'?'挑擔與日用雜貨':a.carrying?`${a.carrying} 件貨物`:'輕裝行走'}</p><label>行程</label><p>${a.walking?'正在沿街道前往目的地':'停留、歇腳或等候'}</p>`);if(outlined){scene.clearGroup(scene.selection);outlined='';}
 }else if(ref.kind==='boat'){
  const b=town.life.boat;inspectorContent(panel,`<div class="eyebrow">汴河水運 · 第 ${b.trips+1} 航次</div><h2>汴河漕船</h2><p>${boatStatus()}</p><hr><label>船上貨物</label><p>${b.cargo} 件，${b.mast?'桅杆升起':'已收桅，準備過橋'}</p><label>本鎮累計</label><p>已卸 ${town.life.dock.received} 件 · 已送商鋪 ${town.life.dock.delivered} 件</p>`);if(outlined){scene.clearGroup(scene.selection);outlined='';}
 }else{
  const p=town.people.find(p=>p.id===ref.id);if(!p){panel.hidden=true;return;}const home=town.building(p.home),work=town.building(p.work),dest=town.building(p.destination);
  if(panel.dataset.person!==String(p.id)){
   panel.innerHTML=`<div class="eyebrow">街巷人物 · 一個人的日常</div><h2 id="person-name"></h2><p id="person-action"></p><button class="primary" id="follow-btn" data-follow="${p.id}"></button><hr><label>住處 · 工作場所</label><p id="person-place"></p><label>當下目的地</label><p id="person-goal"></p><label>今日記事 · 最新在上</label><ol id="person-diary" class="life-events"></ol>`;panel.dataset.person=String(p.id);delete panel.dataset.content;
  }
  $('#person-name').textContent=p.name;$('#person-action').textContent=p.traffic||p.action;
  $('#person-place').textContent=`${home?.name||'尚未安排'} · ${work?.name||'尚待安排'}`;
  $('#person-goal').textContent=p.streetEvent?`${town.stories.active?.venue||'街口'} · ${town.stories.active?.title||'街坊相聚'}`:dest?.name||'暫無目的地';
  $('#follow-btn').textContent=following===p.id?'停止跟隨':'跟著他過一天';$('#follow-btn').setAttribute('aria-pressed',String(following===p.id));
  const diary=(p.diary||[]).map(e=>`<li><time>${formatTime(e.time)}</time><span>${escape(e.text)}</span></li>`).join('')||'<li>等一段日常慢慢發生。</li>';
  if($('#person-diary').innerHTML!==diary)$('#person-diary').innerHTML=diary;
  if(outlined){scene.clearGroup(scene.selection);outlined='';}
 }
}
function updateUI(day){const h=town.time%24,hh=Math.floor(h),mm=Math.floor((h-hh)*60);$('#clock').textContent=`第 ${Math.floor(town.time/24)+1} 日　${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;const shichen=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][Math.floor(((h+1)%24)/2)];$('#period').textContent=`${shichen}時 · ${h<6?'萬籟俱寂':h<10?'晨光初醒':h<16?'日光正好':h<19?'炊煙漸起':'燈火可親'}`;$('#sun-icon').textContent=day>.5?'☀':'☾';$('#light-toggle').textContent=day>.5?'☾':'☀';document.body.classList.toggle('night',day<.4);$('#population').textContent=town.people.length;$('#building-count').textContent=town.buildings.length;$('#block-count').textContent=town.blocks.length;renderInspector();}
function boatStatus(){const b=town.life.boat;return b.state==='approach'?(b.mast?'貨船沿汴河駛來':'船家收桅，緩緩穿過虹橋'):({mooring:'船家正在靠岸繫纜',unloading:'腳夫往返船邊卸貨',depart:'卸貨完成，貨船離岸',away:'等候下一艘來船'})[b.state];}
function updateJournal(){
 const panel=$('#life-panel');$('#life-btn').setAttribute('aria-expanded',String(journalOpen));panel.hidden=!journalOpen;if(!journalOpen)return;const l=town.life;
 if(!panel.querySelector('.watch-buttons'))panel.innerHTML=`<div class="eyebrow">此時此地 · 活著的市井</div><h2>汴水有消息</h2><p class="boat-status"></p><div class="life-numbers"><span><b id="j-visitors"></b> 來客</span><span><b id="j-stock"></b> 件待運</span><span><b id="j-delivered"></b> 件送達</span></div><div class="watch-buttons"><button data-focus="bridge">虹橋看船 ↗</button><button data-focus="dock">碼頭卸貨 ↗</button><button data-focus="town">回到街坊 ↗</button></div><div id="street-story"></div><ol class="life-events"></ol>`;
 panel.querySelector('.boat-status').textContent=town.buildings.length?boatStatus():'先安放街坊，等市井生活長出來';
 $('#j-visitors').textContent=l.visitors.filter(a=>a.visible).length;$('#j-stock').textContent=l.dock.stock;$('#j-delivered').textContent=l.dock.delivered;
 const event=town.stories.active;const story=event?`<strong>${escape(event.title)}</strong><p>${escape(event.venue)} · ${event.phase==='active'?'正在相聚':'街坊陸續到來'}</p><button data-story-focus>去街口看看 ↗</button>`:'街頭暫歇，等下一段相遇';const storyPanel=$('#street-story');if(storyPanel.dataset.content!==story){storyPanel.innerHTML=story;storyPanel.dataset.content=story;}
 const events=town.events.slice(0,5).map(e=>`<li><time>${String(Math.floor(e.time%24)).padStart(2,'0')}:${String(Math.floor(e.time%1*60)).padStart(2,'0')}</time><span>${escape(e.text)}</span></li>`).join('');
 const list=panel.querySelector('.life-events');if(list.dataset.content!==events){list.innerHTML=events;list.dataset.content=events;}
}
let previous=performance.now();function frame(now){const dt=Math.min((now-previous)/1000,.1);previous=now;if(!document.hidden&&!document.querySelector('dialog[open]')&&!paused)town.tick(dt*speed);const day=scene.update(town,dt);sound.update(town,paused||document.hidden||!!document.querySelector('dialog[open]'));if(now-lastUi>180){updateUI(day);updateJournal();lastUi=now;}if(now-lastSave>12000){save();lastSave=now;}requestAnimationFrame(frame);}requestAnimationFrame(frame);
// Read-only diagnostics allow reproducible interaction checks without modifying simulation state.
window.__townDebug={follow:()=>({id:following,target:scene.controls.target.toArray()}),screenPerson:id=>{const model=scene.personModels.get(id);if(!model?.visible)return null;const p=model.position.clone().add(new THREE.Vector3(0,.55,0)).project(scene.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};},snapshot:()=>JSON.parse(JSON.stringify(town)),screenCell:(x,z)=>{const p=new THREE.Vector3(x*4,0,z*4).project(scene.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};},screenBuilding:id=>{const b=town.building(id);if(!b)return null;const p=new THREE.Vector3(b.x*4,1,b.z*4).project(scene.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};},renderInfo:()=>({...scene.renderer.info.render}),mode:()=>mode,sound:()=>({enabled:sound.enabled,state:sound.ctx?.state||'not-started',gain:sound.master?.gain.value||0,volume:sound.volume}),screenLife:id=>{const a=[...town.life.visitors,...town.life.porters,...town.life.oxen].find(a=>a.id===id);if(!a)return null;const p=new THREE.Vector3(a.x,1,a.z).project(scene.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};}};
