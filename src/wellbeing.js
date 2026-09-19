import {buildingStats} from './building-tiers.js';
import {commuteDistance} from './employment.js';
import {managed} from './city-finance.js';
import {waterReport} from './water-service.js';
import {healthcareReport} from './healthcare.js';
import {educationReport,educationOf} from './education.js';
import {fireCoverage,damaged} from './fire-service.js';
import {pollutionAt} from './pollution.js';
import {gardenBenefit} from './garden-services.js';
import {LOW_WELLBEING} from './wellbeing-rules.js';
import {festivalMood,festivalOf} from './festivals.js';
const clamp=n=>Math.max(0,Math.min(100,n));
export function wellbeingReport(t){
 const mood=festivalMood(t),festival=festivalOf(t);
 const water=waterReport(t),care=healthcareReport(t),education=educationReport(t),fire=fireCoverage(t),residents=new Map();
 for(const p of t.people){
  const home=t.building(p.home),job=t.building(p.work),housed=home?.type==='home'&&home.stage>=3;
  const occupancy=housed?t.people.filter(q=>q.home===home.id).length:0;
  const housing=housed?Math.min(1,buildingStats(home).housing/Math.max(1,occupancy))*100:0;
  const employed=job&&job.stage>=3&&buildingStats(job).jobs>0&&!damaged(job)&&Number.isFinite(commuteDistance(t,p,job));
  const shopping=(p.needsSatisfiedUntil||0)>t.elapsed?100:0,row=home?water.homes.get(home.id):null;
  const supplied=row?.residents?row.served/row.residents:0,hygiene=housed?clamp(100-(home.waste||0)/Math.max(1,occupancy)*10):0;
  const health=clamp(p.health??100),medical=health>=100||care.assigned.has(p.id)?100:0,learning=educationOf(p)>=100||education.assigned.has(p.id)?100:0;
  const services=supplied*40+hygiene*.2+health*.2+medical*.1+learning*.05+(home&&fire.covered.has(home.id)?5:0);
  const pollution=home?pollutionAt(t,home):100,garden=housed?gardenBenefit(t,home).score:0;
  const environment=housed?clamp(80-pollution*.8+garden):0;
  const parts=[
   {key:'housing',name:'住房',score:housing,weight:20,reason:housed?`${occupancy} 位住戶／容量 ${buildingStats(home).housing}`:'尚無落成住宅'},
   {key:'employment',name:'就業',score:employed?100:0,weight:15,reason:employed?'有可達且可運作的工作場所':'無可達工作或工作場所受損'},
   {key:'shopping',name:'採買',score:shopping,weight:15,reason:shopping?'日用品已備妥':'日用品尚未補足'},
   {key:'services',name:'公共服務',score:clamp(services),weight:25,reason:`供水 ${Math.round(supplied*100)}％、衛生 ${hygiene.toFixed(0)}、健康 ${health.toFixed(0)}；醫療 ${health>=100?'無需照護':medical?'受照護':'待照護'}、教育 ${learning?'具備':'不足'}、巡守 ${home&&fire.covered.has(home.id)?'涵蓋':'未涵蓋'}`},
   {key:'environment',name:'環境',score:environment,weight:25,reason:`基礎80－污染 ${pollution.toFixed(1)}×0.8＋園景 ${garden.toFixed(1)}，限制0至100`}
  ];
  const score=clamp(parts.reduce((n,x)=>n+x.score*x.weight/100,0)+mood);residents.set(p.id,{id:p.id,score,parts,festival:mood});
 }
 const average=residents.size?[...residents.values()].reduce((n,r)=>n+r.score,0)/residents.size:LOW_WELLBEING;
 return {residents,average,festival:festival?{name:festival.name,mood}:null,demandModifier:managed(t)?Math.round((average-LOW_WELLBEING)*.6):0,low:[...residents.values()].filter(r=>r.score<LOW_WELLBEING).length};
}
