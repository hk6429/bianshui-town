import {tierAppearance} from './tier-appearance.js';
import {installStoryHistoryUI} from './story-history.js';
import {observeStory} from './council-exploration.js';
import {observeResident,watchResident,residentRecord,familiarityText} from './resident-relationships.js';
import {installResidentRelationshipsUI} from './resident-relationships-ui.js';
import {installReadingCollectionUI} from './reading-collection-ui.js';
import {WORKS,SOURCE_WORK} from './reading-collection.js';
import {installPlaceIdentityUI} from './place-identity-ui.js';
import {townName} from './place-identity.js';
import {upgradeUse,blueprintLifeHTML,recordConstruction} from './building-life.js';
import {commissionReply} from './commissions.js';
import {commitJourney,inspectResident} from './journey.js';
import {installJourneyUI} from './journey-ui.js';
import {BuildingLabels} from './building-labels.js';
import {readViewPreferences,writeViewPreferences,reducedMotion} from './view-preferences.js';
import {installNotices} from './notices.js';
import {patchPanel,focusHeading} from './panel-dom.js';
import {installCityDirectory} from './city-directory.js';
import {previewPlan} from './plan-preview.js';
import {PointerGesture,shiftDraft} from './pointer-gesture.js';
import {sceneCommand,stepCursor} from './scene-keyboard.js';
import {wellbeingReport} from './wellbeing.js';
import {gardenStatus} from './garden-services.js';
import {pollutionStatus} from './pollution.js';
import {educationStatus,educationOf} from './education.js';
import {healthcareStatus,healthcareReport} from './healthcare.js';
import {onSickLeave} from './employment.js';
import {fireStatus,repairFire,damaged,fireActionCost} from './fire-service.js';
import {waterStatus} from './water-service.js';
import {isUtility} from './public-services.js';
import {sanitationStatus} from './sanitation.js';
import {publicAccess} from './road-network.js';
import {residentCondition} from './city-growth.js';
import {shopStatus} from './commerce.js';
import {installFinanceUI} from './finance-ui.js';
import {installHUD} from './hud.js';
import {LAYERS,layerTiles} from './data-layers.js';
import {formatMoney} from './money.js';
import {moveCost,upgradeCost,managed,cellCost} from './city-finance.js';
import {editTown} from './town-edit.js';
import {escapeHTML as escape,constructionProgress,lotIdentity,lotButton,lotFocusButton,stallDetails,stallListItem} from './content-html.js';
import {RecoveryPoint} from './recovery.js';
import {installRuntimeRecovery} from './recovery-ui.js';
import {createRuntime} from './runtime.js';
import {installContextRecovery} from './context-recovery.js';
import {installContextRecoveryUI} from './context-recovery-ui.js';
import {SaveStore,SAVE_KEY} from './save-store.js';
import {validateSave} from './save-schema.js';
import {installSaveUI} from './save-ui.js';
import {tierOf,MAX_TIER,TIER_NAMES,buildingStats,buildingAbility,upgradePreview} from './building-tiers.js';
import {NEW_DESIGNS} from './variety.js';
import {marketStalls,marketOpen} from './market.js';
import {publicSquares,ROAD_TYPES,streetCells,footprint,layRoad,removeRoad,moveBuilding,demolishBuilding,upgradeBuilding} from './urban.js';
import {AUTHORS,authorById} from './literati-data.js';
import {authorStatus} from './literati.js';
import {DESIGNS,SOURCES,designFor,squareCells,designCategory,categoryOf} from './heritage.js';
import {CATEGORIES,CATEGORY_NOTE} from './categories.js';
import {setWeather} from './weather.js';
import {GOODS,RECIPES,at,placeName,locateLot} from './production.js';
import {courtyards} from './courtyards.js';
import './style.css';
import './readable-ui.css';
import * as THREE from 'three';
import {TownScene} from './scene.js';
import {Soundscape} from './sound.js';
import {Town,TYPES,dragCells,CELL,townBounds} from './simulation.js';
import {rankName} from './milestones.js';
import {calendar,watchOf} from './calendar.js';
const $=s=>document.querySelector(s),canvas=$('#world'),sound=new Soundscape();let designFilter='all';let editing=null,undoTown=null,pendingDelete=null,editFailure='';let journalOpen=false,selectedDesign=null,plotSize=1;
const icons={explore:'<circle cx="16" cy="16" r="10"/><path d="m20 12-3 7-5 2 3-7 5-2Z"/>',home:'<path d="m3 14 13-9 13 9M6 14v13h20V14M12 27v-9h8v9M2 16h28M8 11v-4h4"/>',shop:'<path d="M5 14v13h22V14M3 13l3-7h20l3 7M3 13c0 5 7 5 7 0 0 5 6 5 6 0 0 5 6 5 6 0 0 5 7 5 7 0M10 27v-8h6v8M21 19h3"/>',work:'<path d="m7 5 6 1 4 5-5 5-5-4-2-5 3 3 4-4-5-1ZM15 14l12 12-3 3-12-12M21 4l6 6-5 5M21 6l-5 6M7 21l-4 5 3 3 5-4"/>',garden:'<path d="M16 28V12M16 12c0-5 4-8 8-8 0 6-3 9-8 9M16 15c0-5-4-8-8-8 0 6 3 9 8 9M4 28h24"/>',civic:'<path d="M4 13 16 5l12 8M6 13v13M26 13v13M11 26V17h4v9M17 26v-9h4v9M3 28h26"/>'};
for(const el of document.querySelectorAll('[data-icon]'))el.innerHTML=`<svg viewBox="0 0 32 32" aria-hidden="true">${icons[el.dataset.icon]}</svg>`;
const pointerGesture=new PointerGesture();let pendingPlan=null;
let keyboardCursor={x:0,z:0},keyboardActive=false;
let town=new Town({mode:'managed'}),scene,mode='explore',speed=1,paused=false,drag=null,down=null,pinned=null,hovered=null,lastUi=0,lastSave=0,toastTimer,following=null,selectedLot=null;
const fixtureName=new URLSearchParams(location.search).get('fixture');const fixtureMode=import.meta.env.DEV&&['v4','v5','v6','v7','v8'].includes(fixtureName);
const owner=crypto.randomUUID();
const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),key:i=>localStorage.key(i),get length(){return localStorage.length;}};
const storageTest=import.meta.env.DEV&&new URLSearchParams(location.search).has('storage-test');
const saveStore=new SaveStore({storage,validate:validateSave,owner,key:storageTest?'bianshui-town-test-v1':SAVE_KEY});let saveUI,recovery;
try{if(fixtureMode)town=Town.restore(await(await fetch(`/tests/fixtures/${fixtureName}-town.json`)).json());else{const loaded=saveStore.load();if(loaded.data)town=Town.restore(loaded.data);if(loaded.status==='recovery')paused=true;}}catch(error){saveStore.blocked='recovery';saveStore.error=error.message;paused=true;$('#save-status').textContent='存檔無法讀取 · 原檔保留，請開啟存檔管理';}

