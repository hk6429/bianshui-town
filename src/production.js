export const GOODS={clay:'泥料',timber:'木材',fiber:'纖維',ceramics:'陶器',furniture:'木器',cloth:'布匹',legacy:'日用雜貨'};
export const RECIPES=[{input:'clay',output:'ceramics',seconds:14,action:'拉坯、入窯燒製'},{input:'timber',output:'furniture',seconds:12,action:'鋸切、打磨木器'},{input:'fiber',output:'cloth',seconds:16,action:'紡線、上機織布'}];
export function createEconomy(){return {version:1,nextId:1,imported:0,archived:0,sold:{},lots:[]};}
export const at=(t,place,good)=>t.economy.lots.filter(l=>l.at===place&&(!good||l.good===good));
function add(t,good,place,origin){const e=t.economy,l={id:e.nextId++,good,at:place,origin,trail:[{at:place,time:t.time}]};e.lots.push(l);e.imported++;return l;}
export function importCargo(t){
 // Bound the unprocessed stock so an unattended town cannot grow its save forever.
 if(t.economy.lots.filter(l=>l.at!=='sold').length>=96)return false;
 for(let i=0;i<12;i++)add(t,RECIPES[i%3].input,'boat',`汴河第 ${t.life.boat.trips+1} 航次`);
 syncCargo(t);return true;
}
export function transfer(t,from,to,count=1,good){
 const lots=at(t,from,good).slice(0,count);
 for(const l of lots){l.at=to;l.trail.push({at:to,time:t.time});if(to==='sold')t.economy.sold[l.good]=(t.economy.sold[l.good]||0)+1;}
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
 for(const a of l.oxen){restore(a.carrying,`ox:${a.id}`);a.deliveryAt=`shop:${a.target}`;}
 for(const b of t.buildings)restore(b.stock,`shop:${b.id}`);
 t.economy.archived=l.dock.sold||0;t.economy.imported+=t.economy.archived;t.economy.sold.legacy=t.economy.archived;syncCargo(t);
}
export function deliveryPlan(t){
 const works=t.buildings.filter(b=>b.type==='work'&&b.stage>=3&&t.workers(b).length).sort((a,b)=>(a.lastSupply??-1)-(b.lastSupply??-1)||at(t,`input:${a.id}`).length-at(t,`input:${b.id}`).length||a.id-b.id);
 for(const b of works){const r=RECIPES[b.variant];if(at(t,'dock',r.input).length&&at(t,`input:${b.id}`).length<3&&at(t,`output:${b.id}`).length<6)return {building:b,good:r.input,to:`input:${b.id}`};}
 const shops=t.buildings.filter(b=>b.type==='shop'&&b.stage>=3).sort((a,b)=>a.stock-b.stock||a.id-b.id);
 if(shops.length&&at(t,'dock','legacy').length)return {building:shops[0],good:'legacy',to:`shop:${shops[0].id}`};
 return null;
}
export function tickProduction(t,dt){
 for(const b of t.buildings.filter(b=>b.type==='work'&&b.stage>=3)){
  const r=RECIPES[b.variant],lot=at(t,`input:${b.id}`,r.input)[0];
  const workers=t.workers(b).filter(p=>!p.outside&&p.current===b.id);
  b.productionStatus=!workers.length?'等工匠到坊':!lot?'等候原料':at(t,`output:${b.id}`).length>=6?'成品待運':r.action;
  if(!lot||!workers.length||at(t,`output:${b.id}`).length>=6)continue;
  lot.progress=(lot.progress||0)+dt*(b.footprint?2:b.level>=2?1.5:1);
  if(lot.progress>=r.seconds){lot.good=r.output;lot.madeAt=b.id;lot.progress=0;transfer(t,`input:${b.id}`,`output:${b.id}`,1,r.output);t.log(`${b.name}製成一件${GOODS[r.output]}，等推車送往商鋪`);}
 }
}
export function tickCraftCarts(t,dt){
 const shops=t.buildings.filter(b=>b.type==='shop'&&b.stage>=3);
 for(const c of t.carts){
  if(c.outside){t.move(c,dt);continue;}
  if(c.carrying){const n=transfer(t,`cart:${c.id}`,`shop:${c.current}`,3);t.life.dock.delivered+=n;t.log(`推車把 ${n} 件成品送到${t.building(c.current)?.name}`);c.wait=3;}
  c.wait=(c.wait||0)-dt;if(c.wait>0)continue;
  if(c.current!==c.home){t.travel(c,c.home);continue;}
  const lot=at(t,`output:${c.home}`)[0];if(!lot||!shops.length){c.action='在作坊等候成品';continue;}
  const shop=[...shops].sort((a,b)=>(lot.good==='cloth'?(b.variant===2)-(a.variant===2):0)||a.stock-b.stock||a.id-b.id)[0];
  if(t.travel(c,shop.id)){transfer(t,`output:${c.home}`,`cart:${c.id}`,3);c.action=`運送${GOODS[lot.good]}至${shop.name}`;}
 }
}
export function goodsBalance(t){return {imported:t.economy.imported,accounted:t.economy.lots.length+t.economy.archived};}
export function placeName(t,place){
 const [kind,id]=place.split(':');const b=t.building(Number(id));
 return ({boat:'漕船',dock:'岸邊貨棧',sold:'已售出',porter:'腳夫搬運中',ox:'牛車運送中',cart:'推車送店中'})[kind]||`${b?.name||'作坊'}${({input:' · 原料／加工',output:' · 成品待運',shop:' · 店內上架'})[kind]||''}`;
}
export function locateLot(t,lot){
 const [kind,id]=lot.at.split(':');if(kind==='sold')return null;
 if(kind==='boat')return {point:[t.life.boat.x,t.life.boat.z],ref:{kind:'boat',id:0}};
 if(kind==='dock')return {point:[12,8]};
 if(['porter','ox','cart'].includes(kind)){const a=[...t.life.porters,...t.life.oxen,...t.carts].find(a=>a.id===Number(id));return a?{point:[a.x,a.z],ref:kind==='cart'?null:{kind:'life',id:a.id}}:null;}
 const b=t.building(Number(id));return b?{point:[b.x*4,b.z*4],ref:{kind:'building',id:b.id}}:null;
}
