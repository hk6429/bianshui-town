import test from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {DESIGNS} from '../src/heritage.js';
import {rankOf,rankName} from '../src/milestones.js';

const put=(t,design,cells)=>{assert(t.place(DESIGNS[design].type,cells,true,design),`${design} 放不下`);const b=t.buildings[t.buildings.length-1];b.stage=3;return b;};

test('自由營造也會升格，不會永遠卡在草市',()=>{
 const t=new Town({mode:'sandbox'});
 for(let x=-6;x<=-2;x++)put(t,'bambooHome',[{x,z:0}]);
 put(t,'tea',[{x:0,z:0}]);put(t,'bookshop',[{x:1,z:0}]);
 for(let i=0;i<40;i++)t.tick(.5);
 assert(t.people.length>=8,`人口應該長出來，實際 ${t.people.length}`);
 assert(rankOf(t)>=1,`自由營造應該升格，實際仍是${rankName(t)}`);
});

test('大鎮的鎮庫門檻只在城市經營模式要求',()=>{
 const t=new Town({mode:'sandbox'});
 t.city.rank=2;
 for(let x=-6;x<=2;x++)put(t,'bambooHome',[{x,z:0}]);
 for(let x=-6;x<=2;x++)put(t,'bambooHome',[{x,z:2}]);
 put(t,'villageSchool',[{x:-7,z:0}]);put(t,'firePost',[{x:-7,z:2}]);
 for(let i=0;i<200;i++)t.tick(.5);
 if(t.people.length>=35)assert(rankOf(t)>=3,`人口 ${t.people.length} 應可升大鎮，實際${rankName(t)}`);
});
