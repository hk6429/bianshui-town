import {councilHTML,explorationHTML,respondCouncil} from './council-exploration.js';
import {constructionHTML} from './building-life.js';
import {commissionCards,respondCommission} from './commissions.js';
import {VISIONS,GUIDE_STEPS,visionConditions,milestones,claimMilestone,reviewJourney,setJourneyMode,chooseVision,setGuide,shortGoals} from './journey.js';
import {escapeHTML as esc} from './content-html.js';
export function installJourneyUI({getTown,change,toast}){
 let focusedResident=null;
 const dialog=document.querySelector('#journey'),content=document.querySelector('#journey-content');
 const conditions=items=>'<ul>'+items.map(c=>`<li>${c.done?'✓':'○'} ${esc(c.text)}：${c.value}／${c.target}</li>`).join('')+'</ul>';
 function render(){
  const t=getTown(),j=t.journey,step=GUIDE_STEPS[j.guide.stage],all=milestones(t),goals=shortGoals(t);
  document.querySelector('#journey-enabled').checked=j.enabled;document.querySelector('#journey-vision').value=j.vision;
  content.innerHTML=`<section><h3>城鎮議事</h3>${councilHTML(t)}</section><section><h3>活動探索冊</h3>${explorationHTML(t)}</section><section><h3>營造成果對照</h3>${constructionHTML(t)}</section><section><h3>居民委託</h3><p>不設期限，婉拒或放下不扣分。可從居民卡接取；此處列出已回應者及前八位居民。最多保留64份委託紀錄。</p>${commissionCards(t,focusedResident)}</section><p>${j.enabled?'引導挑戰進行中':'自由觀察中：引導與領章暫停；議事、探索仍可使用，既有進度保留。'}</p><section><h3>${VISIONS[j.vision]}願景</h3>${conditions(visionConditions(t))}<p>更換願景不拆建物，也不清除其他紀念章。</p></section><section><h3>第一輪城市循環 · ${j.guide.stage}／4</h3>${j.guide.skipped?'<p>已略過引導，隨時可以重新開始。</p>':step?`<p>${esc(step.title)}</p><p class="fine">${esc(step.wait)}</p>`:'<p>已完成落成、觀察、工作場所與成果回看。</p>'}<button data-guide="${j.guide.skipped||!step?'restart':'skip'}">${j.guide.skipped||!step?'重開引導':'略過引導'}</button><button data-journey-city>打開城市清單</button></section><section><h3>城鎮里程碑</h3><p>達標可領取一枚紀念章；每種僅一次，不扣資源，也不要求每日登入。</p>${all.map(m=>`<article><h4>${esc(m.name)} · ${{locked:'未達成',ready:'可領取',claimed:'已完成'}[m.state]}</h4>${conditions(m.conditions)}${m.state==='claimed'?'<p>已收藏這枚紀念章</p>':`<button data-claim="${m.id}" ${m.state!=='ready'||!j.enabled?'disabled':''}>領取紀念章</button>`}</article>`).join('')}</section><section><h3>選一個短程目標</h3>${goals.map(g=>`<article><h4>${esc(g.title)}${j.shortGoal===g.id?' · 目前選擇':''}${g.done?' · 已完成':''}</h4><p>${esc(g.action)}</p><p>${esc(g.wait)}</p><button data-short-goal="${g.id}" aria-pressed="${j.shortGoal===g.id}">追蹤這個目標</button></article>`).join('')}</section>`;
 }
 function open(resident=null){focusedResident=Number.isSafeInteger(resident)?resident:null;change(reviewJourney);render();dialog.showModal();}
 document.querySelector('#journey-btn').onclick=()=>open();
 document.querySelector('#journey-enabled').onchange=e=>{change(t=>setJourneyMode(t,e.target.checked));render();};
 document.querySelector('#journey-vision').onchange=e=>{change(t=>chooseVision(t,e.target.value));render();};
 content.onclick=e=>{
  const proposal=e.target.closest('[data-council]');if(proposal){if(!change(t=>respondCouncil(t,proposal.dataset.proposal,proposal.dataset.council)))toast('目前條件尚未符合，或紀錄未能儲存。');render();return;}
  const request=e.target.closest('[data-commission]');if(request){const ok=change(t=>respondCommission(t,Number(request.dataset.residentId),request.dataset.commission,request.dataset.solution));if(!ok)toast('目前無法變更：請確認挑戰開關、居民與條件，或查看儲存通知。');render();return;}
  const claim=e.target.closest('[data-claim]'),guide=e.target.closest('[data-guide]'),short=e.target.closest('[data-short-goal]');
  if(claim){if(change(t=>claimMilestone(t,claim.dataset.claim)))toast('紀念章已收入城鎮旅程');render();}
  else if(guide){change(t=>setGuide(t,guide.dataset.guide));render();}
  else if(short){change(t=>{t.journey.shortGoal=short.dataset.shortGoal;return true;});render();}
  else if(e.target.closest('[data-journey-city]')){dialog.close();document.querySelector('#city-list-btn').click();}
 };
 return {open};
}
