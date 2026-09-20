import test from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {LITERARY_QUESTS} from '../src/literary-quests.js';
import {recordLearningAnswer,saveLearningRevision,evidenceLines} from '../src/learning.js';
import {ADVENTURE_CONTENT} from '../src/adventure-content.js';
import {adventureView,visitAdventure,decideAdventure,resetAdventure,resolveAdventure,claimAdventure,validateAdventure} from '../src/adventure.js';
const visit=(t,id)=>ADVENTURE_CONTENT[id].roles.forEach(r=>assert(visitAdventure(t,id,r.id)));
const learn=(t,id)=>{for(let step=0;step<3;step++)assert(recordLearningAnswer(t,id,{step,answer:LITERARY_QUESTS[id].steps[step].answer,evidence:evidenceLines(id).findIndex(x=>x.step===step),reason:'根據這段原文。'}));assert(saveLearningRevision(t,id,{text:'我的作品保留證據與推論的界線。'}));};
test('ten missions offer distinct people, dilemmas, consequences and optional reflections',()=>{
 assert.deepEqual(Object.keys(ADVENTURE_CONTENT).sort(),Object.keys(LITERARY_QUESTS).sort());assert.equal(new Set(Object.values(ADVENTURE_CONTENT).map(c=>c.mission)).size,10);
 for(const [id,c]of Object.entries(ADVENTURE_CONTENT)){
  assert.equal(new Set(c.roles.map(r=>r.clue)).size,3);assert.equal(new Set(c.choices.map(r=>r.consequence)).size,2);
  for(const choice of c.choices){const t=new Town();const before=structuredClone(t.resources);visit(t,id);assert(decideAdventure(t,id,{choiceId:choice.id}));const v=adventureView(t,id);assert.deepEqual(v.resources,choice.id==='aid'?{time:2,aid:0}:{time:0,aid:2});assert.deepEqual(t.resources,before);validateAdventure(t.journey.adventure);}
 }
});
test('claims require evidence and work; reset preserves unique honours across replay',()=>{
 const t=new Town(),id='yueyang';assert.equal(claimAdventure(t,id),false);visit(t,id);assert(decideAdventure(t,id,{choiceId:'aid',reason:'先支援居民'}));assert.equal(claimAdventure(t,id),false);learn(t,id);assert.equal(claimAdventure(t,id),false);assert(resolveAdventure(t,id,{choiceId:'repair'}));assert(claimAdventure(t,id));assert.equal(claimAdventure(t,id),false);const initial=adventureView(t,id);assert(resetAdventure(t,id));assert.deepEqual(adventureView(t,id).collections,initial.collections);assert.notEqual(adventureView(t,id).surprise,initial.surprise);
 for(let i=0;i<15;i++){visit(t,id);assert(decideAdventure(t,id,{choiceId:i%2?'aid':'time',reason:'重看取捨'}));assert.equal(claimAdventure(t,id),false);assert(resetAdventure(t,id));}
 const v=adventureView(t,id);assert.equal(v.history.length,12);assert.equal(v.collections.length,1);validateAdventure(t.journey.adventure);
});
test('invalid and duplicate actions do not mutate town, partial visits may be reset',()=>{
 const t=new Town();const before=t.toJSON();assert.equal(adventureView(t,'__proto__'),null);assert.equal(visitAdventure(t,'__proto__','role1'),false);assert.equal(resetAdventure(t,'yueyang'),false);assert.equal(decideAdventure(t,'yueyang',{choiceId:'aid',reason:'先決定'}),false);assert.deepEqual(t.toJSON(),before);
 assert(visitAdventure(t,'yueyang','role1'));assert.equal(visitAdventure(t,'yueyang','role1'),false);assert(resetAdventure(t,'yueyang'));assert.deepEqual(adventureView(t,'yueyang').resources,{time:6,aid:3});visit(t,'yueyang');assert.equal(decideAdventure(t,'yueyang',{choiceId:'aid',reason:'字'.repeat(401)}),false);assert(decideAdventure(t,'yueyang',{choiceId:'time',reason:''}));assert.equal(decideAdventure(t,'yueyang',{choiceId:'aid'}),false);assert.equal(visitAdventure(t,'yueyang','role1'),false);
});
test('strict bounded schema rejects malformed histories, extra fields and forged collection ids',()=>{
 const t=new Town();visit(t,'oil');decideAdventure(t,'oil',{choiceId:'aid',reason:'練習'});const mutations=[s=>s.extra=1,s=>s.round=-1,s=>s.visited=['role1','role1','role1'],s=>s.decision.choiceId='gold',s=>s.decision.reason='字'.repeat(401),s=>s.history=[],s=>s.history[0].round=1,s=>s.collections=['gold'],s=>s.history=Array(13).fill(s.history[0]),s=>s.history[0].reason='changed'];for(const change of mutations){const input=structuredClone(t.journey.adventure);change(input.quests.oil);assert.throws(()=>validateAdventure(input));}
 validateAdventure({version:1,quests:{}});assert.throws(()=>validateAdventure({version:1,quests:{unknown:{}}}));
});
test('correctness flags alone cannot unlock claims without matching actual answers and lines',()=>{
 const t=new Town(),id='moon';visit(t,id);decideAdventure(t,id,{choiceId:'aid'});learn(t,id);resolveAdventure(t,id,{choiceId:'repair'});t.journey.learning.quests[id].attempts[0].answer=2;assert.equal(claimAdventure(t,id),false);t.journey.learning.quests[id].attempts[0].answer=LITERARY_QUESTS[id].steps[0].answer;t.journey.learning.quests[id].attempts[0].evidence=999;assert.equal(claimAdventure(t,id),false);
});

