import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {setJourneyMode,commitJourney} from '../src/journey.js';
import {validateSave} from '../src/save-schema.js';
import {respondCommission,commissionRecord,commissionVenue,commissionReply,commissionCards} from '../src/commissions.js';
function town(){const t=new Town();t.place('home',[{x:0,z:0}],true);t.tick(.05);assert(t.people.length);setJourneyMode(t,true);return t;}
for(const solution of ['tea','garden'])test(`${solution}: named request completes only after actual connected venue is finished; completion is unique`,()=>{
 const t=town(),p=t.people[0];assert.equal(respondCommission(t,p.id,'complete'),false);assert(respondCommission(t,p.id,'accept',solution));assert.equal(commissionRecord(t,p.id).name,p.name);assert.equal(respondCommission(t,p.id,'complete'),false);
 t.place(solution==='tea'?'shop':'garden',[{x:1,z:0}],false,solution);assert.equal(respondCommission(t,p.id,'complete'),false);
 for(let i=0;i<400;i++)t.tick(.05);assert(commissionVenue(t,p.id,solution));assert(respondCommission(t,p.id,'complete'));assert.equal(respondCommission(t,p.id,'complete'),false);assert.equal(respondCommission(t,p.id,'accept','tea'),false);
 assert.match(commissionReply(t,p.id),/謝謝你/);assert.equal(commissionRecord(t,p.id).solution,solution);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('decline, withdraw, change solution and reaccept preserve city finances and cultural collection',()=>{
 const t=town(),p=t.people[0],city=structuredClone(t.city),buildings=structuredClone(t.buildings),culture=structuredClone(t.literati);
 assert(respondCommission(t,p.id,'decline'));assert.match(commissionReply(t,p.id),/不扣分/);assert(respondCommission(t,p.id,'accept','tea'));assert(respondCommission(t,p.id,'accept','garden'));assert(respondCommission(t,p.id,'withdraw'));assert.match(commissionReply(t,p.id),/重新接取/);assert(respondCommission(t,p.id,'accept','tea'));
 assert.deepEqual(t.city,city);assert.deepEqual(t.buildings,buildings);assert.deepEqual(t.literati,culture);assert.equal(t.journey.commissions.length,1);
 setJourneyMode(t,false);assert.equal(respondCommission(t,p.id,'withdraw'),false);setJourneyMode(t,true);assert.equal(commissionRecord(t,p.id).state,'active');
});
test('isolated, distant, damaged, utility and absent-resident conditions cannot complete a request',()=>{
 const t=town(),p=t.people[0];t.place('garden',[{x:1,z:0}],true,'garden');const b=t.buildings.find(b=>b.type==='garden');assert(commissionVenue(t,p.id,'garden'));
 b.fireDamage=10;assert.equal(commissionVenue(t,p.id,'garden'),null);delete b.fireDamage;b.design='well';assert.equal(commissionVenue(t,p.id,'garden'),null);b.design='garden';b.x=7;assert.equal(commissionVenue(t,p.id,'garden'),null);b.x=1;
 const roads=t.roads;t.roads=new Set();assert.equal(commissionVenue(t,p.id,'garden'),null);t.roads=roads;
 respondCommission(t,p.id,'accept','garden');t.people=[];assert.equal(respondCommission(t,p.id,'complete'),false);assert.match(commissionReply(t,p.id),/已離鎮/);assert(respondCommission(t,p.id,'withdraw'));
});
test('save validation rejects duplicate residents, invalid combinations and future completion; legacy saves remain valid',()=>{
 const t=town(),id=t.people[0].id;assert.doesNotThrow(()=>validateSave(t.toJSON()));respondCommission(t,id,'accept','tea');const saved=t.toJSON();assert.equal(Town.restore(saved).journey.commissions[0].state,'active');
 for(const records of [[...t.journey.commissions,...t.journey.commissions],[{resident:id,name:'甲',state:'completed',solution:'tea'}],[{resident:id,name:'甲',state:'declined',solution:'garden'}],[{resident:id,name:'甲',state:'completed',solution:'tea',venue:'茶坊',building:99,completedAt:99}]])assert.throws(()=>validateSave({...saved,journey:{...saved.journey,commissions:records}}));
});
test('storage failure does not publish commission state; output escapes resident and historical venue names',()=>{
 const t=town(),id=t.people[0].id,before=structuredClone(t.toJSON());assert.equal(commitJourney(t,d=>respondCommission(d,id,'accept','garden'),()=>({ok:false})),false);assert.deepEqual(t.toJSON(),before);
 t.people[0].name='<script>unsafe</script>';assert(!commissionCards(t,id).includes('<script>'));assert(commissionCards(t,id).includes('&lt;script&gt;'));
 assert(commitJourney(t,d=>respondCommission(d,id,'accept','garden'),d=>{validateSave(d);return {ok:true};}));assert.equal(t.journey.commissions.length,1);
});
test('history remains bounded; completed departed residents and demolished venues are historical references',()=>{
 const t=town(),id=t.people[0].id;t.journey.commissions=Array.from({length:64},(_,i)=>({resident:10000+i,name:'舊居民',state:'completed',solution:'garden',venue:'舊園景',building:9000+i,completedAt:0}));
 assert.equal(respondCommission(t,id,'accept','tea'),false);assert.doesNotThrow(()=>validateSave(t.toJSON()));assert.match(commissionCards(t,id),/disabled/);
});
