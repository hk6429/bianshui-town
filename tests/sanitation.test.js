import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {addResident,cityDemand} from '../src/city-growth.js';
import {tickSanitation,sanitationReport,cleaningCapacity} from '../src/sanitation.js';
import {serviceEfficiency} from '../src/public-services.js';
import {waterReport} from '../src/water-service.js';
import {layRoad,removeRoad,demolishBuilding} from '../src/urban.js';
import {settleBudget,setCityPolicy} from '../src/city-finance.js';
import {tickProduction,transfer} from '../src/production.js';

function build(t,type,x,z,design=null){assert(t.place(type,[{x,z}],true,design));return t.buildings.at(-1);}
function home(count=4){const t=new Town({mode:'managed'}),b=build(t,'home',0,0,'residence');for(let i=0;i<count;i++)addResident(t,b);return {t,b};}
function day(t){t.time+=24;tickSanitation(t);}
test('population causes proportional daily waste, gradual health decline and real demand loss',()=>{
 const low=home(2),high=home(4),before=cityDemand(high.t).home.score;
 day(low.t);day(high.t);assert.equal(low.b.waste,2);assert.equal(high.b.waste,4);assert.equal(high.t.people[0].health,99);assert(cityDemand(high.t).home.score<before);
 const first=high.t.people[0].health;day(high.t);assert.equal(high.b.waste,8);assert(high.t.people[0].health<first);assert(high.t.people[0].health>0);
 const json=JSON.stringify(high.t);tickSanitation(high.t);assert.equal(JSON.stringify(high.t),json);
});
test('reachable finite-capacity cleaning stabilises waste, disconnection gradually worsens and restoration heals',()=>{
 const {t,b}=home(),yard=build(t,'garden',-2,0,'cleaningYard');assert(layRoad(t,'lane',[{x:-1,z:0}]));
 day(t);assert.equal(b.waste,0);assert.equal(t.people[0].health,100);assert.equal(cleaningCapacity(t,yard),12);
 assert(removeRoad(t,[{x:-1,z:0}]));assert.equal(b.waste,0);day(t);assert.equal(b.waste,4);day(t);assert.equal(b.waste,8);assert(t.people[0].health<100);
 assert(layRoad(t,'lane',[{x:-1,z:0}]));day(t);assert.equal(b.waste,0);assert.equal(t.people[0].health,100);
 // A backlog is processed at the daily limit, never erased by building a yard.
 b.waste=40;day(t);assert.equal(b.waste,32);assert(demolishBuilding(t,yard.id));assert.equal(b.waste,32);day(t);assert.equal(b.waste,36);
});
test('only actual completed production adds pending waste, settled once and preserved across reload',()=>{
 const {t}=home(),work=build(t,'work',-1,0,'kiln');for(const p of t.people){p.work=work.id;p.current=work.id;p.outside=false;}
 transfer(t,'boat',`input:${work.id}`,1,'clay');tickProduction(t,1);assert.equal(work.pendingWaste,undefined);tickProduction(t,14);assert.equal(work.pendingWaste,2);assert.equal(work.waste,undefined);
 const r=Town.restore(t.toJSON());day(t);day(r);assert.equal(work.waste,2);assert.equal(work.pendingWaste,0);assert.deepEqual(r.toJSON(),t.toJSON());
 day(t);assert.equal(work.waste,2);assert.equal(sanitationReport(t).pending,0);
});
test('debt progressively cuts both water and cleaning; real tax receipts restore services and paid building access',()=>{
 const {t}=home();build(t,'garden',-1,0,'well');const yard=build(t,'garden',1,0,'cleaningYard');t.city.treasury=0;setCityPolicy(t,{taxRate:0});
 for(const [i,efficiency,capacity] of [[1,.75,9],[2,.5,6],[3,.25,3]]){t.time+=24;settleBudget(t);tickSanitation(t);assert.equal(t.city.deficitDays,i);assert.equal(serviceEfficiency(t),efficiency);assert.equal(cleaningCapacity(t,yard),capacity);assert.equal(waterReport(t).wells[0].capacity,capacity);}
 assert.equal(waterReport(t).served,3);assert(sanitationReport(t).waste>0);const before=JSON.stringify(t);assert(!t.place('home',[{x:-4,z:0}],true));assert.equal(JSON.stringify(t),before);
 setCityPolicy(t,{taxRate:20});for(let i=0;i<4;i++){t.time+=24;settleBudget(t);tickSanitation(t);}
 assert(t.city.treasury>=0);assert.equal(serviceEfficiency(t),1);assert.equal(cleaningCapacity(t,yard),12);assert.equal(waterReport(t).served,4);assert.equal(sanitationReport(t).waste,0);
 // Existing recovery path remains usable without first paying to build.
 assert(demolishBuilding(t,yard.id));assert(t.city.treasury>0);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('old saves start today, malformed state is rejected, sandbox and mode switches do not back-charge sanitation',()=>{
 const {t,b}=home();t.time=100;const old=structuredClone(t.toJSON());delete old.city.sanitationDay;const r=Town.restore(old);assert.equal(r.city.sanitationDay,4);tickSanitation(r);assert.equal(r.buildings[0].waste,undefined);
 for(const mutate of [d=>d.city.sanitationDay=100,d=>d.buildings[0].waste=-1,d=>d.buildings[0].pendingWaste=Infinity,d=>d.people[0].health=101]){const d=structuredClone(r.toJSON());mutate(d);assert.throws(()=>Town.restore(d));}
 setCityPolicy(t,{mode:'sandbox'});b.pendingWaste=10;day(t);assert.equal(b.waste,undefined);assert.equal(b.pendingWaste,undefined);setCityPolicy(t,{mode:'managed'});tickSanitation(t);assert.equal(b.waste,undefined);day(t);assert.equal(b.waste,4);
});
test('daily health/waste settlement is independent of tick size and resumes without replay',()=>{
 const a=home(2).t;a.city.taxRate=20;const b=Town.restore(a.toJSON());
 for(let i=0;i<250/.25;i++)a.tick(.25);for(let i=0;i<250;i++)b.tick(1);
 assert.equal(a.city.sanitationDay,1);assert.equal(a.buildings[0].waste,b.buildings[0].waste);assert.deepEqual(a.people.map(p=>p.health),b.people.map(p=>p.health));
 const r=Town.restore(a.toJSON()),before=r.buildings[0].waste;r.tick(.05);assert.equal(r.buildings[0].waste,before);
});
test('overlapping yards share capacity without leaving avoidable waste in a single-covered street',()=>{
 const {t,b:a}=home(0),b=build(t,'home',-1,0),y=build(t,'garden',1,0,'cleaningYard'),z=build(t,'garden',-2,0,'cleaningYard');
 a.entrance=[10,0];b.entrance=[0,0];y.entrance=[12,0];z.entrance=[30,0];t.roads=new Set(Array.from({length:31},(_,x)=>`${x},0`));t.revision++;
 a.waste=12;b.waste=12;day(t);assert.equal(a.waste,0);assert.equal(b.waste,0);
});
test('settling several days counts only consecutive actual deficit days, not earlier solvent days',()=>{
 const {t}=home(0);t.city.taxRate=0;t.city.treasury=6; // upkeep: home 2 + starter road 1
 t.time+=24*3;settleBudget(t);assert.equal(t.city.treasury,-3);assert.equal(t.city.deficitDays,1);assert.equal(serviceEfficiency(t),.75);
});
