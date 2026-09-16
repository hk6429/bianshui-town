import {test} from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {healthcareReport,tickHealthcare,medicalCapacity} from '../src/healthcare.js';
import {onSickLeave,presentWorkers} from '../src/employment.js';
import {addResident,residentCondition} from '../src/city-growth.js';
import {tickSanitation} from '../src/sanitation.js';
import {tickProduction,transfer} from '../src/production.js';
import {layRoad,removeRoad} from '../src/urban.js';
import {setCityPolicy} from '../src/city-finance.js';

function build(t,type,x,z,design=null){assert(t.place(type,[{x,z}],true,design));return t.buildings.at(-1);}
function clinic(){const t=new Town({mode:'managed'}),home=build(t,'home',0,0,'residence'),shop=build(t,'shop',1,0,'herbShop'),doctor=addResident(t,home),patient=addResident(t,home);doctor.work=shop.id;doctor.current=shop.id;patient.health=30;return {t,home,shop,doctor,patient};}
test('same sanitation conditions: a staffed operating pharmacy improves health faster than no staff',()=>{
 const a=clinic(),b=clinic();b.doctor.outside=true;
 for(const x of [a,b]){x.t.time+=24;tickSanitation(x.t);tickHealthcare(x.t,30);}
 assert.equal(a.home.waste,b.home.waste);assert.equal(a.patient.health,b.patient.health+8);assert.equal(healthcareReport(a.t).clinics[0].capacity,4);
});
test('off-duty, sick, absent or damaged pharmacies cannot provide care, and night hours stop treatment',()=>{
 for(const disable of [x=>x.shop.design='tea',x=>x.doctor.outside=true,x=>x.doctor.health=39,x=>x.doctor.work=null,x=>x.t.time=22,x=>{x.shop.fireDamage=12;x.shop.fireRepairAt=100;}]){const x=clinic();disable(x);const health=x.patient.health;assert.equal(medicalCapacity(x.t,x.shop),0);tickHealthcare(x.t,30);assert.equal(x.patient.health,health);}
});
test('simultaneous patient capacity is finite, prioritises lower health and never doubles healing across clinics',()=>{
 const x=clinic(),extraHome=build(x.t,'home',0,-1,'residence');const patients=[x.patient];for(let i=0;i<4;i++){const p=addResident(x.t,extraHome);p.health=40+i;patients.push(p);}
 const before=patients.map(p=>p.health);const report=healthcareReport(x.t);assert.equal(report.assigned.size,4);assert.equal(report.waiting,1);assert(report.assigned.has(x.patient.id));
 tickHealthcare(x.t,1);assert.equal(patients.filter((p,i)=>p.health>before[i]).length,4);
 const second=build(x.t,'shop',-1,0,'herbShop'),doctor=addResident(x.t,x.home);doctor.work=second.id;doctor.current=second.id;
 const health=x.patient.health;tickHealthcare(x.t,30);assert(Math.abs(x.patient.health-health-8)<1e-9);assert.equal(healthcareReport(x.t).assigned.size,5);
});
test('care follows actual road distance and stops immediately when the only connection is cut',()=>{
 const x=clinic();x.shop.x=-2;x.t.blocks.find(b=>b.id===x.shop.blockId).cells=[{x:-2,z:0}];x.t.rebuildRoads();x.t.revision++;
 assert.equal(healthcareReport(x.t).assigned.size,0);assert(layRoad(x.t,'lane',[{x:-1,z:0}]));assert.equal(healthcareReport(x.t).assigned.size,1);tickHealthcare(x.t,30);const health=x.patient.health;
 assert(removeRoad(x.t,[{x:-1,z:0}]));tickHealthcare(x.t,30);assert.equal(x.patient.health,health);
});
test('sick workers do not produce; after care they return to their retained job through the normal schedule',()=>{
 const x=clinic(),work=build(x.t,'work',-1,0,'kiln');x.patient.work=work.id;x.patient.current=work.id;x.patient.health=39;
 transfer(x.t,'boat',`input:${work.id}`,1,'clay');const lot=x.t.economy.lots.find(l=>l.at===`input:${work.id}`);
 assert(onSickLeave(x.t,x.patient));assert.match(residentCondition(x.patient),/健康偏低/);assert.doesNotMatch(residentCondition(x.patient),/狀況穩定/);assert.equal(presentWorkers(x.t,work).length,0);tickProduction(x.t,30);assert(!lot.progress);
 x.t.tick(.05);assert.match(x.patient.action,/休養/);assert.equal(x.patient.work,work.id);
 for(let i=0;i<600;i++)x.t.tick(.05);
 assert(!onSickLeave(x.t,x.patient));assert.equal(x.patient.work,work.id);assert.equal(x.patient.current,work.id);assert.equal(x.patient.outside,false);assert(lot.progress>0||lot.good==='ceramics');
});
test('healthcare is bounded and step-independent, saved health resumes without reset or duplicated treatment',()=>{
 const a=clinic(),b=clinic();for(let i=0;i<600;i++)tickHealthcare(a.t,.05);for(let i=0;i<30;i++)tickHealthcare(b.t,1);assert(Math.abs(a.patient.health-b.patient.health)<1e-9);
 const r=Town.restore(a.t.toJSON());tickHealthcare(a.t,30);tickHealthcare(r,30);assert.deepEqual(r.toJSON(),a.t.toJSON());
 a.patient.health=99.9;tickHealthcare(a.t,30);assert.equal(a.patient.health,100);tickHealthcare(a.t,30);assert.equal(a.patient.health,100);
});
test('sandbox preserves optional legacy health but does not apply sick leave or healing; invalid dt has no effect',()=>{
 const x=clinic();for(const dt of [NaN,Infinity,0,-1,61]){tickHealthcare(x.t,dt);assert.equal(x.patient.health,30);}setCityPolicy(x.t,{mode:'sandbox'});assert(!onSickLeave(x.t,x.patient));tickHealthcare(x.t,30);assert.equal(x.patient.health,30);
 const old=structuredClone(x.t.toJSON());for(const p of old.people)delete p.health;const r=Town.restore(old);assert(r.people.every(p=>!onSickLeave(r,p)));assert.doesNotThrow(()=>Town.restore(r.toJSON()));
});
