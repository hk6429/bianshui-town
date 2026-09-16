import {roadAnchor} from './road-network.js';
import {charge,roadCost,moveCost,upgradeCost,refundBuilding} from './city-finance.js';
import {NEW_DESIGNS} from './variety.js';
import {tierOf,MAX_TIER} from './building-tiers.js';
import {bounds,key,point,CELL} from './simulation.js';
import {DESIGNS,squareCells,gardenMergeGroups} from './heritage.js';
import {transfer,syncCargo} from './production.js';
import {send} from './life.js';
export const ROAD_TYPES={lane:'青石小路',avenue:'寬闊大路'};
export const footprint=b=>b.footprint||[{x:b.x,z:b.z}];
export function freeCells(t,cells,ignore=null){return cells.every(c=>Number.isInteger(c.x)&&Number.isInteger(c.z)&&c.x>=bounds.minX&&c.x<=bounds.maxX&&c.z>=bounds.minZ&&c.z<=bounds.maxZ&&!t.buildings.some(b=>b.id!==ignore&&footprint(b).some(p=>p.x===c.x&&p.z===c.z))&&!t.publicWorks.some(p=>p.x===c.x&&p.z===c.z));}
export function streetCells(start,end){if(Math.abs(end.x-start.x)===1&&Math.abs(end.z-start.z)===1)return squareCells({x:Math.min(start.x,end.x),z:Math.min(start.z,end.z)});const out=[{...start}];let {x,z}=start;while(out.length<24&&(x!==end.x||z!==end.z)){if(x!==end.x)x+=Math.sign(end.x-x);else z+=Math.sign(end.z-z);out.push({x,z});}return out;}
export function layRoad(t,type,cells){if(!ROAD_TYPES[type]||!cells.length||cells.length>24||!freeCells({...t,publicWorks:[]},cells))return false;if(!charge(t,roadCost(t,type,cells),'鋪設道路'))return false;for(const c of cells){const existing=t.publicWorks.find(p=>p.x===c.x&&p.z===c.z);if(existing)existing.type=type;else t.publicWorks.push({...c,type});}refresh(t);t.log(`鋪設${cells.length}格${ROAD_TYPES[type]}`);return true;}
export function removeRoad(t,cells){const before=t.publicWorks.length;t.publicWorks=t.publicWorks.filter(p=>!cells.some(c=>c.x===p.x&&c.z===p.z));if(before===t.publicWorks.length)return false;refresh(t);return true;}
export function roadNodes(t){const nodes=new Set();for(const q of publicSquares(t))for(let x=q.x*4-2;x<=q.x*4+6;x++)for(let z=q.z*4-2;z<=q.z*4+6;z++)nodes.add(key(x,z));for(const c of t.publicWorks)for(let i=-2;i<=2;i++){nodes.add(key(c.x*CELL+i,c.z*CELL));nodes.add(key(c.x*CELL,c.z*CELL+i));}return nodes;}
function detach(t,b){const block=t.blocks.find(g=>g.id===b.blockId),cells=footprint(b);block.cells=block.cells.filter(c=>!cells.some(p=>p.x===c.x&&p.z===c.z));t.blocks=t.blocks.filter(g=>g.cells.length);}
function attach(t,b,cells){const block={id:t.nextId++,type:b.type,combined:cells.length===4,cells:cells.map(c=>({...c}))};t.blocks.push(block);b.blockId=block.id;b.x=cells.reduce((s,c)=>s+c.x,0)/cells.length;b.z=cells.reduce((s,c)=>s+c.z,0)/cells.length;if(cells.length===4)b.footprint=cells.map(c=>({...c}));else delete b.footprint;}
export function moveBuilding(t,id,anchor){const b=t.building(id);if(!b||b.stage<3)return false;const cells=b.footprint?squareCells(anchor):[anchor];if(!freeCells(t,cells,id)||!charge(t,moveCost(b),'搬移建築'))return false;detach(t,b);attach(t,b,cells);refresh(t);t.log(`${b.name}已搬移，住戶與貨物保留`);return true;}
export function upgradeBuilding(t,id,expand=false){
 const b=t.building(id);if(!b||b.stage<3)return false;
 if(expand){if(!['home','work'].includes(b.type)||b.footprint)return false;const cells=squareCells({x:b.x,z:b.z});if(!freeCells(t,cells,id)||!charge(t,upgradeCost(b,true),'四格擴建'))return false;detach(t,b);attach(t,b,cells);}
 else{if(tierOf(b)>=MAX_TIER||!charge(t,upgradeCost(b),'建築升級'))return false;b.tier=tierOf(b)+1;}
 if(['home','work'].includes(b.type)){b.level=2;if(!b.design||expand&&!NEW_DESIGNS[b.design])b.design=b.type==='home'?(b.footprint?'mansion':'residence'):['kiln','woodshop','weavery'][b.variant]+(b.footprint?'Hall':'');b.name=b.footprint&&DESIGNS[b.design].largeName?DESIGNS[b.design].largeName:DESIGNS[b.design].name;}
 refresh(t);t.log(`${b.name}${expand?'四格擴建':`升至 ${tierOf(b)} 級`}完成`);return true;
}
export function demolishBuilding(t,id){const b=t.building(id);if(!b)return false;refundBuilding(t,b);for(const kind of ['input','output','shop'])transfer(t,`${kind}:${id}`,'dock',Infinity);for(const c of t.carts.filter(c=>c.home===id)){transfer(t,`cart:${c.id}`,'dock',Infinity);}t.carts=t.carts.filter(c=>c.home!==id);detach(t,b);t.buildings=t.buildings.filter(x=>x.id!==id);for(const p of t.people){for(const field of ['home','work','current','destination','shelter'])if(p[field]===id)p[field]=null;if(!p.current)p.outside=true;}
 for(const a of [...t.life.oxen,...t.life.visitors])if(a.target===id){if(a.kind==='ox'){transfer(t,`ox:${a.id}`,'dock',Infinity);a.phase='return';}else a.phase='choose';a.target=null;a.deliveryAt=null;a.walking=false;a.route=[];}
 for(const c of t.carts)if(c.current===id||c.destination===id){transfer(t,`cart:${c.id}`,'dock',Infinity);c.current=c.home;c.destination=c.home;c.outside=false;}
 refresh(t);t.log(`${b.name}已拆除；貨物退回貨棧，住戶等候新居`);return true;}
