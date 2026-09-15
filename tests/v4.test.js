import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {at,goodsBalance,RECIPES} from '../src/production.js';
import {setWeather} from '../src/weather.js';
import {courtyards} from '../src/courtyards.js';
const run=(t,s)=>{for(let i=0;i<s*4;i++)t.tick(.25);};
test('rain cancels outdoor events, shelters residents, and clear weather releases them',()=>{
 const t=new Town();t.demo();run(t,26);setWeather(t,'rain');run(t,50);assert.equal(t.stories.active,null);assert(t.people.filter(p=>p.id%3===0).every(p=>!p.outside&&p.shelter));
 setWeather(t,'clear');run(t,10);assert(t.people.every(p=>!p.shelter));
});
test('two and three connected cells have private courtyards, without internal roads',()=>{
 const t=new Town();const block=t.place('home',[{x:0,z:0},{x:1,z:0},{x:1,z:1}],true);const courts=courtyards(block);assert.equal(courts.length,2);
 for(const c of courts){assert(!t.roads.has(`${c.x},${c.z}`));assert(c.width>1&&c.depth>1);}
 assert.equal(courtyards({cells:[{x:0,z:0}]}).length,0);
});
test('all raw materials are physically processed, delivered and sold with provenance and conservation',()=>{
 const t=new Town();t.demo();setWeather(t,'clear');run(t,2200);
 for(const r of RECIPES){assert((t.economy.sold[r.output]||0)>0,`${r.output} was not sold`);}
 const balance=goodsBalance(t);assert.equal(balance.imported,balance.accounted);
 const made=t.economy.lots.find(l=>l.madeAt);assert(made);assert(made.trail.some(x=>x.at.startsWith('input:')));assert(made.trail.some(x=>x.at.startsWith('output:')));assert(made.origin.includes('航次'));
});
test('a workshop without a present worker or raw input produces nothing',()=>{
 const t=new Town();t.place('work',[{x:0,z:0}],true);run(t,100);assert.equal(t.economy.lots.filter(l=>l.madeAt).length,0);
});
test('v3 freight migrates without loss; v4 restores weather, lots and manufacturing progress',()=>{
 const old=new Town();old.demo();const data=JSON.parse(JSON.stringify(old));data.version=3;delete data.economy;delete data.weather;
 const t=Town.restore(data);assert.equal(goodsBalance(t).imported,goodsBalance(t).accounted);assert(at(t,'boat').every(l=>l.good==='legacy'));
 setWeather(t,'rain');run(t,10);const restored=Town.restore(JSON.parse(JSON.stringify(t)));assert.deepEqual(restored.economy,t.economy);assert.deepEqual(restored.weather,t.weather);
});
