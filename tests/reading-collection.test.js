// Browser entry imports UI before Town: cover that module initialization order.
import '../src/reading-collection-ui.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {tickLiterati} from '../src/literati.js';
import {validateSave} from '../src/save-schema.js';
import {commitJourney} from '../src/journey.js';
import {demolishBuilding} from '../src/urban.js';
import {WORKS,SOURCE_WORK,readEntry,markRead,saveReadingNote,landscapeMatch,recordMatch,curateAnthology,anthologyHTML} from '../src/reading-collection.js';
function town(){const t=new Town();t.place('garden',[{x:0,z:0}],true,'pond');t.place('work',[{x:1,z:0}],true);return t;}
test('automatic author writing never grants player reading; opening grants only one canonical work',()=>{
 const t=town();t.weather.raining=false;for(let n=0;n<8000;n++){t.elapsed+=.05;tickLiterati(t,.05);}assert(t.literati.collected.length>0);assert.equal(t.journey.reading,undefined);
 assert(markRead(t,'ouyang'));assert.equal(markRead(t,SOURCE_WORK.pavilion),false);assert.equal(t.journey.reading.entries.length,1);assert.equal(readEntry(t,'pond'),undefined);assert.equal(markRead(t,'unknown'),false);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('Little Pond matches a finished pond, explains a workshop mismatch and allows retry without penalty',()=>{
 const t=town(),pond=t.buildings[0],work=t.buildings[1],money=t.city.treasury;assert.equal(recordMatch(t,'pond',pond.id),false);markRead(t,'pond');assert.equal(landscapeMatch(t,'pond',work.id).ok,false);assert.match(landscapeMatch(t,'pond',work.id).message,/來源不是/);assert.equal(recordMatch(t,'pond',work.id),false);pond.stage=2;assert.equal(recordMatch(t,'pond',pond.id),false);pond.stage=3;assert(recordMatch(t,'pond',pond.id));assert.match(landscapeMatch(t,'pond',pond.id).message,/不是史實原址/);assert.equal(t.city.treasury,money);assert.equal(readEntry(t,'pond').matched.building,pond.id);
});
test('different works retain independent notes and chosen landscapes, including safely escaped text and demolished history',()=>{
 const t=town(),[pond,work]=t.buildings;markRead(t,'pond');markRead(t,'su');assert(saveReadingNote(t,'pond','<img src=x>荷影\n是我的心得',pond.id));assert(saveReadingNote(t,'su','工坊也有日常的力量',work.id));assert.equal(saveReadingNote(t,'li','未開啟',null),false);assert.equal(saveReadingNote(t,'su','甲'.repeat(401),null),false);assert.equal(saveReadingNote(t,'su','新文',999),false);
 let restored=Town.restore(t.toJSON());assert.equal(readEntry(restored,'pond').landscape.building,pond.id);assert.equal(readEntry(restored,'su').note,'工坊也有日常的力量');markRead(t,'li');curateAnthology(t,'我的選集',['pond','su','li']);assert(!anthologyHTML(t).includes('<img src=x>'));assert.match(anthologyHTML(t),/&lt;img/);assert(demolishBuilding(t,pond.id));assert.match(anthologyHTML(t),/地標已拆除/);assert(saveReadingNote(t,'pond','保留舊池記憶',pond.id));assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('anthology needs three unique already-opened works, supports re-curation and displays title, works and landscapes',()=>{
 const t=town();for(const id of ['pond','su','li'])markRead(t,id);assert.equal(curateAnthology(t,'選集',['pond','pond','su']),false);assert.equal(curateAnthology(t,'選集',['pond','su','xin']),false);assert.equal(curateAnthology(t,'   ',['pond','su','li']),false);assert(curateAnthology(t,'  荷風集  ',['pond','su','li']));assert.match(anthologyHTML(t),/荷風集/);assert.match(anthologyHTML(t),/尚未選景/);markRead(t,'xin');assert(curateAnthology(t,'燈火集',['xin','li','pond']));assert.deepEqual(t.journey.reading.anthology.works,['xin','li','pond']);assert.equal(t.journey.reading.entries.length,4);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
});
test('strict collection validation rejects duplicates, impossible anthology, unknown works and future reading',()=>{
 const t=town();markRead(t,'pond');const data=t.toJSON(),e=t.journey.reading.entries[0];for(const reading of [{entries:[e,e],anthology:null},{entries:[{...e,work:'unknown'}],anthology:null},{entries:[{...e,openedAt:999}],anthology:null},{entries:[e],anthology:{title:'選集',works:['pond','su','li']}},{entries:[{...e,note:'甲'.repeat(401)}],anthology:null}])assert.throws(()=>validateSave({...data,journey:{...data.journey,reading}}));assert.equal(Object.keys(WORKS).length,9);
});
test('failed reading or note persistence leaves live collection intact; legacy saves need no migration',()=>{
 const t=town(),before=structuredClone(t.toJSON());assert.equal(commitJourney(t,d=>markRead(d,'pond'),()=>({ok:false})),false);assert.deepEqual(t.toJSON(),before);assert.doesNotThrow(()=>Town.restore(before));assert(commitJourney(t,d=>markRead(d,'pond'),d=>{validateSave(d);return {ok:true};}));assert.equal(commitJourney(t,d=>saveReadingNote(d,'pond','未存下',null),()=>({ok:false})),false);assert.equal(readEntry(t,'pond').note,'');
});
