import '../src/journey-ui.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {validateSave} from '../src/save-schema.js';
import {commitJourney} from '../src/journey.js';
import {councilProposals,respondCouncil,observeStory,councilHTML,explorationHTML} from '../src/council-exploration.js';
test('missing garden generates proposal; adoption needs actual finished construction; ignore has no penalty',()=>{
 const t=new Town(),city=structuredClone(t.city);assert(councilProposals(t).find(p=>p.id==='garden').needed);
 assert(respondCouncil(t,'garden','ignore'));assert.deepEqual(t.city,city);assert(respondCouncil(t,'garden','accept'));assert(!respondCouncil(t,'garden','complete'));
 t.place('garden',[{x:0,z:0}],true,'garden');assert(respondCouncil(t,'garden','complete'));assert(!respondCouncil(t,'garden','complete'));assert.match(councilHTML(t),/已回應議案/);
 assert.deepEqual(Town.restore(t.toJSON()).journey.council,t.journey.council);
});
test('work proposal and garden proposal are independent; unfinished and damaged facilities do not fulfill requests',()=>{
 const t=new Town();respondCouncil(t,'work','accept');t.place('work',[{x:0,z:0}],true);const b=t.buildings[0];b.stage=2;assert(!respondCouncil(t,'work','complete'));b.stage=3;b.fireDamage=5;assert(!respondCouncil(t,'work','complete'));delete b.fireDamage;assert(respondCouncil(t,'work','complete'));assert(councilProposals(t).find(p=>p.id==='garden').needed);
});
test('real world event remains unseen until explicitly viewed while active and someone has arrived',()=>{
 const t=new Town();t.demo();for(let i=0;i<1600&&t.stories.active?.phase!=='active';i++)t.tick(.25);
 assert.equal(t.stories.active?.phase,'active');assert.equal(t.journey.seenStories,undefined);assert.match(explorationHTML(t),/尚未看過/);
 const e=t.stories.active;e.phase='gathering';assert(!observeStory(t));e.phase='active';assert(observeStory(t));assert(!observeStory(t));assert.equal(t.journey.seenStories.length,1);assert.match(explorationHTML(t),/親自見過/);
 assert.deepEqual(Town.restore(t.toJSON()).journey.seenStories,t.journey.seenStories);
 t.stories.active=null;assert(!observeStory(t));assert.equal(t.journey.seenStories.length,1);
});
test('save rejects duplicate proposals, missing completion details, future records and nonexistent event IDs',()=>{
 const t=new Town();respondCouncil(t,'garden','accept');const d=t.toJSON(),r=t.journey.council[0];
 for(const council of [[r,r],[{...r,state:'completed'}],[{...r,at:999}]])assert.throws(()=>validateSave({...d,journey:{...d.journey,council}}));
 assert.throws(()=>validateSave({...d,journey:{...d.journey,seenStories:[{type:'tea',event:1,at:0,venue:'茶坊'}]}}));
 const old=structuredClone(d);delete old.journey.council;assert.doesNotThrow(()=>Town.restore(old));
});
test('failed persistence never publishes adoption and historical venue text is escaped',()=>{
 const t=new Town(),before=structuredClone(t.toJSON());assert(!commitJourney(t,d=>respondCouncil(d,'garden','accept'),()=>({ok:false})));assert.deepEqual(t.toJSON(),before);
 t.journey.council=[{proposal:'garden',state:'completed',at:0,building:999,venue:'<img src=x>'}];assert.match(councilHTML(t),/&lt;img/);assert(!councilHTML(t).includes('<img'));assert.doesNotThrow(()=>validateSave(t.toJSON()));
});
