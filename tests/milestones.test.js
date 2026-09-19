import test from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {DESIGNS,squareCells} from '../src/heritage.js';
import {RANKS,MAX_RANK,rankOf,rankName,nextMilestone,reviewRank,lockedReason} from '../src/milestones.js';
import {advisors} from '../src/advisors.js';
import {previewPlan} from '../src/plan-preview.js';
import {validateSave} from '../src/save-schema.js';

const town=()=>{const t=new Town({mode:'managed'});t.city.treasury=100000000;return t;};
const put=(t,design,cells)=>{assert(t.place(DESIGNS[design].type,cells,true,design),`${design} 放不下`);return t.buildings.at(-1);};

test('a new town starts at 草市 and only climbs one rank at a time',()=>{
 const t=town();
 assert.equal(rankOf(t),0);
 assert.equal(rankName(t),'草市');
 assert.equal(nextMilestone(t).name,'墟集');
 assert.equal(nextMilestone(t).ok,false,'一開始不該達標');
 assert.equal(reviewRank(t),false);
 // 墟集：居民 8 人、商鋪 2 處。
 put(t,'tea',[{x:-2,z:0}]);put(t,'textile',[{x:-2,z:2}]);
 for(const b of t.buildings)b.stage=3;
 while(t.people.length<8)t.people.push({id:`p${t.people.length}`,name:'某甲',home:null,work:null});
 assert.equal(nextMilestone(t).ok,true);
 assert.equal(reviewRank(t),true);
 assert.equal(rankName(t),'墟集');
 assert.equal(reviewRank(t),false,'一次只升一級');
});

test('sandbox towns never change rank, and rank survives a save round trip',()=>{
 const s=new Town();
 s.city.rank=0;
 while(s.people.length<40)s.people.push({id:`p${s.people.length}`,name:'某乙',home:null,work:null});
 assert.equal(reviewRank(s),false,'自由營造不升格');
 const t=town();t.city.rank=3;
 const data=JSON.parse(JSON.stringify(t.toJSON()));
 validateSave(data);
 assert.equal(rankOf(Town.restore(data)),3);
});

test('county designs stay locked until the town is promoted, in preview and in placement',()=>{
 const locked=Object.entries(DESIGNS).filter(([,d])=>d.rank);
 assert(locked.length>=4,'應有縣級圖樣');
 const t=town();
 for(const [id,d] of locked){
  assert(lockedReason(t,id),`${id} 未升格時應上鎖`);
  assert.equal(previewPlan(t,{mode:d.type,design:id},squareCells({x:0,z:0})).valid,false);
  assert.equal(t.place(d.type,squareCells({x:0,z:0}),true,id),null);
 }
 assert.equal(t.buildings.length,0);
 t.city.rank=MAX_RANK;
 for(const [id] of locked)assert.equal(lockedReason(t,id),null);
 const [firstId,firstSpec]=locked[0];
 assert(t.place(firstSpec.type,squareCells({x:0,z:0}),true,firstId));
});

test('ranks are ordered, unique and each one names what it still needs',()=>{
 assert.equal(RANKS.length,MAX_RANK+1);
 assert.equal(new Set(RANKS.map(r=>r.key)).size,RANKS.length);
 const t=town();
 for(let rank=0;rank<MAX_RANK;rank++){
  t.city.rank=rank;
  const next=nextMilestone(t);
  assert.equal(next.name,RANKS[rank+1].name);
  assert(next.text.length>0,`${next.name} 應說明還差什麼`);
 }
 t.city.rank=MAX_RANK;
 assert.equal(nextMilestone(t),null);
 t.city.rank=99;
 assert.equal(rankOf(t),MAX_RANK,'等級上限會夾住');
});

test('the six advisers always report, and the government office decides whether they are on duty',()=>{
 const t=town();
 const list=advisors(t);
 assert.equal(list.length,6);
 assert.deepEqual(list.map(a=>a.office),['戶曹','工曹','巡檢','教諭','醫官','里正']);
 for(const a of list){
  assert(['good','watch','bad'].includes(a.level),`${a.office} 燈號不合法`);
  assert(a.status.length>0&&a.advice.length>0,`${a.office} 應有現況與建議`);
 }
 t.city.rank=1;
 const gov=put(t,'townOffice',squareCells({x:0,z:0}));
 gov.stage=1;
 assert.equal(advisors(t).length,6,'施工中僚屬仍可報告現況');
 gov.stage=3;
 assert.equal(nextMilestone(t).text.includes('監鎮廨 已立'),true);
});
