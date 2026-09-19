import {formatMoney} from './money.js';
import {commuteDistance} from './employment.js';
import {buildingStats} from './building-tiers.js';
import {managed,charge} from './city-finance.js';
import {serviceEfficiency,isUtility} from './public-services.js';

export const FIRE_WARNING_SECONDS=30;
export const damaged=b=>(b?.fireDamage||0)>0;
export const patrolCapacity=(t,b)=>Math.floor(buildingStats(b).patrol*serviceEfficiency(t));
export const patrolRange=b=>buildingStats(b).range;
export function fireRisk(t,b){
 const near=t.buildings.filter(q=>q.id!==b.id&&q.stage>=3&&!isUtility(q)&&Math.hypot(q.x-b.x,q.z-b.z)<=2.5);
 const kilns=near.filter(q=>q.type==='work'&&q.variant===0).length+(b.type==='work'&&b.variant===0?1:0);
 return Math.min(.3,.01+near.length*.005+kilns*.025);
}
export function fireCoverage(t){
 const buildings=t.buildings.filter(b=>b.stage>=3&&!isUtility(b)).sort((a,b)=>fireRisk(t,b)-fireRisk(t,a)||a.id-b.id);
 const posts=t.buildings.filter(b=>b.stage>=3&&b.design==='firePost').sort((a,b)=>a.id-b.id),used=new Map(posts.map(b=>[b.id,0])),covered=new Set();
 for(const b of buildings){const candidates=posts.map(p=>({p,d:commuteDistance(t,{home:b.id},p)})).filter(({p,d})=>d<=patrolRange(p)&&used.get(p.id)<patrolCapacity(t,p)).sort((a,b)=>a.d-b.d||a.p.id-b.p.id);if(candidates.length){const p=candidates[0].p;covered.add(b.id);used.set(p.id,used.get(p.id)+1);}}
 return {covered,posts:posts.map(p=>({id:p.id,capacity:patrolCapacity(t,p),used:used.get(p.id),range:patrolRange(p)})),buildings};
}
// Stateless, reproducible draw: save/reload and frame rate cannot reroll a day.
export function fireDraw(day,id){let x=Math.imul(day+1,1664525)^Math.imul(id,1013904223)^0x51f15e;x=Math.imul(x^(x>>>16),0x45d9f3b);return (x>>>0)/4294967296;}
function clearFire(b){const wasDamaged=damaged(b);delete b.fireWarningAt;delete b.fireDamage;delete b.fireRepairAt;if(wasDamaged&&b.type==='work')b.productionStatus='整修完成，等候工匠與原料';}
export const fireActionCost=b=>b.fireWarningAt!==undefined?3000:damaged(b)?Math.ceil(b.fireDamage*150*(b.footprint?.length||1)):0;
export function repairFire(t,id){const b=t.building(id);if(!b||(b.fireWarningAt===undefined&&!damaged(b))||!charge(t,fireActionCost(b),'防火處置與整修'))return false;const warning=b.fireWarningAt!==undefined;clearFire(b);t.revision++;t.log(`${b.name}${warning?'已排除火警':'整修完成，恢復使用'}`);return true;}
export function tickFire(t,{draw=fireDraw}={}){
 const day=Math.floor(t.time/24);t.city.fireDay??=day;
 if(!managed(t)){t.city.fireDay=day;return;}
 let coverage;const coverageNow=()=>coverage??=fireCoverage(t);
 for(const b of t.buildings){
  if(damaged(b)&&t.elapsed>=b.fireRepairAt){clearFire(b);t.revision++;t.log(`${b.name}居民自行整修完成，恢復使用`);}
  if(b.fireWarningAt!==undefined&&t.elapsed>=b.fireWarningAt){
   delete b.fireWarningAt;b.fireDamage=coverageNow().covered.has(b.id)?12:60;b.fireRepairAt=t.elapsed+b.fireDamage*2;t.revision++;
   for(const p of t.people.filter(p=>p.home===b.id))p.health=Math.max(0,(p.health??100)-(coverageNow().covered.has(b.id)?2:10));
   t.log(`${b.name}火警已控制，損害 ${b.fireDamage}；整修 ${b.fireDamage*2} 秒後自動恢復，也可付費修復。住戶與貨物保留`);
  }
 }
 if(day<=t.city.fireDay)return;t.city.fireDay=day;
 // Two-day settlement grace, one warning at most per day, never a city wipe.
 if(day<2)return;
 for(const b of coverageNow().buildings){if(damaged(b)||b.fireWarningAt!==undefined)continue;const chance=fireRisk(t,b)*(coverageNow().covered.has(b.id)?.25:1);
  if(draw(day,b.id)<chance){b.fireWarningAt=t.elapsed+FIRE_WARNING_SECONDS;t.revision++;t.log(`${b.name}發現火星！${FIRE_WARNING_SECONDS} 秒後可能受損，請點建築排除火警或增設可達的巡守所`);break;}
 }
}
export function fireStatus(t,b){
 if(!managed(t)&&(b.fireWarningAt!==undefined||damaged(b)))return '自由營造暫停火警與整修倒數；可按下方按鈕免費排除或修復。';
 if(b.fireWarningAt!==undefined)return `火警預警：${Math.max(0,Math.ceil(b.fireWarningAt-t.elapsed))} 秒內處置；可付 ${formatMoney(3000)} 排除，或增設可達巡守所減輕損害。`;
 if(damaged(b))return `受損 ${b.fireDamage}／100，營業與生產暫停；${Math.max(0,Math.ceil(b.fireRepairAt-t.elapsed))} 秒後免費整修完成，或付 ${formatMoney(fireActionCost(b))} 立即修復。住戶、貨物與建築保留。`;
 if(b.design==='firePost')return b.stage<3?'巡守所施工中。':`可巡守 ${patrolCapacity(t,b)} 處建築，沿路 ${patrolRange(b)} 步內；優先風險較高處，欠款會降低容量。`;
 if(b.stage<3||isUtility(b))return '';
 const guarded=fireCoverage(t).covered.has(b.id);return `火警風險最高 ${(fireRisk(t,b)*(guarded?.25:1)*100).toFixed(1)}％／日；${guarded?'巡守覆蓋中，火警機率與受損程度降低':'尚無可達且有容量的巡守服務'}。前兩日免事件，每日最多一處預警。`;
}
