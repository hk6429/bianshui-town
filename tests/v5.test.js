import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Town,key,pathfind} from '../src/simulation.js';
import {squareCells,DESIGNS} from '../src/heritage.js';
test('four plots form one complex with an exterior entrance and no internal streets',()=>{
 const t=new Town();t.place('home',[{x:-6,z:0}],true);const block=t.place('shop',squareCells({x:-3,z:0}),true,'wine');assert(block);const b=t.buildings.find(b=>b.blockId===block.id);assert.equal(t.buildings.filter(b=>b.blockId===block.id).length,1);assert.equal(b.footprint.length,4);assert(t.roads.has(key(...b.entrance)));assert(!t.roads.has(key(-10,2)));assert(pathfind(t.roads,key(...t.buildings[0].entrance),key(...b.entrance)).length);
 for(const k of t.roads){const [x,z]=k.split(',').map(Number);assert(!t.isInterior(x,z));}
 assert.equal(t.place('home',[{x:-2,z:1}]),null);
});
test('invalid blueprints and occupied or out-of-bounds four plots are rejected atomically',()=>{
 const t=new Town();t.place('home',[{x:-1,z:0}]);const before=JSON.stringify(t);
 for(const [type,cells,design] of [['shop',squareCells({x:-2,z:0}),'wine'],['shop',squareCells({x:2,z:0}),'wine'],['shop',[{x:-5,z:0}],'wine'],['work',squareCells({x:-5,z:0}),'wine'],['garden',[{x:-5,z:0}],'unknown']])assert.equal(t.place(type,cells,false,design),null);
 assert.equal(JSON.stringify(t),before);
});
test('pond is an occupied landscape; people visit but are not assigned garden jobs',()=>{
 const t=new Town();t.place('home',[{x:-6,z:0}],true);t.place('garden',squareCells({x:-3,z:0}),true,'pond');t.time=17;for(let i=0;i<180;i++)t.tick(.25);
 const pond=t.buildings.find(b=>b.design==='pond');assert(t.people.some(p=>p.current===pond.id));assert(t.people.every(p=>!p.work));assert(t.people.some(p=>p.action.includes('賞荷')));
});
test('v4 restores unchanged IDs and freight; v5 round trip preserves all blueprint footprints',()=>{
 const t=new Town();t.demo();const old=JSON.parse(JSON.stringify(t));old.version=4;const r=Town.restore(old);assert.deepEqual(r.economy,old.economy);assert.deepEqual(r.people.map(p=>p.id),old.people.map(p=>p.id));
 const n=new Town();for(const [i,[id,d]] of Object.entries(DESIGNS).entries())n.place(d.type,d.sizes.includes(1)?[{x:-8+i,z:-4}]:squareCells({x:-8+(i-3)*3,z:0}),true,id);
 const restored=Town.restore(JSON.parse(JSON.stringify(n)));assert.equal(restored.toJSON().version,9);assert.deepEqual(restored.buildings,n.buildings);assert.deepEqual([...restored.roads],[...n.roads]);
});

import {TownScene} from '../src/scene.js';
test('all blueprint meshes are finite, distinct in silhouette, and pond water is above its base',()=>{
 const heights=[];
 for(const [design,d] of Object.entries(DESIGNS)){
  const b={id:1,x:0,z:0,facing:0,type:d.type,design,variant:d.variant,stage:4,...(d.sizes.length===1?{footprint:squareCells({x:0,z:0})}:{})};
  const model=TownScene.prototype.buildHouse.call({},b);let high=0;
  model.traverse(o=>{if(!o.isMesh)return;for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));o.geometry.computeBoundingBox();high=Math.max(high,o.geometry.boundingBox.max.y);});heights.push(high);
  if(design==='pond'){const water=model.children.find(m=>m.material.color.getHex()===0x609c96);assert(water.geometry.boundingBox.max.y>.25);}
 }
 assert(new Set(heights).size>=4);
});

import {shelterResident,setWeather} from '../src/weather.js';
test('a pond is not a rain shelter, including for a resident already visiting it',()=>{
 const t=new Town();t.place('home',[{x:-6,z:0}],true);t.place('garden',[{x:-3,z:0}],true,'pond');t.tick(.01);const p=t.people[0],pond=t.buildings.find(b=>b.design==='pond');p.id=3;p.current=pond.id;p.destination=pond.id;p.outside=false;setWeather(t,'rain');shelterResident(t,p,.25);assert.notEqual(p.shelter,pond.id);assert.equal(p.shelter,p.home);
});