try{scene=new TownScene(canvas);}catch(error){$('#welcome').innerHTML='<h2>目前無法開啟 3D 場景</h2><p>請使用支援 WebGL 2 的瀏覽器，並開啟硬體加速後重新整理。</p>';console.error(error);throw error;}
if(town.buildings.length)$('#welcome').hidden=true;
const viewPreferences=readViewPreferences(storage),motionQuery=matchMedia('(prefers-reduced-motion: reduce)'),buildingLabels=new BuildingLabels($('#building-use-labels'));
function applyViewPreferences(){
 const reduce=reducedMotion(viewPreferences.motion,motionQuery.matches);scene.setReducedMotion(reduce);document.body.classList.toggle('reduced-motion',reduce);
 buildingLabels.setVisible(viewPreferences.labels);document.body.classList.toggle('labels-visible',viewPreferences.labels);$('#building-legend').hidden=!viewPreferences.labels;$('#building-label-setting').checked=viewPreferences.labels;$('#motion-setting').value=viewPreferences.motion;
 $('#motion-status').textContent=`目前：${reduce?'減少動態':'完整動態'}${viewPreferences.motion==='auto'?'（依系統）':''}`;
}
$('#view-settings-btn').onclick=()=>$('#view-settings').showModal();
$('#motion-setting').onchange=e=>{viewPreferences.motion=e.target.value;applyViewPreferences();writeViewPreferences(storage,viewPreferences);};
$('#building-label-setting').onchange=e=>{viewPreferences.labels=e.target.checked;applyViewPreferences();writeViewPreferences(storage,viewPreferences);};
motionQuery.addEventListener('change',applyViewPreferences);applyViewPreferences();
const notices=installNotices();
function toast(text){notices.record(text);$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function changeJourney(action){
 try{return commitJourney(town,action,data=>{validateSave(data);const result=fixtureMode?{ok:true}:saveStore.save(data);if(!result.ok)toast('旅程進度未儲存，請先處理存檔管理中的問題');return result;});}catch(error){toast(`旅程操作未完成：${error.message}`);return false;}
}
const identityUI=installPlaceIdentityUI({getTown:()=>town,change:changeJourney,edit:fn=>applyUrban(fn,{record:false}),focus:b=>{stopFollowing();setMode('explore');pinned={kind:'building',id:b.id};hovered=null;scene.focusAt([b.x*CELL,b.z*CELL],2.3);focusInspector();}});
const readingUI=installReadingCollectionUI({getTown:()=>town,change:changeJourney,openWork:id=>{const w=WORKS[id];if(w.authorId)showAuthorWork(w.authorId);else showLiterature(w.source);}});
installResidentRelationshipsUI({getTown:()=>town,change:changeJourney,focus:(p,follow)=>{stopFollowing();setMode('explore');pinned={kind:'person',id:p.id};hovered=null;const b=town.building(p.current)||town.building(p.home);scene.focusAt(!p.outside&&b?[b.x*CELL,b.z*CELL]:[p.x,p.z],2.3);if(follow){following=p.id;scene.follow(p.id);$('#following-name').textContent=`跟著${p.name}過一天`;$('#follow-status').hidden=false;}focusInspector();}});
const storyHistoryUI=installStoryHistoryUI({getTown:()=>town,visit:e=>{stopFollowing();pinned=hovered=null;setMode('explore');scene.focusAt(e.center);toast(`${e.title} · ${e.venue}（已散場，此處為歷史地點）`);}});
const journeyUI=installJourneyUI({getTown:()=>town,change:changeJourney,toast,endObservation:()=>{paused=true;save();syncPauseButton();toast('本次觀察已暫停，城鎮與旅程進度保留');}});
function save(){if(recovery?.fault){$('#save-status').textContent='執行錯誤 · 已停止自動儲存';return;}if(fixtureMode){$('#save-status').textContent='預覽場景 · 不覆寫小鎮';return;}const result=saveStore.save(town.toJSON());$('#save-status').textContent=result.ok?'進度已留存':result.status==='conflict'?'另一分頁已有更新 · 請開啟存檔管理':result.status==='recovery'?'原存檔保留 · 自動儲存已停止':'儲存失敗 · 請匯出目前小鎮';if(result.status==='conflict'&&!paused){paused=true;saveUI?.open();}}

const compactUI=()=>document.body.classList.contains('large-text')||matchMedia('(max-width: 850px), (max-height: 700px)').matches;
function setToolsOpen(open){document.body.classList.toggle('tools-open',open);$('#tools-toggle').setAttribute('aria-expanded',String(open));$('#tools-toggle').textContent=open?'收合營造與工具':'營造與工具';}
$('#tools-toggle').onclick=()=>setToolsOpen(!document.body.classList.contains('tools-open'));
let textScale=100;
$('#text-size').onclick=()=>{textScale=textScale===200?100:textScale+50;document.documentElement.style.fontSize=`${textScale}%`;document.body.classList.toggle('large-text',textScale>100);$('#text-size').textContent=`文字 ${textScale}%`;$('#text-size').setAttribute('aria-label',`文字大小：${textScale}%`);};
function setMode(next){document.body.classList.toggle('is-building',next!=='explore');setToolsOpen(false);discardPointerDraft();editing=null;selectedDesign=null;$('#blueprint-status').hidden=true;scene.showBuildGrid(next!=='explore');if(next!=='explore')stopFollowing();mode=next;drag=down=null;keyboardActive=false;$('#cancel-build').hidden=next==='explore';scene.clearGroup(scene.preview);document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});scene.controls.mouseButtons.LEFT=mode==='explore'?THREE.MOUSE.PAN:undefined;scene.controls.touches.ONE=mode==='explore'?THREE.TOUCH.PAN:undefined;$('#mode-hint').textContent=mode==='explore'?'自由探索 · 拖曳移動畫面，點選屋舍與居民':`${ROAD_TYPES[mode]||TYPES[mode]||'調整街坊'} · 點選放置，橫拉最多四格；斜拉 2 × 2 自動合建；門前步道須以道路接至東側引道`;canvas.style.cursor=mode==='explore'?'grab':'crosshair';}
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{setMode(b.dataset.mode);$('#welcome').hidden=true;focusScene();};
$('#start-btn').onclick=()=>{$('#welcome').hidden=true;setMode('home');toast('在草地上點一下，安放第一間民居');};
$('#demo-btn').onclick=()=>{if(!applyUrban(draft=>{draft.city.mode='sandbox';draft.demo();return true;}))return;$('#welcome').hidden=true;setMode('explore');save();toast('歡迎來到汴水小鎮，點選屋舍看看誰在裡面');};
function syncPauseButton(){
 const button=$('#pause-btn'),reading=!!document.querySelector('dialog[open]');
 if(button.getAttribute('aria-pressed')!==String(paused)||!button.dataset.synced){button.textContent=paused?'▶':'Ⅱ';button.classList.toggle('paused',paused);button.setAttribute('aria-label',paused?'繼續時間':'暫停時間');button.setAttribute('aria-pressed',String(paused));button.dataset.synced='true';}
 const label=paused?'時間已由你暫停':reading?'閱讀中，時間暫停':'時間流動中';
 if($('#time-status').textContent!==label)$('#time-status').textContent=label;
}
$('#pause-btn').onclick=()=>{paused=!paused;syncPauseButton();};
$('#speed-btn').onclick=()=>{speed=speed===1?2:speed===2?4:speed===4?8:1;$('#speed-btn').textContent=`${speed}×`;};
$('#weather-btn').onclick=()=>{const next={auto:'rain',rain:'clear',clear:'auto'}[town.weather.mode];setWeather(town,next);save();};
$('#light-toggle').onclick=()=>{town.time=Math.floor(town.time/24)*24+((town.time%24>=6&&town.time%24<19)?21:9);save();};
$('#zoom-in').onclick=()=>{scene.camera.zoom=Math.min(3.2,scene.camera.zoom*1.2);scene.camera.updateProjectionMatrix();};
$('#zoom-out').onclick=()=>{scene.camera.zoom=Math.max(.6,scene.camera.zoom/1.2);scene.camera.updateProjectionMatrix();};
$('#reset-view').onclick=()=>{stopFollowing();scene.resetView();};
$('#sound-btn').onclick=async()=>{try{const on=await sound.toggle();$('#sound-btn').setAttribute('aria-pressed',String(on));$('#sound-btn').setAttribute('aria-label',on?'關閉環境音':'開啟環境音');$('#sound-btn').classList.toggle('sound-on',on);toast(on?'風聲、水聲與市井日常，慢慢聽':'環境音已關閉');}catch(e){toast(e.message);}};
$('#volume').oninput=e=>sound.setVolume(Number(e.target.value)/100);
$('#life-btn').onclick=()=>{journalOpen=!journalOpen;if(journalOpen&&compactUI())pinned=hovered=null;$('#life-btn').setAttribute('aria-expanded',String(journalOpen));updateJournal();if(journalOpen)focusHeading($('#life-panel'));};
$('#life-panel').onclick=e=>{
 if(e.target.closest('[data-story-history]')){storyHistoryUI.open();return;}
 if(e.target.closest('[data-close-life]')){journalOpen=false;updateJournal();$('#life-btn').focus();return;}
 if(e.target.closest('[data-production]')){renderProduction();$('#production').showModal();return;}
 if(e.target.closest('[data-story-focus]')){
  const event=town.stories.active||town.stories.last;if(!event)return;stopFollowing();pinned=hovered=null;setMode('explore');scene.focusAt(event.center);changeJourney(observeStory);toast(`${event.title} · ${event.venue}${town.stories.active?'':'（已散場）'}`);
 }else{const btn=e.target.closest('[data-focus]');if(!btn)return;stopFollowing();pinned=hovered=null;setMode('explore');scene.focusAt({bridge:[18,-16],dock:[12,8],town:[-7,0]}[btn.dataset.focus],1.8);}
 if(compactUI()) {journalOpen=false;updateJournal();}
};
$('#gallery-entry').onclick=$('#concepts-btn').onclick=()=>$('#gallery').showModal();$('#help-btn').onclick=()=>$('#help').showModal();
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>document.getElementById(b.dataset.close).close();
$('#new-town').onclick=$('#reset-town').onclick=()=>$('#confirm-reset').showModal();
$('#confirm-new').onclick=()=>{const nextTown=new Town({mode:'managed'});if(!fixtureMode&&saveStore.blocked!=='recovery'){const result=saveStore.checkpoint(town.toJSON());if(!result.ok){toast('無法保留重置復原點，請先匯出小鎮');return;}}if(!fixtureMode){const result=saveStore.replace(nextTown.toJSON());if(!result.ok){toast('重置未完成，原小鎮仍保留；請先匯出進度');return;}}stopFollowing();undoTown=JSON.parse(JSON.stringify(town));town=nextTown;journeyUI.resetSession();runtime.reset();recovery=new RecoveryPoint({read:()=>town.toJSON(),validate:validateSave});$('#undo-urban').hidden=false;paused=false;speed=1;$('#speed-btn').textContent='1×';$('#pause-btn').textContent='Ⅱ';$('#pause-btn').classList.remove('paused');$('#pause-btn').setAttribute('aria-label','暫停');down=drag=selectedLot=pendingDelete=null;scene.reset();scene.resetView();pinned=hovered=null;journalOpen=false;updateJournal();$('#inspector').hidden=true;$('#welcome').hidden=false;$('#confirm-reset').close();$('#help').close();setMode('explore');save();toast('小鎮已重置；存檔管理保留重置前小鎮');};
function cellAt(e){const p=scene.atScreen(e.clientX,e.clientY);return p?{x:Math.round(p.x/CELL),z:Math.round(p.z/CELL)}:null;}
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function discardPointerDraft(){pointerGesture.cancel();$('#scene-instructions').hidden=false;pendingPlan=null;drag=down=null;$('#touch-plan').hidden=true;if(scene)scene.clearGroup(scene.preview);}
function showPendingPlan(){
 if(!pendingPlan)return;const valid=canPlan(pendingPlan);scene.outline(pendingPlan,valid?0x668856:0xb5644c);
 $('#touch-plan').hidden=false;$('#scene-instructions').hidden=true;$('#confirm-plan').disabled=!valid;
 $('#touch-plan-status').textContent=`待確認：${pendingPlan.length} 格，起點 X ${pendingPlan[0].x}、Z ${pendingPlan[0].z} · ${valid?'可營造':'目前不可營造，請移動草稿或確認鎮庫'}。按方向鈕微調，確認才扣款。`;
}
function confirmPendingPlan(){if(!pendingPlan)return;const cells=pendingPlan.map(c=>({...c}));if(!canPlan(cells)){showPendingPlan();return;}if(submitPlan(cells)){keyboardCursor={...cells[0]};pendingPlan=null;$('#touch-plan').hidden=true;scene.clearGroup(scene.preview);$('#mode-hint').textContent='本次營造已完成';$('#scene-instructions').hidden=false;$('#scene-instructions').textContent='營造已確認；可重新選地，或按取消營造返回探索。';}else showPendingPlan();}
$('#confirm-plan').onclick=confirmPendingPlan;
for(const button of document.querySelectorAll('[data-draft-shift]'))button.onclick=()=>{if(!pendingPlan)return;const [dx,dz]=button.dataset.draftShift.split(',').map(Number);pendingPlan=shiftDraft(pendingPlan,dx,dz);showPendingPlan();};
canvas.addEventListener('pointerdown',e=>{
 const action=pointerGesture.start(e);if(action==='ignore')return;
 canvas.setPointerCapture(e.pointerId);stopFollowing();keyboardActive=false;
 if(action==='cancel'){discardPointerDraft();$('#scene-instructions').textContent='多指手勢：草稿已取消，全部放開後可重新營造。';return;}
 pendingPlan=null;$('#touch-plan').hidden=true;$('#scene-instructions').hidden=false;$('#scene-instructions').textContent='拖曳選擇占地；觸控抬起後先預覽，再明確確認。';canvas.focus({preventScroll:true});down={x:e.clientX,y:e.clientY};
 if(mode!=='explore'){const c=cellAt(e);if(c){const cells=plannedCells(c);drag={start:c,cells};scene.outline(cells,canPlan(cells)?0x668856:0xb5644c);}}
});
canvas.addEventListener('pointermove',e=>{
 if(pointerGesture.active.size&&!pointerGesture.owns(e.pointerId))return;
 if(keyboardActive||pendingPlan)return;
 if(mode!=='explore'){const c=cellAt(e);if(!c)return;const cells=editing?.kind==='road'?streetCells(drag?.start||c,c):editing?plannedCells(c):selectedDesign&&plotSize===4?plannedCells(c):drag?dragCells(drag.start,c):[c];if(drag)drag.cells=cells;scene.outline(cells,canPlan(cells)?0x668856:0xb5644c);return;}
 if(!down)hovered=compactUI()?null:scene.pick(e.clientX,e.clientY);
});
function submitPlan(cells){
 if(!canPlan(cells)){toast($('#mode-hint').textContent);return false;}
 if(editing){const op=editing,squareCount=publicSquares(town).length;const success=applyUrban(draft=>op.kind==='move'?moveBuilding(draft,op.id,cells[0]):op.type==='erase'?removeRoad(draft,cells):layRoad(draft,op.type,cells));toast(success?(op.kind==='move'?'建築已搬移，住戶與貨物保留':publicSquares(town).length>squareCount?'四格道路已合成街坊市心；可按復原撤銷':'公共道路已更新；可按復原撤銷'):editFailure||'這裡無法操作，請避開建築及範圍外地面');if(success&&op.kind==='move'){setMode('explore');pinned={kind:'building',id:op.id};}return success;}
 const placed=applyUrban(draft=>draft.place(mode,cells,false,selectedDesign));
 if(placed){$('#welcome').hidden=true;const b=town.buildings.find(b=>b.blockId===placed.id);toast(`${b.footprint?'四格合建 · ':''}${b.name}開始${b.design==='pond'?'挖池':'動工'}`);save();if(selectedDesign){setMode('explore');pinned={kind:'building',id:b.id};hovered=null;}}
 else toast(editFailure||'這裡放不下，請選擇範圍內的空地；四格須完整空出 2 × 2');
 return !!placed;
}
canvas.addEventListener('pointerup',e=>{
 if(!pointerGesture.end(e.pointerId))return;
 if(drag){const cells=drag.cells.map(c=>({...c}));drag=null;
  if(e.pointerType!=='mouse'||$('#precise-build').checked){pendingPlan=cells;showPendingPlan();}
  else{submitPlan(cells);scene.clearGroup(scene.preview);}
 }else if(down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<5){pinned=scene.pick(e.clientX,e.clientY);hovered=pinned;if(pinned)focusInspector();}
 down=null;
});
const cancelPointer=e=>{if(!pointerGesture.active.has(e.pointerId))return;pointerGesture.end(e.pointerId,true);discardPointerDraft();};
canvas.addEventListener('pointercancel',cancelPointer);canvas.addEventListener('lostpointercapture',cancelPointer);
canvas.addEventListener('pointerleave',()=>{hovered=null;if(!drag&&!pendingPlan&&!keyboardActive)scene.clearGroup(scene.preview);});
window.addEventListener('blur',()=>{if(drag||pendingPlan)discardPointerDraft();});
function keyboardPreview(){
 if(mode==='explore'){ $('#scene-instructions').textContent='探索：方向鍵或 WASD 平移，Q／E 旋轉；2 民居、3 商鋪、4 作坊。';return;}
 const cells=plannedCells(keyboardCursor),valid=canPlan(cells);scene.outline(cells,valid?0x668856:0xb5644c);
 $('#scene-instructions').textContent=`營造游標 X ${keyboardCursor.x}、Z ${keyboardCursor.z} · ${cells.length} 格 · ${valid?'可放置，Enter 確認':'不可放置，請移動至空地或確認鎮庫'} · 方向鍵移格，Esc 取消`;
}
function focusScene(){if(compactUI())setToolsOpen(false);canvas.focus({preventScroll:true});keyboardActive=true;if(pendingPlan)showPendingPlan();else keyboardPreview();}
function cancelBuild(){stopFollowing();setMode('explore');pinned=hovered=null;focusScene();}
$('#keyboard-scene').onclick=focusScene;$('#cancel-build').onclick=cancelBuild;
window.addEventListener('keydown',e=>{
 if(document.querySelector('dialog[open]'))return;const command=sceneCommand(e,canvas);if(!command)return;e.preventDefault();
 if(command.type==='cancel'){cancelBuild();return;}
 if(command.type==='pause'){$('#pause-btn').click();return;}
 if(command.type==='mode'){setMode(command.mode);$('#welcome').hidden=true;focusScene();return;}
 if(command.type==='rotate'){stopFollowing();scene.rotate(command.angle);return;}
 if(command.type==='direction'){
  stopFollowing();keyboardActive=true;
  if(pendingPlan){pendingPlan=shiftDraft(pendingPlan,...command.direction);showPendingPlan();return;}
  if(mode==='explore'){scene.pan(...command.direction);$('#scene-instructions').textContent=`視角中心 X ${scene.controls.target.x.toFixed(0)}、Z ${scene.controls.target.z.toFixed(0)} · 方向鍵平移，2 民居、3 商鋪、4 作坊`;}
  else{keyboardCursor=stepCursor(keyboardCursor,command.direction,townBounds(town));keyboardPreview();scene.focusAt([keyboardCursor.x*CELL,keyboardCursor.z*CELL],scene.camera.zoom);}
 }
 if(command.type==='submit'&&mode!=='explore'){
  if(pendingPlan){confirmPendingPlan();return;}
  if(pointerGesture.active.size)return;
  if(canPlan(plannedCells(keyboardCursor)))submitPlan(plannedCells(keyboardCursor));else toast($('#mode-hint').textContent);
  drag=down=null;keyboardActive=true;keyboardPreview();
 }
});
window.addEventListener('resize',()=>scene.resize());window.addEventListener('beforeunload',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)discardPointerDraft();runtime.visibility();});
function formatTime(time){return `${String(Math.floor(time%24)).padStart(2,'0')}:${String(Math.floor(time%1*60)).padStart(2,'0')}`;}
function inspectorContent(panel,html){delete panel.dataset.person;delete panel.dataset.author;if(panel.dataset.content!==html){patchPanel(panel,html,$('#inspector'));panel.dataset.content=html;}}
function stopFollowing(){following=null;if(scene)scene.follow(null);$('#follow-status').hidden=true;}
$('#stop-follow').onclick=()=>stopFollowing();
function closeInspector(){pinned=hovered=null;stopFollowing();scene.clearGroup(scene.selection);outlined='';$('#inspector').hidden=true;canvas.focus({preventScroll:true});}
function focusInspector(){if(pinned?.kind==='person')changeJourney(t=>{const observed=observeResident(t,pinned.id),guided=inspectResident(t,pinned.id);return observed||guided;});renderInspector();focusHeading($('#inspector'));}
$('#close-inspector').onclick=closeInspector;
$('#inspector').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeInspector();}});
$('#inspector').addEventListener('focusin',()=>{if(!pinned&&hovered)pinned={...hovered};});
installCityDirectory({getTown:()=>town,select:ref=>{stopFollowing();setMode('explore');pinned=ref;hovered=null;journalOpen=false;updateJournal();const b=ref.kind==='building'?town.building(ref.id):null,p=ref.kind==='person'?town.people.find(p=>p.id===ref.id):null,inside=p&&!p.outside?town.building(p.current)||town.building(p.home):null;scene.focusAt(b?[b.x*CELL,b.z*CELL]:inside?[inside.x*CELL,inside.z*CELL]:[p.x,p.z],2.3);focusInspector();}});
$('#inspector').onclick=e=>{
 const watched=e.target.closest('[data-watch-person]');if(watched){const id=Number(watched.dataset.watchPerson),enabled=!residentRecord(town,id)?.watched;if(!changeJourney(t=>watchResident(t,id,enabled)))toast('關注未變更：名冊最多16人、熟識最多128人，或存檔未成功。');renderInspector();return;}
 const observe=e.target.closest('[data-observe-person]');if(observe){const id=Number(observe.dataset.observePerson);const changed=changeJourney(t=>observeResident(t,id));toast(changed?'已記錄這段日常':'這種日常已觀察過，或記錄未儲存');renderInspector();return;}
 const identity=e.target.closest('[data-place-identity]');if(identity){identityUI.open(Number(identity.dataset.placeIdentity));return;}
 const manage=e.target.closest('[data-manage]');if(manage){const b=town.building(Number(manage.dataset.building));if(!b)return;const op=manage.dataset.manage;if(op==='fire'){toast(applyUrban(draft=>repairFire(draft,b.id))?'火警處置完成，建築恢復使用':editFailure||'鎮庫不足；整修倒數結束後會免費恢復');renderInspector();return;}if(op==='move'){setMode('move');editing={kind:'move',id:b.id};pinned=hovered=null;$('#mode-hint').textContent=`搬移${b.name} · 點選${b.footprint?'2 × 2':'一格'}空地 · Esc 取消`;focusScene();return;}if(op==='delete'){pendingDelete=b.id;$('#demolish-name').textContent=`拆除「${b.name}」這一棟（占地 ${footprint(b).length} 格）？同街坊其他建築保留。住戶保留並等候新居，貨物退回貨棧。可使用「復原上一步」撤銷。`;$('#demolish').showModal();return;}const ok=applyUrban(draft=>upgradeBuilding(draft,b.id,op==='expand'));toast(ok?(op==='expand'?'四格擴建完成':`${town.building(b.id).name}升至 ${tierOf(town.building(b.id))} 級`):editFailure||(!upgradeUse(town,b).allowed?upgradeUse(town,b).text:op==='expand'?'四格擴建須原位置右方、下方共 2 × 2 空出，且不占道路':'建築尚未落成或已達五級'));renderInspector();return;}

 const request=e.target.closest('[data-person-commission]');if(request){journeyUI.open(Number(request.dataset.personCommission));return;}
 const work=e.target.closest('[data-author-work]');if(work){showAuthorWork(work.dataset.authorWork);return;}
 const af=e.target.closest('[data-author-follow]');if(af){const id=af.dataset.authorFollow,key='author:'+id;if(following===key)stopFollowing();else{setMode('explore');following=key;pinned={kind:'author',id};scene.follow(key);$('#following-name').textContent=`跟著${authorById(id).name}散步`;$('#follow-status').hidden=false;}renderInspector();return;}

 const reading=e.target.closest('[data-reading]');if(reading){showLiterature(reading.dataset.reading);return;}
 const courtButton=e.target.closest('[data-courtyard]');if(courtButton){const block=town.blocks.find(b=>b.id===Number(courtButton.dataset.courtyard)),court=courtyards(block)[0];stopFollowing();setMode('explore');scene.focusAt([court.x,court.z],3,true);toast('共享院落 · 側門與晾曬空間');return;}
 const resident=e.target.closest('[data-resident]');if(resident){stopFollowing();pinned={kind:'person',id:Number(resident.dataset.resident)};hovered=null;focusInspector();return;}
 const follow=e.target.closest('[data-follow]');if(!follow)return;const id=Number(follow.dataset.follow);
 if(following===id)stopFollowing();else{setMode('explore');following=id;pinned={kind:'person',id};scene.follow(id);scene.camera.zoom=Math.max(scene.camera.zoom,1.8);scene.camera.updateProjectionMatrix();$('#following-name').textContent=`跟著${town.people.find(p=>p.id===id).name}過一天`;$('#follow-status').hidden=false;}
 renderInspector();
};
let outlined='';
function renderInspector(){
 const ref=pinned||(compactUI()?null:hovered),panel=$('#inspector-content'),shell=$('#inspector');if(ref&&compactUI()&&journalOpen){journalOpen=false;updateJournal();}if(!ref){shell.hidden=true;if(outlined){scene.clearGroup(scene.selection);outlined='';}return;}
 shell.hidden=false;
 const entity=`${ref.kind}:${ref.id}`;if(panel.dataset.entity!==entity){panel.replaceChildren();panel.dataset.entity=entity;delete panel.dataset.content;delete panel.dataset.person;delete panel.dataset.author;shell.scrollTop=0;}
 if(ref.kind==='building'){
  const b=town.building(ref.id);if(!b){shell.hidden=true;return;}const block=town.blocks.find(g=>g.id===b.blockId),res=town.residents(b),workers=town.workers(b),inside=town.occupants(b),stages=['整地打基礎','木架搭建中','覆瓦砌牆中','已落成','生活漸豐'];
  inspectorContent(panel,`<div class="eyebrow">${CATEGORIES[categoryOf(b)]||TYPES[b.type]} · ${b.footprint?'四格合建 · '+(b.type==='garden'?'一處'+(CATEGORIES[categoryOf(b)]||'園景'):'一座建築'):'選取此棟 · 一格占地（所屬街坊 '+block.cells.length+' 格）'}</div><h2>${escape(b.name)}</h2>${b.originalName?`<p>建築原型：${escape(b.originalName)}</p>`:''}<button data-place-identity="${b.id}">命名與收藏</button><div class="sub">${b.design==='pond'&&b.stage<3?['開挖池床','整修池岸','注水植荷'][b.stage]:stages[b.stage]}${pinned?' · 已固定檢視':''}</div>${b.stage<3?`${constructionProgress(b,town.elapsed)}<p>${b.design==='pond'?'池床開挖、修岸與注水植荷依序進行。':'工匠正在'+stages[b.stage]+'，靜候落成。'}</p>`:`<hr><label>${isUtility(b)?'公共設施':b.type==='garden'?(categoryOf(b)==='shrine'?'入廟參拜':categoryOf(b)==='school'?'在此讀書':'園中漫步'):b.type==='home'?'住在這裡':'在此工作'}</label><div>${(b.type==='garden'?inside:b.type==='home'?res:workers).map(p=>`<button class="tag" data-resident="${escape(p.id)}">${escape(p.name)} ↗</button>`).join('')||(isUtility(b)?'<span class="sub">自動服務，不需指派居民</span>':'<span class="sub">等候新朋友到來</span>')}</div>${courtyards(block).length>0?`<p>共享院落 · ${courtyards(block).length} 處相通庭院</p><button class="tag" data-courtyard="${escape(block.id)}">看看院落 ↗</button>`:''}${b.type==='work'?`<label>作坊進度</label><p>${escape(b.productionStatus||'等候原料')} · 原料 ${at(town,`input:${b.id}`).length} 份 · 成品 ${at(town,`output:${b.id}`).length} 件</p>`:''}${b.type==='shop'?`<label>河運補貨</label><p>${escape(shopStatus(town,b))}</p><p>店內 ${escape(b.stock||0)} 件 · 店前 ${town.life.visitors.filter(v=>v.visible&&v.target===b.id&&!v.walking).length} 位來客</p>`:''}<label>此刻在場 · ${inside.length} 人</label><p>${inside.length?inside.map(p=>`${escape(p.name)} · ${escape(p.action)}`).join('<br>'):'目前無人在此停留'}</p>`}${managed(town)?`<p>${publicAccess(town,b)?'道路已接通河岸貨棧':'街坊未接外路：請由門前步道鋪路至東側引道，才能接貨與迎接新住戶。'}</p>`:''}${waterStatus(town,b)?`<section class="water-status"><label>街坊供水</label><p>${escape(waterStatus(town,b))}</p></section>`:''}${sanitationStatus(town,b)?`<section class="sanitation-status"><label>衛生清運</label><p>${escape(sanitationStatus(town,b))}</p></section>`:''}${fireStatus(town,b)?`<section class="fire-status"><label>防火巡守</label><p>${escape(fireStatus(town,b))}</p>${b.fireWarningAt!==undefined||damaged(b)?`<button data-manage="fire" data-building="${escape(b.id)}">${b.fireWarningAt!==undefined?'排除火警':'立即修復'} · ${managed(town)?formatMoney(fireActionCost(b)):'免費'}</button>`:''}</section>`:''}${healthcareStatus(town,b)?`<section class="healthcare-status"><label>藥鋪醫療</label><p>${escape(healthcareStatus(town,b))}</p></section>`:''}${educationStatus(town,b)?`<section class="education-status"><label>書院教育</label><p>${escape(educationStatus(town,b))}</p></section>`:''}${pollutionStatus(town,b)?`<section class="pollution-status"><label>生產污染與居住環境</label><p>${escape(pollutionStatus(town,b))}</p></section>`:''}${gardenStatus(town,b)?`<section class="garden-status"><label>園景宜居</label><p>${escape(gardenStatus(town,b))}</p></section>`:''}${buildingTools(b)}${literatureLink(b)}<hr><div class="sub">${pinned?'點選空地取消固定':'點選屋舍可固定這張小卡'}</div>`);
  const cells=footprint(b),code=JSON.stringify([b.id,cells]);if(outlined!==code){scene.outline(cells,0x7b3d27,scene.selection);outlined=code;}
 }else if(ref.kind==='stall'){
  const s=marketStalls(town).find(s=>s.id===ref.id);if(!s){shell.hidden=true;return;}inspectorContent(panel,stallDetails(s,town.market.trades,marketOpen(town)));if(outlined){scene.clearGroup(scene.selection);outlined='';}
 }else if(ref.kind==='author'){

  const a=authorById(ref.id),actor=town.literati.actors.find(v=>v.author===ref.id);if(!a){shell.hidden=true;return;}
  if(panel.dataset.author!==a.id){panel.innerHTML=`<div class="eyebrow">${a.era} · 文人行旅</div><h2>${a.name}</h2><p id="author-status"></p><button class="primary" data-author-follow="${a.id}"></button><hr><label>${a.title}</label><blockquote>${a.quote}</blockquote><button class="tag" data-author-work="${a.id}">讀代表作 ↗</button><p class="fine">跨年代文學相遇 · 落筆為遊戲演出</p>`;panel.dataset.author=a.id;delete panel.dataset.content;delete panel.dataset.person;}
  $('#author-status').textContent=authorStatus(town,actor)+(actor?.phase==='writing'&&!town.weather.raining?` · ${Math.min(100,Math.floor(actor.progress/12*100))}%`:'');
  const btn=panel.querySelector('[data-author-follow]');btn.textContent=following==='author:'+a.id?'停止跟隨':'跟著散步';btn.disabled=!actor?.visible;btn.setAttribute('aria-pressed',String(following==='author:'+a.id));
  if(outlined){scene.clearGroup(scene.selection);outlined='';}
 }else if(ref.kind==='life'){

  const a=[...town.life.visitors,...town.life.porters,...town.life.oxen].find(a=>a.id===ref.id);if(!a){shell.hidden=true;return;}inspectorContent(panel,`<div class="eyebrow">${({ox:'牛車運送',porter:'碼頭腳夫',peddler:'挑擔行商',traveler:'過橋旅人',shopper:'趕集來客'})[a.kind]}</div><h2>${escape(a.name)}</h2><p>${escape(a.traffic||a.action)}</p><hr><label>此刻攜帶</label><p>${a.kind==='peddler'?'挑擔與日用雜貨':a.carrying?at(town,`${a.kind==='ox'?'ox':'porter'}:${a.id}`).map(l=>GOODS[l.good]).join('、'):'輕裝行走'}</p><label>行程</label><p>${a.walking?'正在沿街道前往目的地':'停留、歇腳或等候'}</p>`);if(outlined){scene.clearGroup(scene.selection);outlined='';}
 }else if(ref.kind==='boat'){
  const b=town.life.boat;inspectorContent(panel,`<div class="eyebrow">汴河水運 · 第 ${b.trips+1} 航次</div><h2>汴河漕船</h2><p>${boatStatus()}</p><hr><label>船上貨物</label><p>${escape(b.cargo)} 件，${b.mast?'桅杆升起':'已收桅，準備過橋'}</p><label>本鎮累計</label><p>已卸 ${escape(town.life.dock.received)} 件 · 已送商鋪 ${escape(town.life.dock.delivered)} 件</p>`);if(outlined){scene.clearGroup(scene.selection);outlined='';}
 }else{
  const p=town.people.find(p=>p.id===ref.id);if(!p){shell.hidden=true;return;}const home=town.building(p.home),work=town.building(p.work),dest=town.building(p.destination);
  if(panel.dataset.person!==String(p.id)){
   panel.innerHTML=`<div class="eyebrow">街巷人物 · 一個人的日常</div><h2 id="person-name"></h2><p id="person-action"></p><p id="person-familiarity"></p><button data-observe-person="${p.id}">觀察這段日常</button><button id="watch-person-btn" data-watch-person="${p.id}"></button><details><summary id="person-wellbeing-title">民生滿意分項</summary><p id="person-wellbeing" style="white-space:pre-line"></p></details><button class="primary" id="follow-btn" data-follow="${escape(p.id)}"></button><hr><label>住處 · 工作場所</label><p id="person-place"></p><label>當下目的地</label><p id="person-goal"></p><section><label>街坊委託</label><p id="person-commission-reply"></p><button data-person-commission="${escape(p.id)}">回應這位居民的委託</button></section><label>今日記事 · 最新在上</label><ol id="person-diary" class="life-events"></ol>`;panel.dataset.person=String(p.id);delete panel.dataset.author;delete panel.dataset.content;
  }
  const happiness=wellbeingReport(town).residents.get(p.id);$('#person-wellbeing-title').textContent=`民生滿意 ${happiness.score.toFixed(1)}／100 · 查看分項`;$('#person-wellbeing').textContent=happiness.parts.map(x=>`${x.name} ${x.score.toFixed(1)}／100（占${x.weight}％）\n${x.reason}`).join('\n\n');
  $('#person-familiarity').textContent=familiarityText(town,p.id);$('#watch-person-btn').textContent=residentRecord(town,p.id)?.watched?'取消關注這位居民':'加入關注名冊';
  $('#person-commission-reply').textContent=commissionReply(town,p.id);
  $('#person-name').textContent=p.name;$('#person-action').textContent=(p.traffic||p.action)+((p.needsSatisfiedUntil||0)>town.elapsed?' · 日用品已備妥':'')+' · '+residentCondition(p)+` · 學力 ${educationOf(p).toFixed(1)}／100 · 健康 ${Math.floor(p.health??100)}／100${onSickLeave(town,p)?' · 病假休養':''}${healthcareReport(town).assigned.has(p.id)?' · 接受藥鋪照護':''}`;
  $('#person-place').textContent=`${home?.name||'尚未安排'} · ${work?.name||'尚待安排'}`;
  $('#person-goal').textContent=p.streetEvent?`${town.stories.active?.venue||'街口'} · ${town.stories.active?.title||'街坊相聚'}`:dest?.name||'暫無目的地';
  $('#follow-btn').textContent=following===p.id?'停止跟隨':'跟著他過一天';$('#follow-btn').setAttribute('aria-pressed',String(following===p.id));
  const diary=(p.diary||[]).map(e=>`<li><time>${formatTime(e.time)}</time><span>${escape(e.text)}</span></li>`).join('')||'<li>等一段日常慢慢發生。</li>';
  if($('#person-diary').innerHTML!==diary)$('#person-diary').innerHTML=diary;
  if(outlined){scene.clearGroup(scene.selection);outlined='';}
 }
 const heading=panel.querySelector('h2');if(heading){heading.id||='inspector-title';heading.tabIndex=-1;shell.setAttribute('aria-labelledby',heading.id);}
}
function updateUI(day){syncPauseButton();const incident=town.buildings.find(b=>b.fireWarningAt!==undefined)||town.buildings.find(damaged);$('#fire-alert').hidden=!incident;if(incident)$('#fire-alert').textContent=`${incident.fireWarningAt!==undefined?'火警預警':'整修中'}：${incident.name} · 點此查看`;if(following!=null&&!town.people.some(p=>p.id===following)&&!String(following).startsWith('author:'))stopFollowing();financeUI.update();$('#weather-btn').textContent=`${town.weather.raining?'細雨':'晴天'} · ${{auto:'自然',rain:'手動',clear:'手動'}[town.weather.mode]}`;$('#weather-btn').setAttribute('aria-label',`天候：${town.weather.raining?'細雨':'晴天'}，${{auto:'自然',rain:'手動',clear:'手動'}[town.weather.mode]}模式`);const h=town.time%24,hh=Math.floor(h),mm=Math.floor((h-hh)*60);$('#clock').textContent=`第 ${Math.floor(town.time/24)+1} 日　${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;const shichen=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'][Math.floor(((h+1)%24)/2)];$('#period').textContent=`${calendar(town).label} · ${shichen}時${watchOf(town)?` · ${watchOf(town)}`:''} · ${h<6?'萬籟俱寂':h<10?'晨光初醒':h<16?'日光正好':h<19?'炊煙漸起':'燈火可親'}`;$('#sun-icon').textContent=day>.5?'☀':'☾';$('#light-toggle').textContent=day>.5?'☾':'☀';document.body.classList.toggle('night',day<.4);updateDataLayer();updateGateway();$('#town-name-label').textContent=townName(town);$('#town-rank-label').textContent=`${rankName(town)} · 我的城鎮`;$('#population').textContent=town.people.length;$('#building-count').textContent=town.buildings.length;$('#block-count').textContent=town.blocks.length;hud.update();renderInspector();}
function boatStatus(){const b=town.life.boat;return b.state==='approach'?(b.mast?'貨船沿汴河駛來':'船家收桅，緩緩穿過虹橋'):({mooring:'船家正在靠岸繫纜',unloading:'腳夫往返船邊卸貨',depart:'卸貨完成，貨船離岸',away:'等候下一艘來船'})[b.state];}
function updateJournal(){
 const panel=$('#life-panel');$('#life-btn').setAttribute('aria-expanded',String(journalOpen));panel.hidden=!journalOpen;if(!journalOpen)return;const l=town.life;
 if(!panel.querySelector('.watch-buttons'))panel.innerHTML=`<div class="eyebrow">此時此地 · 活著的市井</div><button class="panel-close" data-close-life>關閉市井見聞</button><h2 id="life-heading" tabindex="-1">汴水有消息</h2><p class="boat-status"></p><div class="life-numbers"><span><b id="j-visitors"></b> 來客</span><span><b id="j-stock"></b> 件待運</span><span><b id="j-delivered"></b> 件送達</span></div><div class="watch-buttons"><button data-focus="bridge">虹橋看船 ↗</button><button data-focus="dock">碼頭卸貨 ↗</button><button data-focus="town">回到街坊 ↗</button></div><button class="production-link" data-production>物產流轉 · 追蹤貨物 ↗</button><div id="street-story"><strong id="story-title"></strong><p id="story-description"></p><button data-story-focus>去街口看看 ↗</button></div><button data-story-history>街頭往事 · 散場補訪</button><ol class="life-events"></ol>`;
 panel.querySelector('.boat-status').textContent=town.buildings.length?boatStatus():'先安放街坊，等市井生活長出來';
 $('#j-visitors').textContent=l.visitors.filter(a=>a.visible).length;$('#j-stock').textContent=l.dock.stock;$('#j-delivered').textContent=l.dock.delivered;
 const event=town.stories.active||town.stories.last;
 $('#story-title').textContent=event?.title||'街頭暫歇';$('#story-description').textContent=event?`${event.venue} · ${town.stories.active?(event.phase==='active'?'正在相聚':'街坊陸續到來'):'上一場已散場，可回看地點'}`:'等下一段相遇';
 panel.querySelector('[data-story-focus]').disabled=!event;
 const events=town.events.slice(0,5).map(e=>`<li><time>${String(Math.floor(e.time%24)).padStart(2,'0')}:${String(Math.floor(e.time%1*60)).padStart(2,'0')}</time><span>${escape(e.text)}</span></li>`).join('');
 const list=panel.querySelector('.life-events');if(list.dataset.content!==events){list.innerHTML=events;list.dataset.content=events;}
}
for(const [value,label] of Object.entries(GOODS))$('#goods-filter').add(new Option(label,value));$('#goods-filter').onchange=()=>renderProduction();
function renderProduction(){
 const overview=RECIPES.map(r=>{const works=town.buildings.filter(b=>b.type==='work'&&b.variant===RECIPES.indexOf(r));return `<article class="production-card"><h3>${GOODS[r.input]} → ${GOODS[r.output]}</h3><p>原料 ${town.economy.lots.filter(l=>l.good===r.input).length} 份 · 成品 ${town.economy.lots.filter(l=>l.good===r.output&&l.at!=='sold').length} 件 · 售出 ${escape(town.economy.sold[r.output]||0)} 件</p><p>${works.length?works.map(b=>`${escape(b.name)}：${escape(b.productionStatus||'等候工匠與原料')}`).join('<br>'):'先安放對應作坊，再等工匠到來'}</p></article>`;}).join('');$('#production-overview').innerHTML=overview;
 const filter=$('#goods-filter').value;const lots=town.economy.lots.filter(l=>filter==='all'||l.good===filter).sort((a,b)=>(a.at==='sold')-(b.at==='sold')||(!!b.madeAt)-(!!a.madeAt)||b.id-a.id);
 $('#lot-list').innerHTML=lots.map(l=>lotButton(l,placeName(town,l.at))).join('')||'<p>等一艘載貨的船到來。</p>';
 if(!lots.some(l=>l.id===selectedLot))selectedLot=lots[0]?.id;renderLot();
}
function renderLot(){
 for(const button of document.querySelectorAll('[data-lot]'))button.setAttribute('aria-pressed',String(Number(button.dataset.lot)===selectedLot));
 const l=town.economy.lots.find(l=>l.id===selectedLot);if(!l){$('#lot-detail').removeAttribute('aria-labelledby');$('#lot-detail').innerHTML='<p>目前篩選沒有可追蹤的貨物。</p>';return;}
 $('#lot-detail').setAttribute('aria-labelledby','lot-detail-title');
 $('#lot-detail').innerHTML=`<h3 id="lot-detail-title">${lotIdentity(l)}</h3><p>來源：${escape(l.origin)}${l.madeAt?` · 製作：${escape(town.building(l.madeAt)?.name)}`:''}</p><ol class="cargo-trail">${l.trailOmitted?`<li>較早的 ${escape(l.trailOmitted)} 筆紀錄已收進摘要；來源與製作紀錄仍保留。</li>`:''}${l.trail.map(step=>`<li>第 ${Math.floor(step.time/24)+1} 日 ${formatTime(step.time)} · ${escape(placeName(town,step.at))}</li>`).join('')}</ol>${locateLot(town,l)?lotFocusButton(l):'<p>這件貨已由來客購得。</p>'}`;
}
$('#production').onclick=e=>{const select=e.target.closest('[data-lot]');if(select){selectedLot=Number(select.dataset.lot);renderLot();return;}const focus=e.target.closest('[data-lot-focus]');if(!focus)return;const lot=town.economy.lots.find(l=>l.id===Number(focus.dataset.lotFocus)),location=lot&&locateLot(town,lot);if(!location)return;$('#production').close();journalOpen=false;updateJournal();stopFollowing();setMode('explore');pinned=location.ref||null;hovered=null;scene.focusAt(location.point,2.6);if(pinned)focusInspector();toast(`${GOODS[lot.good]} · ${placeName(town,lot.at)}`);};
recovery=new RecoveryPoint({read:()=>town.toJSON(),validate:validateSave});
const showRuntimeError=installRuntimeRecovery({getRecovery:()=>recovery,store:saveStore,fixtureMode});
const faultInjection=import.meta.env.DEV&&(fixtureMode||storageTest)?new URLSearchParams(location.search).get('runtime-fault'):null;let faultTicks=0;
const runtime=createRuntime({
 request:fn=>requestAnimationFrame(fn),cancel:id=>cancelAnimationFrame(id),hidden:()=>document.hidden,
 options:()=>({speed,paused:paused||!!document.querySelector('dialog[open]')}),tick:dt=>{town.tick(dt);if(faultInjection==='tick'&&++faultTicks===3){town.time=NaN;throw Error('測試：模擬更新中斷');}},
 mute:()=>sound.update(town,true),onHide:save,onError:showRuntimeError,
 render:(dt,now,isPaused)=>{const day=scene.update(town,dt);buildingLabels.update(town,scene);if(faultInjection==='render')throw Error('測試：畫面更新中斷');sound.update(town,isPaused);if(now-lastUi>180){updateUI(day);updateJournal();lastUi=now;}recovery.checkpoint(now);if(now-lastSave>12000){save();lastSave=now;}}
});
// Read-only diagnostics allow reproducible interaction checks without modifying simulation state.
let graphicsSnapshot=null;
const graphicsNotice=installContextRecoveryUI({snapshot:()=>structuredClone(graphicsSnapshot),exportSave:data=>saveStore.export(data),toast,reload:data=>{
 if(!fixtureMode&&!saveStore.save(data).ok)return false;location.reload();return true;
}});
installContextRecovery({canvas,runtime,capture:()=>{if(recovery.fault)throw recovery.fault;discardPointerDraft();graphicsSnapshot=validateSave(town.toJSON());},
 rebuild:()=>{scene.resize();scene.renderer.render(scene.scene,scene.camera);},notify:graphicsNotice,onError:showRuntimeError});
window.__townDebug={town:()=>town,follow:()=>({id:following,target:scene.controls.target.toArray()}),screenPerson:id=>{const model=scene.personModels.get(id);if(!model?.visible)return null;const p=model.position.clone().add(new THREE.Vector3(0,.55,0)).project(scene.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};},snapshot:()=>JSON.parse(JSON.stringify(town)),screenCell:(x,z)=>{const p=new THREE.Vector3(x*4,0,z*4).project(scene.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};},screenBuilding:id=>{const b=town.building(id);if(!b)return null;const p=new THREE.Vector3(b.x*4,1,b.z*4).project(scene.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};},renderInfo:()=>({...scene.renderer.info.render}),mode:()=>mode,sound:()=>({enabled:sound.enabled,state:sound.ctx?.state||'not-started',gain:sound.master?.gain.value||0,volume:sound.volume}),screenLife:id=>{const a=[...town.life.visitors,...town.life.porters,...town.life.oxen].find(a=>a.id===id);if(!a)return null;const p=new THREE.Vector3(a.x,1,a.z).project(scene.camera);return {x:(p.x+1)/2*innerWidth,y:(1-p.y)/2*innerHeight};}};

function plannedCells(c){if(editing?.kind==='move')return town.building(editing.id)?.footprint?squareCells(c):[c];if(editing)return [c];return selectedDesign&&plotSize===4?squareCells(c):[c];}
function literatureLink(b){const d=DESIGNS[designFor(b)];if(!d?.source)return '';const source=SOURCES[d.source];return `<section class="literary-note"><small>${escape(source.author)} · ${escape(source.title)}</small><blockquote>${escape(source.quote)}</blockquote><button class="tag" data-reading="${d.source}">讀作品與地景 ↗</button></section>`;}
function showLiterature(id){const s=SOURCES[id];if(!s)return;$('#literature-title').textContent=s.title;$('#literature-body').innerHTML=`<p class="source-author">${escape(s.author)} · ${escape(s.era)}</p><blockquote>${escape(s.quote)}</blockquote><h3>文字如何長成風景</h3><p>${escape(s.note)}</p><a href="${s.url}" target="_blank" rel="noopener noreferrer">閱讀原文出處 ↗</a><p class="fine">引文為公版古典作品。建築名稱與造型為遊戲設計。</p>`;$('#literature').showModal();readingUI.visit($('#literature-body'),SOURCE_WORK[id]);}
const planArt=id=>{const common='<path d="M15 81H145" stroke="#8f9477" stroke-width="2"/>';const roof=(x,y,w)=>`<path d="M${x} ${y+15}L${x+10} ${y+4}L${x+w-10} ${y+4}L${x+w} ${y+15}Z" fill="#586b68"/><path d="M${x+12} ${y+16}V80M${x+w-12} ${y+16}V80" stroke="#826345" stroke-width="4"/>`;let art='';if(id==='cleaningYard')art=roof(20,8,120)+'<path d="M30 58H125V76H30Z" fill="#826345"/><circle cx="45" cy="79" r="9" fill="#454536"/><circle cx="111" cy="79" r="9" fill="#454536"/><path d="M50 44H68V60H50ZM80 44H98V60H80Z" fill="#65775a"/>';else if(id==='well')art=roof(25,8,110)+'<ellipse cx="80" cy="70" rx="32" ry="12" fill="#b9b294"/><ellipse cx="80" cy="67" rx="23" ry="8" fill="#325e60"/><path d="M80 34V67M38 37H122" stroke="#826345" stroke-width="4"/>';else if(id==='garden')art='<path d="M20 65H140M80 30V85" stroke="#b6a987" stroke-width="10"/><circle cx="48" cy="48" r="17" fill="#8c9c69"/><circle cx="110" cy="48" r="17" fill="#8c9c69"/><circle cx="48" cy="45" r="6" fill="#d5a194"/><circle cx="110" cy="45" r="6" fill="#d9c379"/>';else if(id==='inn')art=roof(24,6,112)+'<path d="M38 56H122V80H38Z" fill="#e4d8bc"/><path d="M46 56V80M114 56V80" stroke="#7a5233" stroke-width="4"/><path d="M60 62H100V80H60Z" fill="#8a6b45"/><path d="M28 28H54V46H28Z" fill="#9b4c38"/><path d="M126 30V78" stroke="#826345" stroke-width="4"/><path d="M126 32H146V44H126Z" fill="#b9984b"/>';else if(id==='pawnshop')art=roof(30,6,100)+'<path d="M42 56H118V80H42Z" fill="#cfc3a4"/><path d="M56 62H104V80H56Z" fill="#6f5a41"/><path d="M62 36H98V52H62Z" fill="#b9984b"/><path d="M70 40H90V48H70Z" fill="#4a3c2a"/><path d="M24 80H136" stroke="#7a5233" stroke-width="5"/>';else if(id==='townOffice')art=roof(28,6,104)+'<path d="M40 58H120V80H40Z" fill="#e4d8bc"/><path d="M52 58V80M108 58V80" stroke="#7a5233" stroke-width="4"/><path d="M30 34H130V50H30Z" fill="#b3ab90"/><path d="M22 24V80M138 24V80" stroke="#9b4c38" stroke-width="5"/>';
 else if(id==='taxOffice')art=roof(30,10,100)+'<path d="M38 56H122V78H38Z" fill="#9c7c55"/><path d="M62 30H98V46H62Z" fill="#b9984b"/><path d="M44 50H116" stroke="#7a5233" stroke-width="3"/><circle cx="108" cy="56" r="7" fill="#50504a"/>';
 else if(id==='wineOffice')art=roof(22,12,86)+'<path d="M112 20V72" stroke="#7a5233" stroke-width="5"/><path d="M114 22H142V40H114Z" fill="#9d7136"/><ellipse cx="46" cy="72" rx="13" ry="9" fill="#a9763f"/><ellipse cx="74" cy="74" rx="13" ry="9" fill="#8c6234"/><ellipse cx="60" cy="58" rx="12" ry="8" fill="#a9763f"/>';
 else if(id==='postStation')art=roof(18,14,74)+'<path d="M96 46H140V78H96Z" fill="#8a7355"/><path d="M96 46L118 30L140 46" fill="#6d6a4f"/><path d="M26 18V78" stroke="#7a5233" stroke-width="4"/><path d="M26 22H52" stroke="#7a5233" stroke-width="3"/><circle cx="52" cy="28" r="6" fill="#b9984b"/>';
 else if(id==='villageSchool')art=roof(34,16,92)+'<path d="M46 58H114V78H46Z" fill="#e4d8bc"/><path d="M52 66H74V72H52ZM86 66H108V72H86Z" fill="#7a5233"/><circle cx="26" cy="60" r="11" fill="#8c9c69"/>';
 else if(id==='townSchool')art=roof(38,8,84)+roof(8,44,44)+roof(108,44,44)+'<path d="M56 62H104V80H56Z" fill="#8f9e84"/><path d="M64 68H96" stroke="#7a5233" stroke-width="3"/>';
 else if(id==='earthShrine')art='<path d="M44 34L80 14L116 34L104 42H56Z" fill="#9b4c38"/><path d="M58 42H102V78H58Z" fill="#e4d8bc"/><path d="M68 54H92V78H68Z" fill="#9b4c38"/><ellipse cx="34" cy="70" rx="12" ry="8" fill="#6d6a5c"/><circle cx="130" cy="52" r="14" fill="#8c9c69"/>';
 else if(id==='cityGodTemple')art='<path d="M18 30H142L134 42H26Z" fill="#9b4c38"/><path d="M30 42H130V56H30Z" fill="#4a5f63"/><path d="M44 56H116V80H44Z" fill="#e4d8bc"/><path d="M62 62H98V80H62Z" fill="#9b4c38"/><path d="M26 18H134" stroke="#4a5f63" stroke-width="6"/>';
 else if(id==='dock')art='<path d="M10 74H150" stroke="#5f8a84" stroke-width="12"/><path d="M28 56H126V66H28Z" fill="#7a5233"/><path d="M40 66V80M74 66V80M108 66V80" stroke="#7a5233" stroke-width="4"/><path d="M34 20V56" stroke="#7a5233" stroke-width="5"/><path d="M34 22H72" stroke="#7a5233" stroke-width="4"/><path d="M72 24V40" stroke="#6b5a45" stroke-width="3"/>';
 else if(id==='granary')art='<ellipse cx="52" cy="34" rx="24" ry="10" fill="#8c8058"/><path d="M28 34H76V76H28Z" fill="#cbb98f"/><ellipse cx="112" cy="42" rx="20" ry="9" fill="#8c8058"/><path d="M92 42H132V76H92Z" fill="#cbb98f"/><path d="M46 56H58V76H46Z" fill="#7a5233"/>';
 else if(id==='watermill')art=roof(16,14,68)+'<path d="M12 72H150" stroke="#5f8a84" stroke-width="10"/><circle cx="114" cy="56" r="26" fill="none" stroke="#7a5233" stroke-width="5"/><path d="M114 30V82M88 56H140M96 38L132 74M132 38L96 74" stroke="#6b5030" stroke-width="4"/>';
 else if(DESIGNS[id]?.type==='home')art=roof(25,5,110)+roof(20,40,120)+'<path d="M40 40H120M50 30V40M75 30V40M100 30V40" stroke="#a47d52" stroke-width="3"/>';else if(DESIGNS[id]?.type==='work')art=roof(20,15,120)+'<path d="M28 55H130V80H28Z" fill="#9c815e"/><path d="M44 55V30H58V55" fill="#a07357"/>';else if(id==='pond')art='<ellipse cx="80" cy="64" rx="60" ry="17" fill="#78a59a"/><path d="M74 64V44M99 66V50" stroke="#778950" stroke-width="2"/><ellipse cx="63" cy="66" rx="18" ry="5" fill="#829e67"/><path d="M62 45Q74 22 85 45Q74 59 62 45" fill="#c89391"/>';else if(id==='wine')art=roof(24,5,112)+roof(16,39,128)+'<path d="M31 39H127M31 29H127M40 28V40M56 28V40M73 28V40M90 28V40M108 28V40" stroke="#a47d52" stroke-width="3"/>';else if(id==='academy')art=roof(38,12,84)+roof(9,47,42)+roof(109,47,42)+'<path d="M61 70H100V82H61Z" fill="#80a49a"/>';else if(id==='pavilion')art='<path d="M24 39L80 10L137 39L115 47H45Z" fill="#586b68"/><path d="M45 44V80M80 44V80M115 44V80" stroke="#8a6744" stroke-width="4"/>';else if(id==='textile')art=roof(25,7,110)+'<path d="M38 41H64V78H38Z" fill="#ac7673"/><path d="M66 41H92V78H66Z" fill="#82a3a1"/><path d="M94 41H120V78H94Z" fill="#c3ad7a"/>';else if(id==='food')art=roof(20,20,120)+'<path d="M39 30V9H51V30" fill="#9d8b71"/><path d="M24 49H136L145 61H15Z" fill="#b68c67"/><path d="M49 79V67H108V79" fill="#b89a6d"/>';else art=roof(15,20,78)+roof(82,39,63)+'<ellipse cx="104" cy="69" rx="19" ry="5" fill="#a58c66"/><path d="M104 70V80" stroke="#826345" stroke-width="3"/>';return `<svg viewBox="0 0 160 92" aria-hidden="true">${common}${art}</svg>`;};
function renderBlueprints(){document.querySelectorAll('[data-design-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.designFilter===designFilter)));document.querySelectorAll('[data-size]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.size)===plotSize)));$('#design-filter-note').textContent=designFilter==='all'?'共 '+Object.keys(DESIGNS).length+' 款圖樣，依民居／商鋪／作坊／園景／文教／公設／祠廟／水運分類。':designFilter==='new'?'第二批新增的十款外觀。':CATEGORY_NOTE[designFilter]||'';
 const built=new Map();for(const b of town.buildings)built.set(designFor(b),(built.get(designFor(b))||0)+1);
 $('#blueprint-grid').innerHTML=Object.entries(DESIGNS).filter(([id,d])=>designFilter==='all'||designFilter==='new'&&!!NEW_DESIGNS[id]||designCategory(id)===designFilter).map(([id,d])=>`<article class="blueprint-card${built.get(id)?' is-built':''}">${planArt(id)}<div><h3>${d.name}<span class="blueprint-tag">${CATEGORIES[designCategory(id)]}</span></h3><p class="blueprint-state">${built.get(id)?`鎮上已有 ${built.get(id)} 處`:'尚未營造'} · 每格 ${formatMoney(cellCost(d.type,id))}</p><p>${d.detail}</p>${blueprintLifeHTML(id)}<small>${d.source?SOURCES[d.source].author+' · '+SOURCES[d.source].title:'宋式街坊 · 遊戲建築設計'}</small></div><button data-plan="${id}">${d.sizes.includes(plotSize)?(plotSize===4?'四格合建':d.sizes.includes(4)?'點蓋／拖曳合建':'一格營造'):'使用'+(d.sizes.includes(4)?'四格合建':'一格營造')}${id==='pond'?' · 挖池塘':''} ↗</button></article>`).join('');}
$('#blueprints-btn').onclick=()=>{renderBlueprints();$('#blueprints').showModal();};
$('#blueprints').onclick=e=>{const filter=e.target.closest('[data-design-filter]');if(filter){designFilter=filter.dataset.designFilter;renderBlueprints();return;}const size=e.target.closest('[data-size]');if(size){plotSize=Number(size.dataset.size);renderBlueprints();return;}const plan=e.target.closest('[data-plan]');if(!plan)return;const d=DESIGNS[plan.dataset.plan];if(!d.sizes.includes(plotSize))plotSize=d.sizes[0];setMode(d.type);selectedDesign=plan.dataset.plan;pinned=hovered=null;journalOpen=false;updateJournal();$('#blueprint-status').textContent=`${d.name} · ${plotSize===4?'四格合建':'一格小築'}`;$('#blueprint-status').hidden=false;$('#mode-hint').textContent=`${d.name} · 點選${plotSize===4?'完整的 2 × 2':'一格'}空地${d.type==='garden'?'營造園景':'開始動工'} · Esc 取消`;$('#welcome').hidden=true;$('#blueprints').close();focusScene();};

function showAuthorWork(id){const a=authorById(id);if(!a)return;$('#author-work-title').textContent=a.title;$('#author-work-body').innerHTML=`<p class="source-author">${a.name} · ${a.era} · ${a.form}</p><div class="original-work">${escape(a.text)}</div><hr><p>${escape(a.intro)}</p><a href="${a.url}" target="_blank" rel="noopener noreferrer">閱讀原文出處 ↗</a><p class="fine">宋代公版原文。跨年代的行旅與落筆為遊戲演出。</p>`;$('#author-work').showModal();readingUI.visit($('#author-work-body'),id);}
function renderWriters(){const list=town.literati.collected;$('#writers-count').textContent=`汴水文集 · 已落筆 ${list.length} / ${AUTHORS.length} 篇`;$('#writers-list').innerHTML=AUTHORS.map(a=>{const actor=town.literati.actors.find(v=>v.author===a.id),entry=list.find(v=>v.author===a.id);return `<article class="writer-card"><small>${a.era} · ${a.form}</small><h3>${a.name}</h3><p>${a.title}</p><p class="writer-state">${escape(authorStatus(town,actor))}</p><p class="fine">${entry?`已收入文集 · ${escape(entry.venue)} · 第 ${Math.floor(entry.time/24)+1} 日 ${formatTime(entry.time)}`:'晴天停步落筆後收入文集，代表作隨時可讀。'}</p><div><button data-author-focus="${a.id}" ${actor?.visible?'':'disabled'}>去找${a.name} ↗</button><button data-author-work="${a.id}">讀代表作</button></div></article>`;}).join('');}
$('#writers-btn').onclick=()=>{renderWriters();$('#writers').showModal();};
$('#writers').onclick=e=>{const work=e.target.closest('[data-author-work]');if(work){showAuthorWork(work.dataset.authorWork);return;}const focus=e.target.closest('[data-author-focus]');if(!focus)return;const a=town.literati.actors.find(v=>v.author===focus.dataset.authorFocus);if(!a?.visible)return;$('#writers').close();stopFollowing();setMode('explore');journalOpen=false;updateJournal();pinned={kind:'author',id:a.author};hovered=null;scene.focusAt([a.x,a.z],2.8);focusInspector();};

function canPlan(cells){const report=previewPlan(town,{mode,design:selectedDesign,editing},cells);$('#mode-hint').textContent=report.text;return report.valid;}
function applyUrban(fn,{record=true}={}){
 editFailure='';
 const editFault=import.meta.env.DEV&&(fixtureMode||storageTest)&&new URLSearchParams(location.search).get('edit-fault')==='refresh';
 const result=editTown(town,draft=>{if(editFault)draft.rebuildRoads=()=>{throw Error('測試：城市道路更新中斷');};const edited=fn(draft);if(edited&&record)recordConstruction(town,draft);return edited;},{prepare:draft=>{scene.update(draft,0);},persist:data=>fixtureMode?{ok:true}:saveStore.save(data)});
 if(!result.ok){if(result.error){editFailure='操作未完成，原小鎮與進度仍保留。';$('#save-status').textContent=editFailure;toast(editFailure);try{scene.update(town,0);}catch{showRuntimeError(result.error);}}return false;}
 town=result.town;undoTown=result.before;runtime.reset();recovery=new RecoveryPoint({read:()=>town.toJSON(),validate:validateSave});$('#undo-urban').hidden=false;if(drag)canPlan(drag.cells);$('#save-status').textContent=fixtureMode?'預覽場景 · 不覆寫小鎮':'進度已留存';return result.result;
}
function buildingTools(b){if(b.stage<3)return '';const tier=tierOf(b),use=upgradeUse(town,b);return `<hr><p>${escape(use.text)}</p><label>建築 ${tier}／${MAX_TIER} 級 · ${TIER_NAMES[tier-1]} · ${buildingAbility(b)} · 每日維護 ${formatMoney(buildingStats(b).upkeep)}</label><p class="tier-detail">${tier<MAX_TIER?`下級：${tierAppearance(b,tier+1)}；${buildingAbility(upgradePreview(b))}；每日維護 ${formatMoney(buildingStats(upgradePreview(b)).upkeep)}`:'已達五級 · 盛景落成'}</p><div class="building-tools"><button data-manage="move" data-building="${escape(b.id)}">搬移 ${managed(town)?formatMoney(moveCost(b)):''}</button><button data-manage="delete" data-building="${escape(b.id)}">拆除</button>${tier<MAX_TIER?`<button data-manage="upgrade" ${!use.allowed?'disabled':''} data-building="${escape(b.id)}">升至 ${tier+1} 級${managed(town)?' · '+formatMoney(upgradeCost(b)):''}</button>`:''}${['home','work'].includes(b.type)&&!b.footprint?`<button data-manage="expand" ${!use.allowed?'disabled':''} data-building="${escape(b.id)}">四格擴建${managed(town)?' · '+formatMoney(upgradeCost(b,true)):''} ↘</button>`:''}</div>`;}

function openCatalog(cat){designFilter=cat;plotSize=1;renderBlueprints();$('#public-works').close();$('#blueprints').showModal();}
for(const b of document.querySelectorAll('.toolbar [data-catalog]'))b.onclick=()=>{$('#welcome').hidden=true;openCatalog(b.dataset.catalog);};
$('#public-btn').onclick=()=>$('#public-works').showModal();
$('#public-works').onclick=e=>{const cat=e.target.closest('[data-catalog]');if(cat){openCatalog(cat.dataset.catalog);return;}const b=e.target.closest('[data-road]');if(!b)return;$('#public-works').close();setMode('road');editing={kind:'road',type:b.dataset.road};pinned=hovered=null;$('#welcome').hidden=true;$('#mode-hint').textContent=`${ROAD_TYPES[editing.type]||'移除自建道路'} · 點選或拖曳空格（最多 24 格） · Esc 取消`;focusScene();};
$('#fire-alert').onclick=()=>{const b=town.buildings.find(b=>b.fireWarningAt!==undefined)||town.buildings.find(damaged);if(!b)return;stopFollowing();setMode('explore');pinned={kind:'building',id:b.id};hovered=null;scene.focusAt([b.x*CELL,b.z*CELL],2.6);focusInspector();};
$('#public-fire').onclick=()=>{$('#public-works').close();plotSize=1;setMode('garden');selectedDesign='firePost';$('#blueprint-status').textContent=`軍巡鋪 · 每格 ${formatMoney(15000)}`;$('#blueprint-status').hidden=false;$('#mode-hint').textContent='軍巡鋪 · 點蓋或斜拉四格 · 沿路覆蓋附近建築';$('#welcome').hidden=true;};
$('#public-cleaning').onclick=()=>{$('#public-works').close();plotSize=1;setMode('garden');selectedDesign='cleaningYard';$('#blueprint-status').textContent=`街道司 · 每格 ${formatMoney(15000)}`;$('#blueprint-status').hidden=false;$('#mode-hint').textContent='街道司 · 點蓋或斜拉四格 · 須以道路接至住宅與作坊';$('#welcome').hidden=true;};
$('#public-water').onclick=()=>{$('#public-works').close();plotSize=1;setMode('garden');selectedDesign='well';$('#blueprint-status').textContent=`街坊水井 · 每格 ${formatMoney(15000)} · 落成後供水`;$('#blueprint-status').hidden=false;$('#mode-hint').textContent='街坊水井 · 點蓋一格或斜拉四格井院 · 須有步道接到住宅';$('#welcome').hidden=true;};
$('#public-garden').onclick=()=>{$('#public-works').close();plotSize=1;designFilter='garden';renderBlueprints();$('#blueprints').showModal();};
$('#demolish-confirm').onclick=()=>{const id=pendingDelete;$('#demolish').close();stopFollowing();if(applyUrban(draft=>demolishBuilding(draft,id))){pinned=hovered=null;toast('已拆除，住戶與貨物妥善保留；可復原上一步');}};
$('#undo-urban').onclick=()=>{if(!undoTown)return;$('#undo-description').textContent=`將整座小鎮回到第 ${Math.floor(undoTown.time/24)+1} 日 ${formatTime(undoTown.time)}（操作前）。這會一起回復建築、道路、居民位置與貨物；其後約 ${Math.max(0,Math.round(town.elapsed-undoTown.elapsed))} 秒的模擬進度也會回復。`;$('#confirm-undo').showModal();};
$('#undo-confirm').onclick=()=>{if(!undoTown)return;const target=undoTown;if(!applyUrban(draft=>{Object.assign(draft,Town.restore(target));return true;},{record:false}))return;stopFollowing();undoTown=null;pinned=hovered=null;setMode('explore');$('#undo-urban').hidden=true;$('#welcome').hidden=!!town.buildings.length;$('#confirm-undo').close();toast('已回到確認視窗所列的操作前時間');};

$('#stalls-btn').onclick=()=>{const stalls=marketStalls(town);$('#stalls-list').innerHTML=stalls.length?stalls.map(stallListItem).join(''):'<p>先讓商鋪或說書棚落成，或將道路鋪成 2 × 2 市心，攤販便會出現。</p>';$('#public-works').close();$('#stalls').showModal();};
$('#stalls').onclick=e=>{const b=e.target.closest('[data-stall-focus]');if(!b)return;const s=marketStalls(town).find(s=>s.id===b.dataset.stallFocus);if(!s)return;$('#stalls').close();stopFollowing();setMode('explore');pinned={kind:'stall',id:s.id};hovered=null;scene.focusAt([s.x,s.z],2.8);renderInspector();};

if(!fixtureMode)saveUI=installSaveUI({store:saveStore,getTown:()=>town.toJSON(),prepareTown:data=>Town.restore(data),pause:()=>{if(!paused)$('#pause-btn').click();},replaceTown:restored=>{stopFollowing();town=restored;journeyUI.resetSession();runtime.reset();recovery=new RecoveryPoint({read:()=>town.toJSON(),validate:validateSave});undoTown=null;pinned=hovered=null;selectedLot=null;scene.reset();scene.resetView();setMode('explore');$('#undo-urban').hidden=true;$('#welcome').hidden=!!town.buildings.length;$('#inspector').hidden=true;toast('已讀取選定版本，小鎮暫停中');save();}});else $('#save-manager-btn').onclick=()=>toast('預覽場景不寫入存檔；請使用一般小鎮的存檔管理');

let dataLayer=null,layerAt=0;
$('#layer-buttons').innerHTML=Object.entries(LAYERS).map(([key,l])=>`<button data-layer="${key}" aria-pressed="false">${l.name}</button>`).join('');
$('#layer-toggle').onclick=()=>{const open=$('#layer-buttons').hidden;$('#layer-buttons').hidden=!open;$('#layer-toggle').setAttribute('aria-expanded',String(open));if(!open)setLayer(null);};
function setLayer(key){
 dataLayer=dataLayer===key?null:key;layerAt=0;
 for(const b of document.querySelectorAll('[data-layer]'))b.setAttribute('aria-pressed',String(b.dataset.layer===dataLayer));
 $('#layer-note').hidden=!dataLayer;$('#layer-note').textContent=dataLayer?LAYERS[dataLayer].note:'';
 if(!dataLayer)scene.showDataLayer([]);
}
$('#layer-buttons').onclick=e=>{const b=e.target.closest('[data-layer]');if(b)setLayer(b.dataset.layer);};
function updateGateway(){
 const stranded=managed(town)&&town.buildings.some(b=>b.stage>=3&&b.type==='home'&&!publicAccess(town,b));
 scene.showGateway(stranded,town.elapsed);
}
function updateDataLayer(){
 const welcome=!$('#welcome').hidden;$('#data-layers').hidden=welcome;
 if(welcome&&dataLayer)setLayer(dataLayer);
 if(!dataLayer)return;
 const now=performance.now();if(now-layerAt<900)return;layerAt=now;
 scene.showDataLayer(layerTiles(town,dataLayer,townBounds(town)));
}
const financeUI=installFinanceUI({getTown:()=>town,edit:fn=>{const result=applyUrban(fn);if(result)setMode('explore');return result;}});
const hud=installHUD({getTown:()=>town,openBudget:()=>$('#budget-btn').click(),openPublicWorks:()=>$('#public-works').showModal(),setMode,toast});
