import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';import {DESIGNS,squareCells} from '../src/heritage.js';
import {previewPlan} from '../src/plan-preview.js';import {layRoad} from '../src/urban.js';import {MAX_RANK} from '../src/milestones.js';
const at=(x=0,z=0)=>[{x,z}];
const ranked=(o)=>{const t=new Town(o);t.city.rank=MAX_RANK;return t;};
test('preview names and counts match actual placement for every design and supported footprint',()=>{
 for(const [design,d] of Object.entries(DESIGNS))for(const size of d.sizes){const t=ranked(),cells=size===4?squareCells({x:0,z:0}):at(),before=JSON.stringify(t),r=previewPlan(t,{mode:d.type,design},cells);assert(r.valid,`${design}: ${r.reason}`);assert.equal(JSON.stringify(t),before,'preview has no side effects');assert(t.place(d.type,cells,true,design));for(const b of t.buildings)assert(r.result.includes(b.name),`${design}: ${r.result} != ${b.name}`);assert.equal(t.buildings.length,1);}
});
test('same residence blueprint predicts one four-cell mansion or four distinct houses in a line',()=>{
 for(const [cells,count,name] of [[squareCells({x:0,z:0}),1,'四合雅宅'],[[{x:-3,z:0},{x:-2,z:0},{x:-1,z:0},{x:0,z:0}],4,'雅居小樓']]){const t=new Town({mode:'managed'}),r=previewPlan(t,{mode:'home',design:'residence'},cells);assert(r.valid);assert(r.result.includes(name));assert(r.result.includes(`占地4格 · ${count}棟`));assert.equal(r.cost,72000);assert(t.place('home',cells,false,'residence'));assert.equal(t.buildings.length,count);assert.equal(t.city.treasury,228000);assert(t.buildings.every(b=>b.name===name));}
});
test('previews distinguish occupied houses, roads, edges, disconnected shapes, footprint restrictions and insufficient funds',()=>{
 const t=new Town({mode:'managed'});t.place('home',at(),true,'residence');layRoad(t,'lane',at(1));
 for(const [cells,design,pattern] of [[at(),'residence',/已有「雅居小樓」/],[at(1),'residence',/已有道路/],[at(3),'residence',/超出/],[[{x:-2,z:0},{x:-3,z:1}],'residence',/不能只接角/],[at(-2),'mansion',/須完整2×2/]]){const r=previewPlan(t,{mode:'home',design},cells);assert(!r.valid);assert.match(r.reason,pattern);assert.match(r.text,/✕ 不可營造/);const before=JSON.stringify(t);assert(!t.place('home',cells,false,design));assert.equal(JSON.stringify(t),before);}
 t.city.treasury=0;const r=previewPlan(t,{mode:'home'},at(-3));assert(!r.valid);assert.match(r.reason,/需要 18 貫，目前 0 文/);assert(!t.place('home',at(-3)));
});
test('road squares and auto-merged gardens predict the actual combined result',()=>{
 const t=new Town();for(const c of [{x:0,z:0},{x:1,z:0},{x:0,z:1}])t.place('garden',[c],true,'garden');
 const r=previewPlan(t,{mode:'garden',design:'garden'},at(1,1));assert(r.valid);assert.match(r.result,/曲水疊石園.*1處園景.*既有3格花園/);t.place('garden',at(1,1),true,'garden');assert.equal(t.buildings.length,1);assert.equal(t.buildings[0].name,'曲水疊石園');
 const road=new Town(),cells=squareCells({x:0,z:0}),p=previewPlan(road,{mode:'road',editing:{kind:'road',type:'lane'}},cells);assert(p.valid);assert.match(p.result,/新成1處街坊市心/);assert(layRoad(road,'lane',cells));
});
test('moving ignores the selected footprint but reports other buildings and new roads',()=>{const t=new Town();t.place('home',at(),true,'residence');t.place('shop',at(1),true,'tea');const editing={kind:'move',id:t.buildings[0].id};assert(previewPlan(t,{mode:'move',editing},at()).valid);assert.match(previewPlan(t,{mode:'move',editing},at(1)).reason,/已有/);});
