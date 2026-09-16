import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {prepareTraffic,trafficMotion} from '../src/traffic.js';
const run=(t,s)=>{for(let i=0;i<s*4;i++)t.tick(.25);};
test('street events gather real residents, finish and release everyone',()=>{
 const t=new Town();t.demo();let attended=false,types=new Set();
 for(let i=0;i<1300;i++){t.tick(.25);const e=t.stories.active;if(e){types.add(e.type);if(e.phase==='active'){attended=true;assert(e.participants.some(id=>{const p=t.people.find(p=>p.id===id);return p?.streetEvent===e.id&&!p.route.length;}));}}}
 assert(attended);assert(types.size>=2);assert(t.stories.completed>0);
 t.time=22;run(t,90);assert.equal(t.stories.active,null);assert(t.people.every(p=>!p.streetEvent&&p.current===p.home));
});
test('resident diary follows actual work, meals and return home; rolls over by day',()=>{
 const t=new Town();t.place('home',[{x:0,z:0}],true);t.place('work',[{x:-1,z:0}],true);t.place('shop',[{x:1,z:0}],true);run(t,30);
 const p=t.people[0];assert(p.diary.some(e=>e.text.includes('前往')));assert(p.diary.some(e=>e.text.includes('燒製')||e.text.includes('打磨')||e.text.includes('整理織物')));
 t.time=12;run(t,20);assert(p.diary.some(e=>e.text.includes('喝茶')));t.time=22;run(t,20);assert(p.diary.some(e=>e.text.includes('安睡')));
 t.time=24.1;t.tick(.1);assert(p.diary.length>0);assert(p.diary.every(e=>Math.floor(e.time/24)===1));assert(p.diary.length<=12);
});
test('v1/v2 saves migrate diaries and v3 survives active events without stranded residents',()=>{
 const t=new Town();t.demo();run(t,50);const data=JSON.parse(JSON.stringify(t));assert.equal(data.version,9);
 const r=Town.restore(data);assert.deepEqual(r.people[0].diary,t.people[0].diary);run(r,100);r.time=22;run(r,90);assert(r.people.every(p=>p.current===p.home));
 for(const v of [1,2]){const old=structuredClone(data);old.version=v;delete old.stories;old.people.forEach(p=>{delete p.diary;delete p.streetEvent;});const migrated=Town.restore(old);migrated.tick(.1);assert(migrated.people.every(p=>Array.isArray(p.diary)));}
});
test('pedestrian yields to oncoming ox, resumes after passing and uses side of road',()=>{
 const t=new Town(),p={id:1,x:0,z:0,route:[[1,0]],outside:true,speed:1},ox={id:4001,kind:'ox',x:2,z:0,route:[[1,0]],visible:true,walking:true};t.people=[p];t.life.oxen=[ox];
 prepareTraffic(t);const yielding=trafficMotion(t,p);assert.equal(yielding.scale,0);assert.equal(yielding.reason,'讓牛車先過');assert(Math.abs(yielding.offset)>=.7);
 ox.x=-3;prepareTraffic(t);assert(trafficMotion(t,p).scale>0);
});
test('same-direction followers maintain headway; opposite lanes and bridge crowding make progress',()=>{
 const t=new Town(),a={id:1,x:15,z:-16,route:[[16,-16]],outside:true},b={id:2,x:15.3,z:-16,route:[[16,-16]],outside:true};t.people=[a,b];prepareTraffic(t);assert.equal(trafficMotion(t,a).scale,0);assert(trafficMotion(t,b).scale>0);
 b.route=[[14,-16]];prepareTraffic(t);assert(trafficMotion(t,a).scale>0);assert(trafficMotion(t,b).scale>0);assert(trafficMotion(t,a).scale<1);
});
test('three event types cycle over multiple days while freight remains conserved',async()=>{
 const {cargoBalance}=await import('../src/life.js');const t=new Town();t.demo();const types=new Set();
 for(let i=0;i<4800;i++){t.tick(.25);if(t.stories.active)types.add(t.stories.active.type);}
 assert.deepEqual([...types].sort(),['market','story','tea']);assert(t.stories.completed>=3);const {imported,accounted}=cargoBalance(t);assert.equal(imported,accounted);
});
test('stationary residents are not described as yielding or blocked',async()=>{
 const {applyTraffic}=await import('../src/traffic.js');const t=new Town(),p={id:1,x:0,z:0,route:[],outside:true,traffic:'讓牛車先過'};
 t.people=[p];t.life.oxen=[{id:4001,kind:'ox',x:2,z:0,route:[[1,0]],visible:true}];prepareTraffic(t);assert.equal(applyTraffic(t,p),1);assert.equal(p.traffic,'');
});
