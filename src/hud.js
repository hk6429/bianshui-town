import {cityDemand} from './city-growth.js';
import {dailyUpkeep,householdTax,managed} from './city-finance.js';
import {publicAccess} from './road-network.js';
import {jobCapacity} from './employment.js';
import {formatMoney} from './money.js';

const DEMAND_INTERVAL=800;

// Always-on treasury, demand and next-step readouts; the budget dialog keeps the detail.
export function installHUD({getTown,openBudget,openPublicWorks,setMode,toast}){
 const $=s=>document.querySelector(s);
 const floatEl=$('#treasury-float'),rows=[...document.querySelectorAll('[data-demand]')];
 let lastTreasury=null,demandAt=0,demandCache=null,warnedAccess=false,lastStep='';
 $('#hud-treasury').onclick=()=>openBudget();
 $('#next-step-action').onclick=()=>{const action=$('#next-step-action').dataset.action;if(action==='road')openPublicWorks();else if(action)setMode(action);};

 function flash(delta){
  if(!delta)return;
  floatEl.textContent=`${delta>0?'+':'−'}${formatMoney(Math.abs(delta))}`;
  floatEl.classList.toggle('gain',delta>0);
  floatEl.classList.remove('show');void floatEl.offsetWidth;floatEl.classList.add('show');
 }

 function nextStep(t){
  const ready=t.buildings.filter(b=>b.stage>=3),homes=ready.filter(b=>b.type==='home');
  if(!t.buildings.length)return {text:'選下方「民居」，在空地點一下，第一間屋就開工。',action:'home',label:'選民居'};
  if(!homes.length&&!t.buildings.some(b=>b.type==='home'))return {text:'先蓋一間民居，才會有人搬來。',action:'home',label:'選民居'};
  if(managed(t)){
   const stranded=homes.find(b=>!publicAccess(t,b));
   if(stranded)return {text:`${stranded.name}還沒接上外路。從門前鋪路到東側河岸引道，居民才會搬來、貨才送得到。`,action:'road',label:'去鋪路'};
  }
  if(!homes.length)return {text:'民居施工中，約十八秒落成，稍候即有住戶。',action:null};
  const jobs=ready.filter(b=>jobCapacity(b)).reduce((n,b)=>n+jobCapacity(b),0);
  if(t.people.length&&jobs===0)return {text:'居民還沒有工作。蓋一處商鋪或作坊，讓他們有活做。',action:'shop',label:'選商鋪'};
  const jobless=t.people.filter(p=>!p.work).length;
  if(jobless>=2)return {text:`${jobless} 位居民沒有工作，可再蓋商鋪或作坊。`,action:'work',label:'選作坊'};
  const unmet=t.people.filter(p=>!(p.needsSatisfiedUntil>t.elapsed)).length;
  if(unmet>=2)return {text:`${unmet} 位居民買不到日用品，商鋪需要補貨或增設。`,action:'shop',label:'選商鋪'};
  if(managed(t)&&t.city.treasury<300)return {text:'鎮庫將盡。可調稅率、拆除高維護建築，或先停手等稅收。',action:null};
  if(!t.buildings.some(b=>b.design==='well'))return {text:'新住戶需要水井才會遷入，公共營造可蓋街坊水井。',action:'road',label:'公共營造'};
  return {text:'小鎮運作順利。可繼續擴建街坊，或看看市井見聞。',action:null};
 }

 return {update(){
  const t=getTown(),c=t.city;
  const value=managed(t)?c.treasury:null;
  $('#hud-treasury-value').textContent=value===null?'自由':formatMoney(value);
  const net=managed(t)?householdTax(t)-dailyUpkeep(t):0;
  $('#hud-treasury-note').textContent=managed(t)?`鎮庫 · 每日 ${net>=0?'+':'−'}${formatMoney(Math.abs(net))}`:'自由營造 · 不收費';
  $('#hud-treasury').classList.toggle('debt',managed(t)&&c.treasury<0);
  if(managed(t)){if(lastTreasury!==null&&value!==lastTreasury)flash(value-lastTreasury);lastTreasury=value;}else lastTreasury=null;

  const now=performance.now();
  if(now-demandAt>=DEMAND_INTERVAL){demandAt=now;demandCache=cityDemand(t);}
  if(demandCache)for(const row of rows){const d=demandCache[row.dataset.demand];if(!d)continue;const bar=row.querySelector('i');bar.style.width=`${Math.abs(d.score)/2}%`;bar.classList.toggle('negative',d.score<0);row.querySelector('.demand-score').textContent=d.score;row.title=d.reasons.join('；');}

  const welcome=!$('#welcome').hidden;
  $('#hud-demand').hidden=welcome;
  const step=nextStep(t);
  $('#next-step').hidden=welcome;
  $('#next-step-text').textContent=step.text;
  const button=$('#next-step-action');button.hidden=!step.action;
  if(step.action){button.textContent=step.label;button.dataset.action=step.action;}else delete button.dataset.action;
  if(step.text!==lastStep){lastStep=step.text;}

  if(managed(t)){
   const stranded=t.buildings.some(b=>b.stage>=3&&b.type==='home'&&!publicAccess(t,b));
   if(stranded&&!warnedAccess){warnedAccess=true;toast('街坊尚未接上東側河岸引道，居民不會搬來；請從門前鋪路過去');}
   if(!stranded)warnedAccess=false;
  }
 }};
}
