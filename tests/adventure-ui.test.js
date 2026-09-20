import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdventureUI} from '../src/adventure-ui.js';
import {ADVENTURE_CONTENT} from '../src/adventure-content.js';
import {adventureView} from '../src/adventure.js';

function harness(){
 let town={},fail=false,message='';
 const ui=createAdventureUI({getTown:()=>town,change:fn=>fail?false:fn(town),rerender:m=>{message=m;}});
 const click=(name,extra={},id='yueyang')=>ui.click({target:{closest:()=>({dataset:{adventureAction:name,adventureId:id,...extra},closest:()=>null})}});
 const input=(text,id='yueyang')=>ui.input({target:{dataset:{adventureField:'reason',adventureId:id},value:text,closest:()=>null}});
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
