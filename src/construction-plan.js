import {townBounds,TYPES} from './grid-rules.js';
import {DESIGNS,isSquare} from './heritage.js';
const at=c=>`X ${c.x}、Z ${c.z}`;
export const AUTO_DESIGNS={home:['bambooHome','terraceHome','plumHome'],shop:['tea','food','textile'],work:['dragonKiln','timberYard','dyeHouse']};
export function placementIssue(t,cells,{max=4,connected=true,ignore=null,allowRoad=false}={}){
 if(!Array.isArray(cells)||!cells.length)return '請先選擇占地';
 if(cells.length>max)return `本次最多${max}格`;
 if(cells.some(c=>!Number.isInteger(c.x)||!Number.isInteger(c.z)))return '占地必須對齊完整格點';
 if(new Set(cells.map(c=>`${c.x},${c.z}`)).size!==cells.length)return '占地含有重複格點';
 const limit=townBounds(t);
 const outside=cells.find(c=>c.x<limit.minX||c.x>limit.maxX||c.z<limit.minZ||c.z>limit.maxZ);
 if(outside)return `${at(outside)} 超出目前的鎮界；可在鎮庫視窗買地擴城`;
 if(connected){const seen=new Set([0]);for(let n=0;n<cells.length;n++)for(let i=0;i<cells.length;i++)if([...seen].some(j=>Math.abs(cells[i].x-cells[j].x)+Math.abs(cells[i].z-cells[j].z)===1))seen.add(i);if(seen.size!==cells.length)return '占地須以邊相連，不能只接角或分散';}
 for(const c of cells){const b=t.buildings.find(b=>b.id!==ignore&&(b.footprint||[{x:b.x,z:b.z}]).some(p=>p.x===c.x&&p.z===c.z));if(b)return `${at(c)} 已有「${b.name}」`;if(!allowRoad&&t.publicWorks.some(p=>p.x===c.x&&p.z===c.z))return `${at(c)} 已有道路，請先移除道路`;}
 return null;
}
export function constructionPlan(type,cells,design,nextId=1){
 if(!TYPES[type])return {reason:'請先選擇營造類型'};
 const combined=isSquare(cells);
 if(combined&&design)design=({garden:'scholarGarden',residence:'mansion',kiln:'kilnHall',woodshop:'woodshopHall',weavery:'weaveryHall'})[design]||design;
 if(combined&&!design)design=type==='home'?'mansion':type==='work'?'kilnHall':type==='shop'?'wine':null;

 // 未指定圖樣時逐棟輪抽既有外觀，讓快捷列蓋出的民居／商鋪／作坊不再長得一樣。
 const autoFor=id=>!design&&!combined?AUTO_DESIGNS[type]?.[id%3]??null:null;
 const spec=DESIGNS[design];
 if(design&&(!spec||spec.type!==type))return {reason:'圖樣與營造類型不符'};
 if(spec&&!spec.sizes.includes(combined?4:1))return {reason:`「${spec.name}」${spec.sizes.includes(4)?'須完整2×2四格合建':'僅支援單格或直線多棟，不能四格合建'}`};
 if(type==='garden'&&!spec)return {reason:'園景須先選擇圖樣'};
 const plots=combined?[{x:cells.reduce((s,c)=>s+c.x,0)/4,z:cells.reduce((s,c)=>s+c.z,0)/4,footprint:cells.map(c=>({...c}))}]:cells;
 const buildings=plots.map((c,i)=>{const id=nextId+1+i;return {...c,id,type,design:design||autoFor(id)||null,name:design&&spec?(combined&&spec.largeName?spec.largeName:spec.name):type==='home'?`${['柳蔭','汴水','杏花'][id%3]}人家 ${id}`:type==='shop'?['春水茶坊','陳記食肆','錦色布莊'][id%3]:['青瓷作坊','木作小院','織雲坊'][id%3]};});
 return {reason:null,design,spec,combined,buildings};
}
