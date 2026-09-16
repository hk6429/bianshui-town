import {jobCapacity,commuteDistance,assignJobs} from './employment.js';
import {managed,taxDemand} from './city-finance.js';
export const CENSUS_SECONDS=15;
export const GRACE={unhoused:90,unemployed:180,unserved:360};
export const homeCapacity=b=>b.type==='home'&&b.stage>=3?(b.footprint?8:b.level>=2?4:2):0;
export const createDemography=(elapsed=0)=>({lastAt:elapsed,credit:0,arrived:0,departed:0});
const bounded=n=>Math.round(Math.max(-100,Math.min(100,n)));
const reachable=(t,home,b)=>Number.isFinite(commuteDistance(t,{home:home.id},b));
export function cityDemand(t){
 const ready=t.buildings.filter(b=>b.stage>=3),homes=ready.filter(b=>b.type==='home'),shops=ready.filter(b=>b.type==='shop'),works=ready.filter(b=>b.type==='work'),gardens=ready.filter(b=>b.type==='garden');
 const population=t.people.length,housing=homes.reduce((s,b)=>s+homeCapacity(b),0),vacant=Math.max(0,housing-t.people.filter(p=>p.home).length);
 const accessible=ready.filter(b=>jobCapacity(b)&&homes.some(h=>reachable(t,h,b))),jobs=accessible.reduce((s,b)=>s+jobCapacity(b),0);
 const employed=t.people.filter(p=>accessible.some(b=>b.id===p.work&&Number.isFinite(commuteDistance(t,p,b)))).length,unemployed=population-employed;
 const gardenHomes=homes.filter(h=>gardens.some(b=>reachable(t,h,b))).length;
 const stock=t.economy.lots.filter(l=>l.at.startsWith('shop:')||l.at.startsWith('output:')).length;
 const unmet=t.people.filter(p=>!(p.needsSatisfiedUntil>t.elapsed)).length;
 const retail=shops.reduce((s,b)=>s+(b.footprint?12:4),0),industrial=works.reduce((s,b)=>s+jobCapacity(b),0),orders=Math.max(0,retail-stock);
 const tax=(taxDemand(t)-100)*.6,targetPopulation=2+jobs+Math.min(4,gardenHomes);
 let housingPressure=(targetPopulation-population)*12-vacant*4;
 // A new settlement can attract its first two residents without prebuilt jobs.
 if(population<2)housingPressure=Math.max(12,housingPressure);
 return {
  home:{score:bounded(housingPressure+tax),reasons:[`空位 ${vacant}／容量 ${housing} 人`,`可達工作 ${jobs} 席，失業 ${unemployed} 人`,`有可達園景的住宅 ${gardenHomes} 處`,`稅率需求修正 ${tax>=0?'+':''}${tax}`]},
  shop:{score:bounded(population*14+unmet*5-retail*10-stock*2+tax),reasons:[`居民 ${population} 人，日用品待補 ${unmet} 人`,`商業服務容量 ${retail} 人，現有存貨 ${stock} 件`,`稅率需求修正 ${tax>=0?'+':''}${tax}`]},
  work:{score:bounded(orders*8+unemployed*8-industrial*12+tax),reasons:[`商鋪補貨缺口 ${orders} 件`,`失業 ${unemployed} 人，作坊工作容量 ${industrial} 席`,`稅率需求修正 ${tax>=0?'+':''}${tax}`]},
  population,housing,vacant,jobs,unemployed,unmet,targetPopulation
 };
}
export function addResident(t,b){
 const id=t.nextId++,p={id,name:['沈','李','周','陳','柳','王','趙','何','蘇','林'][id%10]+['安','小滿','青','禾','阿寧','知夏','明','蘭','平','春'][Math.floor(id/10)%10],home:b.id,work:null,current:b.id,destination:b.id,x:b.entrance[0],z:b.entrance[1],outside:false,route:[],action:'在家歇息',speed:.8+(id%4)*.12};
 t.people.push(p);return p;
}
function leaveTown(t,p,reason){
 t.people=t.people.filter(q=>q.id!==p.id);
 for(const q of t.people)if(q.chatPartner===p.id){delete q.chatPartner;q.socialUntil=0;}
 const e=t.stories.active;if(e){e.participants=e.participants.filter(id=>id!==p.id);if(!e.participants.length){t.stories.active=null;t.stories.nextAt=t.elapsed+35;}}
 t.demography.departed++;t.log(`${p.name}因${reason}遷離小鎮`);
}
export function residentCondition(p){const h=p.hardship||{};return [['unhoused','無家'],['unemployed','失業'],['unserved','日用品不足']].filter(([key])=>h[key]>0).map(([key,label])=>`${label} ${h[key]} 秒／寬限 ${GRACE[key]} 秒`).join('；')||'生活狀況穩定';}
export function tickPopulation(t){
 const d=t.demography;
 if(!managed(t)){
  d.lastAt=t.elapsed;d.credit=0;
  for(const p of t.people)delete p.hardship;
  for(const b of t.buildings.filter(b=>homeCapacity(b))){let missing=homeCapacity(b)-t.residents(b).length;const changed=missing>0;for(const p of t.people.filter(p=>!p.home).slice(0,missing)){p.home=b.id;p.destination=null;p.outside=true;p.action='前往新居';missing--;}
   while(missing-->0)addResident(t,b);if(changed)t.log(`${b.name}迎來新住戶`);
  }return;
 }
 // Do not replay an unbounded stale census after externally advanced/imported time.
 d.lastAt=Math.max(d.lastAt,t.elapsed-60);
 while(t.elapsed-d.lastAt>=CENSUS_SECONDS-1e-8){
  d.lastAt+=CENSUS_SECONDS;assignJobs(t);
  const homes=t.buildings.filter(b=>homeCapacity(b)>t.residents(b).length),waiting=t.people.find(p=>!p.home);
  let rehoused=false;if(waiting&&homes.length){const b=homes.find(b=>!waiting.work||Number.isFinite(commuteDistance(t,{home:b.id},t.building(waiting.work))));if(b){waiting.home=b.id;waiting.destination=null;waiting.outside=true;waiting.action='前往新居';rehoused=true;t.log(`${waiting.name}已安置到${b.name}`);}}
  let departing=null;
  for(const p of t.people){
   const h=p.hardship??={unhoused:0,unemployed:0,unserved:0};
   const flags={unhoused:!t.building(p.home),unemployed:!t.building(p.work)||!Number.isFinite(commuteDistance(t,p,t.building(p.work))),unserved:!(p.needsSatisfiedUntil>d.lastAt)};
   for(const key of Object.keys(GRACE))h[key]=flags[key]?Math.min(GRACE[key],h[key]+CENSUS_SECONDS):0;
   if(!departing){const reason=Object.keys(GRACE).find(key=>h[key]>=GRACE[key]);if(reason)departing={p,reason:{unhoused:'長期無家可歸',unemployed:'長期失業',unserved:'長期缺乏日用品'}[reason]};}
  }
  if(departing)leaveTown(t,departing.p,departing.reason);
  const demand=cityDemand(t);
  if(rehoused||departing||demand.home.score<=0||demand.population>=demand.targetPopulation){d.credit=0;continue;}
  // Fractional attraction credit is saved, so reloads and frame rates cannot reset it.
  d.credit=Math.min(1,d.credit+Math.min(1,demand.home.score/40));
  const home=homes.find(b=>!t.people.length||t.people.length<2||t.buildings.some(j=>jobCapacity(j)&&j.stage>=3&&reachable(t,b,j)));
  if(d.credit>=1-1e-8&&home){addResident(t,home);d.credit=0;d.arrived++;assignJobs(t);t.log(`${home.name}迎來一位新住戶`);}
 }
}
