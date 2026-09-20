import test from 'node:test';import assert from 'node:assert/strict';import {Town} from '../src/simulation.js';import {validateSave} from '../src/save-schema.js';import {adventureView,visitAdventure,decideAdventure,claimAdventure,resetAdventure,resolveAdventure} from '../src/adventure.js';import {recordLearningAnswer,evidenceLines,saveLearningRevision} from '../src/learning.js';import {LITERARY_QUESTS} from '../src/literary-quests.js';
test('adventure survives city restore and collection imports require actual learning evidence',()=>{const t=new Town();for(const r of adventureView(t,'kaifeng').roles)visitAdventure(t,'kaifeng',r.id);decideAdventure(t,'kaifeng',{choiceId:'aid',reason:'先支持需要協助的居民'});const v=validateSave(t.toJSON());assert.deepEqual(v.journey.adventure,t.journey.adventure);const restored=Town.restore(v);assert.deepEqual(restored.journey.adventure,t.journey.adventure);for(let step=0;step<3;step++)recordLearningAnswer(t,'kaifeng',{step,answer:LITERARY_QUESTS.kaifeng.steps[step].answer,evidence:evidenceLines('kaifeng').findIndex(l=>l.step===step),reason:'我要查證資料再判斷'});saveLearningRevision(t,'kaifeng',{text:'我會比較當事人陳述與傳聞來源。'});assert(resolveAdventure(t,'kaifeng',{choiceId:'repair'}));assert(claimAdventure(t,'kaifeng'));resetAdventure(t,'kaifeng');const saved=validateSave(t.toJSON());assert(saved.journey.adventure.quests.kaifeng.collections.length);delete saved.journey.learning;assert.throws(()=>validateSave(saved),/收藏/);});

test('many retries retain previously earned evidence instead of locking a collection',()=>{const t=new Town(),q=LITERARY_QUESTS.kaifeng;for(let step=0;step<2;step++)recordLearningAnswer(t,'kaifeng',{step,answer:q.steps[step].answer,evidence:evidenceLines('kaifeng').findIndex(l=>l.step===step),reason:'先找證據',at:step+1});for(let i=0;i<100;i++)recordLearningAnswer(t,'kaifeng',{step:2,answer:1,evidence:0,reason:'我還在想',at:i+3});recordLearningAnswer(t,'kaifeng',{step:2,answer:q.steps[2].answer,evidence:evidenceLines('kaifeng').findIndex(l=>l.step===2),reason:'查證不看官位',at:104});assert.equal(t.journey.learning.quests.kaifeng.attempts.length,90);assert(adventureView(t,'kaifeng').requirements[2].ok);validateSave(t.toJSON());});

test('Yueyang continuity reflection survives validated city restore and rejects branch tampering',async()=>{
 const {continuityView,recordContinuity}=await import('../src/adventure-continuity.js');
 const t=new Town();
 for(const r of adventureView(t,'yueyang').roles)visitAdventure(t,'yueyang',r.id);
 decideAdventure(t,'yueyang',{choiceId:'aid',reason:'先安頓眼前居民'});
 resolveAdventure(t,'yueyang',{choiceId:'reserve'});
 resetAdventure(t,'yueyang');
 const view=continuityView(t,'yueyang');
 assert(view);assert(recordContinuity(t,'yueyang',{evidenceId:view.evidenceOptions[0].id,reason:'新線索提醒我還有其他居民的需要，原文不能直接決定唯一安置方法。'}));
 const saved=validateSave(t.toJSON()),restored=Town.restore(saved);
 assert.deepEqual(continuityView(restored,'yueyang').record,view.record||t.journey.adventure.quests.yueyang.reflection);
 const bad=structuredClone(saved);bad.journey.adventure.quests.yueyang.reflection.branchId='time-repair';
 assert.throws(()=>validateSave(bad));
 visitAdventure(t,'yueyang','role1');assert(resetAdventure(t,'yueyang'));
 assert.equal(Object.hasOwn(t.journey.adventure.quests.yueyang,'reflection'),false);
 validateSave(t.toJSON());
});
