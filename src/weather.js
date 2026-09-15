export const createWeather=()=>({mode:'auto',raining:false,nextAt:180});
export function setWeather(t,mode){if(!['auto','rain','clear'].includes(mode))return;const w=t.weather;w.mode=mode;w.raining=mode==='rain';w.nextAt=t.elapsed+(w.raining?75:180);t.log(w.raining?'汴河落起細雨，行人撐傘、街坊避雨':'雨歇天晴，街坊繼續今日行程');}
export function tickWeather(t){const w=t.weather;if(w.mode==='auto'&&t.elapsed>=w.nextAt){w.raining=!w.raining;w.nextAt=t.elapsed+(w.raining?75:180);t.log(w.raining?'細雨落下，街頭聚會暫歇':'雨過天青，街坊又熱鬧起來');}}
export function shelterResident(t,p,dt){
 if(!t.weather.raining||t.time%24>=20||t.time%24<6){p.shelter=null;return false;}
 if(p.id%3!==0)return false;
 if(!p.shelter){
  const buildings=t.buildings.filter(b=>b.stage>=3&&b.design!=='pond');
  const b=!p.outside&&t.building(p.current)?.design!=='pond'?t.building(p.current):buildings.sort((a,b)=>Math.hypot(a.entrance[0]-p.x,a.entrance[1]-p.z)-Math.hypot(b.entrance[0]-p.x,b.entrance[1]-p.z))[0];
  if(!b)return false;p.shelter=b.id;
 }
 if(p.outside||p.current!==p.shelter){if(p.destination!==p.shelter||!p.route.length)t.travel(p,p.shelter);t.move(p,dt);}
 p.action=p.outside?`到${t.building(p.shelter)?.name}簷下避雨`:`在${t.building(p.current)?.name}簷下聽雨`;
 return true;
}
