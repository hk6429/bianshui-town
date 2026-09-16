import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {addResident,cityDemand} from '../src/city-growth.js';
import {transfer,tickProduction} from '../src/production.js';import {demolishBuilding,moveBuilding} from '../src/urban.js';
import {emitProductionPollution,tickPollution,pollutionAt,pollutionReport} from '../src/pollution.js';import {squareCells} from '../src/heritage.js';
function fixture(design='kiln'){const t=new Town({mode:'managed'});assert(t.place('work',[{x:0,z:0}],true,design));const work=t.buildings.at(-1);assert(t.place('home',[{x:1,z:0}],true,'residence'));const home=t.buildings.at(-1);assert(t.place('home',[{x:-4,z:0}],true,'residence'));const far=t.buildings.at(-1);for(let i=0;i<4;i++){const p=addResident(t,home);p.work=work.id;p.current=work.id;}transfer(t,'boat',`input:${work.id}`,4,['clay','timber','fiber'][work.variant]);return {t,work,home,far};}
const decay=(t,seconds)=>{for(let i=0;i<seconds/30;i++)tickPollution(t,30);};
test('real finished output pollutes nearby land with distance falloff and quantity/type dependence',()=>{
 const x=fixture();assert.equal(pollutionAt(x.t,x.home),0);tickProduction(x.t,20);assert.equal(pollutionAt(x.t,x.work),18);assert.equal(pollutionAt(x.t,x.home),13.5);assert.equal(pollutionAt(x.t,x.far),0);tickProduction(x.t,20);assert.equal(pollutionAt(x.t,x.home),27);
 const wood=fixture('woodshop'),cloth=fixture('weavery');tickProduction(wood.t,20);tickProduction(cloth.t,20);assert.equal(pollutionAt(wood.t,wood.work),8);assert.equal(pollutionAt(cloth.t,cloth.work),14);
});
test('missing material, missing staff, full output and fire-damaged works cause no new emissions',()=>{
 for(const disable of [x=>transfer(x.t,`input:${x.work.id}`,'dock',Infinity),x=>x.t.people.forEach(p=>p.outside=true),x=>{x.work.fireDamage=60;x.work.fireRepairAt=120;},x=>{for(const l of x.t.economy.lots.slice(0,6)){l.at=`output:${x.work.id}`;l.good='ceramics';}}]){const x=fixture();disable(x);tickProduction(x.t,30);assert.equal(pollutionAt(x.t,x.work),0);}
});
test('stopping output halves pollution gradually and improves residential demand with the same population',()=>{
 const x=fixture();const clean=cityDemand(x.t).home.score;tickProduction(x.t,20);const initial=pollutionAt(x.t,x.home),dirty=cityDemand(x.t).home.score;assert(dirty<clean);assert.equal(x.t.people.length,4);
 const crowded=pollutionReport(x.t);const separated=Town.restore(x.t.toJSON());for(const p of separated.people)p.home=x.far.id;assert(pollutionReport(separated).environment>crowded.environment);assert.equal(separated.people.length,x.t.people.length);
 decay(x.t,90);assert(Math.abs(pollutionAt(x.t,x.home)-initial/2)<1e-10);assert(cityDemand(x.t).home.score>dirty);decay(x.t,360);assert(pollutionAt(x.t,x.home)<initial/16);
});
test('moving or demolishing a source leaves contamination on its former land, which then recovers',()=>{
 for(const action of [x=>moveBuilding(x.t,x.work.id,{x:-7,z:0}),x=>demolishBuilding(x.t,x.work.id)]){const x=fixture();tickProduction(x.t,20);const before=pollutionAt(x.t,x.home);assert(action(x));assert.equal(pollutionAt(x.t,x.home),before);decay(x.t,90);assert(Math.abs(pollutionAt(x.t,x.home)-before/2)<1e-10);}
});
test('four-cell sources spread one output emission across their true footprint; pollution remains bounded',()=>{
 const t=new Town({mode:'managed'});assert(t.place('work',squareCells({x:-2,z:0}),true,'kilnHall'));const b=t.buildings.at(-1);emitProductionPollution(t,b);const amounts=b.footprint.map(c=>pollutionAt(t,c));assert(Math.max(...amounts)-Math.min(...amounts)<1e-10);assert(amounts.every(n=>n>0&&n<18));
 for(let i=0;i<100;i++)emitProductionPollution(t,b);assert(t.city.pollution.length<=143);assert(t.city.pollution.every(c=>c.value<=100&&c.value>=0));assert.equal(new Set(t.city.pollution.map(c=>`${c.x},${c.z}`)).size,t.city.pollution.length);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('pollution survives save and reload, decays without timestep drift, and rejects unsafe fields',()=>{
 const x=fixture();tickProduction(x.t,20);const a=Town.restore(x.t.toJSON()),b=Town.restore(x.t.toJSON());for(let i=0;i<600;i++)tickPollution(a,.05);tickPollution(b,30);assert(Math.abs(pollutionAt(a,x.home)-pollutionAt(b,x.home))<1e-10);
 const restored=Town.restore(a.toJSON());tickPollution(a,30);tickPollution(restored,30);assert.deepEqual(restored.toJSON(),a.toJSON());
 const old=x.t.toJSON();delete old.city.pollution;assert.equal(pollutionAt(Town.restore(old),x.home),0);
 for(const invalid of [[{x:0,z:0,value:101}],[{x:3,z:0,value:1}],[{x:0,z:0,value:1},{x:0,z:0,value:1}],[{x:0,z:0,value:NaN}]]){const data=x.t.toJSON();data.city.pollution=invalid;assert.throws(()=>Town.restore(data),/pollution/);}
});
test('sandbox preserves pollution but does not emit, decay or penalize demand; invalid dt has no effect',()=>{
 const x=fixture();tickProduction(x.t,20);const initial=JSON.stringify(x.t.city.pollution);for(const dt of [-1,0,61,NaN,Infinity])tickPollution(x.t,dt);assert.equal(JSON.stringify(x.t.city.pollution),initial);
 x.t.city.mode='sandbox';tickProduction(x.t,20);tickPollution(x.t,30);assert.equal(JSON.stringify(x.t.city.pollution),initial);assert.equal(pollutionReport(x.t).demandModifier,0);
});
