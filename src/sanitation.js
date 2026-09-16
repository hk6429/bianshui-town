import {commuteDistance,jobCapacity} from './employment.js';
import {tierOf} from './building-tiers.js';
import {serviceEfficiency} from './public-services.js';
import {managed} from './city-finance.js';

export const cleaningCapacity=(t,b)=>Math.floor((b.footprint?48:12)*tierOf(b)*serviceEfficiency(t));
export const cleaningRange=b=>24+(tierOf(b)-1)*4;
const ready=t=>t.buildings.filter(b=>b.stage>=3);
const residents=(t,b)=>t.people.filter(p=>p.home===b.id).length;
function clean(t,sites,yards){
 // Residual flow lets an overlapping yard hand work to another yard, leaving
 // scarce coverage for streets that only one service can reach.
 const ordered=[...sites].sort((a,b)=>b.waste-a.waste||a.id-b.id),sink=1+ordered.length+yards.length,graph=Array.from({length:sink+1},()=>[]);
 const edge=(a,b,capacity)=>{const forward={to:b,capacity,reverse:graph[b].length},back={to:a,capacity:0,reverse:graph[a].length};graph[a].push(forward);graph[b].push(back);return forward;};
 const requests=ordered.map((b,i)=>edge(0,i+1,b.waste));
 for(let i=0;i<ordered.length;i++)for(let j=0;j<yards.length;j++)if(commuteDistance(t,{home:ordered[i].id},yards[j])<=cleaningRange(yards[j]))edge(i+1,1+ordered.length+j,ordered[i].waste);
 yards.forEach((y,j)=>edge(1+ordered.length+j,sink,cleaningCapacity(t,y)));
 while(true){
  const parent=new Map([[0,null]]),queue=[0];
  for(let i=0;i<queue.length&&!parent.has(sink);i++)for(const e of graph[queue[i]])if(e.capacity>0&&!parent.has(e.to)){parent.set(e.to,{from:queue[i],edge:e});queue.push(e.to);}
  if(!parent.has(sink))break;
  let amount=Infinity;for(let at=sink;at!==0;){const p=parent.get(at);amount=Math.min(amount,p.edge.capacity);at=p.from;}
  for(let at=sink;at!==0;){const p=parent.get(at);p.edge.capacity-=amount;graph[at][p.edge.reverse].capacity+=amount;at=p.from;}
 }
 ordered.forEach((b,i)=>{b.waste=requests[i].capacity;});
}
export function sanitationReport(t){
 const buildings=ready(t),yards=buildings.filter(b=>b.design==='cleaningYard');
 const sites=buildings.filter(b=>b.type==='home'||b.type==='work').map(b=>({id:b.id,waste:b.waste||0,pending:b.pendingWaste||0,residents:residents(t,b),reachable:yards.filter(y=>commuteDistance(t,{home:b.id},y)<=cleaningRange(y)).map(y=>y.id)}));
 const waste=sites.reduce((n,s)=>n+s.waste,0),population=t.people.length;
 return {sites,waste,pending:sites.reduce((n,s)=>n+s.pending,0),hygiene:Math.max(0,Math.round(100-waste/Math.max(1,population)*10)),health:population?Math.round(t.people.reduce((n,p)=>n+(p.health??100),0)/population):100,yards:yards.map(y=>({id:y.id,capacity:cleaningCapacity(t,y),range:cleaningRange(y)})),efficiency:serviceEfficiency(t)};
}
export function tickSanitation(t){
 const day=Math.floor(t.time/24);t.city.sanitationDay??=day;
 if(day<=t.city.sanitationDay)return;
 if(!managed(t)){t.city.sanitationDay=day;for(const b of t.buildings)delete b.pendingWaste;return;}
 // Normal ticks cross at most one day. Imported/stale cursors never replay
 // an unbounded history; old saves start on their current day in restore().
 const days=Math.min(7,day-t.city.sanitationDay);t.city.sanitationDay=day;
 for(let i=0;i<days;i++){
  const buildings=ready(t),sites=buildings.filter(b=>b.type==='home'||b.type==='work');
  for(const b of sites){b.waste=Math.min(1000,(b.waste||0)+(b.type==='home'?residents(t,b):0)+(b.pendingWaste||0));b.pendingWaste=0;}
  clean(t,sites,buildings.filter(b=>b.design==='cleaningYard').sort((a,b)=>a.id-b.id));
  for(const p of t.people){const home=t.building(p.home),work=t.building(p.work);
   const burden=Math.max(home?(home.waste||0)/Math.max(1,residents(t,home)):1,work?(work.waste||0)/Math.max(1,jobCapacity(work)):0);
   p.health=Math.max(0,Math.min(100,(p.health??100)+(burden>0?-Math.min(12,Math.ceil(burden/2)):5)));
  }
 }
}
export function sanitationStatus(t,b){
 if(b.design==='cleaningYard')return b.stage<3?'清運院施工中，落成後開始服務。':`每日清運 ${cleaningCapacity(t,b)} 份；沿路 ${cleaningRange(b)} 步內處理住宅與作坊，優先清理積存較多處。${serviceEfficiency(t)<1?'欠款使服務量下降。':''}`;
 if(b.type==='home'||b.type==='work')return `積存髒污 ${b.waste||0} 份；${b.type==='home'?`住戶每日新增 ${residents(t,b)} 份`:`今日生產待結算 ${b.pendingWaste||0} 份`}。每日結算，增建清運院並接通道路可逐日清除。`;
 return '';
}
