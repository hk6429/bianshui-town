import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {validateSave} from '../src/save-schema.js';
import {createJourney,chooseVision,visionConditions,milestones,claimMilestone,refreshGuide,inspectResident,reviewJourney,setJourneyMode,setGuide,shortGoals,commitJourney} from '../src/journey.js';
const fixture=()=>({journey:createJourney(),buildings:[],people:[],economy:{lots:[],sold:{}},literati:{collected:[]}});
test('three visions read actual different conditions and switching never changes the town',()=>{
 const t=fixture();t.buildings.push({id:1,type:'home',stage:3});t.people.push({id:2},{id:3},{id:4},{id:5});const buildings=structuredClone(t.buildings);
 assert(visionConditions(t).every(c=>c.done));chooseVision(t,'culture');assert(visionConditions(t).every(c=>!c.done));assert.deepEqual(t.buildings,buildings);assert.equal(chooseVision(t,'unknown'),false);
});
test('all milestone types need their live conditions, and each stamp can only be claimed once',()=>{
 const t=fixture();setJourneyMode(t,true);assert.equal(claimMilestone(t,'settlement'),false);
 t.buildings=[{id:1,type:'home',stage:3},{id:2,type:'work',stage:3},{id:3,type:'garden',design:'pond',stage:3}];t.people=[{id:4},{id:5}];
 assert.equal(milestones(t)[0].state,'ready');assert.equal(milestones(t)[1].state,'locked');assert.equal(milestones(t)[2].state,'locked');
 t.economy.lots=[{id:1,madeAt:2}];t.literati.collected=[{author:'su'}];
 for(const id of ['settlement','craft','culture']){assert(claimMilestone(t,id));assert.equal(claimMilestone(t,id),false);}
 assert.equal(t.journey.claimed.length,3);for(let i=0;i<50;i++)assert(milestones(t).every(m=>m.state==='claimed'));assert.equal(t.journey.claimed.length,3);
});
test('guided cycle requires active observation and returning to review, not elapsed time',()=>{
 const t=fixture();setJourneyMode(t,true);t.buildings=[{id:1,type:'home',stage:0}];t.people=[{id:2}];refreshGuide(t);assert.equal(t.journey.guide.stage,0);
 t.buildings[0].stage=3;refreshGuide(t);assert.equal(t.journey.guide.stage,1);
 for(let i=0;i<100;i++)refreshGuide(t);assert.equal(t.journey.guide.stage,1);assert.equal(t.journey.observedResident,false);assert.equal(inspectResident(t,999),false);
 inspectResident(t,2);assert.equal(t.journey.guide.stage,2);t.buildings.push({id:3,type:'work',stage:3});refreshGuide(t);assert.equal(t.journey.guide.stage,3);
 reviewJourney(t);assert.equal(t.journey.guide.stage,4);assert.equal(reviewJourney(t),false);
 setGuide(t,'skip');assert(t.journey.guide.skipped);setGuide(t,'restart');assert.equal(t.journey.guide.stage,1);assert.equal(t.journey.guide.skipped,false);
});
test('optional challenge can be disabled and resumed without resetting city or previous stamps',()=>{
 const t=fixture();t.buildings=[{id:1,type:'home',stage:3}];t.people=[{id:2},{id:3}];setJourneyMode(t,true);claimMilestone(t,'settlement');const before=structuredClone(t.buildings);
 setJourneyMode(t,false);assert.equal(inspectResident(t,2),false);setJourneyMode(t,true);assert.deepEqual(t.buildings,before);assert.deepEqual(t.journey.claimed,['settlement']);inspectResident(t,2);assert(shortGoals(t)[0].done);assert(shortGoals(t)[0].wait.includes('不需等待天候'));
});
test('journey data round-trips with strict bounds, old saves get independent defaults',()=>{
 const t=new Town();setJourneyMode(t,true);chooseVision(t,'craft');const data=validateSave(t.toJSON());assert.deepEqual(Town.restore(data).journey,t.journey);
 const old=structuredClone(data);delete old.journey;assert.deepEqual(Town.restore(old).journey,createJourney());
 for(const bad of [{...createJourney(),claimed:['craft','craft']},{...createJourney(),guide:{stage:5,skipped:false}},{...createJourney(),enabled:'true'},{...createJourney(),vision:'cheat'}])assert.throws(()=>validateSave({...data,journey:bad}));
});
test('failed persistence leaves journey and city untouched; success publishes one validated snapshot',()=>{
 const t=new Town(),before=structuredClone(t.toJSON());assert.equal(commitJourney(t,d=>setJourneyMode(d,false),()=>({ok:false})),false);assert.deepEqual(t.toJSON(),before);
 let writes=0;assert(commitJourney(t,d=>setJourneyMode(d,false),data=>{validateSave(data);writes++;return {ok:true};}));assert.equal(writes,1);assert.equal(t.journey.enabled,false);assert.deepEqual(t.city,before.city);
});
test('an empty real town completes all four guide steps through actual building and simulation',()=>{
 const t=new Town();setJourneyMode(t,true);assert.equal(t.journey.guide.stage,0);
 assert(t.place('home',[{x:0,z:0}]));for(let n=0;n<400;n++)t.tick(.05);
 assert(t.people.length>0);reviewJourney(t);assert.equal(t.journey.guide.stage,1);
 for(let n=0;n<200;n++)t.tick(.05);refreshGuide(t);assert.equal(t.journey.guide.stage,1);
 inspectResident(t,t.people[0].id);assert.equal(t.journey.guide.stage,2);
 assert(t.place('work',[{x:1,z:0}]));for(let n=0;n<400;n++)t.tick(.05);refreshGuide(t);assert.equal(t.journey.guide.stage,3);
 reviewJourney(t);assert.equal(t.journey.guide.stage,4);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
