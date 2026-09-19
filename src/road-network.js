import {key} from './simulation.js';
import {managed} from './city-finance.js';
export const STARTER_ROAD={x:2,z:2,type:'lane'};
export function roadAnchor(t,x,z){if(!managed(t))return t.nearestRoad(x,z);let best=null,distance=1.01;for(let a=Math.floor(x)-1;a<=Math.floor(x)+1;a++)for(let b=Math.floor(z)-1;b<=Math.floor(z)+1;b++){const d=Math.hypot(x-a,z-b),k=key(a,b);if(d<=distance&&t.roads.has(k)){best=k;distance=d;}}return best;}
const components=new WeakMap();
export function roadReachable(t,origin,goal){
 if(!origin||!goal)return false;
 let cache=components.get(t);if(!cache||cache.roads!==t.roads||cache.revision!==t.revision||cache.size!==t.roads.size){
  const ids=new Map();let id=0;for(const start of t.roads){if(ids.has(start))continue;const queue=[start];ids.set(start,++id);for(let i=0;i<queue.length;i++){const [x,z]=queue[i].split(',').map(Number);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const next=key(x+dx,z+dz);if(t.roads.has(next)&&!ids.has(next)){ids.set(next,id);queue.push(next);}}}}
  cache={roads:t.roads,revision:t.revision,size:t.roads.size,ids};components.set(t,cache);
 }const a=cache.ids.get(key(...origin));return a!==undefined&&a===cache.ids.get(key(...goal));
}
export const publicAccess=(t,b)=>roadReachable(t,b.entrance,[12,8]);
export function roadCapacity(t,a){return (t.publicWorks||[]).some(r=>r.type==='avenue'&&Math.abs(a.x-r.x*4)<=2.01&&Math.abs(a.z-r.z*4)<=2.01)?2:1;}

// 一格建地占世界座標 ±2；只要建地邊緣碰得到道路格，就算臨街。
export function touchesRoad(t,cells){
 if(!cells?.length)return false;
 for(const c of cells)for(let a=c.x*4-2;a<=c.x*4+2;a++)for(let b=c.z*4-2;b<=c.z*4+2;b++)if(t.roads.has(key(a,b)))return true;
 return false;
}
