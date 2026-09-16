import {addResident} from '../src/city-growth.js';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {validateSave} from '../src/save-schema.js';import {editTown} from '../src/town-edit.js';
import {buildCost,moveCost,upgradeCost,roadCost,dailyUpkeep,householdTax,taxDemand,setCityPolicy,settleBudget} from '../src/city-finance.js';
import {layRoad,moveBuilding,upgradeBuilding,demolishBuilding} from '../src/urban.js';import {transfer} from '../src/production.js';
const cells=[{x:0,z:0},{x:1,z:0},{x:0,z:1},{x:1,z:1}];
test('managed building prices are shared with execution; invalid or unaffordable placement changes nothing',()=>{
 const t=new Town({mode:'managed'});assert(buildCost('home',cells)>buildCost('home',[cells[0]]));const funds=t.city.treasury;assert(t.place('home',cells,true));assert.equal(t.city.treasury,funds-buildCost('home',cells));assert.equal(t.city.ledger.length,1);
 const before=JSON.stringify(t);assert(!t.place('home',cells,true));assert.equal(JSON.stringify(t),before);t.city.treasury=1;const low=JSON.stringify(t);assert(!t.place('shop',[{x:-4,z:0}],true));assert.equal(JSON.stringify(t),low);
});
test('roads, moves, upgrades and expansion debit once; insufficient funds preserve all state',()=>{
 const t=new Town({mode:'managed'});t.place('home',[{x:-4,z:0}],true);const b=t.buildings[0];
 for(const [cost,act] of [[()=>roadCost(t,'lane',[{x:0,z:4}]),()=>layRoad(t,'lane',[{x:0,z:4}])],[()=>moveCost(b),()=>moveBuilding(t,b.id,{x:-5,z:0})],[()=>upgradeCost(b),()=>upgradeBuilding(t,b.id)],[()=>upgradeCost(b,true),()=>upgradeBuilding(t,b.id,true)]]){const price=cost();t.city.treasury=0;const before=JSON.stringify(t);assert(!act());assert.equal(JSON.stringify(t),before);t.city.treasury=10000;assert(act());assert.equal(t.city.treasury,10000-price);}
});
test('failed refresh does not commit construction fees or ledger entries',()=>{const t=new Town({mode:'managed'}),before=JSON.stringify(t);const result=editTown(t,d=>d.place('home',[{x:0,z:0}],true),{prepare:()=>{throw Error('renderer');}});assert(!result.ok);assert.equal(JSON.stringify(t),before);});
test('daily upkeep depends on active facilities, is independent of tick sizes and settles once',()=>{
 const run=dt=>{const t=new Town({mode:'managed'});t.city.taxRate=0;t.place('home',[{x:0,z:0}],true);for(let i=0;i<720/dt;i++)t.tick(dt);return t;};
 const a=run(.25),b=run(1);assert.equal(a.city.maintenancePaid,b.city.maintenancePaid);assert.equal(a.city.maintenancePaid,6);const before=a.city.treasury;settleBudget(a);assert.equal(a.city.treasury,before);
 const one=dailyUpkeep(a);a.place('shop',[{x:-3,z:0}],true);assert(dailyUpkeep(a)>one);const active=dailyUpkeep(a);a.place('work',[{x:2,z:4}],false);assert.equal(dailyUpkeep(a),active);
});
test('only housed residents and new actual sales pay tax; policy range and tax pressure are bounded',()=>{
 const t=new Town({mode:'managed'});t.place('home',[{x:0,z:0}],true);assert.equal(householdTax(t),0);addResident(t,t.buildings[0]);addResident(t,t.buildings[0]);assert.equal(householdTax(t),4);
 const lot=t.economy.lots[0];lot.good='cloth';const funds=t.city.treasury;assert.equal(transfer(t,'boat','sold',1,'cloth'),1);assert.equal(t.city.treasury,funds+4);assert.equal(transfer(t,'sold','sold',1,'cloth'),0);assert.equal(t.city.treasury,funds+4);
 const demand=taxDemand(t);assert(setCityPolicy(t,{taxRate:20}));assert.equal(householdTax(t),8);assert(taxDemand(t)<demand);const next=t.economy.lots.find(l=>l.at==='boat');next.good='cloth';const highFunds=t.city.treasury;assert.equal(transfer(t,'boat','sold',1,'cloth'),1);assert.equal(t.city.treasury,highFunds+8);const before=JSON.stringify(t);assert(!setCityPolicy(t,{taxRate:21}));assert.equal(JSON.stringify(t),before);
});
test('old saves migrate to sandbox without back-charging; mode toggles never refill the treasury',()=>{
 const t=new Town();t.demo();const old=t.toJSON();old.version=8;delete old.city;const r=Town.restore(old);assert.equal(r.city.mode,'sandbox');const n=r.buildings.length;assert.equal(r.city.ledger.length,0);assert(setCityPolicy(r,{mode:'managed'}));r.city.treasury=500;assert(setCityPolicy(r,{mode:'sandbox'}));r.time+=24;settleBudget(r);assert.equal(r.city.treasury,500);assert(setCityPolicy(r,{mode:'managed'}));assert.equal(r.city.treasury,500);assert.equal(r.buildings.length,n);assert.doesNotThrow(()=>Town.restore(r.toJSON()));
});
test('debt blocks paid construction but permits demolition and policy changes',()=>{
 const t=new Town({mode:'managed'});t.place('garden',[{x:0,z:0}],true,'garden');t.city.treasury=0;t.time+=24;settleBudget(t);assert(t.city.treasury<0);assert.equal(t.city.deficitDays,1);assert(!t.place('home',[{x:-3,z:0}],true));assert(demolishBuilding(t,t.buildings[0].id));assert(t.city.treasury>0);assert.equal(dailyUpkeep(t),1);assert(setCityPolicy(t,{taxRate:12}));
});
test('city schema rejects invalid policy, missing v9 budget and future settlement cursor',()=>{const t=new Town({mode:'managed'});for(const mutate of [d=>d.city.taxRate=99,d=>d.city.treasury=NaN,d=>d.city.day=100,d=>delete d.city]){const d=structuredClone(t.toJSON());mutate(d);assert.throws(()=>validateSave(d));}});