test('followup invests available resources in different beneficiaries, locks repeated spending and persists history',()=>{
 for(const id of Object.keys(ADVENTURE_CONTENT))for(const primary of ['aid','time'])for(const next of ['repair','reserve']){
  const t=new Town();assert.equal(resolveAdventure(t,id,{choiceId:next}),false);visit(t,id);decideAdventure(t,id,{choiceId:primary});const before=adventureView(t,id);assert(before.followupNeed);assert.equal(before.followupChoices.length,2);assert(resolveAdventure(t,id,{choiceId:next}));const after=adventureView(t,id);assert.deepEqual(after.resources,{time:0,aid:0});assert.deepEqual(before.followupChoices.find(c=>c.id===next).cost,before.resources);assert.notEqual(before.followupChoices[0].consequence,before.followupChoices[1].consequence);if(next==='reserve'){assert(after.followupStatus.includes(ADVENTURE_CONTENT[id].followupProtection[0]));assert(after.followupStatus.includes(ADVENTURE_CONTENT[id].followupProtection[3]));assert(after.followupStatus.includes('獲得'));}else assert(after.followupStatus.includes('尚未另外安排')); assert(after.followupStatus.includes(next==='repair'?'困難獲得回應':'仍待處理'));assert.equal(after.history.at(-1).followup.choiceId,next);assert.equal(resolveAdventure(t,id,{choiceId:next}),false);validateAdventure(t.journey.adventure);assert(resetAdventure(t,id));assert.equal(adventureView(t,id).followup,null);assert.equal(adventureView(t,id).history.at(-1).followup.choiceId,next);
 }
});
test('bounded attempt history can retain earned earlier steps without accepting remaining false evidence',()=>{
 const t=new Town(),id='moon';recordLearningAnswer(t,id,{step:0,answer:LITERARY_QUESTS[id].steps[0].answer,evidence:0,reason:'原文'});
 for(let i=0;i<95;i++)recordLearningAnswer(t,id,{step:1,answer:0,evidence:evidenceLines(id).findIndex(x=>x.step===1),reason:'重試'});
 for(const step of [1,2])recordLearningAnswer(t,id,{step,answer:LITERARY_QUESTS[id].steps[step].answer,evidence:evidenceLines(id).findIndex(x=>x.step===step),reason:'原文'});
 saveLearningRevision(t,id,{text:'作品'});visit(t,id);decideAdventure(t,id,{choiceId:'time'});resolveAdventure(t,id,{choiceId:'reserve'});assert(adventureView(t,id).canClaim);assert(claimAdventure(t,id));
 const bad=structuredClone(t.journey.adventure);bad.quests[id].followup.choiceId='unknown';assert.throws(()=>validateAdventure(bad));
 const badHistory=structuredClone(t.journey.adventure);badHistory.quests[id].history.at(-1).followup=null;assert.throws(()=>validateAdventure(badHistory));
});
