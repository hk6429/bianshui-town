import '../src/story-history.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {tickStories} from '../src/stories.js';
import {storyHistoryHTML} from '../src/story-history.js';
import {validateSave} from '../src/save-schema.js';
function active(stage=false){const t=new Town();t.demo();if(stage)t.place('garden',[{x:-8,z:-6},{x:-7,z:-6},{x:-8,z:-5},{x:-7,z:-5}],true,'wazi');for(let i=0;i<2000&&t.stories.active?.phase!=='active';i++)t.tick(.25);assert.equal(t.stories.active?.phase,'active');return t;}
test('real venue changes story branch, narration and duration; ended record explains each cause',()=>{
 for(const stage of [false,true]){const t=active(stage),e=t.stories.active;assert.equal(e.branch,stage?'stage':'street');assert.match(e.activity,stage?/長篇/:/短篇|趣談/);assert(Math.abs(e.until-t.elapsed-(stage?28:12))<1e-9);t.time=22;tickStories(t);const r=t.stories.history[0];assert.equal(r.branch,e.branch);assert.match(r.reason,stage?/瓦舍/:/商鋪/);assert.equal(r.summary,e.activity);assert(r.participants.length);assert.match(storyHistoryHTML(t),/已散場/);assert.deepEqual(Town.restore(t.toJSON()).stories.history,t.stories.history);}
});
test('arrival history contains actual attendees only and remains after the residents depart',()=>{
 const t=active(),e=t.stories.active;const expected=structuredClone(e.attendees);assert(expected.length);const outsider=t.people.find(p=>!e.participants.includes(p.id));assert(outsider);e.participants.push(outsider.id);outsider.eventSlot=[90,90];outsider.x=0;outsider.z=0;e.until=t.elapsed;tickStories(t);assert.deepEqual(t.stories.history[0].participants,expected);t.people=[];const html=storyHistoryHTML(t);assert(html.includes(expected[0].name));assert.match(html,/不重演/);assert.equal(t.journey.seenStories,undefined);
});
test('history keeps newest 24 only; cancelled gathering has no fictional participants; legacy lacks fabricated history',()=>{
 const t=active(),template=structuredClone(t.stories.active);
 for(let i=0;i<30;i++){const e={...structuredClone(template),id:++t.stories.sequence,phase:'gathering',attendees:[]};t.stories.active=e;t.time=22;tickStories(t);}
 assert.equal(t.stories.history.length,24);assert.equal(t.stories.history[0].id,t.stories.sequence);assert(t.stories.history.every(e=>!e.happened&&!e.participants.length));assert.match(storyHistoryHTML(t),/已取消/);
 const d=t.toJSON();assert.doesNotThrow(()=>validateSave(d));delete d.stories.history;assert.match(storyHistoryHTML(Town.restore(d)),/不補造/);
});
test('strict archive bounds reject duplicate IDs, future time, impossible participants and malformed branches; text escaped',()=>{
 const t=active();t.time=22;tickStories(t);const d=t.toJSON(),r=t.stories.history[0];
 for(const history of [[r,r],[{...r,at:t.elapsed+1}],[{...r,happened:false}],[{...r,type:'tea',branch:'stage'}],Array.from({length:25},(_,i)=>({...r,id:i+1}))])assert.throws(()=>validateSave({...d,stories:{...d.stories,history}}));
 r.venue='<script>x</script>';r.participants[0].name='<img src=x>';const html=storyHistoryHTML(t);assert(!html.includes('<script>'));assert(!html.includes('<img src=x>'));
});
