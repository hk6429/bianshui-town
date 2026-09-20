import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdventureUI} from '../src/adventure-ui.js';
import {ADVENTURE_CONTENT} from '../src/adventure-content.js';
import {continuityView,CONTINUITY_RESIDENTS} from '../src/adventure-continuity.js';
import {adventureView} from '../src/adventure.js';

function harness(){
 let town={},fail=false,message='';
 const ui=createAdventureUI({getTown:()=>town,change:fn=>fail?false:fn(town),rerender:m=>{message=m;}});
 const click=(name,extra={},id='yueyang')=>ui.click({target:{closest:()=>({dataset:{adventureAction:name,adventureId:id,...extra},closest:()=>null})}});
 const input=(text,id='yueyang',field='reason')=>ui.input({target:{dataset:{adventureField:field,adventureId:id},value:text,closest:()=>null}});
 return {ui,click,input,town:()=>town,replace:()=>{town={};},fail:()=>{fail=true;},message:()=>message};
}
test('ten adventures begin with a mission and resident encounters, progressively reveal decisions',()=>{
 const h=harness();
 for(const [id,c]of Object.entries(ADVENTURE_CONTENT)){
  const first=h.ui.render(id);assert(first.includes(c.mission));assert(first.includes('第 1 次演練'));
  assert(!first.includes('data-adventure-action="decide"'));assert(!first.includes('<textarea'));
  for(const r of c.roles)h.click('visit',{adventureRole:r.id},id);
  const visited=h.ui.render(id);assert(visited.includes('data-adventure-action="decide"'));assert(visited.includes('可用時間 <strong>3</strong>'));
  for(const r of c.roles)assert(visited.includes(r.clue));
 }
 assert.equal(h.ui.render('unknown'),'');
});
test('draft survives chapter render, is escaped, and saves with branch history',()=>{
 const h=harness();for(const r of ADVENTURE_CONTENT.yueyang.roles)h.click('visit',{adventureRole:r.id});
 h.input('<script>你好</script>');h.ui.render('lotus');
 assert(h.ui.render('yueyang').includes('&lt;script&gt;你好&lt;/script&gt;'));
 h.click('decide',{adventureChoice:'aid'});
 assert.equal(adventureView(h.town(),'yueyang').decision.reason,'<script>你好</script>');
 assert(h.ui.render('yueyang').includes('居民的回應'));
 h.click('reset');assert.equal(adventureView(h.town(),'yueyang').history.length,1);
 assert(h.ui.render('yueyang').includes('第 2 次演練'));
});
test('failed persistence retains draft; changing town clears in-memory drafts',()=>{
 const h=harness();for(const r of ADVENTURE_CONTENT.yueyang.roles)h.click('visit',{adventureRole:r.id});
 h.input('先安頓住處');h.fail();h.click('decide',{adventureChoice:'time'});
 assert.equal(adventureView(h.town(),'yueyang').decision,null);
 assert(h.ui.render('yueyang').includes('先安頓住處'));assert(h.message().includes('尚未儲存'));
 h.replace();assert(!h.ui.render('yueyang').includes('先安頓住處'));
});
test('student can make a first choice without completing a written form',()=>{
 const h=harness();for(const r of ADVENTURE_CONTENT.yueyang.roles)h.click('visit',{adventureRole:r.id});
 h.click('decide',{adventureChoice:'aid'});assert.equal(adventureView(h.town(),'yueyang').decision?.choiceId,'aid');
 assert(h.ui.render('yueyang').includes('理由留給你、同學與老師討論'));
});
test('follow-up choices both spend resources and show different resident outcomes',()=>{
 for(const primary of ['aid','time'])for(const followup of ['repair','reserve']){
  const h=harness();for(const r of ADVENTURE_CONTENT.yueyang.roles)h.click('visit',{adventureRole:r.id});
  h.click('decide',{adventureChoice:primary});
  const before=adventureView(h.town(),'yueyang'),html=h.ui.render('yueyang');
  assert(html.includes('data-adventure-action="resolve"'));assert(html.includes(before.followupNeed));
  assert.notEqual(before.followupChoices[0].consequence,before.followupChoices[1].consequence);
  for(const choice of before.followupChoices)assert.deepEqual(choice.cost,before.resources);
  assert(html.includes('aria-label="收藏與榮譽" hidden'));
  h.click('resolve',{adventureChoice:followup});
  const after=adventureView(h.town(),'yueyang');
  assert.equal(after.followup.choiceId,followup);assert.equal(after.history.at(-1).followup.choiceId,followup);
  assert.deepEqual(after.resources,{time:0,aid:0});
  const result=h.ui.render('yueyang');assert(result.includes(after.followupStatus));assert(!result.includes('data-adventure-action="resolve"'));assert(!result.includes('aria-label="收藏與榮譽" hidden'));
  assert(result.includes('保留最近12次決策與已得收藏，重玩超過12次會移除最早一筆'));
 }
});
test('failed follow-up persistence leaves its choices available',()=>{
 const h=harness();for(const r of ADVENTURE_CONTENT.yueyang.roles)h.click('visit',{adventureRole:r.id});
 h.click('decide',{adventureChoice:'aid'});h.fail();h.click('resolve',{adventureChoice:'repair'});
 assert.equal(adventureView(h.town(),'yueyang').followup,null);assert(h.ui.render('yueyang').includes('data-adventure-action="resolve"'));assert(h.message().includes('尚未儲存'));
});

