import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {SimulationClock,createRuntime} from '../src/runtime.js';

function run(hz,speed,seconds){const town=new Town();town.demo();const clock=new SimulationClock();for(let i=0;i<=hz*seconds;i++)clock.advance(i*1000/hz,{speed,tick:dt=>town.tick(dt)});return town.toJSON();}
test('60 seconds of a real town are identical at 30/60/120Hz and equivalent 4x time',()=>{
 const reference=run(60,1,60);
 assert.deepEqual(run(30,1,60),reference);assert.deepEqual(run(120,1,60),reference);
 assert.deepEqual(run(60,4,15),reference);assert.deepEqual(run(30,4,15),reference);
});
test('pause discards partial time; resume and long stalls have bounded work',()=>{
 const clock=new SimulationClock();let calls=0;const tick=dt=>{assert.equal(dt,.05);calls++;};
 clock.advance(0,{tick});clock.advance(25,{tick});clock.advance(5000,{tick,paused:true});assert.equal(calls,0);
 clock.advance(5025,{tick});assert.equal(calls,0);clock.advance(5050,{tick});assert.equal(calls,1);
 clock.reset();clock.advance(1e8,{tick,speed:4});assert.equal(calls,1);clock.advance(2e8,{tick,speed:4});assert.equal(calls,21);
});
test('background cancels scheduled rendering, mutes once, preserves town and does not catch up',()=>{
 const town=new Town();town.demo();let isHidden=false,id=0,renders=0,mutes=0,saves=0;const queue=new Map();
 const runtime=createRuntime({request:fn=>{queue.set(++id,fn);return id;},cancel:i=>queue.delete(i),hidden:()=>isHidden,options:()=>({speed:1,paused:false}),tick:dt=>town.tick(dt),render:()=>renders++,mute:()=>mutes++,onHide:()=>saves++});
 const frame=now=>{const [i,fn]=queue.entries().next().value;queue.delete(i);fn(now);};
 frame(0);frame(100);const before=JSON.stringify(town);const renderCount=renders;
 const stale=[...queue.values()][0];isHidden=true;runtime.visibility();assert.equal(queue.size,0);assert.equal(mutes,1);assert.equal(saves,1);
 stale(60000);assert.equal(renders,renderCount);assert.equal(JSON.stringify(town),before);assert.equal(queue.size,0);
 isHidden=false;runtime.visibility();runtime.visibility();assert.equal(queue.size,1);frame(120000);assert.equal(JSON.stringify(town),before);
 frame(120050);assert.notEqual(JSON.stringify(town),before);runtime.stop();assert.equal(queue.size,0);
});
