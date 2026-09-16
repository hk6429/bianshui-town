import {AUTHORS,authorById} from './literati-data.js';
import {designFor} from './heritage.js';
import {send,advance} from './life.js';
import {key,point} from './simulation.js';
export const createLiterati=()=>({actors:[],collected:[],nextAt:3});
export function authorStatus(t,a){
 if(!a)return '等街坊落成，文人將陸續到訪';
 if(!a.visible)return '夜深暫歇，天明再來';
 if(t.weather.raining)return a.walking?'撐傘沿街慢行':'收筆聽雨，待晴續寫';
 return a.phase==='writing'?`在${a.venue}停步落筆` :a.phase==='reading'?`在${a.venue}展卷吟讀`:`沿街漫步，前往${a.venue}`;
}
function nextDestination(t,a){
 const spec=authorById(a.author),places=t.buildings.filter(b=>b.stage>=3),fav=places.filter(b=>spec.preferred.includes(designFor(b))),pool=fav.length?fav:places;
 const b=pool[(a.visits+AUTHORS.indexOf(spec))%pool.length];
 // Every other leg goes back through the riverside streets, even with one favourite venue.
 const center=a.visits%2?[12,-16]:b.entrance,slots=[...t.roads].map(point).filter(p=>Math.abs(p[0]-center[0])+Math.abs(p[1]-center[1])<=3).sort((p,q)=>Math.hypot(p[0]-center[0],p[1]-center[1])-Math.hypot(q[0]-center[0],q[1]-center[1])||p[0]-q[0]||p[1]-q[1]);const goal=slots[AUTHORS.indexOf(spec)%slots.length]||center;a.venue=a.visits%2?'虹橋街口':b.name;
 if(send(t,a,goal,'')){a.phase='walking';a.visits++;a.progress=0;}
}
export function tickLiterati(t,dt){
 const l=t.literati,day=t.time%24>=6&&t.time%24<23;
 if(!t.buildings.some(b=>b.stage>=3))return;
 if(day&&l.actors.length<AUTHORS.length&&t.elapsed>=l.nextAt){
  const i=l.actors.length,spec=AUTHORS[i],start=point(t.nearestRoad(12,-14+i*2));
  const a={id:90001+i,author:spec.id,kind:'author',x:start[0],z:start[1],route:[],walking:false,visible:true,phase:'walking',speed:.95,visits:0,progress:0,wait:0,venue:'街坊'};l.actors.push(a);nextDestination(t,a);l.nextAt=t.elapsed+8;t.log(`${spec.name}來到汴水，沿街尋景`);
 }
 for(const a of l.actors){
  a.visible=day;if(!day)continue;
  if(a.walking){advance(a,dt,t);if(a.walking)continue;a.phase='writing';a.progress=0;}
  if(a.phase==='writing'){
   if(t.weather.raining)continue;a.progress=Math.min(12,a.progress+dt);
   if(a.progress>=12){a.phase='reading';a.wait=14;const spec=authorById(a.author);if(!l.collected.some(w=>w.author===a.author)){l.collected.push({author:a.author,time:t.time,venue:a.venue});t.log(`${spec.name}停筆展卷，〈${spec.title}〉收入汴水文集`);}}
  }else if(a.phase==='reading'){a.wait-=dt;if(a.wait<=0)nextDestination(t,a);}
  else nextDestination(t,a);
 }
}
export function rerouteLiterati(t){
 for(const a of t.literati.actors){
  const nearest=t.nearestRoad(a.x,a.z);if(!nearest)continue;
  if(!t.roads.has(key(a.x,a.z))&&!a.walking){[a.x,a.z]=point(nearest);}
  if(a.walking){const goal=a.goal&&t.nearestRoad(...a.goal);if(goal)send(t,a,point(goal),'');}
 }
}
