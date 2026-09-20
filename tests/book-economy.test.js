import test from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {squareCells} from '../src/heritage.js';
import {importCargo,at,transfer,deliveryPlan,tickProduction,tickCraftCarts,goodsBalance} from '../src/production.js';
import {tickLife} from '../src/life.js';
import {sellAtShop} from '../src/commerce.js';
import {demolishBuilding,layRoad} from '../src/urban.js';
import {jobCapacity,assignJobs} from '../src/employment.js';
import {buildingStats} from '../src/building-tiers.js';
function fixture(){
 const t=new Town();t.place('home',squareCells({x:-4,z:0}),true);
 t.place('garden',squareCells({x:0,z:0}),true,'garden');const work=t.buildings.at(-1);
 // 此 fixture 僅隔離驗證經濟，閱讀/排字解鎖另有 literary-quests 測試。
 work.design='movableTypeHall';work.name='活字印書坊';
 t.place('shop',[{x:0,z:-3}],true,'bookshop');const shop=t.buildings.at(-1);
 t.tick(.05);t.time=12;t.city.mode='managed';
 assert(layRoad(t,'lane',[{x:2,z:2},{x:2,z:1},{x:2,z:0},{x:2,z:-1},{x:2,z:-2},{x:1,z:-2},{x:0,z:-2},{x:-2,z:1},{x:-1,z:1}]));
 for(const [i,p] of t.people.entries()){p.work=i<2?shop.id:work.id;p.current=p.work;p.outside=false;p.route=[];}
 return {t,work,shop};
}
function paperAndInk(t,work){assert(importCargo(t));transfer(t,'boat',`input:${work.id}`,1,'paper');transfer(t,'boat',`input:${work.id}`,1,'ink');}
function assertBalance(t){const b=goodsBalance(t);assert.equal(b.imported,b.accounted);}
test('garden-compatible print shop hires workers and real purchased paper and ink produce one traceable book',()=>{
 const {t,work}=fixture();assert.equal(work.type,'garden');assert(jobCapacity(work)>0);
 for(const p of t.people)p.work=null;assignJobs(t);assert(t.workers(work).length>0);
 for(const p of t.workers(work)){p.current=work.id;p.outside=false;}
 const expense=t.city.trade.importExpense;paperAndInk(t,work);assert(t.city.trade.importExpense>expense);
 const paper=at(t,`input:${work.id}`,'paper')[0],ink=at(t,`input:${work.id}`,'ink')[0];tickProduction(t,100);
 assert.equal(paper.good,'books');assert.equal(paper.at,`output:${work.id}`);assert.equal(ink.at,'consumed');assert.equal(ink.consumedBy,paper.id);assert.deepEqual(paper.materials.map(x=>x.id),[paper.id,ink.id]);
 assert.equal(t.city.trade.revenue,0);assert.equal(t.economy.sold.ink,undefined);assert.equal(transfer(t,'consumed','sold',1),0);assertBalance(t);
 assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('actual ox delivery, printing, cart route and staffed bookshop sale finish without repeated revenue',()=>{
 const {t,work,shop}=fixture();assert(importCargo(t));transfer(t,'boat','dock',Infinity);
 for(let i=0;i<1600&&(!at(t,`input:${work.id}`,'paper').length||!at(t,`input:${work.id}`,'ink').length);i++)tickLife(t,.5);
 assert(at(t,`input:${work.id}`,'paper').length);assert(at(t,`input:${work.id}`,'ink').length);
 tickProduction(t,100);assert.equal(at(t,`output:${work.id}`,'books').length,1);
 assert(t.carts.some(c=>c.home===work.id),'simulation creates garden workshop cart');
 for(let i=0;i<1600&&!at(t,`shop:${shop.id}`,'books').length;i++)tickCraftCarts(t,.5);
 assert.equal(at(t,`shop:${shop.id}`,'books').length,1);const funds=t.city.trade.funds,revenue=t.city.trade.revenue;
 assert.equal(sellAtShop(t,shop,'books'),1);assert(t.city.trade.funds>funds);assert.equal(t.city.trade.revenue-revenue,9000);
 assert.equal(sellAtShop(t,shop,'books'),0);assert.equal(t.city.trade.revenue-revenue,9000);assert.equal(t.economy.sold.books,1);assertBalance(t);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('missing ink, absent staff and full output prevent paper consumption',()=>{
 for(const mode of ['ink','staff','full']){const {t,work}=fixture();paperAndInk(t,work);const paper=at(t,`input:${work.id}`,'paper')[0];
  if(mode==='ink')transfer(t,`input:${work.id}`,'dock',1,'ink');
  if(mode==='staff')for(const p of t.workers(work))p.outside=true;
  if(mode==='full')transfer(t,'boat',`output:${work.id}`,6);
  tickProduction(t,100);assert.equal(paper.good,'paper');assert.equal(at(t,'consumed').length,0);assertBalance(t);
 }
});
test('no trade credit, disconnected road, non-bookshop and full retail do not invent goods or deliveries',()=>{
 const {t,work,shop}=fixture();paperAndInk(t,work);tickProduction(t,100);const cart=t.carts.find(c=>c.home===work.id);
 const roads=t.roads;t.roads=new Set();assert.equal(deliveryPlan(t),null);tickCraftCarts(t,10);assert.equal(cart.carrying,0);t.roads=roads;
 shop.design='shop';tickCraftCarts(t,10);assert.equal(cart.carrying,0);shop.design='bookshop';
 transfer(t,'boat',`shop:${shop.id}`,buildingStats(shop).retail);tickCraftCarts(t,10);assert.equal(cart.carrying,0);
 t.city.trade.funds=0;const before=structuredClone(t.economy);assert.equal(importCargo(t),false);assert.deepEqual(t.economy,before);assertBalance(t);
});
test('demolition returns input, books and loaded cart goods; books are resupplied only to a bookshop',()=>{
 const {t,work,shop}=fixture();paperAndInk(t,work);tickProduction(t,100);tickCraftCarts(t,.1);assert.equal(at(t,`cart:${t.carts[0].id}`,'books').length,1);
 const before=t.economy.lots.length;assert(demolishBuilding(t,work.id));assert.equal(t.economy.lots.length,before);assert.equal(at(t,'dock','books').length,1);assert.equal(at(t,'consumed').length,1);assert(layRoad(t,'lane',[{x:0,z:-2},{x:0,z:-1},{x:0,z:0},{x:0,z:1},{x:0,z:2},{x:1,z:2},{x:2,z:2}]));assert.equal(deliveryPlan(t).to,`shop:${shop.id}`);
 assertBalance(t);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('consumed archive stays bounded and conserved without producing sale revenue',()=>{
 const {t,work}=fixture();t.city.mode='sandbox';
 for(let i=0;i<32;i++){transfer(t,'boat','sold',Infinity);transfer(t,'dock','sold',Infinity);transfer(t,`output:${work.id}`,'sold',Infinity);paperAndInk(t,work);const soldInk=t.economy.sold.ink||0;tickProduction(t,100);assert.equal(t.economy.sold.ink||0,soldInk);}
 assert.equal(at(t,'consumed').length,24);assert(t.economy.archived>0);assert.equal(t.city.trade.revenue,0);assertBalance(t);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('multiple oxen reserve different required materials instead of filling every cart with paper',()=>{
 const {t,work}=fixture();assert(importCargo(t));assert(importCargo(t));transfer(t,'boat','dock',Infinity);
 const first=deliveryPlan(t);assert.equal(first.to,`input:${work.id}`);
 const ox={id:4999,kind:'ox',phase:'deliver',deliveryAt:first.to};t.life.oxen.push(ox);transfer(t,'dock',`ox:${ox.id}`,first.count,first.good);
 const second=deliveryPlan(t);assert(second);assert.notEqual(second.good,first.good);assert.equal(second.to,first.to);assertBalance(t);
});
test('saved books reject missing, duplicated or contradictory material histories',()=>{
 const {t,work}=fixture();paperAndInk(t,work);tickProduction(t,100);
 for(const corrupt of [
  d=>{delete d.economy.lots.find(l=>l.good==='books').materials;},
  d=>{const b=d.economy.lots.find(l=>l.good==='books');b.materials[1].id=b.id;},
  d=>{d.economy.lots.find(l=>l.at==='consumed').good='paper';},
  d=>{d.economy.lots.find(l=>l.at==='consumed').at='dock';},
  d=>{d.economy.lots.find(l=>l.good==='books').materials[1].origin='偽造來源';},
  d=>{d.economy.lots.find(l=>l.at==='consumed').consumedBy=1;}
 ]){const data=structuredClone(t.toJSON());corrupt(data);assert.throws(()=>Town.restore(data));}
 assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('whole town ticks unload imported paper and ink and sell printed books without direct inventory transfers',()=>{
 const {t}=fixture();assert(importCargo(t));t.time=8;
 // 給長流程測試的既有居民備足日用品，隔離人口遷出政策。
 for(const p of t.people)p.needsSatisfiedUntil=1e6;
 for(let i=0;i<10000&&!(t.economy.sold.books>0);i++)t.tick(.05);
 assert(t.economy.sold.books>0);assert(t.city.trade.ledger.some(x=>x.kind==='sale'&&x.good==='books'));assertBalance(t);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
