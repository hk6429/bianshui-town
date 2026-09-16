import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {cityDemand,addResident,tickPopulation,GRACE,residentCondition} from '../src/city-growth.js';
import {setCityPolicy,householdTax} from '../src/city-finance.js';
import {demolishBuilding} from '../src/urban.js';
const advance=(t,seconds,dt=.25)=>{for(let i=0;i<Math.round(seconds/dt);i++)t.tick(dt);};
function city(types){const t=new Town({mode:'managed'});types.forEach((type,i)=>assert(t.place(type,[{x:i-6,z:0}],true)));return t;}
test('RCI responds differently to housing, retail, workshops and balance; excess supply reduces its own demand',()=>{
 const homes=city(['home','home']),shops=city(['shop','shop']),works=city(['work','work']),balanced=city(['home','home','shop','work']);
 for(const t of [homes,balanced])for(const b of t.buildings.filter(b=>b.type==='home'))for(let i=0;i<2;i++)addResident(t,b);
 balanced.tick(.05);
 const values=[homes,shops,works,balanced].map(t=>Object.values(cityDemand(t)).slice(0,3).map(d=>d.score));assert.equal(new Set(values.map(JSON.stringify)).size,4);
 assert(cityDemand(homes).home.score<0);assert(cityDemand(homes).shop.score>0);assert(cityDemand(shops).shop.score<0);assert(cityDemand(shops).work.score>0);assert(cityDemand(works).work.score<0);
 for(const [type,key]of [['home','home'],['shop','shop'],['work','work']]){const t=city(['home','shop','work']);const before=cityDemand(t)[key].score;assert(t.place(type,[{x:0,z:0}],true));assert(cityDemand(t)[key].score<before,`${type} surplus lowers demand`);assert(cityDemand(t)[key].reasons.length>=3);}
});
test('tax increases reduce all three real demand scores, delay arrivals and empty homes pay no tax',()=>{
 const low=city(['home']),high=city(['home']);setCityPolicy(low,{taxRate:0});setCityPolicy(high,{taxRate:20});
 for(const key of ['home','shop','work'])assert(cityDemand(high)[key].score<cityDemand(low)[key].score);
 assert.equal(householdTax(high),0);advance(low,60);advance(high,60);assert(low.people.length>high.people.length);assert.equal(high.people.length,0);assert.equal(householdTax(high),0);
 setCityPolicy(high,{taxRate:0});advance(high,30);assert(high.people.length>0);
});
test('managed arrivals are gradual, frame-step independent and cannot accumulate a burst behind low demand',()=>{
 const a=city(['home','home','work','shop']),b=Town.restore(a.toJSON());a.tick(.05);assert.equal(a.people.length,0);
 advance(a,60,.05);advance(b,60,1);assert.equal(a.people.length,4);assert.equal(b.people.length,4);assert.equal(a.demography.arrived,b.demography.arrived);
 const c=city(['home']);c.city.taxRate=20;advance(c,150);assert.equal(c.people.length,0);c.city.taxRate=0;advance(c,15);assert.equal(c.people.length,1);
});
test('long-term homelessness causes bounded exits, clears chat/story references and preserves valid saves',()=>{
 const t=city(['home']);const home=t.buildings[0];const first=addResident(t,home),second=addResident(t,home);first.chatPartner=second.id;second.chatPartner=first.id;demolishBuilding(t,home.id);
 advance(t,GRACE.unhoused-15);assert.equal(t.people.length,2);assert.match(residentCondition(first),/無家/);
 advance(t,15);assert.equal(t.people.length,1);assert.equal(t.demography.departed,1);assert.equal(t.people[0].chatPartner,undefined);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
 advance(t,15);assert.equal(t.people.length,0);assert.equal(t.demography.departed,2);
});
test('rehousing has priority over immigration; restoring home and job ends hardship before departure',()=>{
 const t=city(['home','work']);const old=t.buildings[0],p=addResident(t,old);p.needsSatisfiedUntil=1e6;demolishBuilding(t,old.id);advance(t,60);assert.equal(t.people.length,1);
 assert(t.place('home',[{x:0,z:0}],true));advance(t,15);assert.equal(t.people.length,1);assert(p.home);assert(p.work);assert.equal(p.hardship.unhoused,0);assert.equal(p.hardship.unemployed,0);
 advance(t,60);assert(t.people.some(q=>q.id===p.id));assert.equal(t.demography.departed,0);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('unemployment and unmet goods each have their own grace, relief cancels only the relevant timer',()=>{
 const t=city(['home']);const p=addResident(t,t.buildings[0]);p.needsSatisfiedUntil=1e6;t.city.taxRate=20;
 advance(t,GRACE.unemployed-15);assert(t.people.includes(p));advance(t,15);assert(!t.people.includes(p));
 const a=city(['home','work']);const q=addResident(a,a.buildings[0]);a.city.taxRate=20;advance(a,GRACE.unserved-15);assert(a.people.includes(q));assert(q.work);advance(a,15);assert(!a.people.includes(q));
});
test('census credit and hardship round-trip without replay; sandbox remains explicitly unconstrained',()=>{
 const t=city(['home','work']);advance(t,35);const r=Town.restore(t.toJSON());assert.deepEqual(r.demography,t.demography);advance(t,30);advance(r,30);assert.deepEqual(r.toJSON(),t.toJSON());
 const old=structuredClone(t.toJSON());delete old.demography;const migrated=Town.restore(old);assert.equal(migrated.demography.lastAt,migrated.elapsed);const n=migrated.people.length;migrated.tick(.05);assert.equal(migrated.people.length,n);
 const sandbox=new Town();sandbox.place('home',[{x:0,z:0}],true);sandbox.tick(.05);assert.equal(sandbox.people.length,2);advance(sandbox,400);assert.equal(sandbox.people.length,2);
 const bad=structuredClone(t.toJSON());bad.demography.lastAt=bad.elapsed+10;assert.throws(()=>Town.restore(bad),/人口統計/);
});
test('removing the last story participant cancels the event without orphan references',()=>{
 const t=city(['home']);const p=addResident(t,t.buildings[0]);p.home=null;p.streetEvent=1;p.eventSlot=[0,2];p.hardship={unhoused:75,unemployed:0,unserved:0};
 // No available home: isolate the explicit census reference cleanup from story scheduling.
 demolishBuilding(t,t.buildings[0].id);p.streetEvent=1;p.eventSlot=[0,2];t.stories.active={id:1,type:'tea',title:'茶敘',gather:'聚集',activity:'聊天',end:'散場',center:[0,2],venue:'河畔',phase:'gathering',deadline:100,participants:[p.id]};
 t.elapsed=15;tickPopulation(t);assert.equal(t.people.length,0);assert.equal(t.stories.active,null);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
