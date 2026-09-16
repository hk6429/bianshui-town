import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {waterReport,waterStatus} from '../src/water-service.js';
import {addResident,cityDemand,tickPopulation} from '../src/city-growth.js';
import {dailyUpkeep,settleBudget} from '../src/city-finance.js';
import {layRoad,removeRoad,upgradeBuilding,demolishBuilding,moveBuilding} from '../src/urban.js';
import {squareCells} from '../src/heritage.js';

function place(t,type,x,z,design=null,cells=[{x,z}]){assert(t.place(type,cells,true,design));return t.buildings.at(-1);}
function fill(t,b,count){for(let i=0;i<count;i++)addResident(t,b);}
function connected(){const t=new Town({mode:'managed'}),home=place(t,'home',0,0),well=place(t,'garden',-2,0,'well');assert(layRoad(t,'lane',[{x:-1,z:0}]));return {t,home,well};}
test('completed wells supply residents through roads; cut, rebuild, move and demolition recompute coverage',()=>{
 const {t,home,well}=connected();fill(t,home,2);assert.equal(waterReport(t).served,2);assert.equal(waterReport(t).satisfaction,100);
 assert(removeRoad(t,[{x:-1,z:0}]));assert.equal(waterReport(t).served,0);assert.match(waterStatus(t,home),/沒有可沿路到達/);
 assert(layRoad(t,'lane',[{x:-1,z:0}]));assert.equal(waterReport(t).served,2);
 assert(moveBuilding(t,well.id,{x:-5,z:0}));assert.equal(waterReport(t).served,0);assert(demolishBuilding(t,well.id));assert.equal(waterReport(t).wells.length,0);
});
test('capacity is finite, existing residents have priority, a second well and tier upgrade restore water',()=>{
 const t=new Town({mode:'managed'}),a=place(t,'home',-4,0,'mansion',squareCells({x:-4,z:0})),b=place(t,'home',-2,0,'mansion',squareCells({x:-2,z:0})),w=place(t,'garden',0,0,'well');fill(t,a,8);fill(t,b,8);
 let r=waterReport(t);assert.equal(r.served,12);assert.equal(r.satisfaction,75);assert.equal(r.available,0);assert.equal(r.wells[0].used,12);assert.match(waterStatus(t,b),/容量不足/);
 const extra=place(t,'garden',1,0,'well');assert.equal(waterReport(t).served,16);assert(demolishBuilding(t,extra.id));assert.equal(waterReport(t).served,12);
 assert(upgradeBuilding(t,w.id));r=waterReport(t);assert.equal(r.served,16);assert.equal(r.wells[0].capacity,24);assert.equal(r.wells[0].range,28);
 // Vacant homes sorted earlier than an occupied home cannot consume its water.
 t.people=t.people.filter(p=>p.home===b.id);r=waterReport(t);assert.equal(r.homes.get(b.id).served,8);
});
test('coverage uses walking distance rather than straight-line distance; incomplete wells do not serve',()=>{
 const {t,home,well}=connected();fill(t,home,2);
 const [ax,az]=home.entrance,[bx,bz]=well.entrance,roads=new Set();
 // The two entrances remain close, but the only road detours far north.
 for(let z=Math.min(az,bz);z<=30;z++){roads.add(`${ax},${z}`);roads.add(`${bx},${z}`);}
 for(let x=Math.min(ax,bx);x<=Math.max(ax,bx);x++)roads.add(`${x},30`);
 t.roads=roads;t.revision++;assert.equal(waterReport(t).served,0);
 t.rebuildRoads();assert.equal(waterReport(t).served,2);well.stage=2;assert.equal(waterReport(t).served,0);well.stage=3;assert.equal(waterReport(t).served,2);
});
test('water changes housing demand and actual new arrivals without pretending wells are recreation gardens',()=>{
 const t=new Town({mode:'managed'});const a=place(t,'home',0,0),b=place(t,'home',-1,0),work=place(t,'work',-2,0);fill(t,a,2);assert(layRoad(t,'lane',[{x:0,z:1},{x:0,z:2},{x:1,z:2}]));
 for(const p of t.people){p.work=work.id;p.needsSatisfiedUntil=1000;}
 const before=cityDemand(t);t.elapsed=15;tickPopulation(t);assert.equal(t.people.length,2);
 place(t,'garden',-1,1,'well');const after=cityDemand(t);assert(after.home.score>before.home.score);assert.equal(after.targetPopulation,before.targetPopulation);
 t.elapsed=30;tickPopulation(t);assert.equal(t.people.length,3);assert.equal(t.people.at(-1).home,b.id);
 const r=Town.restore(t.toJSON());assert.deepEqual(waterReport(r),waterReport(t));
});
test('well construction and daily upkeep are real charges, tiers and four-cell capacity remain consistent',()=>{
 const t=new Town({mode:'managed'}),money=t.city.treasury,upkeep=dailyUpkeep(t);const w=place(t,'garden',-4,0,'well',squareCells({x:-4,z:0}));
 assert.equal(t.city.treasury,money-400);assert.equal(dailyUpkeep(t)-upkeep,12);assert.equal(waterReport(t).wells[0].capacity,48);
 const balance=t.city.treasury;t.time=24;settleBudget(t);assert.equal(t.city.treasury,balance-13);
 assert(upgradeBuilding(t,w.id));assert.equal(waterReport(t).wells[0].capacity,96);assert.equal(dailyUpkeep(t),25);
 const saved=t.toJSON();assert.deepEqual(Town.restore(saved).toJSON(),saved);
});
test('no double supply: overlapping wells report only actual residents and reserved housing seats',()=>{
 const {t,home}=connected();fill(t,home,2);place(t,'garden',1,0,'well');const r=waterReport(t);
 assert.equal(r.served,2);assert.equal(r.wells.reduce((n,w)=>n+w.used,0),2);assert.equal(r.available,0);assert.equal(r.homes.get(home.id).satisfaction,100);
 const before=t.city.treasury;assert(t.place('garden',[{x:-4,z:-3}],false,'well'));assert.equal(t.city.treasury,before-100);assert.equal(waterReport(t).wells.length,2);
});
test('overlapping coverage reallocates flexible households so a constrained household is not starved',()=>{
 const t=new Town(),a=place(t,'home',-4,0,'mansion',squareCells({x:-4,z:0})),b=place(t,'home',-2,0,'mansion',squareCells({x:-2,z:0})),w=place(t,'garden',0,0,'well'),v=place(t,'garden',1,0,'well');
 // Explicit road graph: a can use either well; b can reach only w within range.
 a.entrance=[10,0];b.entrance=[0,0];w.entrance=[12,0];v.entrance=[30,0];t.roads=new Set(Array.from({length:31},(_,x)=>`${x},0`));t.revision++;
 fill(t,a,8);fill(t,b,8);const r=waterReport(t);assert.equal(r.served,16);assert.equal(r.homes.get(b.id).served,8);assert(r.wells.every(w=>w.used<=w.capacity));
});
