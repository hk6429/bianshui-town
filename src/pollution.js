import {managed} from './city-finance.js';

// Game balance values, not measured historical emissions. Output is the trigger.
export const EMISSIONS=[18,8,14],POLLUTION_HALF_LIFE=90,MAX_POLLUTION=100;
const cells=b=>b.footprint||[{x:b.x,z:b.z}];
export function emitProductionPollution(t,b){
 if(!managed(t)||b.type!=='work')return;
 const field=new Map((t.city.pollution||[]).map(c=>[`${c.x},${c.z}`,{...c}])),source=cells(b);
 for(let x=-8;x<=2;x++)for(let z=-6;z<=6;z++){
  const amount=source.reduce((sum,c)=>{const d=Math.hypot(x-c.x,z-c.z);return sum+(d<=3?1-d/4:0);},0)/source.length*EMISSIONS[b.variant];
  if(!amount)continue;const key=`${x},${z}`,entry=field.get(key)||{x,z,value:0};entry.value=Math.min(MAX_POLLUTION,entry.value+amount);field.set(key,entry);
 }
 t.city.pollution=[...field.values()];
}
export function tickPollution(t,dt){
 if(!managed(t)||!Number.isFinite(dt)||dt<=0||dt>60||!t.city.pollution)return;
 const decay=2**(-dt/POLLUTION_HALF_LIFE);
 t.city.pollution=t.city.pollution.map(c=>({...c,value:c.value*decay})).filter(c=>c.value>=1e-6);
}
export function pollutionAt(t,b){
 const field=t.city.pollution||[],plots=cells(b);
 return plots.reduce((sum,c)=>sum+(field.find(p=>p.x===c.x&&p.z===c.z)?.value||0),0)/plots.length;
}
export function pollutionReport(t){
 const homes=t.buildings.filter(b=>b.type==='home'&&b.stage>=3).map(b=>({id:b.id,pollution:pollutionAt(t,b),residents:t.people.filter(p=>p.home===b.id).length}));
 const weight=homes.reduce((sum,h)=>sum+Math.max(1,h.residents),0),exposure=weight?homes.reduce((sum,h)=>sum+h.pollution*Math.max(1,h.residents),0)/weight:0;
 return {homes,exposure,environment:100-exposure,demandModifier:managed(t)?-Math.round(exposure*.3):0,affected:(t.city.pollution||[]).length};
}
export function pollutionStatus(t,b){
 if(!['home','work'].includes(b.type))return '';
 const value=pollutionAt(t,b);
 return `此處污染 ${value.toFixed(1)}／100${b.type==='home'?`，居住環境 ${(100-value).toFixed(1)}／100`:`；每件${['陶器','木器','布匹'][b.variant]}排放強度 ${EMISSIONS[b.variant]}`}。${managed(t)?'生產污染隨距離衰減，鄰近住宅需求降低；停止生產後每90遊戲秒減半。搬移或拆除不會瞬間清除原址殘留。':'自由營造保留既有污染，不新增、不衰減，也不降低需求。'}清運處理固體髒污，不能立即清掉生產污染。`;
}
