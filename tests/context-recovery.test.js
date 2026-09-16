import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installContextRecovery} from '../src/context-recovery.js';
import {createRuntime} from '../src/runtime.js';

function setup({badRebuild=false}={}){
 const canvas=new EventTarget(),frames=new Map(),timers=new Map(),events=[];let id=0,time=0,renders=0,hidden=false;
 const runtime=createRuntime({request:fn=>{frames.set(++id,fn);return id;},cancel:i=>frames.delete(i),hidden:()=>hidden,options:()=>({speed:1}),tick:dt=>time+=dt,render:()=>renders++,mute:()=>events.push('mute')});
 const control=installContextRecovery({canvas,runtime,capture:()=>events.push('capture'),rebuild:()=>{if(badRebuild)throw Error('GPU');events.push('rebuild');},notify:s=>events.push(s),onError:e=>events.push(e.message),setTimer:fn=>{timers.set(++id,fn);return id;},clearTimer:i=>timers.delete(i)});
 const frame=now=>{const [i,fn]=frames.entries().next().value;frames.delete(i);fn(now);};
 const lost=()=>{const event=new Event('webglcontextlost',{cancelable:true});canvas.dispatchEvent(event);assert(event.defaultPrevented);};
 return {control,runtime,canvas,frames,timers,events,frame,lost,hidden:value=>hidden=value,counts:()=>({time,renders})};
}
test('actual runtime freezes on context loss, ignores stale frames, restores once without catchup',()=>{
 const s=setup();s.frame(0);s.frame(100);const before=s.counts(),stale=[...s.frames.values()][0];s.lost();s.lost();
 assert.equal(s.frames.size,0);stale(90000);assert.deepEqual(s.counts(),before);assert.equal(s.events.filter(x=>x==='capture').length,1);
 s.hidden(true);s.runtime.visibility();s.canvas.dispatchEvent(new Event('webglcontextrestored'));assert.equal(s.frames.size,0);assert.equal(s.timers.size,0);
 s.hidden(false);s.runtime.visibility();s.canvas.dispatchEvent(new Event('webglcontextrestored'));assert.equal(s.frames.size,1);s.frame(120000);assert.equal(s.counts().time,before.time);
 s.frame(120100);assert(s.counts().time>before.time);assert.equal(s.events.filter(x=>x==='rebuild').length,1);
 s.lost();assert.equal(s.control.state,'lost');s.control.dispose();assert.equal(s.timers.size,0);s.canvas.dispatchEvent(new Event('webglcontextrestored'));assert.equal(s.frames.size,0);
});
test('timeout remains paused but permits late restoration; rebuild failure never resumes',()=>{
 const s=setup();s.lost();[...s.timers.values()][0]();assert.equal(s.control.state,'timeout');assert.equal(s.frames.size,0);assert(s.events.includes('timeout'));
 s.canvas.dispatchEvent(new Event('webglcontextrestored'));assert.equal(s.control.state,'ready');assert.equal(s.frames.size,1);
 const failed=setup({badRebuild:true});failed.lost();failed.canvas.dispatchEvent(new Event('webglcontextrestored'));assert.equal(failed.control.state,'failed');assert.equal(failed.frames.size,0);assert(failed.events.includes('GPU'));failed.runtime.resume();assert.equal(failed.frames.size,0);
});
