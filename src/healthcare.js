import {commuteDistance,presentWorkers,onSickLeave} from './employment.js';
import {shopIsOpen} from './commerce.js';
import {buildingStats} from './building-tiers.js';
import {managed} from './city-finance.js';

export const HEALING_PER_SECOND=8/30;
export const medicalRange=b=>buildingStats(b).range;
export const medicalCapacity=(t,b)=>b?.design==='herbShop'&&shopIsOpen(t,b)?presentWorkers(t,b).length*buildingStats(b).carePerWorker:0;
export function healthcareReport(t){
 const clinics=t.buildings.filter(b=>b.design==='herbShop'&&b.stage>=3).sort((a,b)=>a.id-b.id);
 const capacities=new Map(clinics.map(b=>[b.id,medicalCapacity(t,b)]));
 const usage=new Map(clinics.map(b=>[b.id,[]])),patients=t.people.filter(p=>(p.health??100)<100&&t.building(p.home)).sort((a,b)=>(a.health??100)-(b.health??100)||a.id-b.id);
 const options=new Map(patients.map(p=>[p.id,clinics.map(b=>({b,distance:commuteDistance(t,p,b)})).filter(x=>x.distance<=medicalRange(x.b)&&capacities.get(x.b.id)>0).sort((a,b)=>a.distance-b.distance||a.b.id-b.b.id).map(x=>x.b)]));
 function assign(p,seen=new Set()){
  for(const b of options.get(p.id)){if(seen.has(b.id))continue;seen.add(b.id);const list=usage.get(b.id);
   if(list.length<capacities.get(b.id)){list.push(p);return true;}
   for(let i=0;i<list.length;i++)if(assign(list[i],seen)){list[i]=p;return true;}
  }return false;
 }
 for(const p of patients)assign(p);
 const assigned=new Map();for(const [id,list]of usage)for(const p of list)assigned.set(p.id,id);
 return {assigned,sick:t.people.filter(p=>onSickLeave(t,p)).length,waiting:patients.length-assigned.size,clinics:clinics.map(b=>({id:b.id,capacity:capacities.get(b.id),staff:presentWorkers(t,b).length,range:medicalRange(b),patients:usage.get(b.id).length}))};
}
export function tickHealthcare(t,dt){
 if(!managed(t)||!Number.isFinite(dt)||dt<=0||dt>60)return;
 // Coverage means neighbourhood care based on home-to-clinic walking distance.
 // Capacity is concurrent patients; allocation is recalculated when staff leave.
 const report=healthcareReport(t);for(const p of t.people)if(report.assigned.has(p.id))p.health=Math.min(100,(p.health??100)+HEALING_PER_SECOND*dt);
}
export function healthcareStatus(t,b){
 if(b.design!=='herbShop')return '';
 if(b.stage<3)return '藥鋪落成、營業且有健康過賣到場後才能提供醫療。';
 const r=healthcareReport(t),c=r.clinics.find(c=>c.id===b.id);
 return `${managed(t)?'社區醫療':'自由營造僅顯示覆蓋，不結算健康與病假'}：到場過賣 ${c.staff} 人，同時照護 ${c.patients}／${c.capacity} 人；依住家沿路 ${c.range} 步內分配，優先健康較差者。受照護者每30遊戲秒回復8點健康，休業或過賣離開立即停止；健康未滿40者請假，回到40後返工。`;
}
