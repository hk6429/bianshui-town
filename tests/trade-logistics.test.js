import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {importCargo,transfer,goodsBalance,syncCargo} from '../src/production.js';
import {logistics,upgradeLogistics} from '../src/logistics.js';import {dailyUpkeep} from '../src/city-finance.js';import {tickLife} from '../src/life.js';import {prepareTraffic} from '../src/traffic.js';
test('managed imports reconcile prices, quantities and working capital separately from city money',()=>{
 const t=new Town({mode:'managed'}),a=t.city.trade;assert.equal(t.economy.imported,12);assert.equal(a.importExpense,128);assert.equal(a.funds,472);assert.equal(t.city.treasury,2400);
 assert.equal(a.ledger.reduce((n,e)=>n+e.quantity,0),12);assert.equal(a.ledger.reduce((n,e)=>n-e.amount,0),128);assert.equal(new Set(a.ledger.map(e=>e.unitPrice)).size,2);assert(a.ledger.every(e=>e.batch===1));
 const before=a.funds;assert(importCargo(t));assert.equal(a.funds,before-128);assert.equal(a.nextBatch,3);assert.equal(t.economy.imported,24);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('insufficient trade funds block imports; partial cargo only bills the accepted units',()=>{
 const t=new Town({mode:'managed'});t.city.trade.funds=0;const before=JSON.stringify(t);assert(!importCargo(t));assert.equal(JSON.stringify(t),before);
 t.city.trade.funds=22;const n=t.economy.imported,cost=t.city.trade.importExpense;assert(importCargo(t));assert.equal(t.economy.imported-n,2);assert.equal(t.city.trade.importExpense-cost,22);assert.equal(t.city.trade.funds,0);assert.equal(goodsBalance(t).imported,goodsBalance(t).accounted);
});
test('sales credit gross revenue less tax to trade, only tax to city, and cannot repeat',()=>{
 const t=new Town({mode:'managed'});const lot=t.economy.lots[0];lot.good='furniture';const city=t.city.treasury,trade=t.city.trade.funds;
 assert.equal(transfer(t,'boat','sold',1,'furniture'),1);assert.equal(t.city.treasury-city,6);assert.equal(t.city.trade.funds-trade,54);assert.equal(t.city.trade.revenue,60);assert.equal(t.city.trade.taxPaid,6);
 const before=JSON.stringify(t);assert.equal(transfer(t,'sold','sold',1),0);assert.equal(JSON.stringify(t),before);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('logistics investment has finite levels, atomic affordability and daily upkeep',()=>{
 const t=new Town({mode:'managed'}),base=dailyUpkeep(t);const q=logistics(t);assert.equal(q.level,1);t.city.treasury=299;const before=JSON.stringify(t);assert(!upgradeLogistics(t));assert.equal(JSON.stringify(t),before);
 t.city.treasury=2000;assert(upgradeLogistics(t));assert.equal(t.city.treasury,1700);assert.equal(dailyUpkeep(t),base+6);assert(upgradeLogistics(t));assert.equal(t.city.treasury,1100);assert.equal(dailyUpkeep(t),base+12);const full=JSON.stringify(t);assert(!upgradeLogistics(t));assert.equal(JSON.stringify(t),full);assert.equal(Town.restore(t.toJSON()).city.logisticsLevel,3);
});
function delivery(level){const t=new Town({mode:'managed'});t.place('shop',[{x:0,z:0}],true);for(let i=1;i<level;i++)assert(upgradeLogistics(t));for(const l of t.economy.lots)l.good='legacy';syncCargo(t);t.life.boat.state='unloading';let seconds=0;
 for(;seconds<600&&t.life.dock.delivered<12;seconds+=.05){t.elapsed+=.05;t.time+=.05/15;prepareTraffic(t);tickLife(t,.05);}
 assert.equal(t.life.dock.delivered,12);assert.equal(t.life.porters.length,logistics(t).porters);assert.equal(t.life.oxen.length,logistics(t).oxen);assert.equal(new Set([...t.life.porters,...t.life.oxen,...t.life.visitors].map(a=>a.id)).size,t.life.porters.length+t.life.oxen.length+t.life.visitors.length);assert.equal(goodsBalance(t).imported,goodsBalance(t).accounted);return {seconds,t};}
test('upgraded real transport delivers the same 12 goods sooner without duplicate carriers',()=>{const one=delivery(1),three=delivery(3);assert(three.seconds<one.seconds*.8,`${three.seconds} vs ${one.seconds}`);assert(three.t.city.spent>one.t.city.spent);assert(dailyUpkeep(three.t)>dailyUpkeep(one.t));assert.doesNotThrow(()=>Town.restore(three.t.toJSON()));console.log(`物流實測：一級 ${one.seconds.toFixed(2)} 秒，三級 ${three.seconds.toFixed(2)} 秒`);});
test('old city budgets receive trade baseline and level one, without retroactively billing inventory',()=>{
 const t=new Town();t.demo();const data=t.toJSON();delete data.city.trade;delete data.city.logisticsLevel;const r=Town.restore(data);assert.equal(r.city.trade.funds,600);assert.equal(r.city.trade.importExpense,0);assert.equal(r.city.logisticsLevel,1);assert.deepEqual(r.economy,t.economy);
 for(const mutate of [d=>d.city.logisticsLevel=4,d=>d.city.trade.funds=-1,d=>d.city.trade.ledger[0].quantity=99,d=>d.city.trade.funds++,d=>d.city.trade.ledger[0].amount++]){const d=new Town({mode:'managed'}).toJSON();mutate(d);assert.throws(()=>Town.restore(d));}
});
