import {calendar} from './calendar.js';
import {festivalOf,festivalNote} from './festivals.js';
import {releaseGranary} from './production.js';
import {managed} from './city-finance.js';
import {granaryStores} from './civic.js';
import {sanitationReport} from './sanitation.js';
import {healthcareReport} from './healthcare.js';
import {isUtility} from './public-services.js';
import {damaged} from './fire-service.js';

// 兩種天災：夏秋汴水漲、疫氣時行。義倉與城垣的存糧可抵一次，藥鋪減輕疫情。
export const FLOOD_MONTHS=[5,6,7,8];
export const PLAGUE_MONTHS=[6,7,8,9];
export const FLOOD_DAMAGE=40;
export const PLAGUE_HEALTH=18;
export const createAlmanac=day=>({day,floodDay:-1,plagueDay:-1,stores:0,notice:''});
export const almanacOf=t=>(t.city.almanac??=createAlmanac(Math.floor(t.time/24)));
// 與火警同一套可重現抽樣：存檔重讀或改速度都不會重骰。
export const disasterDraw=(day,salt)=>{let x=Math.imul(day+7,22695477)^Math.imul(salt,2654435761)^0x9e3779b;x=Math.imul(x^(x>>>15),0x27d4eb2d);return (x>>>0)/4294967296;};

export const floodRisk=t=>FLOOD_MONTHS.includes(calendar(t).month)?.16:0;
export function plagueRisk(t){
 if(!PLAGUE_MONTHS.includes(calendar(t).month))return 0;
 const hygiene=sanitationReport(t).hygiene;
 return hygiene>=70?0:Math.min(.3,(70-hygiene)/70*.3);
}
// 越靠汴河（東側）越容易淹。
const riverside=t=>t.buildings.filter(b=>b.stage>=3&&!isUtility(b)&&!damaged(b)).sort((a,b)=>b.x-a.x||a.id-b.id);
export const floodBuffer=t=>granaryStores(t);

export function tickDisasters(t,{draw=disasterDraw}={}){
 const day=Math.floor(t.time/24),a=almanacOf(t);
 if(day<=a.day)return null;
 a.day=day;
 const c=calendar(t);
 // 一年之中，閉口與開漕各報一次；節慶當日記一筆。
 if(c.half===0&&c.month===10)t.log('汴河閉口：漕船停航至來年二月，義倉存糧開始放出。');
 if(c.half===0&&c.month===2)t.log('汴河開漕：漕船復航，原料重新上岸。');
 const winterStock=releaseGranary(t);
 if(winterStock)t.log(granaryStores(t)?`義倉冬儲放出 ${winterStock} 份原料，接濟坊市。`:`陸路小車運來 ${winterStock} 份原料，勉強接濟坊市；蓋座義倉冬天才夠用。`);
 const festival=festivalOf(t);
 if(festival)t.log(festivalNote(t));
 if(!managed(t))return null;
 if(day<3)return null;
 const events=[];
 if(a.floodDay!==day&&draw(day,1)<floodRisk(t)){
  a.floodDay=day;
  const buffer=floodBuffer(t)-a.stores;
  if(buffer>0){a.stores++;events.push({kind:'flood',averted:true,text:'汴水暴漲，義倉與城垣撐住堤岸，街市無恙；今年的存糧用去一分。'});}
  else{
   const hit=riverside(t)[0];
   if(hit){hit.fireDamage=FLOOD_DAMAGE;hit.fireRepairAt=t.elapsed+FLOOD_DAMAGE*2;
    for(const p of t.people.filter(p=>p.home===hit.id))p.health=Math.max(0,(p.health??100)-6);
    events.push({kind:'flood',averted:false,text:`汴水暴漲，${hit.name}水淹及階，受損 ${FLOOD_DAMAGE}；築義倉或城垣可擋下一次。`});}
  }
 }
 if(a.plagueDay!==day&&draw(day,2)<plagueRisk(t)){
  a.plagueDay=day;
  const care=healthcareReport(t);
  let hurt=0;
  for(const p of t.people){const covered=care.assigned.has(p.id),loss=covered?Math.round(PLAGUE_HEALTH/3):PLAGUE_HEALTH;
   if(loss>0){p.health=Math.max(0,(p.health??100)-loss);hurt++;}}
  events.push({kind:'plague',averted:false,text:`疫氣時行，${hurt} 位居民健康下降${care.clinics.length?'；藥鋪照護者症狀較輕。':'；鎮上無藥鋪，病情難抑。'}`});
 }
 if(!events.length)return null;
 for(const e of events)t.log(e.text);
 a.notice=events.at(-1).text;
 t.revision++;
 return events;
}
