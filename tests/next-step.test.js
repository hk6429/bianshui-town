import test from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {DESIGNS} from '../src/heritage.js';
import {nextStep} from '../src/hud.js';
import {layRoad} from '../src/urban.js';


const town=()=>{const t=new Town({mode:'managed'});t.city.treasury=100000000;return t;};
const put=(t,design,cells)=>{assert(t.place(DESIGNS[design].type,cells,true,design),`${design} 放不下`);const b=t.buildings.find(b=>b.design===design);b.stage=3;return b;};

test('the shop hint names the real cause instead of always asking for another shop',()=>{
 const t=town();
 assert.match(nextStep(t).text,/民居/,'空鎮先蓋民居');
});

test('a stocked shop no longer triggers the 買不到日用品 nag',()=>{
 const t=town();
 const shop=put(t,'tea',[{x:1,z:0}]);
 const e=t.economy;e.lots.push({id:e.nextId++,good:'ceramics',at:`shop:${shop.id}`,origin:'測試',trail:[{at:`shop:${shop.id}`,time:t.time}]});e.imported++;
 t.people.push({id:9001,name:'測試甲',home:null,work:shop.id,current:null,destination:null,outside:false,needsSatisfiedUntil:0});
 const step=nextStep(t);
 assert.doesNotMatch(step.text,/買不到日用品/,`有貨就不該催蓋商鋪：${step.text}`);
});

test('an empty shop in winter points at the river closure and the granary, not at more shops',()=>{
 const t=town();
 const shop=put(t,'tea',[{x:1,z:0}]);
 const home=put(t,'bambooHome',[{x:0,z:0}]);
 assert(layRoad(t,'lane',[{x:0,z:1},{x:0,z:2},{x:1,z:2}]),'鋪路失敗');
 t.people.push({id:9002,name:'測試乙',home:home.id,work:shop.id,current:null,destination:null,outside:false,needsSatisfiedUntil:0});
 t.time=(11*2)*24+8;   // 十二月：汴河閉口
 const step=nextStep(t);
 assert.match(step.text,/汴河|義倉/,`冬季缺貨要講明原因：${step.text}`);
});
