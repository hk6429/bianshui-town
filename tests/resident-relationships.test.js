import '../src/resident-relationships-ui.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tickStories} from '../src/stories.js';
import {Town} from '../src/simulation.js';
import {validateSave} from '../src/save-schema.js';
import {commitJourney} from '../src/journey.js';
import {observeResident,watchResident,residentRecord,familiarity,residentActivity,watchedResident,residentWatchHTML} from '../src/resident-relationships.js';
function town(){const t=new Town();t.place('home',[{x:0,z:0}],true);t.tick(.05);assert.equal(t.people.length,2);return t;}
test('repeated observations cannot farm familiarity; different daily activities and one completed commission contribute once',()=>{
 const t=town(),p=t.people[0];assert(observeResident(t,p.id));assert.equal(familiarity(t,p.id).score,1);for(let i=0;i<30;i++)observeResident(t,p.id);assert.equal(familiarity(t,p.id).score,1);
 p.outside=true;p.route=[[0,0]];p.action='沿街散步';assert(observeResident(t,p.id));assert.equal(familiarity(t,p.id).score,2);t.journey.commissions=[{resident:p.id,name:p.name,state:'completed',solution:'garden',venue:'花園',building:99,completedAt:t.elapsed}];assert.equal(familiarity(t,p.id).score,3);assert.equal(familiarity(t,p.id).label,'相識');for(let i=0;i<20;i++)assert.equal(familiarity(t,p.id).score,3);
});
test('no idle or offline decay and no automatic world observation; saved relationship round-trips',()=>{
 const t=town(),p=t.people[0];for(let i=0;i<20;i++)t.tick(.25);assert.equal(t.journey.residents,undefined);observeResident(t,p.id);const before=structuredClone(t.journey.residents);t.elapsed+=100000;t.time+=100;assert.deepEqual(t.journey.residents,before);const restored=Town.restore(t.toJSON());assert.deepEqual(restored.journey.residents,before);
});
test('watch two IDs independently, remove one, retain history and never redirect a departed resident to someone else',()=>{
 const t=town(),[a,b]=t.people;assert(watchResident(t,a.id,true));assert(watchResident(t,b.id,true));assert.equal(watchedResident(t,a.id),a);assert.equal(watchedResident(t,b.id),b);assert.equal(watchResident(t,a.id,true),false);observeResident(t,a.id);assert(watchResident(t,a.id,false));assert.equal(watchedResident(t,a.id),null);assert.equal(watchedResident(t,b.id),b);assert.equal(familiarity(t,a.id).score,1);
 t.people=t.people.filter(p=>p.id!==b.id);assert.equal(watchedResident(t,b.id),null);assert.match(residentWatchHTML(t),/已離鎮/);assert.match(residentWatchHTML(t),/最近已知行程/);assert.match(residentWatchHTML(t),/disabled/);assert.doesNotThrow(()=>validateSave(t.toJSON()));assert(watchResident(t,b.id,false));assert.equal(residentRecord(t,b.id).watched,false);
});
test('activity categories depend on actual state, and merely gathering for a story does not count as hearing it',()=>{
 const t=town(),p=t.people[0];p.outside=true;p.route=[[0,0]];t.stories.active={phase:'gathering',type:'story',participants:[p.id]};assert.equal(residentActivity(t,p),'travel');t.stories.active.phase='active';assert.equal(residentActivity(t,p),'travel');p.eventSlot=[p.x,p.z];assert.equal(residentActivity(t,p),'story');t.stories.active=null;p.shelter=p.home;assert.equal(residentActivity(t,p),'rain');p.shelter=null;p.socialUntil=t.elapsed+4;assert.equal(residentActivity(t,p),'social');
});
test('failed persistence leaves observations and watch flags untouched; names and actions are escaped',()=>{
 const t=town(),p=t.people[0],before=structuredClone(t.toJSON());assert.equal(commitJourney(t,d=>observeResident(d,p.id),()=>({ok:false})),false);assert.deepEqual(t.toJSON(),before);assert.equal(commitJourney(t,d=>watchResident(d,p.id,true),()=>({ok:false})),false);assert.deepEqual(t.toJSON(),before);
 p.name='<img src=x>';p.action='<script>alert(1)</script>';watchResident(t,p.id,true);const html=residentWatchHTML(t);assert(!html.includes('<img src=x>'));assert(!html.includes('<script>'));assert.match(html,/&lt;script&gt;/);
});
test('save bounds reject duplicate IDs, repeated categories, future observations and more than 16 watched people',()=>{
 const t=town();observeResident(t,t.people[0].id);const d=t.toJSON(),r=t.journey.residents[0];for(const residents of [[r,r],[{...r,seen:['home','home']}],[{...r,lastAt:999}],Array.from({length:17},(_,i)=>({...r,resident:100+i,watched:true}))])assert.throws(()=>validateSave({...d,journey:{...d.journey,residents}}));
 const legacy=structuredClone(d);delete legacy.journey.residents;assert.doesNotThrow(()=>Town.restore(legacy));
});

test('active storytelling only credits residents who actually arrived',()=>{
 const t=new Town();t.demo();t.time=12;t.weather.raining=false;t.elapsed=t.stories.nextAt;t.stories.sequence=0;tickStories(t);
 const e=t.stories.active;assert(e);e.type='story';const [a,b]=e.participants.map(id=>t.people.find(p=>p.id===id));assert(a&&b);
 [a.x,a.z]=a.eventSlot;a.route=[];b.x=b.eventSlot[0]+5;b.z=b.eventSlot[1];b.route=[[...b.eventSlot]];
 t.elapsed=e.deadline;tickStories(t);assert.equal(e.phase,'active');observeResident(t,a.id);observeResident(t,b.id);
 assert(residentRecord(t,a.id).seen.includes('story'));assert(!residentRecord(t,b.id).seen.includes('story'));assert(residentRecord(t,b.id).seen.includes('travel'));
 [b.x,b.z]=b.eventSlot;b.route=[];observeResident(t,b.id);assert(residentRecord(t,b.id).seen.includes('story'));
});
