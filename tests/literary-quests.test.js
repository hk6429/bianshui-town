import test from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {squareCells} from '../src/heritage.js';
import {validateSave} from '../src/save-schema.js';
import {commitJourney} from '../src/journey.js';
import {LITERARY_QUESTS,LANDMARK_QUEST,questEntry,answerQuest,unlockQuest,saveQuestNote,literaryLock} from '../src/literary-quests.js';
const solve=(t,id)=>LITERARY_QUESTS[id].steps.forEach((s,i)=>assert(answerQuest(t,id,i,s.answer)));
function fixture(){const t=new Town();t.place('home',[{x:-6,z:-4}],true);t.place('work',[{x:-4,z:-4}],true);t.place('shop',[{x:-2,z:-4}],true);t.place('garden',[{x:0,z:-4}],true,'granary');t.place('garden',[{x:2,z:-4}],true,'villageSchool');return t;}
test('all three quests lock construction, reject skip/wrong answers, persist and unlock four-cell landmarks',()=>{
 for(const [design,id] of Object.entries(LANDMARK_QUEST)){
  const t=fixture(),cells=squareCells({x:-6,z:0});assert(literaryLock(t,design));assert.equal(t.place('garden',cells,true,design),null);
  assert.equal(answerQuest(t,id,1,0),false);assert.equal(answerQuest(t,id,0,(LITERARY_QUESTS[id].steps[0].answer+1)%3),false);assert.equal(unlockQuest(t,id),false);
  solve(t,id);assert(unlockQuest(t,id));assert.equal(unlockQuest(t,id),false);assert(saveQuestNote(t,id,'引用原文，說明我的理由。'));assert(t.place('garden',cells,true,design));
  const restored=Town.restore(t.toJSON());assert.equal(literaryLock(restored,design),null);assert.equal(questEntry(restored,id).note,'引用原文，說明我的理由。');assert.equal(restored.buildings.find(b=>b.design===design).footprint.length,4);
 }
});
test('city prerequisites cannot be bypassed by solving readings in an empty town',()=>{const t=new Town();solve(t,'yueyang');assert.equal(unlockQuest(t,'yueyang'),false);assert(literaryLock(t,'yueyangTower'));});
test('failed persistence does not award reading progress or unlock',()=>{const t=fixture();assert.equal(commitJourney(t,d=>answerQuest(d,'printing',0,0),()=>({ok:false})),false);assert.equal(questEntry(t,'printing').step,0);solve(t,'printing');assert.equal(commitJourney(t,d=>unlockQuest(d,'printing'),()=>({ok:false})),false);assert(literaryLock(t,'movableTypeHall'));});
test('old saves remain valid; invalid steps and oversized notes are rejected on import',()=>{const t=new Town();assert(Town.restore(t.toJSON()));let data=t.toJSON();data.journey.literary={yueyang:{step:5,note:''}};assert.throws(()=>validateSave(data));data.journey.literary.yueyang={step:0,note:'字'.repeat(401)};assert.throws(()=>validateSave(data));assert.equal(saveQuestNote(t,'invalid','x'),false);});
