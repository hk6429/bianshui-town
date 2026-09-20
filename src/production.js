import {isWorkshop,recipeFor,acceptsGoods,RECIPES} from './workshop-rules.js';
export {isWorkshop,recipeFor,RECIPES};
import {buildingStats} from './building-tiers.js';
import {emitProductionPollution} from './pollution.js';
import {craftEducationMultiplier} from './education.js';
import {millMultiplier} from './civic.js';
import {damaged} from './fire-service.js';
import {roadReachable,roadAnchor} from './road-network.js';
import {purchaseImports,recordSale} from './trade.js';
import {staffingRatio,jobCapacity,presentWorkers} from './employment.js';
import {saleTax,managed} from './city-finance.js';
import {riverOpen} from './calendar.js';
import {granaryStores} from './civic.js';
export const MAX_LOT_TRAIL=32,MAX_UNPROCESSED_LOTS=96;
export const GOODS={clay:'泥料',timber:'木材',fiber:'纖維',ceramics:'陶器',furniture:'木器',cloth:'布匹',legacy:'日用雜貨',paper:'印書紙',ink:'印墨',books:'書籍'};
export function createEconomy(){return {version:1,nextId:1,imported:0,archived:0,sold:{},lots:[]};}
export const at=(t,place,good)=>t.economy.lots.filter(l=>l.at===place&&(!good||l.good===good));
function add(t,good,place,origin){const e=t.economy,l={id:e.nextId++,good,at:place,origin,trail:[{at:place,time:t.time}]};e.lots.push(l);e.imported++;return l;}
function importGoods(t,count){const inputs=t.buildings.some(b=>b.design==='movableTypeHall'&&b.stage>=3)?['clay','timber','fiber','paper','ink','paper','ink']:['clay','timber','fiber'];return Array.from({length:count},(_,i)=>inputs[(t.economy.imported+i)%inputs.length]);}
export function importCargo(t){
 // Bound the unprocessed stock so an unattended town cannot grow its save forever.
 const capacity=MAX_UNPROCESSED_LOTS-t.economy.lots.filter(l=>!['sold','consumed'].includes(l.at)).length;
 if(capacity<=0)return false;
 if(!riverOpen(t))return false;   // 十月閉口至來年二月開漕，漕船不上
 const goods=purchaseImports(t,importGoods(t,Math.min(12,capacity)));if(!goods.length)return false;
 for(const good of goods)add(t,good,'boat',`汴河第 ${t.life.boat.trips+1} 航次`);
 syncCargo(t);return true;
}
// 冬季閉口時，義倉與城垣的存糧每日放出，讓街市不致斷貨。
export function releaseGranary(t){
 if(riverOpen(t))return 0;
 // 沒有義倉時仍有陸路小車勉強接濟，街市不會整個冬天完全斷貨，只是量少。
 const stores=granaryStores(t);
 const capacity=MAX_UNPROCESSED_LOTS-t.economy.lots.filter(l=>!['sold','consumed'].includes(l.at)).length;
 const count=Math.min(stores?stores*2:1,capacity);
 if(count<=0)return 0;
 const goods=purchaseImports(t,importGoods(t,count));
 if(!goods.length)return 0;
 for(const good of goods)add(t,good,'dock',stores?'義倉冬儲':'陸路小車');
 syncCargo(t);return goods.length;
}
function recordTrail(l,entry){
 l.trail.push(entry);
 if(l.trail.length<=MAX_LOT_TRAIL)return;
 const keep=new Set([0]);
 if(l.madeAt)for(const kind of ['input','output']){const i=l.trail.findIndex(e=>e.at===`${kind}:${l.madeAt}`);if(i>=0)keep.add(i);}
 for(let i=l.trail.length-1;keep.size<MAX_LOT_TRAIL;i--)keep.add(i);
 l.trailOmitted=(l.trailOmitted||0)+l.trail.length-keep.size;
 l.trail=l.trail.filter((_,i)=>keep.has(i));
}
export function transfer(t,from,to,count=1,good){
 if(['sold','consumed'].includes(from)||from===to)return 0;
 const lots=at(t,from,good).slice(0,count);
 for(const l of lots){l.at=to;recordTrail(l,{at:to,time:t.time});if(to==='sold'){t.economy.sold[l.good]=(t.economy.sold[l.good]||0)+1;recordSale(t,l.good,saleTax(t,l.good));}}
 const sold=at(t,'sold');if(sold.length>24){const ids=new Set(sold.slice(0,sold.length-24).map(l=>l.id));t.economy.lots=t.economy.lots.filter(l=>!ids.has(l.id));t.economy.archived+=ids.size;}
 syncCargo(t);return lots.length;
}
export function syncCargo(t){
 const l=t.life;l.boat.cargo=at(t,'boat').length;l.boat.imported=t.economy.imported;l.dock.stock=at(t,'dock').length;
 for(const a of [...l.porters,...l.oxen,...t.carts])a.carrying=at(t,`${a.kind==='porter'?'porter':a.kind==='ox'?'ox':'cart'}:${a.id}`).length;
 for(const b of t.buildings)if(b.type==='shop')b.stock=at(t,`shop:${b.id}`).length;
}
export function migrateEconomy(t){
 t.economy=createEconomy();const l=t.life,origin='舊版留存的日用雜貨';
 const restore=(count,place)=>{for(let i=0;i<(count||0);i++)add(t,'legacy',place,origin);};
 restore(l.boat.cargo,'boat');restore(l.dock.stock,'dock');
 for(const a of l.porters)restore(a.carrying,`porter:${a.id}`);
 for(const a of l.oxen){restore(a.carrying,`ox:${a.id}`);a.deliveryAt=t.building(a.target)?.type==='shop'?`shop:${a.target}`:null;}
 for(const b of t.buildings)restore(b.stock,`shop:${b.id}`);
 t.economy.archived=l.dock.sold||0;t.economy.imported+=t.economy.archived;t.economy.sold.legacy=t.economy.archived;syncCargo(t);
}
export const shopRoom=(t,b,good)=>good==='books'?Math.max(0,buildingStats(b).retail-at(t,`shop:${b.id}`).length):Infinity;
function incoming(t,to,good){return t.life.oxen.filter(a=>a.deliveryAt===to&&a.phase==='deliver').reduce((n,a)=>n+at(t,`ox:${a.id}`,good).length,0);}
export function deliveryPlan(t){
 const works=t.buildings.filter(b=>isWorkshop(b)&&b.stage>=3&&t.workers(b).length&&roadReachable(t,[12,8],b.entrance)).sort((a,b)=>(a.lastSupply??-1)-(b.lastSupply??-1)||at(t,`input:${a.id}`).length-at(t,`input:${b.id}`).length||a.id-b.id);
 for(const b of works){const r=recipeFor(b);for(const input of r.inputs||[r.input])if(at(t,'dock',input).length&&at(t,`input:${b.id}`,input).length+(r.output==='books'?incoming(t,`input:${b.id}`,input):0)<3&&at(t,`output:${b.id}`).length<6)return {building:b,good:input,to:`input:${b.id}`,count:r.output==='books'?3-at(t,`input:${b.id}`,input).length-incoming(t,`input:${b.id}`,input):Infinity};}
 // 拆除退回貨棧的成品可再配送，不會永久留在岸邊。
 const shops=t.buildings.filter(b=>b.type==='shop'&&b.stage>=3&&roadReachable(t,[12,8],b.entrance)).sort((a,b)=>a.stock-b.stock||a.id-b.id);
 for(const lot of at(t,'dock').filter(l=>['legacy',...RECIPES.map(r=>r.output)].includes(l.good))){const shop=shops.find(b=>acceptsGoods(b,lot.good)&&shopRoom(t,b,lot.good)>incoming(t,`shop:${b.id}`));if(shop)return {building:shop,good:lot.good,to:`shop:${shop.id}`,count:shopRoom(t,shop,lot.good)-incoming(t,`shop:${shop.id}`)};}
 return null;
}
export function tickProduction(t,dt){
 for(const b of t.buildings.filter(b=>isWorkshop(b)&&b.stage>=3)){
  if(damaged(b)){b.productionStatus='火警後整修中，暫停生產';continue;}
  const r=recipeFor(b),lot=at(t,`input:${b.id}`,r.input)[0],ink=r.output==='books'?at(t,`input:${b.id}`,'ink')[0]:null,ready=!!lot&&(r.output!=='books'||!!ink);
  const workers=presentWorkers(t,b);
  b.productionStatus=!workers.length?'等工匠到坊':!ready?(r.output==='books'?'等候印書紙與印墨':'等候原料'):at(t,`output:${b.id}`).length>=6?'成品待運':`${r.action} · 到場 ${workers.length}／${jobCapacity(b)} 人 · 學力加成 ${Math.round((craftEducationMultiplier(t,b)-1)*100)}％`;
  if(!ready||!workers.length||at(t,`output:${b.id}`).length>=6)continue;
  lot.progress=(lot.progress||0)+dt*buildingStats(b).production*(managed(t)?staffingRatio(t,b):1)*craftEducationMultiplier(t,b)*millMultiplier(t,b);
  if(lot.progress>=r.seconds){emitProductionPollution(t,b);if(managed(t))b.pendingWaste=Math.min(1000000,(b.pendingWaste||0)+2);if(ink){lot.materials=[lot,ink].map(l=>({id:l.id,good:l.good,origin:l.origin}));ink.consumedBy=lot.id;transfer(t,`input:${b.id}`,'consumed',1,'ink');const spent=at(t,'consumed');if(spent.length>24){const ids=new Set(spent.slice(0,spent.length-24).map(l=>l.id));t.economy.lots=t.economy.lots.filter(l=>!ids.has(l.id));t.economy.archived+=ids.size;}}lot.good=r.output;lot.madeAt=b.id;lot.progress=0;transfer(t,`input:${b.id}`,`output:${b.id}`,1,r.output);t.log(`${b.name}製成一件${GOODS[r.output]}，等推車送往商鋪`);}
 }
}
export function tickCraftCarts(t,dt){
 const shops=t.buildings.filter(b=>b.type==='shop'&&b.stage>=3);
 for(const c of t.carts){
  if(c.outside){if(!c.route.length&&c.destination)t.travel(c,c.destination);t.move(c,dt);continue;}
  const carried=at(t,`cart:${c.id}`)[0],currentShop=t.building(c.current);
  if(c.carrying&&acceptsGoods(currentShop,carried?.good)){const n=transfer(t,`cart:${c.id}`,`shop:${c.current}`,shopRoom(t,currentShop,carried?.good));t.life.dock.delivered+=n;if(n)t.log(`推車把 ${n} 件成品送到${t.building(c.current)?.name}`);c.wait=3;}
  if(c.carrying){const origin=roadAnchor(t,c.x,c.z)?.split(',').map(Number),shop=shops.find(b=>acceptsGoods(b,carried?.good)&&shopRoom(t,b,carried?.good)>0&&roadReachable(t,origin,b.entrance));if(shop)t.travel(c,shop.id);else c.action='載貨等候道路連通';continue;}
  c.wait=(c.wait||0)-dt;if(c.wait>0)continue;
  if(c.current!==c.home){t.travel(c,c.home);continue;}
  const lot=at(t,`output:${c.home}`)[0];if(!lot||!shops.length){c.action='在作坊等候成品';continue;}
  const shop=shops.filter(b=>acceptsGoods(b,lot.good)&&shopRoom(t,b,lot.good)>0&&roadReachable(t,t.building(c.home)?.entrance,b.entrance)).sort((a,b)=>(lot.good==='cloth'?(b.variant===2)-(a.variant===2):0)||a.stock-b.stock||a.id-b.id)[0];
  if(shop&&t.travel(c,shop.id)){transfer(t,`output:${c.home}`,`cart:${c.id}`,Math.min(3,shopRoom(t,shop,lot.good)),lot.good);c.action=`運送${GOODS[lot.good]}至${shop.name}`;}
 }
}
export function goodsBalance(t){return {imported:t.economy.imported,accounted:t.economy.lots.length+t.economy.archived};}
export function placeName(t,place){
 const [kind,id]=place.split(':');const b=t.building(Number(id));
 return ({boat:'漕船',dock:'岸邊貨棧',sold:'已售出',consumed:'印製耗用（未售出）',porter:'腳夫搬運中',ox:'牛車運送中',cart:'推車送店中'})[kind]||`${b?.name||'作坊'}${({input:' · 原料／加工',output:' · 成品待運',shop:' · 店內上架'})[kind]||''}`;
}
export function locateLot(t,lot){
 const [kind,id]=lot.at.split(':');if(['sold','consumed'].includes(kind))return null;
 if(kind==='boat')return {point:[t.life.boat.x,t.life.boat.z],ref:{kind:'boat',id:0}};
 if(kind==='dock')return {point:[12,8]};
 if(['porter','ox','cart'].includes(kind)){const a=[...t.life.porters,...t.life.oxen,...t.carts].find(a=>a.id===Number(id));return a?{point:[a.x,a.z],ref:kind==='cart'?null:{kind:'life',id:a.id}}:null;}
 const b=t.building(Number(id));return b?{point:[b.x*4,b.z*4],ref:{kind:'building',id:b.id}}:null;
}
