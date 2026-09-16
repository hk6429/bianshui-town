import {buildingStats} from './building-tiers.js';
import {managed} from './city-finance.js';
export const onSickLeave=(t,p)=>managed(t)&&(p.health??100)<40;
const routeCache=new WeakMap();
export const jobCapacity=b=>buildingStats(b).jobs;
export const presentWorkers=(t,b)=>t.workers(b).filter(p=>!p.outside&&p.current===b.id&&!onSickLeave(t,p));
export const staffingRatio=(t,b)=>Math.min(1,presentWorkers(t,b).length/jobCapacity(b));
export const JOB_GRACE_SECONDS=60;
function distances(t,origin){
 let cache=routeCache.get(t);if(!cache||cache.roads!==t.roads||cache.revision!==t.revision||cache.size!==t.roads.size){cache={roads:t.roads,revision:t.revision,size:t.roads.size,origins:new Map()};routeCache.set(t,cache);}
 if(cache.origins.has(origin))return cache.origins.get(origin);
 const result=new Map();if(t.roads.has(origin)){const queue=[origin];result.set(origin,0);for(let i=0;i<queue.length;i++){const k=queue[i],[x,z]=k.split(',').map(Number);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const next=`${x+dx},${z+dz}`;if(t.roads.has(next)&&!result.has(next)){result.set(next,result.get(k)+1);queue.push(next);}}}}
 cache.origins.set(origin,result);return result;
}
export function commuteDistance(t,p,b){const home=t.building(p.home),origin=home?.entrance?.join(',')||t.nearestRoad(p.x,p.z);if(!origin||!b?.entrance)return Infinity;return distances(t,origin).get(b.entrance.join(','))??Infinity;}
export function assignJobs(t){
 const jobs=t.buildings.filter(b=>b.stage>=3&&jobCapacity(b)>0),counts=new Map(jobs.map(b=>[b.id,t.workers(b).length]));
 for(const p of t.people){
  if(p.work){const current=jobs.find(b=>b.id===p.work);if(current&&Number.isFinite(commuteDistance(t,p,current))){delete p.jobLostAt;continue;}
   if(current){p.jobLostAt??=t.elapsed;if(t.elapsed-p.jobLostAt<JOB_GRACE_SECONDS)continue;}
   counts.set(p.work,Math.max(0,(counts.get(p.work)||0)-1));p.work=null;delete p.jobLostAt;
  }
  const candidates=jobs.filter(b=>(counts.get(b.id)||0)<jobCapacity(b)).map(b=>({b,distance:commuteDistance(t,p,b)})).filter(x=>Number.isFinite(x.distance)).sort((a,b)=>a.distance-b.distance||a.b.id-b.b.id);
  if(candidates.length){p.work=candidates[0].b.id;counts.set(p.work,(counts.get(p.work)||0)+1);}
 }
}
