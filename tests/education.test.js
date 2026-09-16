import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {squareCells} from '../src/heritage.js';
import {addResident} from '../src/city-growth.js';import {layRoad,removeRoad} from '../src/urban.js';
import {tickEducation,educationReport,educationCapacity,educationOf,craftEducationMultiplier} from '../src/education.js';
import {tickProduction,transfer,RECIPES} from '../src/production.js';
function fixture(schoolX=1){const t=new Town({mode:'managed'});assert(t.place('home',[{x:0,z:0}],true,'residence'));const home=t.buildings.at(-1);assert(t.place('garden',squareCells({x:schoolX,z:0}),true,'academy'));const school=t.buildings.at(-1),p=addResident(t,home);return {t,home,school,p};}
function advance(t,seconds){for(let i=0;i<seconds/30;i++)tickEducation(t,30);}
test('road-covered residents acquire 10 points per game day gradually; no coverage grants none',()=>{
 const x=fixture();assert.equal(educationOf(x.p),0);tickEducation(x.t,30);assert(Math.abs(x.p.education-10/12)<1e-10);advance(x.t,330);assert(Math.abs(x.p.education-10)<1e-10);
 const no=fixture();no.t.buildings=no.t.buildings.filter(b=>b.id!==no.school.id);advance(no.t,360);assert.equal(educationOf(no.p),0);
 const real=fixture();real.t.tick(.05);assert(real.p.education>0&&real.p.education<.01);
});
test('capacity is finite, low attainment has priority, and overlapping academies never duplicate education',()=>{
 const x=fixture();x.p.education=60;for(let i=0;i<9;i++)addResident(x.t,x.home);
 const report=educationReport(x.t);assert.equal(report.assigned.size,8);assert.equal(report.waiting,2);assert(!report.assigned.has(x.p.id));tickEducation(x.t,30);assert.equal(x.p.education,60);assert.equal(x.t.people.filter(p=>educationOf(p)>0&&p!==x.p).length,8);
 assert(x.t.place('garden',squareCells({x:1,z:-2}),true,'academy'));const before=x.p.education;tickEducation(x.t,30);assert(Math.abs(x.p.education-before-10/12)<1e-10);assert.equal(educationReport(x.t).assigned.size,10);
 x.school.tier=5;assert.equal(educationCapacity(x.t,x.school),40);x.t.city.treasury=-1;x.t.city.deficitDays=3;assert.equal(educationCapacity(x.t,x.school),10);
});
test('disconnecting a road, construction, damage and sick leave stop learning without deleting attainment',()=>{
 const x=fixture(-3);assert.equal(educationReport(x.t).assigned.size,0);assert(layRoad(x.t,'lane',[{x:-1,z:0}]));assert.equal(educationReport(x.t).assigned.size,1);tickEducation(x.t,30);const before=x.p.education;
 assert(removeRoad(x.t,[{x:-1,z:0}]));tickEducation(x.t,30);assert.equal(x.p.education,before);
 for(const disable of [x=>x.school.stage=2,x=>{x.school.fireDamage=12;x.school.fireRepairAt=100;},x=>x.p.health=39,x=>x.p.home=null]){const x=fixture();x.p.education=20;disable(x);tickEducation(x.t,30);assert.equal(x.p.education,20);}
});
test('education is bounded, fractional, saved and independent of time-step size when coverage is unchanged',()=>{
 const a=fixture(),b=fixture();for(let i=0;i<600;i++)tickEducation(a.t,.05);tickEducation(b.t,30);assert(Math.abs(a.p.education-b.p.education)<1e-10);
 const r=Town.restore(a.t.toJSON());tickEducation(a.t,30);tickEducation(r,30);assert.deepEqual(r.toJSON(),a.t.toJSON());
 a.p.education=99.9;advance(a.t,360);assert.equal(a.p.education,100);assert(!educationReport(a.t).assigned.has(a.p.id));advance(a.t,360);assert.equal(a.p.education,100);
 const old=a.t.toJSON();delete old.people[0].education;assert.equal(educationOf(Town.restore(old).people[0]),0);for(const value of [-1,100.1,NaN,Infinity,'10']){old.people[0].education=value;assert.throws(()=>Town.restore(old),/education/);}
});
test('trained present workers finish a real item sooner, absent or sick experts confer no benefit',()=>{
 function workshop(education){const x=fixture();assert(x.t.place('work',[{x:-1,z:0}],true,'kiln'));const work=x.t.buildings.at(-1);for(let i=0;i<3;i++)addResident(x.t,x.home);for(const p of x.t.people){p.work=work.id;p.current=work.id;p.outside=false;p.education=education;}
 transfer(x.t,'boat',`input:${work.id}`,1,'clay');return {...x,work,lot:x.t.economy.lots.find(l=>l.at===`input:${work.id}`)};}
 const low=workshop(0),high=workshop(100),seconds=RECIPES[low.work.variant].seconds/(low.work.level>=2?1.5:1)/1.1;
 assert.equal(craftEducationMultiplier(low.t,low.work),1);assert.equal(craftEducationMultiplier(high.t,high.work),1.2);tickProduction(low.t,seconds);tickProduction(high.t,seconds);assert.equal(low.lot.good,'clay');assert.equal(high.lot.good,'ceramics');assert.equal(high.lot.at,`output:${high.work.id}`);
 high.t.people[0].education=0;for(const p of high.t.people.slice(1))p.outside=true;assert.equal(craftEducationMultiplier(high.t,high.work),1);for(const p of high.t.people.slice(1)){p.outside=false;p.health=39;}assert.equal(craftEducationMultiplier(high.t,high.work),1);
 const mid=workshop(50);assert.equal(craftEducationMultiplier(mid.t,mid.work),1.1);
});
test('sandbox preserves saved education without learning or bonus; invalid dt never grants points',()=>{
 const x=fixture();x.p.education=25;for(const dt of [-1,0,61,NaN,Infinity])tickEducation(x.t,dt);assert.equal(x.p.education,25);x.t.city.mode='sandbox';advance(x.t,360);assert.equal(x.p.education,25);assert.equal(craftEducationMultiplier(x.t,{type:'work'}),1);
});
