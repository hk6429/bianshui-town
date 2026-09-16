import {commuteDistance} from './employment.js';
import {isUtility,serviceEfficiency} from './public-services.js';
import {buildingStats} from './building-tiers.js';
import {damaged} from './fire-service.js';
import {managed} from './city-finance.js';

export const gardenRange=b=>buildingStats(b).range;
export const isLeisureGarden=b=>b.type==='garden'&&!isUtility(b)&&b.stage>=3&&!damaged(b);
export function gardenBenefit(t,home){
 const sources=t.buildings.filter(isLeisureGarden).map(b=>{const distance=commuteDistance(t,{home:home.id},b),range=gardenRange(b);return {id:b.id,distance,range,value:Math.max(0,1-distance/range)*buildingStats(b).garden*serviceEfficiency(t)};}).filter(x=>x.distance<x.range&&x.value>0).sort((a,b)=>b.value-a.value||a.id-b.id);
 // Additional gardens share the same leisure time: each successive benefit halves.
 const score=Math.min(20,sources.reduce((sum,s,i)=>sum+s.value/2**i,0));
 return {score,sources};
}
export function gardenReport(t){
 const homes=t.buildings.filter(b=>b.type==='home'&&b.stage>=3).map(b=>({id:b.id,residents:t.people.filter(p=>p.home===b.id).length,...gardenBenefit(t,b)}));
 const weight=homes.reduce((n,h)=>n+Math.max(1,h.residents),0),average=weight?homes.reduce((n,h)=>n+h.score*Math.max(1,h.residents),0)/weight:0;
 return {homes,average,demandModifier:managed(t)?Math.round(average):0,covered:homes.filter(h=>h.score>0).length,gardens:t.buildings.filter(isLeisureGarden).length};
}
export function gardenStatus(t,b){
 if(b.type==='home'){const r=gardenBenefit(t,b);return `可達園景 ${r.sources.length} 處，宜居加成 ${r.score.toFixed(1)}／20。依門前步道路程遞減；效益由高到低排列，第二處折半、第三處四分之一，總加成最高20。${managed(t)?'影響住宅需求，入住優先考量園景與污染。':'自由營造僅供參考，不提高入住需求。'}`;}
 if(b.type!=='garden'||isUtility(b))return '';
 if(!isLeisureGarden(b))return '尚未落成或正在整修，暫不提供園景宜居效益。';
 const served=gardenReport(t).homes.filter(h=>h.sources.some(s=>s.id===b.id)).length;
 return `沿路 ${gardenRange(b)} 步內涵蓋 ${served} 處住宅；距離越近效益越高，一級基礎8點，每級增加2點與4步。多處園景效益遞減，上限20；欠款降低維護效果。`;
}
