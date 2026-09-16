import {test} from 'node:test';import assert from 'node:assert/strict';import {Town} from '../src/simulation.js';
import {wellbeingReport} from '../src/wellbeing.js';import {addResident,tickPopulation,cityDemand} from '../src/city-growth.js';
import {demolishBuilding,layRoad} from '../src/urban.js';
function fixture(){const t=new Town({mode:'managed'});t.place('home',[{x:0,z:0}],true,'residence');const home=t.buildings[0];t.place('shop',[{x:1,z:0}],true,'tea');const job=t.buildings[1];const people=[addResident(t,home),addResident(t,home)];for(const p of people){p.work=job.id;p.current=job.id;p.needsSatisfiedUntil=10000;}return {t,home,job,p:people[0]};}
const part=(t,p,key)=>wellbeingReport(t).residents.get(p.id).parts.find(x=>x.key===key).score;
function census(t,n=1){for(let i=0;i<n;i++){t.elapsed+=15;t.time+=1;tickPopulation(t);}}
function unhappy(){const x=fixture();x.home.waste=40;x.t.city.pollution=[{x:0,z:0,value:100}];return x;}
test('five factors have bounded, deterministic, independently traceable scores and exact weighted total',()=>{
 const x=fixture(),r=wellbeingReport(x.t).residents.get(x.p.id);assert.equal(r.score,82.5);assert.equal(r.parts.reduce((n,p)=>n+p.weight,0),100);assert(r.parts.every(p=>p.score>=0&&p.score<=100&&p.reason));assert.equal(r.score,r.parts.reduce((n,p)=>n+p.score*p.weight/100,0));
 x.p.home=null;assert.equal(part(x.t,x.p,'housing'),0);x.p.home=x.home.id;assert.equal(part(x.t,x.p,'housing'),100);
 x.p.work=null;assert.equal(part(x.t,x.p,'employment'),0);x.p.work=x.job.id;assert.equal(part(x.t,x.p,'employment'),100);
 x.p.needsSatisfiedUntil=0;assert.equal(part(x.t,x.p,'shopping'),0);x.p.needsSatisfiedUntil=10000;assert.equal(part(x.t,x.p,'shopping'),100);
 const services=part(x.t,x.p,'services');assert(x.t.place('garden',[{x:0,z:1}],true,'well'));assert(part(x.t,x.p,'services')>services);
 const environment=part(x.t,x.p,'environment');x.t.city.pollution=[{x:0,z:0,value:100}];assert(part(x.t,x.p,'environment')<environment);x.t.city.pollution=[];assert.equal(part(x.t,x.p,'environment'),environment);
 assert.deepEqual(wellbeingReport(Town.restore(x.t.toJSON())),wellbeingReport(x.t));
});
test('turning off water or raising pollution lowers shared satisfaction and real housing demand',()=>{
 const x=fixture();x.t.place('garden',[{x:0,z:1}],true,'well');const well=x.t.buildings.at(-1),before=wellbeingReport(x.t).average,demand=cityDemand(x.t).home.score;assert(demolishBuilding(x.t,well.id));assert(wellbeingReport(x.t).average<before);assert(cityDemand(x.t).home.score<demand);
 const clean=wellbeingReport(x.t).average,cleanDemand=cityDemand(x.t).home.score;x.t.city.pollution=[{x:0,z:0,value:100}];assert(wellbeingReport(x.t).average<clean);assert(cityDemand(x.t).home.score<cleanDemand);
});
test('persistent low satisfaction alone causes bounded departures, while basic needs remain met',()=>{
 const x=unhappy();assert(wellbeingReport(x.t).average<65);assert(wellbeingReport(x.t).demandModifier<0);census(x.t,39);assert.equal(x.t.people.length,2);assert.equal(x.p.hardship.dissatisfied,585);assert.equal(x.p.hardship.unemployed,0);assert.equal(x.p.hardship.unserved,0);assert.equal(x.p.hardship.unhoused,0);
 census(x.t);assert.equal(x.t.people.length,1);assert.match(x.t.events[0].text,/長期民生滿意偏低/);assert.equal(x.t.demography.departed,1);census(x.t);assert.equal(x.t.people.length,0);assert.equal(x.t.demography.departed,2);
});
test('a single service improvement resets the low-satisfaction departure clock before expiry',()=>{
 const x=unhappy();census(x.t,39);assert.equal(x.p.hardship.dissatisfied,585);assert(x.t.place('garden',[{x:0,z:1}],true,'well'));assert(wellbeingReport(x.t).average>=65);census(x.t);assert.equal(x.t.people.length,2);assert.equal(x.p.hardship.dissatisfied,0);assert.equal(x.t.demography.departed,0);
});
test('saved dissatisfaction resumes, legacy hardship works, no residents uses neutral score, sandbox never expels',()=>{
 const x=unhappy();census(x.t,20);const r=Town.restore(x.t.toJSON());census(x.t);census(r);assert.deepEqual(r.toJSON(),x.t.toJSON());
 const old=x.t.toJSON();for(const p of old.people)delete p.hardship.dissatisfied;const migrated=Town.restore(old);census(migrated);assert.equal(migrated.people[0].hardship.dissatisfied,15);
 const invalid=x.t.toJSON();invalid.people[0].hardship.dissatisfied=601;assert.throws(()=>Town.restore(invalid),/dissatisfied/);
 x.t.city.mode='sandbox';census(x.t,50);assert.equal(x.t.demography.departed,0);assert(x.t.people.every(p=>!p.hardship));assert.equal(wellbeingReport(x.t).demandModifier,0);assert.equal(wellbeingReport(new Town()).average,65);
});
test('same vacancies jobs and water: higher satisfaction accelerates an actual new arrival',()=>{
 const a=fixture(),b=unhappy();for(const x of [a,b]){assert(x.t.place('garden',[{x:0,z:1}],true,'well'));assert(layRoad(x.t,'lane',[{x:1,z:1},{x:2,z:1}]));}
 assert(wellbeingReport(a.t).average>wellbeingReport(b.t).average);assert.equal(a.t.people.length,b.t.people.length);census(a.t,2);census(b.t,2);assert.equal(a.t.people.length,3);assert.equal(b.t.people.length,2);
});
