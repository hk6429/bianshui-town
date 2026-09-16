import {bounds,key,point,CELL} from './simulation.js';
import {DESIGNS,squareCells} from './heritage.js';
import {transfer,syncCargo} from './production.js';
import {send} from './life.js';
export const ROAD_TYPES={lane:'青石小路',avenue:'寬闊大路'};
export const footprint=b=>b.footprint||[{x:b.x,z:b.z}];
export function freeCells(t,cells,ignore=null){return cells.every(c=>Number.isInteger(c.x)&&Number.isInteger(c.z)&&c.x>=bounds.minX&&c.x<=bounds.maxX&&c.z>=bounds.minZ&&c.z<=bounds.maxZ&&!t.buildings.some(b=>b.id!==ignore&&footprint(b).some(p=>p.x===c.x&&p.z===c.z))&&!t.publicWorks.some(p=>p.x===c.x&&p.z===c.z));}
export function streetCells(start,end){const out=[{...start}];let {x,z}=start;while(out.length<24&&(x!==end.x||z!==end.z)){if(x!==end.x)x+=Math.sign(end.x-x);else z+=Math.sign(end.z-z);out.push({x,z});}return out;}
export function layRoad(t,type,cells){if(!ROAD_TYPES[type]||!cells.length||cells.length>24||!freeCells({...t,publicWorks:[]},cells))return false;for(const c of cells){const existing=t.publicWorks.find(p=>p.x===c.x&&p.z===c.z);if(existing)existing.type=type;else t.publicWorks.push({...c,type});}refresh(t);t.log(`鋪設${cells.length}格${ROAD_TYPES[type]}`);return true;}
export function removeRoad(t,cells){const before=t.publicWorks.length;t.publicWorks=t.publicWorks.filter(p=>!cells.some(c=>c.x===p.x&&c.z===p.z));if(before===t.publicWorks.length)return false;refresh(t);return true;}
export function roadNodes(t){const nodes=new Set();for(const c of t.publicWorks)for(let i=-2;i<=2;i++){nodes.add(key(c.x*CELL+i,c.z*CELL));nodes.add(key(c.x*CELL,c.z*CELL+i));}return nodes;}
function detach(t,b){const block=t.blocks.find(g=>g.id===b.blockId),cells=footprint(b);block.cells=block.cells.filter(c=>!cells.some(p=>p.x===c.x&&p.z===c.z));t.blocks=t.blocks.filter(g=>g.cells.length);}
function attach(t,b,cells){const block={id:t.nextId++,type:b.type,combined:cells.length===4,cells:cells.map(c=>({...c}))};t.blocks.push(block);b.blockId=block.id;b.x=cells.reduce((s,c)=>s+c.x,0)/cells.length;b.z=cells.reduce((s,c)=>s+c.z,0)/cells.length;if(cells.length===4)b.footprint=cells.map(c=>({...c}));else delete b.footprint;}
export function moveBuilding(t,id,anchor){const b=t.building(id);if(!b||b.stage<3)return false;const cells=b.footprint?squareCells(anchor):[anchor];if(!freeCells(t,cells,id))return false;detach(t,b);attach(t,b,cells);refresh(t);t.log(`${b.name}已搬移，住戶與貨物保留`);return true;}
export function upgradeBuilding(t,id,expand=false){const b=t.building(id);if(!b||b.stage<3||!['home','work'].includes(b.type)||(!expand&&b.level>=2)||expand&&b.footprint)return false;if(expand){const cells=squareCells({x:b.x,z:b.z});if(!freeCells(t,cells,id))return false;detach(t,b);attach(t,b,cells);}b.level=2;b.design=b.type==='home'?(b.footprint?'mansion':'residence'):['kiln','woodshop','weavery'][b.variant]+(b.footprint?'Hall':'');b.name=DESIGNS[b.design].name;refresh(t);t.log(`${b.name}${expand?'四格擴建':'升級'}完成`);return true;}
export function demolishBuilding(t,id){const b=t.building(id);if(!b)return false;for(const kind of ['input','output','shop'])transfer(t,`${kind}:${id}`,'dock',Infinity);for(const c of t.carts.filter(c=>c.home===id)){transfer(t,`cart:${c.id}`,'dock',Infinity);}t.carts=t.carts.filter(c=>c.home!==id);detach(t,b);t.buildings=t.buildings.filter(x=>x.id!==id);for(const p of t.people){for(const field of ['home','work','current','destination','shelter'])if(p[field]===id)p[field]=null;if(!p.current)p.outside=true;}
 for(const a of [...t.life.oxen,...t.life.visitors])if(a.target===id){if(a.kind==='ox'){transfer(t,`ox:${a.id}`,'dock',Infinity);a.phase='return';}else a.phase='choose';a.target=null;a.deliveryAt=null;a.walking=false;a.route=[];}
 for(const c of t.carts)if(c.current===id||c.destination===id){transfer(t,`cart:${c.id}`,'dock',Infinity);c.current=c.home;c.destination=c.home;c.outside=false;}
 refresh(t);t.log(`${b.name}已拆除；貨物退回貨棧，住戶等候新居`);return true;}
function refresh(t){
 t.stories.active=null;t.stories.nextAt=t.elapsed+20;for(const p of t.people){p.streetEvent=null;p.socialUntil=0;p.shelter=null;}
 t.rebuildRoads();
 for(const a of [...t.life.visitors,...t.life.porters,...t.life.oxen]){const nearest=t.nearestRoad(a.x,a.z);if(nearest)[a.x,a.z]=point(nearest);if(a.target&&t.building(a.target)&&['deliver','browse'].includes(a.phase))send(t,a,t.building(a.target).entrance,a.action);else if(a.walking&&a.goal){const goal=t.nearestRoad(...a.goal);if(goal)send(t,a,point(goal),a.action);}}
 for(const c of t.carts){const home=t.building(c.home);if(!home)continue;c.current=c.home;c.destination=c.home;c.outside=false;c.route=[];[c.x,c.z]=home.entrance;if(c.carrying){const shop=t.buildings.find(b=>b.type==='shop'&&b.stage>=3);if(shop)t.travel(c,shop.id);else transfer(t,`cart:${c.id}`,'dock',Infinity);}}

 syncCargo(t);t.revision++;
}
