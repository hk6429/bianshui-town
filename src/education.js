import {commuteDistance,presentWorkers,onSickLeave} from './employment.js';
import {buildingStats} from './building-tiers.js';
import {managed} from './city-finance.js';
import {serviceEfficiency} from './public-services.js';
import {damaged} from './fire-service.js';

export const MAX_EDUCATION=100,EDUCATION_PER_DAY=10,GAME_DAY_SECONDS=360;
export const educationOf=p=>Math.min(MAX_EDUCATION,Math.max(0,p.education??0));
export const educationRange=b=>buildingStats(b).range;
export const educationCapacity=(t,b)=>b.design==='academy'&&b.stage>=3&&!damaged(b)?Math.floor(buildingStats(b).education*serviceEfficiency(t)):0;
export function educationReport(t){
 const academies=t.buildings.filter(b=>b.design==='academy'&&b.stage>=3).sort((a,b)=>a.id-b.id);
 const capacities=new Map(academies.map(b=>[b.id,educationCapacity(t,b)])),usage=new Map(academies.map(b=>[b.id,[]]));
 const learners=t.people.filter(p=>t.building(p.home)?.stage>=3&&!onSickLeave(t,p)&&educationOf(p)<MAX_EDUCATION).sort((a,b)=>educationOf(a)-educationOf(b)||a.id-b.id);
 const options=new Map(learners.map(p=>[p.id,academies.map(b=>({b,distance:commuteDistance(t,p,b)})).filter(x=>capacities.get(x.b.id)>0&&x.distance<=educationRange(x.b)).sort((a,b)=>a.distance-b.distance||a.b.id-b.b.id).map(x=>x.b)]));
 function assign(p,seen=new Set()){
  for(const b of options.get(p.id)){if(seen.has(b.id))continue;seen.add(b.id);const list=usage.get(b.id);
   if(list.length<capacities.get(b.id)){list.push(p);return true;}
   for(let i=0;i<list.length;i++)if(assign(list[i],seen)){list[i]=p;return true;}
  }return false;
 }
 for(const p of learners)assign(p);
 const assigned=new Map();for(const [id,list]of usage)for(const p of list)assigned.set(p.id,id);
 return {assigned,waiting:learners.length-assigned.size,average:t.people.length?t.people.reduce((sum,p)=>sum+educationOf(p),0)/t.people.length:0,academies:academies.map(b=>({id:b.id,capacity:capacities.get(b.id),learners:usage.get(b.id).length,range:educationRange(b)}))};
}
export function tickEducation(t,dt){
 if(!managed(t)||!Number.isFinite(dt)||dt<=0||dt>60)return;
 // Neighbourhood education models cumulative service exposure, not physical attendance.
 // Save the fractional attainment itself: loading never grants missed or offline days.
 const report=educationReport(t);
 for(const p of t.people)if(report.assigned.has(p.id))p.education=Math.min(MAX_EDUCATION,educationOf(p)+dt*EDUCATION_PER_DAY/GAME_DAY_SECONDS);
}
export function craftEducationMultiplier(t,b){
 if(!managed(t)||b.type!=='work')return 1;
 const workers=presentWorkers(t,b);
 return workers.length?1+workers.reduce((sum,p)=>sum+educationOf(p),0)/workers.length/MAX_EDUCATION*.2:1;
}
export function educationStatus(t,b){
 if(b.design!=='academy')return '';
 const c=educationReport(t).academies.find(c=>c.id===b.id);
 if(!c)return '書院落成後，開始為沿路可達的住戶提供教育。';
 return `${managed(t)?'街坊教育':'自由營造僅顯示覆蓋，不累積學力'}：受教 ${c.learners}／${c.capacity} 人，住家沿路 ${c.range} 步內可涵蓋；優先學力較低者，病假暫停。持續受教一遊戲日增加10點，最高100點；道路中斷、書院受損或拆除即停止累積，既有學力保留。到場工匠平均學力每10點提高2％產能，上限20％。`;
}
