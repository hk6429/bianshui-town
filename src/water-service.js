import {commuteDistance} from './employment.js';
import {buildingStats} from './building-tiers.js';

export {isUtility} from './public-services.js';
import {serviceEfficiency} from './public-services.js';
export const waterCapacity=b=>buildingStats(b).water;
export const waterRange=b=>buildingStats(b).range;
const capacity=b=>buildingStats(b).housing;

// Recomputed from roads, homes and residents: never persist stale coverage in saves.
export function waterReport(t){
 const wells=t.buildings.filter(b=>b.design==='well'&&b.stage>=3).sort((a,b)=>a.id-b.id);
 const homes=t.buildings.filter(b=>b.type==='home'&&b.stage>=3).sort((a,b)=>a.id-b.id);
 const users=new Map(wells.map(b=>[b.id,[]])),rows=new Map(),occupied=[],vacant=[];
 for(const b of homes){
  const residents=t.people.filter(p=>p.home===b.id).length;
  const nearby=wells.map(w=>({well:w,distance:commuteDistance(t,{home:b.id},w)})).filter(x=>x.distance<=waterRange(x.well)).sort((a,b)=>a.distance-b.distance||a.well.id-b.well.id);
  const row={id:b.id,residents,capacity:capacity(b),served:0,available:0,satisfaction:0,nearby:nearby.map(x=>({id:x.well.id,distance:x.distance}))};rows.set(b.id,row);
  for(let i=0;i<Math.max(residents,row.capacity);i++){const slot={home:b.id,occupied:i<residents,choices:nearby.map(x=>x.well)};(slot.occupied?occupied:vacant).push(slot);}
 }
 // Augmenting paths prevent a flexible home from monopolising the only well
 // reachable by another home. Existing residents always precede vacant seats.
 function assign(slot,seen=new Set()){
  for(const w of slot.choices){if(seen.has(w.id))continue;seen.add(w.id);const list=users.get(w.id);
   if(list.length<Math.floor(waterCapacity(w)*serviceEfficiency(t))){list.push(slot);return true;}
   for(let i=0;i<list.length;i++)if(assign(list[i],seen)){list[i]=slot;return true;}
  }return false;
 }
 for(const slot of [...occupied,...vacant])assign(slot);
 for(const list of users.values())for(const slot of list){const row=rows.get(slot.home);if(slot.occupied)row.served++;else row.available++;}
 for(const row of rows.values())row.satisfaction=row.residents?Math.round(row.served/row.residents*100):null;
 const served=[...rows.values()].reduce((n,r)=>n+r.served,0),residents=[...rows.values()].reduce((n,r)=>n+r.residents,0);
 return {homes:rows,wells:wells.map(w=>({id:w.id,capacity:Math.floor(waterCapacity(w)*serviceEfficiency(t)),range:waterRange(w),used:users.get(w.id).filter(s=>s.occupied).length,reserved:users.get(w.id).filter(s=>!s.occupied).length})),served,residents,available:[...rows.values()].reduce((n,r)=>n+r.available,0),satisfaction:residents?Math.round(served/residents*100):null};
}
export function waterStatus(t,b,report=waterReport(t)){
 if(b.type==='home'){const r=report.homes.get(b.id);if(!r)return '供水：住宅落成後開始分配';return `供水 ${r.served}／${r.residents} 人；有水空位 ${r.available} 席。${r.satisfaction===null?'尚無住戶':`供水滿意度 ${r.satisfaction}％`}。${!r.nearby.length?'附近沒有可沿路到達且在服務距離內的水井。':r.served<r.residents?'可達水井容量不足，請增建或升級。':'優先供應現有住戶，再分配空位。'}`;}
 if(b.design==='well'){const w=report.wells.find(w=>w.id===b.id);return w?`水井容量 ${w.capacity} 人；正在供水 ${w.used} 人，預留住宅空位 ${w.reserved} 席；沿路服務距離 ${w.range} 步。`:'水井施工中，落成後開始供水。';}
 return '';
}