function replay(h){
 for(const r of ADVENTURE_CONTENT.yueyang.roles)h.click('visit',{adventureRole:r.id});
 h.click('decide',{adventureChoice:'aid'});h.click('resolve',{adventureChoice:'repair'});h.click('reset');
}
test('Yueyang named residents recur with a visible new clue and optional reflection disclosure',()=>{
 const h=harness(),first=h.ui.render('yueyang');
 for(const resident of CONTINUITY_RESIDENTS)assert(first.includes(resident.name));
 assert(!first.includes('data-adventure-action="reflect"'));
 replay(h);const view=continuityView(h.town(),'yueyang'),html=h.ui.render('yueyang');
 assert(html.includes('本輪新線索'));assert(html.includes(view.title));assert(html.includes(view.clue));
 for(const resident of view.residents)assert(html.includes(resident.memory));
 assert(html.includes('maxlength="600"'));assert(html.includes('不自動評定理解或理由對錯'));
 assert(html.includes('重新演練會清除'));assert(!h.ui.render('lotus').includes('adventure-continuity'));
});
test('reflection evidence and escaped draft survive visits and chapter switches, then save and update',()=>{
 const h=harness();replay(h);const evidence=continuityView(h.town(),'yueyang').evidenceOptions[0].id;
 h.input(evidence,'yueyang','evidence');h.input('<img src=x onerror=alert(1)>重新思考','yueyang','reflection');
 h.click('visit',{adventureRole:ADVENTURE_CONTENT.yueyang.roles[0].id});h.ui.render('lotus');
 let html=h.ui.render('yueyang');assert(html.includes('&lt;img'));assert(!html.includes('<img'));
 assert(html.includes(`value="${evidence}" selected`));h.click('reflect');
 assert.equal(continuityView(h.town(),'yueyang').record.reason,'<img src=x onerror=alert(1)>重新思考');
 h.input('補充理由','yueyang','reflection');h.click('reflect');
 assert.equal(continuityView(h.town(),'yueyang').record.reason,'補充理由');
 assert(h.ui.render('yueyang').includes('最近一份修正已儲存'));
});
test('failed reflection keeps both fields, clamps draft length and changing town isolates drafts',()=>{
 const h=harness();replay(h);const evidence=continuityView(h.town(),'yueyang').evidenceOptions[0].id;
 h.input(evidence,'yueyang','evidence');h.input('甲'.repeat(610),'yueyang','reflection');h.fail();h.click('reflect');
 assert.equal(continuityView(h.town(),'yueyang').record,null);
 let html=h.ui.render('yueyang');assert(html.includes('甲'.repeat(600)));assert(!html.includes('甲'.repeat(601)));
 assert(html.includes(`value="${evidence}" selected`));assert(h.message().includes('尚未儲存'));
 h.replace();assert(!h.ui.render('yueyang').includes('甲'));
});
test('reflection drafts do not leak into the next round',()=>{
 const h=harness();replay(h);h.input('上一輪草稿','yueyang','reflection');
 replay(h);assert(!h.ui.render('yueyang').includes('上一輪草稿'));
});
