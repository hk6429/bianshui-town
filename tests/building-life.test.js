import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {upgradeBuilding} from '../src/urban.js';
import {setJourneyMode} from '../src/journey.js';
import {upgradeUse,blueprintLife,blueprintLifeHTML,residentBuildingAction,recordConstruction,constructionHTML,useSnapshot} from '../src/building-life.js';
import {DESIGNS} from '../src/heritage.js';
import {validateSave} from '../src/save-schema.js';
import {editTown} from '../src/town-edit.js';
const town=()=>{const t=new Town();t.place('home',[{x:0,z:0}],true);return t;};
test('challenge rejects unused home without charge, allows actual households; sandbox and disabled challenge retain free upgrades',()=>{
 const t=town(),b=t.buildings[0];t.city.mode='managed';setJourneyMode(t,true);const money=t.city.treasury;assert.equal(upgradeUse(t,b).allowed,false);assert.equal(upgradeBuilding(t,b.id),false);assert.equal(t.city.treasury,money);assert.match(upgradeUse(t,b).text,/入住/);
 t.city.mode='sandbox';t.tick(.05);t.city.mode='managed';assert(t.people.length);assert(upgradeUse(t,b).allowed);assert(upgradeBuilding(t,b.id));
 const empty=town();setJourneyMode(empty,true);assert(upgradeBuilding(empty,empty.buildings[0].id));empty.city.mode='managed';empty.journey.enabled=false;assert(upgradeBuilding(empty,empty.buildings[0].id));
});
test('work requires an actual present healthy worker, not merely a job assignment; garden requires presence',()=>{
 const t=town();t.tick(.05);t.place('work',[{x:1,z:0}],true);t.place('garden',[{x:0,z:1}],true,'garden');t.city.mode='managed';setJourneyMode(t,true);const work=t.buildings.find(b=>b.type==='work'),garden=t.buildings.find(b=>b.type==='garden'),p=t.people[0];p.work=work.id;p.outside=true;
 assert.equal(upgradeUse(t,work).allowed,false);p.outside=false;p.current=work.id;assert(upgradeUse(t,work).allowed);p.health=0;assert.equal(upgradeUse(t,work).allowed,false);p.health=100;assert.equal(upgradeUse(t,garden).allowed,false);p.current=garden.id;assert(upgradeUse(t,garden).allowed);
});
test('all blueprints expose distinct activity, resident behavior and commission rules; academy preview uses the actual simulation action',()=>{
 for(const id of Object.keys(DESIGNS)){const p=blueprintLife(id);for(const k of ['activity','behavior','commission'])assert(p[k].length>0);}
 assert.notEqual(blueprintLife('tea').activity,blueprintLife('academy').activity);assert.match(blueprintLife('tea').commission,/茶坊小聚/);assert.match(blueprintLife('pond').commission,/園中歇腳/);assert.match(blueprintLife('well').commission,/沒有/);
 const t=town();t.tick(.05);t.place('garden',[{x:1,z:0},{x:2,z:0},{x:1,z:1},{x:2,z:1}],true,'academy');const b=t.buildings.find(b=>b.design==='academy'),p=t.people[0];t.time=12;p.work=null;p.current=b.id;p.destination=b.id;p.outside=false;p.route=[];t.tick(.05);
 assert.equal(p.action,blueprintLife('academy').activity);assert.equal(residentBuildingAction({id:999,type:'shop',design:'tea'},{work:null},12),blueprintLife('tea').activity);assert.match(blueprintLifeHTML('academy'),/居民行為/);
});
test('construction comparison targets changed buildings only and records no imaginary use',()=>{
 const t=town();t.tick(.05);const before=Town.restore(t.toJSON());t.place('garden',[{x:1,z:0}],true,'pond');assert(recordConstruction(before,t));const b=t.buildings.find(b=>b.design==='pond');assert.deepEqual(t.journey.construction.targets,[b.id]);assert.equal(t.journey.construction.before.users,0);assert.match(constructionHTML(t),/此刻尚無居民到場使用/);assert.equal(useSnapshot(t,[b.id]).users,0);
 const p=t.people[0];p.current=b.id;p.outside=false;p.action='沿池賞荷、看蜻蜓';assert.equal(useSnapshot(t,[b.id]).users,1);assert.match(constructionHTML(t),/沿池賞荷、看蜻蜓 1人/);assert.match(constructionHTML(t),/不能全部歸因/);assert.doesNotThrow(()=>Town.restore(t.toJSON()));
 const same=Town.restore(t.toJSON());same.city.taxRate=15;assert.equal(recordConstruction(t,same),false);assert.deepEqual(same.journey.construction,t.journey.construction);
});
test('failed build persistence leaves the old comparison untouched; schema rejects malformed snapshots',()=>{
 const t=town(),before=structuredClone(t.toJSON());const result=editTown(t,d=>{d.place('garden',[{x:1,z:0}],true,'pond');recordConstruction(t,d);return true;},{persist:()=>({ok:false})});assert.equal(result.ok,false);assert.deepEqual(t.toJSON(),before);
 for(const bad of [{at:0,label:'池',targets:[],before:{buildings:0,users:0,activities:[]}},{at:99,label:'池',targets:[99],before:{buildings:0,users:0,activities:[]}}])assert.throws(()=>validateSave({...before,journey:{...before.journey,construction:bad}}));
});

test('tea visitors in the real simulation perform the previewed activity; utility use comes from occupied service coverage',()=>{
 const t=town();t.place('home',[{x:-1,z:0}],true);t.place('shop',[{x:1,z:0}],true,'tea');t.tick(.05);const tea=t.buildings.find(b=>b.design==='tea'),p=t.people.find(p=>p.work!==tea.id);assert(p);t.time=12;p.current=tea.id;p.destination=tea.id;p.outside=false;p.route=[];t.tick(.05);assert.equal(p.action,blueprintLife('tea').activity);
 t.place('garden',[{x:0,z:1}],true,'well');const well=t.buildings.find(b=>b.design==='well');t.city.mode='managed';setJourneyMode(t,true);assert(upgradeUse(t,well).allowed);t.people=[];assert.equal(upgradeUse(t,well).allowed,false);
});
