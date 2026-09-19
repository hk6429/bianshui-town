import test from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {DESIGNS,designCategory,SCHOOL_FACTOR} from '../src/heritage.js';
import {CATEGORIES} from '../src/categories.js';
import {transitTaxRate,wineExcise,dockBonus,millMultiplier,granaryStores,hasGovernment} from '../src/civic.js';
import {buyLand,saleTax,cellCost,buildCost} from '../src/city-finance.js';
import {townBounds,boundsCells,landCost,MAX_EXPANSION} from '../src/grid-rules.js';
import {educationCapacity} from '../src/education.js';
import {layerTiles,LAYER_KEYS} from '../src/data-layers.js';
import {validateSave} from '../src/save-schema.js';

const town=()=>new Town({mode:'managed'});
const ready=(t,design,cells)=>{assert(t.place(DESIGNS[design].type,cells,true,design),`${design} 放不下`);return t.buildings.find(b=>b.design===design);};

test('every catalogue design has a known category and the eight categories are all used',()=>{
 for(const [id,d] of Object.entries(DESIGNS)){
  const cat=designCategory(id);
  assert(CATEGORIES[cat],`${id} 的分類 ${cat} 不在八大類中`);
 }
 const used=new Set(Object.keys(DESIGNS).map(designCategory));
 for(const key of Object.keys(CATEGORIES))assert(used.has(key),`${CATEGORIES[key]} 類目前沒有任何圖樣`);
});

test('civic buildings cost their own price and only take effect once completed',()=>{
 assert.equal(cellCost('garden','townOffice'),22500);
 assert.equal(buildCost('garden',[{x:0,z:0}],'taxOffice'),30000);
 const t=town();
 assert.equal(transitTaxRate(t),0);
 t.place('garden',[{x:-1,z:0}],false,'taxOffice');
 assert.equal(transitTaxRate(t),0,'施工中不該抽過稅');
 t.buildings.find(b=>b.design==='taxOffice').stage=3;
 assert.equal(transitTaxRate(t),2);
 const before=t.city.treasury;
 assert(saleTax(t,'ceramics')>0);
 assert.equal(t.city.treasury-before,Math.floor(6750*12/100));
});

test('酒務 excise scales with drinking shops, 碼頭 adds porter load, 義倉 stores relief, 水碾磨 speeds nearby workshops',()=>{
 const t=town();
 ready(t,'wineOffice',[{x:-1,z:0}]);
 assert.equal(wineExcise(t),0,'沒有酒樓食肆就沒有榷酤');
 ready(t,'tea',[{x:-2,z:0}]);
 assert.equal(wineExcise(t),2250);
 assert.equal(dockBonus(t),0);
 ready(t,'dock',[{x:-3,z:0}]);
 assert.equal(dockBonus(t),1);
 assert.equal(granaryStores(t),0);
 ready(t,'granary',[{x:-4,z:0}]);
 assert.equal(granaryStores(t),1);
 const work=ready(t,'dragonKiln',[{x:-5,z:0}]);
 assert.equal(millMultiplier(t,work),1);
 ready(t,'watermill',[{x:-6,z:0}]);
 t.rebuildRoads();
 assert.equal(millMultiplier(t,work),1.1);
 assert.equal(millMultiplier(t,t.buildings.find(b=>b.design==='tea')),1,'只加速作坊');
});

test('監鎮廨 needs four cells and opens town governance',()=>{
 const t=town();
 assert.equal(hasGovernment(t),false);
 assert.equal(t.place('garden',[{x:-1,z:0}],true,'townOffice'),null,'監鎮廨只能四格合建');
 ready(t,'townOffice',[{x:-2,z:0},{x:-1,z:0},{x:-2,z:1},{x:-1,z:1}]);
 assert(hasGovernment(t));
});

test('village school, town school and academy form a rising education ladder',()=>{
 assert(SCHOOL_FACTOR.villageSchool<SCHOOL_FACTOR.townSchool);
 assert(SCHOOL_FACTOR.townSchool<SCHOOL_FACTOR.academy);
 const t=town();
 const village=ready(t,'villageSchool',[{x:-1,z:0}]);
 const school=ready(t,'townSchool',[{x:-2,z:0}]);
 assert(educationCapacity(t,village)<educationCapacity(t,school));
 assert.equal(educationCapacity(t,{...village,stage:2}),0,'未落成不供教育');
});

test('buying land widens the buildable town, costs more each time and stops at the cap',()=>{
 const t=town();
 const start=boundsCells(townBounds(t));
 assert.equal(start,143);
 assert.equal(t.place('home',[{x:-10,z:0}],true),null,'買地前不能蓋到鎮界外');
 const price=landCost(t),funds=t.city.treasury;
 assert(buyLand(t));
 assert.equal(t.city.treasury,funds-price);
 assert(boundsCells(townBounds(t))>start);
 assert(t.place('home',[{x:-10,z:0}],true),'買地後鎮西可營造');
 assert(landCost(t)>price,'下一區更貴');
 t.city.treasury=99_000_000;
 while(t.city.expansion<MAX_EXPANSION)assert(buyLand(t));
 assert.equal(buyLand(t),false,'買滿三區後不能再買');
 assert.doesNotThrow(()=>validateSave(t.toJSON()));
 assert.equal(Town.restore(t.toJSON()).city.expansion,MAX_EXPANSION);
});

test('data layers report coverage tiles only where a service actually reaches',()=>{
 const t=town();
 for(const key of LAYER_KEYS)assert.equal(layerTiles(t,key).length,0,`${key} 空鎮不該有覆蓋`);
 ready(t,'well',[{x:-1,z:0}]);
 t.rebuildRoads();
 const water=layerTiles(t,'water');
 assert(water.length>0);
 assert(water.every(c=>c.opacity>0&&c.opacity<=.55));
 assert(water.some(c=>c.x===-1&&c.z===0),'水井所在格應該最亮');
 assert.equal(layerTiles(t,'patrol').length,0,'沒有軍巡鋪就沒有巡守覆蓋');
});
