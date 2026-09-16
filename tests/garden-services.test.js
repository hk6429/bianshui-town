import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {gardenBenefit,gardenReport} from '../src/garden-services.js';
import {cityDemand,addResident,tickPopulation} from '../src/city-growth.js';import {layRoad,removeRoad,demolishBuilding,upgradeBuilding} from '../src/urban.js';
function fixture(){const t=new Town({mode:'managed'});assert(t.place('home',[{x:0,z:0}],true,'residence'));return {t,home:t.buildings[0]};}
function garden(t,x,z,design='garden'){assert(t.place('garden',[{x,z}],true,design));return t.buildings.at(-1);}
test('first nearby garden raises actual demand; isolated or reachable but distant gardens do not give the same benefit',()=>{
 const x=fixture(),before=cityDemand(x.t).home.score;garden(x.t,1,0);assert(gardenBenefit(x.t,x.home).score>0);assert(cityDemand(x.t).home.score>before);
 const far=fixture();garden(far.t,-7,0);assert.equal(gardenBenefit(far.t,far.home).score,0);assert.equal(cityDemand(far.t).home.score,before);
 assert(layRoad(far.t,'lane',Array.from({length:6},(_,i)=>({x:-6+i,z:0}))));assert.equal(gardenBenefit(far.t,far.home).score,0);
 const mid=fixture();garden(mid.t,-2,0);assert(layRoad(mid.t,'lane',[{x:-1,z:0}]));assert(gardenBenefit(mid.t,mid.home).score>0);assert(gardenBenefit(mid.t,mid.home).score<gardenBenefit(x.t,x.home).score);
});
test('additional parks have diminishing returns, order does not matter and the total stays bounded',()=>{
 const x=fixture();garden(x.t,1,0);const first=gardenBenefit(x.t,x.home).score;garden(x.t,-1,0);const second=gardenBenefit(x.t,x.home).score;assert(second>first);assert(second-first<first);
 for(const [a,b]of [[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]])garden(x.t,a,b);
 const report=gardenBenefit(x.t,x.home);assert(report.score>second&&report.score<=20);for(const b of x.t.buildings.filter(b=>b.type==='garden'))b.tier=5;assert(gardenBenefit(x.t,x.home).score<=20);const before=gardenBenefit(x.t,x.home).score;x.t.buildings.reverse();assert.equal(gardenBenefit(x.t,x.home).score,before);
});
test('road cuts, damage and incomplete parks remove the bonus; utilities do not count as leisure gardens',()=>{
 const x=fixture(),b=garden(x.t,-2,0);assert(layRoad(x.t,'lane',[{x:-1,z:0}]));assert(gardenBenefit(x.t,x.home).score>0);assert(removeRoad(x.t,[{x:-1,z:0}]));assert.equal(gardenBenefit(x.t,x.home).score,0);
 const near=fixture(),park=garden(near.t,1,0);park.stage=2;assert.equal(gardenBenefit(near.t,near.home).score,0);park.stage=4;park.fireDamage=12;assert.equal(gardenBenefit(near.t,near.home).score,0);
 for(const design of ['well','cleaningYard','firePost']){const q=fixture();garden(q.t,1,0,design);assert.equal(gardenBenefit(q.t,q.home).score,0);}
});
test('upgrading a park improves its reach/benefit; debt reduces upkeep effects and demolition removes them',()=>{
 const x=fixture(),b=garden(x.t,1,0);const before=gardenBenefit(x.t,x.home).score;assert(upgradeBuilding(x.t,b.id));assert(gardenBenefit(x.t,x.home).score>before);x.t.city.treasury=-1;x.t.city.deficitDays=3;assert(gardenBenefit(x.t,x.home).score<before);x.t.city.treasury=100;assert(demolishBuilding(x.t,b.id));assert.equal(gardenBenefit(x.t,x.home).score,0);
});
test('rehousing uses local amenity quality, coverage survives loading, sandbox imposes no demand bonus',()=>{
 const x=fixture();assert(x.t.place('home',[{x:-4,z:0}],true,'residence'));const distant=x.t.buildings.at(-1);garden(x.t,-5,0);const p=addResident(x.t,x.home);p.home=null;p.current=null;p.outside=true;x.t.elapsed=15;tickPopulation(x.t);assert.equal(p.home,distant.id);
 const report=gardenReport(x.t),restored=Town.restore(x.t.toJSON());assert.deepEqual(gardenReport(restored),report);x.t.city.mode='sandbox';assert.equal(gardenReport(x.t).demandModifier,0);
});
