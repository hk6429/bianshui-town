import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {fireRisk,fireCoverage,fireDraw,tickFire,repairFire,FIRE_WARNING_SECONDS,damaged} from '../src/fire-service.js';
import {layRoad,removeRoad,demolishBuilding} from '../src/urban.js';
import {tickProduction,transfer} from '../src/production.js';
import {addResident} from '../src/city-growth.js';
import {shopIsOpen} from '../src/commerce.js';
import {setCityPolicy} from '../src/city-finance.js';

function build(t,type,x,z,design=null){assert(t.place(type,[{x,z}],true,design));return t.buildings.at(-1);}
function workTown(){const t=new Town({mode:'managed'}),b=build(t,'work',0,0,'kiln');return {t,b};}
function warn(t,draw=()=>0){t.time=48;tickFire(t,{draw});}
test('kilns and dense wooden buildings increase risk; posts require reachable paths, capacity and funding',()=>{
 const {t,b}=workTown(),risk=fireRisk(t,b);build(t,'work',1,0,'kiln');assert(fireRisk(t,b)>risk);
 const post=build(t,'garden',-2,0,'firePost');assert(!fireCoverage(t).covered.has(b.id));assert(layRoad(t,'lane',[{x:-1,z:0}]));assert(fireCoverage(t).covered.has(b.id));
 t.city.treasury=-1;t.city.deficitDays=3;assert.equal(fireCoverage(t).posts[0].capacity,2);assert.equal(fireCoverage(t).covered.size,2);
 t.city.treasury=1000;assert(removeRoad(t,[{x:-1,z:0}]));assert(!fireCoverage(t).covered.has(b.id));assert(demolishBuilding(t,post.id));assert.equal(fireCoverage(t).posts.length,0);
});
test('same injected draw yields lower loss with patrol and never deletes buildings or cargo',()=>{
 const unguarded=workTown(),guarded=workTown();build(guarded.t,'garden',1,0,'firePost');
 for(const {t,b} of [unguarded,guarded]){const cargo=JSON.stringify(t.economy),count=t.buildings.length;warn(t);assert.equal(b.fireWarningAt,FIRE_WARNING_SECONDS);assert(!damaged(b));t.elapsed=29;tickFire(t);assert(!damaged(b));t.elapsed=30;tickFire(t);assert(damaged(b));assert.equal(t.buildings.length,count);assert.equal(JSON.stringify(t.economy),cargo);}
 assert.equal(unguarded.b.fireDamage,60);assert.equal(guarded.b.fireDamage,12);assert(guarded.b.fireRepairAt<unguarded.b.fireRepairAt);
});
test('a patrol built during the warning reduces damage, paid warning intervention cancels the incident',()=>{
 const {t,b}=workTown();warn(t);build(t,'garden',1,0,'firePost');t.elapsed=30;tickFire(t);assert.equal(b.fireDamage,12);
 const c=workTown();warn(c.t);const money=c.t.city.treasury;assert(repairFire(c.t,c.b.id));assert.equal(c.t.city.treasury,money-20);c.t.elapsed=60;tickFire(c.t);assert(!damaged(c.b));assert.equal(c.b.fireWarningAt,undefined);
});
test('damage stops actual production and sales; free countdown repair resumes them even with no funds',()=>{
 const {t,b}=workTown(),home=build(t,'home',-1,0,'residence');for(let i=0;i<4;i++){const p=addResident(t,home);p.work=b.id;p.current=b.id;p.outside=false;}
 transfer(t,'boat',`input:${b.id}`,1,'clay');warn(t);t.elapsed=30;tickFire(t);const lot=t.economy.lots.find(l=>l.at===`input:${b.id}`);tickProduction(t,30);assert.equal(lot.good,'clay');assert.match(b.productionStatus,/整修/);
 t.city.treasury=0;const before=JSON.stringify(t);assert(!repairFire(t,b.id));assert.equal(JSON.stringify(t),before);t.elapsed=b.fireRepairAt;tickFire(t);tickProduction(t,20);assert.equal(lot.good,'ceramics');
 const s=new Town(); // Independent shop with staffed opening hours.
 s.place('shop',[{x:0,z:0}],true);const sb=s.buildings[0];s.workers=()=>[{outside:false,current:sb.id}];assert(shopIsOpen(s,sb));sb.fireDamage=60;sb.fireRepairAt=100;assert(!shopIsOpen(s,sb));delete sb.fireDamage;delete sb.fireRepairAt;assert(shopIsOpen(s,sb));
});
test('daily draws are deterministic; no reroll after reload, first two days safe, at most one warning per day',()=>{
 const {t,b}=workTown();build(t,'work',1,0,'kiln');t.time=24;tickFire(t,{draw:()=>0});assert.equal(b.fireWarningAt,undefined);
 warn(t);assert.equal(t.buildings.filter(b=>b.fireWarningAt!==undefined).length,1);const r=Town.restore(t.toJSON());tickFire(r,{draw:()=>0});assert.deepEqual(r.toJSON(),t.toJSON());assert.equal(fireDraw(30,b.id),fireDraw(30,b.id));assert(fireDraw(30,b.id)>=0&&fireDraw(30,b.id)<1);
 // A draw between patrolled and unpatrolled probabilities creates only the unprotected warning.
 const a=workTown(),g=workTown();build(g.t,'garden',1,0,'firePost');const draw=()=>fireRisk(a.t,a.b)*.5;warn(a.t,draw);warn(g.t,draw);assert(a.b.fireWarningAt!==undefined);assert.equal(g.b.fireWarningAt,undefined);
});
test('valid warning and repair state round-trip, invalid/incomplete state and future cursor are rejected',()=>{
 const {t,b}=workTown();warn(t);assert.deepEqual(Town.restore(t.toJSON()).toJSON(),t.toJSON());t.elapsed=30;tickFire(t);assert.deepEqual(Town.restore(t.toJSON()).toJSON(),t.toJSON());
 for(const mutate of [d=>delete d.buildings[0].fireRepairAt,d=>d.buildings[0].fireDamage=101,d=>d.buildings[0].fireWarningAt=50,d=>d.city.fireDay=100]){const d=structuredClone(t.toJSON());mutate(d);assert.throws(()=>Town.restore(d));}
 const old=structuredClone(t.toJSON());delete old.city.fireDay;const r=Town.restore(old);assert.equal(r.city.fireDay,Math.floor(r.time/24));
 setCityPolicy(t,{mode:'sandbox'});t.elapsed+=100;tickFire(t,{draw:()=>0});assert.equal(b.fireDamage,60);b.productionStatus='火警後整修中，暫停生產';assert(repairFire(t,b.id));assert(!damaged(b));assert.equal(b.productionStatus,'整修完成，等候工匠與原料');
});
test('normal daily seed creates the same real event history across save/reload, without injected random values',()=>{
 const a=workTown().t;build(a,'work',1,0,'kiln');let b=Town.restore(a.toJSON());const days=[];
 for(let day=2;day<122;day++){
  for(const t of [a,b]){t.time=day*24;t.elapsed=day*360;tickFire(t);}
  assert.deepEqual(a.buildings.map(q=>q.fireWarningAt),b.buildings.map(q=>q.fireWarningAt));
  if(a.buildings.some(q=>q.fireWarningAt!==undefined))days.push(day);
  b=Town.restore(b.toJSON());
 }
 assert(days.length>0);assert(days.length<120);assert.deepEqual(a.toJSON(),b.toJSON());
});
test('patrol capacity cannot cover unlimited homes; a residential incident preserves residents and their home',()=>{
 const t=new Town({mode:'managed'});for(let x=-2;x<=0;x++)for(let z=-1;z<=1;z++)build(t,'home',x,z);build(t,'garden',-3,0,'firePost');assert.equal(fireCoverage(t).covered.size,8);
 const a=new Town({mode:'managed'}),b=build(a,'home',0,0,'residence');for(let i=0;i<4;i++)addResident(a,b);const people=a.people.map(p=>p.id);warn(a);a.elapsed=30;tickFire(a);assert.equal(b.fireDamage,60);assert.deepEqual(a.people.map(p=>p.id),people);assert(a.people.every(p=>p.home===b.id&&p.health===90));assert.doesNotThrow(()=>Town.restore(a.toJSON()));
});
