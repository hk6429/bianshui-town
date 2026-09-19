import {cityDemand} from './city-growth.js';
import {dailyUpkeep,householdTax,managed} from './city-finance.js';
import {publicAccess} from './road-network.js';
import {jobCapacity} from './employment.js';
import {formatMoney} from './money.js';
import {at} from './production.js';
import {riverOpen} from './calendar.js';
import {granaryStores} from './civic.js';
import {townBounds,boundsCells,expansionOf,MAX_EXPANSION} from './grid-rules.js';
import {GOODS_VALUE} from './city-finance.js';

import {SALEABLE,shoppingCapacity,shoppingNeed,shopsNeeded} from './supply.js';

const DEMAND_INTERVAL=800;

export // 下一步提示：只在真的卡住時才指出成因，避免「常態未採買」被誤報成缺商鋪。
function nextStep(t){
  const ready=t.buildings.filter(b=>b.stage>=3),homes=ready.filter(b=>b.type==='home');
  if(!t.buildings.length)return {text:'開始蓋你的小鎮吧。做法：① 點下面的「民居」② 在綠色草地上點一下 ③ 等一下下，房子就會蓋好。',action:'home',label:'選民居'};
  if(!homes.length&&!t.buildings.some(b=>b.type==='home'))return {text:'還沒有人住進來，因為鎮上沒有房子。做法：① 點下面的「民居」② 在空地點一下，蓋一間房子。',action:'home',label:'選民居'};
  if(managed(t)){
   const stranded=homes.find(b=>!publicAccess(t,b));
   if(stranded)return {text:`「${stranded.name}」沒有路可以走到外面，所以沒有人搬進來、貨也送不到。做法：① 點「營造與工具」裡的「公共營造」② 選「鋪路」③ 從房子門口一路點到右邊河岸的大路。`,action:'road',label:'去鋪路'};
  }
  if(!homes.length)return {text:'房子正在蓋，大約十八秒就好，等一下就會有人搬進來。',action:null};
  const jobs=ready.filter(b=>jobCapacity(b)).reduce((n,b)=>n+jobCapacity(b),0);
  if(t.people.length&&jobs===0)return {text:'居民沒有工作可以做。做法：① 點下面的「商鋪」或「作坊」② 在空地點一下蓋起來 ③ 居民會自己去上工。',action:'shop',label:'選商鋪'};
  const jobless=t.people.filter(p=>!p.work).length;
  if(jobless>=2)return {text:`有 ${jobless} 位居民找不到工作。做法：① 點下面的「作坊」或「商鋪」② 再蓋一間，位子就夠了。`,action:'work',label:'選作坊'};
  // 居民只在午後與傍晚到店採買，「這一刻沒買到」是常態；只有真的供給斷了才該提醒。
  const shops=ready.filter(b=>b.type==='shop');
  if(!shops.length)return {text:'居民買不到日用品，因為鎮上還沒有商鋪。做法：① 點下面的「商鋪」② 在空地上點一下 ③ 等它蓋好就會開門。',action:'shop',label:'選商鋪'};
  if(!shops.some(b=>at(t,`shop:${b.id}`).some(l=>SALEABLE.includes(l.good)))){
   if(!riverOpen(t)&&!granaryStores(t))return {text:'冬天汴河結凍封河，船不來了，店裡沒有貨。做法：① 點下面的「公設」② 蓋一座「義倉」③ 義倉冬天會放存糧給商鋪。',action:'road',label:'公共營造'};
   if(t.city.trade.funds<GOODS_VALUE.clay)return {text:'商行的錢用完了，買不起原料。做法：① 先等店裡的貨賣掉換錢 ② 或點右上角「鎮庫」，在裡面把稅率調高一點。',action:null};
   if(!ready.some(b=>b.type==='work'))return {text:'商鋪架上是空的，因為原料還沒有人加工。貨的路線是：碼頭 → 作坊 → 商鋪。做法：① 點下面的「作坊」② 蓋一間作坊 ③ 作坊會把原料做成陶器、木器、布匹，小車自動送到商鋪。',action:'work',label:'選作坊'};
   return {text:'商鋪正在等貨。貨的路線是：碼頭 → 作坊 → 商鋪，小車正在送，等一下就會上架。',action:null};
  }
  const unmet=t.people.filter(p=>!(p.needsSatisfiedUntil>t.elapsed)).length;
  const capacity=shoppingCapacity(t),need=shoppingNeed(t);
  if(need>capacity&&t.people.length>=4){
   const more=shopsNeeded(t);
   const short=shops.filter(b=>t.workers(b).length<jobCapacity(b)).length;
   return {text:`${unmet} 位居民買不到日用品，因為商鋪來不及賣。現在全鎮每天賣得出 ${capacity} 件，居民每天要買 ${need} 件。做法：① 點下面的「商鋪」，再蓋 ${more} 處商鋪${short?`（或先幫 ${short} 處缺人的商鋪等居民來上工）`:''} ② 商鋪要有夥計上工才會開門 ③ 記得同時加蓋作坊，貨才跟得上。`,action:'shop',label:'選商鋪'};
  }
  if(managed(t)&&t.city.treasury<300)return {text:'鎮上的錢快用完了。做法：① 點右上角的「鎮庫」② 把稅率調高一點 ③ 或先暫停蓋新東西，等收稅進帳。',action:null};
  if(!t.buildings.some(b=>b.design==='well'))return {text:'沒有水井，新的居民不敢搬進來。做法：① 點「營造與工具」裡的「公共營造」② 選「街坊水井」③ 在住家附近蓋一口。',action:'road',label:'公共營造'};
  const room=boundsCells(townBounds(t))-t.blocks.reduce((n,b)=>n+b.cells.length,0)-t.publicWorks.length;
  if(room<8&&expansionOf(t)<MAX_EXPANSION)return {text:`空地只剩大約 ${Math.max(0,room)} 格了。做法：① 點右上角顯示錢的那一塊（寫「鎮庫」或「自由」都一樣）② 在跳出來的視窗裡找「買地擴城」③ 按下去，小鎮西邊就會多一整排土地（最多買三次）。`,action:'budget',label:'開鎮庫'};
  return {text:'小鎮現在很順利。可以再蓋房子讓人口變多，或點「破關指南」看看下一個目標。',action:null};
 }


// Always-on treasury, demand and next-step readouts; the budget dialog keeps the detail.
export function installHUD({getTown,openBudget,openPublicWorks,setMode,toast}){
 const $=s=>document.querySelector(s);
 const floatEl=$('#treasury-float'),rows=[...document.querySelectorAll('[data-demand]')];
 let lastTreasury=null,demandAt=0,demandCache=null,warnedAccess=false,lastStep='';
 $('#hud-treasury').onclick=()=>openBudget();
 $('#next-step-action').onclick=()=>{const action=$('#next-step-action').dataset.action;if(action==='road')openPublicWorks();else if(action==='budget')openBudget();else if(action)setMode(action);};

 function flash(delta){
  if(!delta)return;
  floatEl.textContent=`${delta>0?'+':'−'}${formatMoney(Math.abs(delta))}`;
  floatEl.classList.toggle('gain',delta>0);
  floatEl.classList.remove('show');void floatEl.offsetWidth;floatEl.classList.add('show');
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
