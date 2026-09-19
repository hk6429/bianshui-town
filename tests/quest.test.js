import test from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {DESIGNS,squareCells} from '../src/heritage.js';
import {questReport,ENDGAME,WELLBEING_TARGET} from '../src/quest.js';
import {MAX_RANK} from '../src/milestones.js';

const town=()=>{const t=new Town({mode:'managed'});t.city.treasury=100000000;return t;};
const put4=(t,design)=>{for(let x=-10;x<=8;x+=2)for(let z=-10;z<=8;z+=2){if(t.place(DESIGNS[design].type,squareCells({x,z}),true,design)){const b=t.buildings.find(b=>b.design===design);b.stage=3;return b;}}assert.fail(`${design} 找不到四格空地`);};
const put=(t,design,cells)=>{assert(t.place(DESIGNS[design].type,cells,true,design),`${design} 放不下`);const b=t.buildings.find(b=>b.design===design);b.stage=3;return b;};

test('a fresh town has every 功德 still open and reads as 草市',()=>{
 const r=questReport(town());
 assert.equal(r.cleared,0);
 assert.equal(r.total,ENDGAME.length);
 assert.equal(r.done,false);
 assert.equal(r.rankName,'草市');
 assert.match(r.goals[0].state,/草市/);
});

test('building the 官署 trio clears exactly that 功德',()=>{
 const t=town();
 put(t,'taxOffice',[{x:-4,z:0}]);put(t,'wineOffice',[{x:-4,z:2}]);put(t,'postStation',[{x:-4,z:4}]);
 const r=questReport(t);
 const office=r.goals.find(g=>g.key==='office');
 assert.equal(office.ok,true,office.state);
 assert.equal(r.cleared,1,'其餘功德不該被一併算成');
});

test('民生有備 needs stores, not just the three buildings',()=>{
 const t=town();
 put(t,'firePost',[{x:-4,z:0}]);put(t,'cleaningYard',[{x:-4,z:2}]);
 assert.equal(questReport(t).goals.find(g=>g.key==='relief').ok,false);
 put(t,'granary',[{x:-4,z:4}]);
 assert.equal(questReport(t).goals.find(g=>g.key==='relief').ok,true);
});

test('all five 功德 met reports 破關',()=>{
 const t=town();
 t.city.rank=MAX_RANK;
 put4(t,'academy');put4(t,'countySchool');
 put(t,'taxOffice',[{x:-4,z:4}]);put(t,'wineOffice',[{x:-4,z:6}]);put(t,'postStation',[{x:-6,z:0}]);
 put(t,'granary',[{x:-6,z:2}]);put(t,'firePost',[{x:-6,z:4}]);put(t,'cleaningYard',[{x:-6,z:6}]);
 const r=questReport(t,{average:WELLBEING_TARGET});
 assert.equal(r.done,true,JSON.stringify(r.goals.filter(g=>!g.ok)));
});
