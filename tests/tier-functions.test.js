import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {DESIGNS,squareCells} from '../src/heritage.js';import {buildingStats,buildingAbility,upgradePreview} from '../src/building-tiers.js';
import {upgradeBuilding} from '../src/urban.js';import {upgradeCost,dailyUpkeep} from '../src/city-finance.js';
import {homeCapacity,addResident,tickPopulation} from '../src/city-growth.js';import {assignJobs,jobCapacity} from '../src/employment.js';
import {tickProduction,transfer} from '../src/production.js';import {waterReport,waterCapacity,waterRange} from '../src/water-service.js';
import {cleaningCapacity} from '../src/sanitation.js';import {patrolCapacity} from '../src/fire-service.js';import {educationCapacity} from '../src/education.js';
import {MAX_RANK} from '../src/milestones.js';
const ranked=(o)=>{const t=new Town(o);t.city.rank=MAX_RANK;return t;};
const place=(t,type,x,z,design)=>{assert(t.place(type,[{x,z}],true,design));return t.buildings.at(-1);};
test('every design and footprint has growing tier ability/upkeep, preview matches applied upgrade, and no sixth tier charges',()=>{
 for(const [design,d]of Object.entries(DESIGNS))for(const size of d.sizes){const t=ranked({mode:'managed'});t.city.treasury=100000000;assert(t.place(d.type,size===4?squareCells({x:0,z:0}):[{x:0,z:0}],true,design));const b=t.buildings[0];
  for(let tier=1;tier<5;tier++){const before=buildingStats(b),preview=upgradePreview(b),balance=t.city.treasury,cost=upgradeCost(b),daily=dailyUpkeep(t);assert(upgradeBuilding(t,b.id));assert.deepEqual(buildingStats(b),buildingStats(preview));assert.equal(buildingAbility(b),buildingAbility(preview));assert.equal(t.city.treasury,balance-cost);assert(dailyUpkeep(t)>daily);const after=buildingStats(b);assert(after.upkeep>before.upkeep);const metric={home:'housing',work:'production',shop:'jobs',garden:'range'}[b.type];assert(after[metric]>before[metric],`${design} tier ${tier+1}`);}
  const saved=JSON.stringify(t.toJSON());assert.equal(upgradePreview(b),null);assert.equal(upgradeBuilding(t,b.id),false);assert.equal(JSON.stringify(t.toJSON()),saved);
 }
});
test('housing capacity drives real occupancy and water reservations, including tiers above two',()=>{
 const t=new Town(),b=place(t,'home',0,0,'residence');upgradeBuilding(t,b.id);tickPopulation(t);assert.equal(t.residents(b).length,5);assert.equal(homeCapacity(b),5);upgradeBuilding(t,b.id);tickPopulation(t);assert.equal(t.residents(b).length,6);assert.equal(homeCapacity(b),6);place(t,'garden',1,0,'well');const row=waterReport(t).homes.get(b.id);assert.equal(row.capacity,6);assert.equal(row.residents,6);assert.equal(row.served,6);
 const r=Town.restore(t.toJSON());assert.equal(homeCapacity(r.building(b.id)),6);assert.equal(r.residents(r.building(b.id)).length,6);
});
test('third-tier workshop finishes a real item sooner with exactly the same crew than second-tier',()=>{
 function model(tier){const t=new Town({mode:'managed'}),home=place(t,'home',0,0,'residence'),work=place(t,'work',1,0,'kiln');for(let i=0;i<4;i++){const p=addResident(t,home);p.work=work.id;p.current=work.id;}for(let i=1;i<tier;i++)assert(upgradeBuilding(t,work.id));transfer(t,'boat',`input:${work.id}`,1,'clay');return {t,work,lot:t.economy.lots.find(l=>l.at===`input:${work.id}`)};}
 const a=model(2),b=model(3);tickProduction(a.t,6.5);tickProduction(b.t,6.5);assert.equal(a.lot.good,'clay');assert.equal(b.lot.good,'ceramics');assert.equal(b.lot.at,`output:${b.work.id}`);assert.equal(a.t.workers(a.work).length,b.t.workers(b.work).length);assert(dailyUpkeep(b.t)>dailyUpkeep(a.t));
});
test('third-tier shop hires one more real employee than second-tier and retains existing staff',()=>{
 const t=new Town({mode:'managed'}),home=place(t,'home',0,0,'residence'),shop=place(t,'shop',1,0,'tea');for(let i=0;i<4;i++)addResident(t,home);assert(upgradeBuilding(t,shop.id));assignJobs(t);assert.equal(jobCapacity(shop),3);assert.equal(t.workers(shop).length,3);const assigned=t.workers(shop).map(p=>p.id);assert(upgradeBuilding(t,shop.id));assignJobs(t);assert.equal(jobCapacity(shop),4);assert.equal(t.workers(shop).length,4);assert(assigned.every(id=>t.workers(shop).some(p=>p.id===id)));
});
test('public-service capacity bindings agree with the shared ability table at every tier',()=>{
 const t=new Town({mode:'managed'});for(let tier=1;tier<=5;tier++)for(const large of [false,true]){const base={type:'garden',stage:4,tier,...(large?{footprint:squareCells({x:0,z:0})}:{})},s=buildingStats(base);assert.equal(waterCapacity(base),s.water);assert.equal(waterRange(base),s.range);assert.equal(cleaningCapacity(t,base),s.cleaning);assert.equal(patrolCapacity(t,base),s.patrol);assert.equal(educationCapacity(t,{...base,design:'academy'}),s.education);}
});
test('shop upgrades increase real sales throughput with the same staff; cooldown persists and empty or closed shops do not sell',async()=>{
 const {sellAtShop}=await import('../src/commerce.js');
 function setup(tier){const t=new Town({mode:'managed'}),home=place(t,'home',0,0,'residence'),shop=place(t,'shop',1,0,'tea');for(let i=0;i<2;i++){const p=addResident(t,home);p.work=shop.id;p.current=shop.id;}shop.tier=tier;t.time=12;for(const lot of t.economy.lots)lot.good='cloth';transfer(t,'boat',`shop:${shop.id}`,12,'cloth');return {t,shop};}
 const a=setup(2),b=setup(3);let soldA=0,soldB=0;for(let seconds=0;seconds<=20;seconds++){for(const x of [a,b])x.t.elapsed=seconds;soldA+=sellAtShop(a.t,a.shop,'cloth');soldB+=sellAtShop(b.t,b.shop,'cloth');}assert.equal(soldA,5);assert.equal(soldB,6);
 const r=Town.restore(b.t.toJSON());assert.equal(sellAtShop(r,r.building(b.shop.id),'cloth'),0);r.elapsed=24;assert.equal(sellAtShop(r,r.building(b.shop.id),'cloth'),1);r.time=22;r.elapsed=30;assert.equal(sellAtShop(r,r.building(b.shop.id),'cloth'),0);
});
test('managed residents share the visitor sales cooldown, failed purchases retain stock, invalid cooldown saves fail',async()=>{
 const {residentPurchase}=await import('../src/commerce.js'),{tickLife}=await import('../src/life.js');
 const t=new Town({mode:'managed'}),home=place(t,'home',0,0,'residence'),shop=place(t,'shop',1,0,'tea');const staff=addResident(t,home),buyer=addResident(t,home);staff.work=shop.id;staff.current=shop.id;buyer.current=shop.id;t.time=12;for(const l of t.economy.lots)l.good='cloth';transfer(t,'boat',`shop:${shop.id}`,3,'cloth');assert(residentPurchase(t,buyer));assert.equal(shop.stock,2);
 const visitor={id:2000,kind:'shopper',visible:true,x:shop.entrance[0],z:shop.entrance[1],route:[],walking:false,wait:0,phase:'browse',speed:1,target:shop.id};t.life.visitors=[visitor];tickLife(t,.01);assert.equal(shop.stock,2);assert.equal(t.economy.sold.cloth,1);t.elapsed=12;visitor.phase='browse';visitor.wait=0;tickLife(t,.01);assert.equal(shop.stock,1);assert.equal(t.economy.sold.cloth,2);
 assert.doesNotThrow(()=>Town.restore(t.toJSON()));const data=t.toJSON();data.buildings.find(b=>b.id===shop.id).nextSaleAt=t.elapsed+13;assert.throws(()=>Town.restore(data),/nextSaleAt/);
});
