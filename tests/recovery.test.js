import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {validateSave} from '../src/save-schema.js';
import {RecoveryPoint} from '../src/recovery.js';import {createRuntime} from '../src/runtime.js';
for(const phase of ['tick','render'])test(`${phase} failure stops once and preserves a loadable snapshot despite partial mutation`,()=>{
 const town=new Town();town.demo();const recovery=new RecoveryPoint({read:()=>town.toJSON(),validate:validateSave});
 const primary=JSON.stringify(recovery.snapshot());let disk=primary,hidden=false,errors=0,id=0,muted=0,broken=false;const queue=new Map();
 const runtime=createRuntime({request:fn=>{queue.set(++id,fn);return id;},cancel:i=>queue.delete(i),hidden:()=>hidden,options:()=>({speed:1,paused:false}),
 tick:dt=>{town.tick(dt);if(broken&&phase==='tick'){town.people[0].x=NaN;throw Error('tick failed');}},
 render:()=>{if(broken&&phase==='render')throw Error('render failed');},mute:()=>muted++,onHide:()=>{if(!recovery.fault)disk=JSON.stringify(town);},onError:e=>{errors++;recovery.fail(e);}});
 const frame=now=>{const [i,fn]=queue.entries().next().value;queue.delete(i);fn(now);};frame(0);frame(100);broken=true;frame(200);
 assert.equal(queue.size,0);assert.equal(errors,1);assert.equal(muted,1);assert.equal(JSON.stringify(recovery.snapshot()),primary);
 assert.doesNotThrow(()=>Town.restore(recovery.snapshot()));assert.equal(disk,primary);
 hidden=true;runtime.visibility();hidden=false;runtime.visibility();assert.equal(queue.size,0);assert.equal(errors,1);assert.equal(disk,primary);
 recovery.checkpoint(5000);assert.equal(JSON.stringify(recovery.snapshot()),primary);
});
test('successful checkpoints advance at most once per second and returned copies cannot corrupt recovery',()=>{
 const town=new Town();town.demo();const r=new RecoveryPoint({read:()=>town.toJSON(),validate:validateSave});const initial=r.snapshot();town.tick(.05);r.checkpoint(999);assert.deepEqual(r.snapshot(),initial);r.checkpoint(1000);assert.deepEqual(r.snapshot(),town.toJSON());const copy=r.snapshot();copy.people[0].name='changed';assert.notEqual(r.snapshot().people[0].name,'changed');
 town.people[0].x=NaN;assert.throws(()=>r.checkpoint(2000));assert.doesNotThrow(()=>Town.restore(r.snapshot()));
});
