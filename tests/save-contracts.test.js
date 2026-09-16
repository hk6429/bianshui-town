import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town,bounds} from '../src/simulation.js';import {validateSave} from '../src/save-schema.js';import {transfer} from '../src/production.js';import {SaveStore} from '../src/save-store.js';
const memory=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),key:i=>[...m.keys()][i],get length(){return m.size;}};};
test('restored allocator creates 100 buildings without duplicate city IDs',()=>{
 const town=Town.restore(new Town().toJSON());let count=0;
 for(let z=bounds.minZ;z<=bounds.maxZ&&count<100;z++)for(let x=bounds.minX;x<=bounds.maxX&&count<100;x++){assert(town.place('home',[{x,z}],true));count++;}
 town.tick(.05);const ids=[...town.buildings,...town.blocks,...town.people,...town.carts].map(x=>x.id);
 assert.equal(count,100);assert.equal(new Set(ids).size,ids.length);assert(town.nextId>Math.max(...ids));assert.doesNotThrow(()=>Town.restore(town.toJSON()));
});
test('simulation, renaming and cargo transfer after restore never mutate any part of the input',()=>{
 const town=new Town();town.demo();for(let i=0;i<100;i++)town.tick(.05);
 const original=town.toJSON(),before=structuredClone(original),restored=Town.restore(original);
 for(let i=0;i<100;i++)restored.tick(.05);restored.people[0].name='修改後名字';restored.buildings[0].name='修改後屋舍';
 const lot=restored.economy.lots.find(l=>l.at!=='sold');assert(lot);assert.equal(transfer(restored,lot.at,lot.at==='dock'?'boat':'dock',1,lot.good),1);lot.trail[0].time+=1;
 assert.deepEqual(original,before);assert.notStrictEqual(restored.economy.lots[0].trail,original.economy.lots[0].trail);
});
test('reset checkpoint restores complete live town after reload and new-town autosaves',()=>{
 const storage=memory(),make=owner=>new SaveStore({storage,owner,validate:validateSave});const store=make('old');store.load();
 const town=new Town();town.demo();for(let i=0;i<600;i++)town.tick(.05);const original=town.toJSON();
 assert(store.save(original).ok);assert(store.checkpoint(original).ok);const empty=new Town();assert(store.replace(empty.toJSON()).ok);
 const newSession=make('new');assert.equal(newSession.load().data.buildings.length,0);empty.place('home',[{x:0,z:0}],true);assert(newSession.save(empty.toJSON()).ok);empty.tick(.05);assert(newSession.save(empty.toJSON()).ok);
 const recovered=Town.restore(newSession.candidate('reset'));assert.deepEqual(recovered.toJSON(),original);
});
