import test from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {visitAdventure,decideAdventure,resolveAdventure,resetAdventure} from '../src/adventure.js';
import {evidenceLines} from '../src/learning.js';
import {CONTINUITY_RESIDENTS,continuityView,recordContinuity,validateContinuityReflection} from '../src/adventure-continuity.js';
const decide=(t,choiceId)=>{for(const id of ['role1','role2','role3'])assert(visitAdventure(t,'yueyang',id));assert(decideAdventure(t,'yueyang',{choiceId,reason:'比較不同居民的需要'}));};
const replay=(primary='aid',followup='repair')=>{const t=new Town();decide(t,primary);assert(resolveAdventure(t,'yueyang',{choiceId:followup}));assert(resetAdventure(t,'yueyang'));return t;};
test('four decision and followup combinations carry distinct clues with stable fictional residents',()=>{
 const clues=new Set();for(const primary of ['aid','time'])for(const next of ['repair','reserve']){
  const v=continuityView(replay(primary,next),'yueyang');assert.equal(v.branchId,`${primary}-${next}`);clues.add(v.clue);
  assert.deepEqual(v.residents.map(({name,role})=>({name,role})),CONTINUITY_RESIDENTS);assert(v.residents.every(r=>r.role.includes('教學虛構')&&r.memory));assert(v.residents[0].memory.includes(primary==='aid'?'集中援助安置':'分批安置與修繕'));assert(v.prompt.includes('不自動評理解分數'));assert.equal(v.record,null);
  for(const e of v.evidenceOptions)assert.equal(e.text,evidenceLines('yueyang')[Number(e.id.slice(9))].text);
 }assert.equal(clues.size,4);
});
test('first rounds, other quests and unfinished previous decisions cannot open continuity',()=>{
 const t=new Town();assert.equal(continuityView(t,'yueyang'),null);assert.equal(continuityView(t,'oil'),null);decide(t,'aid');assert.equal(continuityView(t,'yueyang'),null);resetAdventure(t,'yueyang');assert.equal(continuityView(t,'yueyang'),null);assert.equal(recordContinuity(t,'yueyang',{evidenceId:'evidence-0',reason:'修正'}),false);
});
test('latest prior history determines the branch, independent of round parity and current decision',()=>{
 const t=replay();decide(t,'time');resolveAdventure(t,'yueyang',{choiceId:'reserve'});assert.equal(continuityView(t,'yueyang').branchId,'aid-repair');resetAdventure(t,'yueyang');assert.equal(continuityView(t,'yueyang').branchId,'time-reserve');assert(continuityView(t,'yueyang').residents[0].memory.includes('第2輪'));decide(t,'aid');resetAdventure(t,'yueyang');assert.equal(continuityView(t,'yueyang'),null);
});
test('unfinished latest history cannot borrow an old completed source across bounded history pruning',()=>{
 const t=replay();for(let i=0;i<11;i++){decide(t,'time');resetAdventure(t,'yueyang');assert.equal(continuityView(t,'yueyang'),null);assert.equal(recordContinuity(t,'yueyang',{evidenceId:'evidence-0',reason:'不能借舊輪來源'}),false);}
 assert.equal(t.journey.adventure.quests.yueyang.history.length,12);decide(t,'aid');assert.equal(t.journey.adventure.quests.yueyang.history.length,12);assert.equal(t.journey.adventure.quests.yueyang.history[0].round,1);assert.equal(continuityView(t,'yueyang'),null);assert.equal(Object.hasOwn(t.journey.adventure.quests.yueyang,'reflection'),false);
});
test('record rejects blank, excessive or unrelated evidence without mutation, and retains only latest reflection',()=>{
 const t=replay(),before=JSON.stringify(t.journey.adventure);for(const input of [null,{}, {evidenceId:'evidence-0',reason:''},{evidenceId:'evidence-0',reason:'  '},{evidenceId:'evidence-0',reason:'字'.repeat(601)},{evidenceId:'evidence-5',reason:'修正'},{evidenceId:'evidence-0',reason:1}])assert.equal(recordContinuity(t,'yueyang',input),false);assert.equal(JSON.stringify(t.journey.adventure),before);
 assert(recordContinuity(t,'yueyang',{evidenceId:'evidence-0',reason:' 原文只支持治理方向，無法決定具體物資數量。 '}));assert(recordContinuity(t,'yueyang',{evidenceId:'evidence-6',reason:'我會補上下一批居民的接應。'}));
 const s=t.journey.adventure.quests.yueyang,r=continuityView(t,'yueyang').record;assert.deepEqual(r,{round:1,branchId:'aid-repair',evidenceId:'evidence-6',reason:'我會補上下一批居民的接應。'});assert.deepEqual(validateContinuityReflection(JSON.parse(JSON.stringify(r)),s,'yueyang'),r);r.reason='外部變更';assert.notEqual(s.reflection.reason,r.reason);
});
test('reflection schema rejects forged branch, source, round, fields and unrelated quest',()=>{
 const t=replay(),s=t.journey.adventure.quests.yueyang;recordContinuity(t,'yueyang',{evidenceId:'evidence-0',reason:'修正'});const r=s.reflection;
 for(const changed of [null,undefined,[],{...r,round:0},{...r,round:2},{...r,branchId:'time-repair'},{...r,evidenceId:'evidence-5'},{...r,extra:true},{...r,reason:' '},{...r,reason:'字'.repeat(601)}])assert.throws(()=>validateContinuityReflection(changed,s,'yueyang'));
 assert.throws(()=>validateContinuityReflection(r,s,'oil'));const withoutSource=structuredClone(s);withoutSource.history[0].followup=null;assert.throws(()=>validateContinuityReflection(r,withoutSource,'yueyang'));const changedSource=structuredClone(s);changedSource.history[0].followup.choiceId='reserve';assert.throws(()=>validateContinuityReflection(r,changedSource,'yueyang'));
});
