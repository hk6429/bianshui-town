import test from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {validateSave} from '../src/save-schema.js';
import {commitJourney} from '../src/journey.js';
import {activityState,activityAction,activitiesDone,LITERARY_ACTIVITIES,validActivityState} from '../src/literary-activities.js';
import {solveActivities} from './literary-activity-fixture.js';
import {literaryLock,answerQuest,unlockQuest,LITERARY_QUESTS} from '../src/literary-quests.js';
test('all ten scenes complete through their operations, persist, and cannot claim twice',()=>{
 for(const id of Object.keys(LITERARY_ACTIVITIES)){const t=new Town();solveActivities(t,id);assert(activitiesDone(Town.restore(t.toJSON()),id));assert.equal(activityAction(t,id,'submit'),false);assert.equal(activityState(t,id).stage,3);}
});
test('relief budget rejects overspending, repeated actions and incomplete allocations without charging live funds',()=>{
 const t=new Town(),treasury=t.city.treasury;assert(activityAction(t,'yueyang','pick','feast'));assert(activityAction(t,'yueyang','pick','shelter'));assert.equal(activityAction(t,'yueyang','pick','food'),false);assert.equal(activityAction(t,'yueyang','pick','shelter'),false);assert.equal(activityAction(t,'yueyang','submit'),false);assert.equal(t.city.treasury,treasury);assert(activityAction(t,'yueyang','clear'));for(const k of ['food','shelter','road'])assert(activityAction(t,'yueyang','pick',k));assert(activityAction(t,'yueyang','submit'));
});
test('a court cannot proceed without visiting every witness and evidence mapping cannot be skipped',()=>{
 const t=new Town();assert.equal(activityAction(t,'kaifeng','submit'),false);assert(activityAction(t,'kaifeng','visit','qin'));assert.equal(activityAction(t,'kaifeng','visit','qin'),false);assert.equal(activityAction(t,'kaifeng','submit'),false);for(const k of ['neighbor','clerk'])assert(activityAction(t,'kaifeng','visit',k));assert(activityAction(t,'kaifeng','submit'));assert.equal(activityAction(t,'kaifeng','submit'),false);assert(activityAction(t,'kaifeng','pair','family=threat'));assert(activityAction(t,'kaifeng','pair','attack=marriage'));assert(activityAction(t,'kaifeng','pair','rumor=hearsay'));assert.equal(activityAction(t,'kaifeng','submit'),false);
});
test('boat follows adjacent water cells and must visit waypoints before returning',()=>{
 const t=new Town();assert.equal(activityAction(t,'redcliff','move',15),false);assert.equal(activityAction(t,'redcliff','move',2),false);for(const n of [4,5,9,13,14,15])assert(activityAction(t,'redcliff','move',n));assert.equal(activityAction(t,'redcliff','submit'),false);assert(activityAction(t,'redcliff','clear'));for(const n of [1,5,9,10,11,15])assert(activityAction(t,'redcliff','move',n));assert(activityAction(t,'redcliff','submit'));
});
test('duplicate glyphs have unique pieces; wrong sequence fails and persistence failure rolls back',()=>{
 const t=new Town();for(const k of ['1','0','2','3','4','5','6','7','8','9'])assert(activityAction(t,'printing','pick',k));assert.equal(activityAction(t,'printing','submit'),false);assert.equal(activityAction(t,'printing','pick','0'),false);assert(activityAction(t,'printing','clear'));assert.equal(commitJourney(t,d=>activityAction(d,'printing','pick','0'),()=>({ok:false})),false);assert.deepEqual(activityState(t,'printing').selection,[]);
});
test('import rejects invented witnesses, teleportation and duplicate pair targets',()=>{
 const t=new Town();for(const [id,state] of [['kaifeng',{stage:0,selection:[],visited:['invented']}],['redcliff',{stage:0,selection:['15'],visited:[]}],['lotus',{stage:0,selection:['ju=hidden','peony=hidden'],visited:[]}],['oil',{stage:3,selection:['take'],visited:[]}]]){const data=t.toJSON();data.journey.literary={[id]:{step:0,note:'',activity:state}};assert.equal(validActivityState(id,state),false);assert.throws(()=>validateSave(data));}
});
test('legacy unlocked landmarks remain available; new unlock requires both reading and scene',()=>{
 const t=new Town();t.journey.literary={yueyang:{step:4,note:'old'}};assert.equal(literaryLock(Town.restore(t.toJSON()),'yueyangTower'),null);const fresh=new Town();for(const [i,s] of LITERARY_QUESTS.yueyang.steps.entries())assert(answerQuest(fresh,'yueyang',i,s.answer));assert.equal(unlockQuest(fresh,'yueyang'),false);
});