function refresh(t){
 t.stories.active=null;t.stories.nextAt=t.elapsed+20;for(const p of t.people){p.streetEvent=null;p.socialUntil=0;p.shelter=null;}
 const cartTargets=new Map(t.carts.map(c=>[c.id,c.destination]));t.rebuildRoads();
 for(const a of [...t.life.visitors,...t.life.porters,...t.life.oxen]){const nearest=roadAnchor(t,a.x,a.z);if(nearest)[a.x,a.z]=point(nearest);if(a.target&&t.building(a.target)&&['deliver','browse'].includes(a.phase))send(t,a,t.building(a.target).entrance,a.action);else if(a.walking&&a.goal){send(t,a,a.goal,a.action);}}
 for(const c of t.carts){if(!t.building(c.home))continue;if(c.outside){c.destination=cartTargets.get(c.id)||c.home;if(c.destination)t.travel(c,c.destination);}}

 syncCargo(t);t.revision++;
}

// Disjoint 2x2 plots prevent overlapping plazas in larger paved areas.
export function publicSquares(t){const cells=[...t.publicWorks].sort((a,b)=>a.z-b.z||a.x-b.x),used=new Set(),available=new Set(cells.map(c=>key(c.x,c.z))),out=[];for(const c of cells){const four=squareCells(c);if(four.every(p=>available.has(key(p.x,p.z))&&!used.has(key(p.x,p.z)))){out.push({...c,cells:four});for(const p of four)used.add(key(p.x,p.z));}}return out;}
export function mergeGardens(t){let result=null;for(const parts of gardenMergeGroups(t.buildings)){const a=parts[0],cells=squareCells(a);const ids=new Set(parts.map(b=>b.id));for(const b of parts)detach(t,b);attach(t,a,cells);a.tier=Math.max(...parts.map(tierOf));a.design='scholarGarden';a.name=DESIGNS.scholarGarden.name;a.born=Math.max(...parts.map(b=>b.born));a.stage=Math.min(...parts.map(b=>b.stage));t.buildings=t.buildings.filter(b=>!ids.has(b.id)||b.id===a.id);for(const p of [...t.people,...t.carts])for(const k of ['current','destination','shelter'])if(ids.has(p[k]))p[k]=a.id;for(const p of [...t.life.visitors,...t.life.oxen])if(ids.has(p.target))p.target=a.id;result=t.blocks.find(b=>b.id===a.blockId);t.log('四格花園相連，合成曲水疊石園');}return result;}
