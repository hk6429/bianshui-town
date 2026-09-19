import test from 'node:test';import assert from 'node:assert/strict';
import {Town} from '../src/simulation.js';
import {DESIGNS,squareCells} from '../src/heritage.js';
import {calendar,riverOpen,watchOf,YEAR_DAYS,CLOSED_MONTHS} from '../src/calendar.js';
import {festivalOf,festivalMood,FESTIVALS} from '../src/festivals.js';
import {tickDisasters,floodRisk,plagueRisk,almanacOf,FLOOD_DAMAGE} from '../src/disasters.js';
import {marketHours,marketOpen} from '../src/market.js';
import {innGuests,pawnInterest,granaryStores} from '../src/civic.js';
import {gazette} from '../src/gazette.js';
import {wellbeingReport} from '../src/wellbeing.js';
import {validateSave} from '../src/save-schema.js';
import {importCargo} from '../src/production.js';

const town=()=>{const t=new Town({mode:'managed'});t.city.treasury=100000000;return t;};
const put=(t,design,cells)=>{assert(t.place(DESIGNS[design].type,cells,true,design),`${design} 放不下`);const b=t.buildings.find(b=>b.design===design);b.stage=3;return b;};
const atDay=(t,day)=>{t.time=day*24+8;};

test('the year runs twelve months of two days, opens on 二月 and closes the river in winter',()=>{
 const t=town();
 assert.equal(calendar(t).month,2,'新局自二月開漕起算');
 assert.equal(riverOpen(t),true);
 const months=new Set();
 for(let day=0;day<YEAR_DAYS;day++){atDay(t,day);const c=calendar(t);months.add(c.month);assert.equal(c.riverOpen,!CLOSED_MONTHS.includes(c.month));}
 assert.equal(months.size,12);
 atDay(t,YEAR_DAYS);
 assert.equal(calendar(t).month,2,'一年二十四日後回到二月');
 assert.equal(calendar(t).year,2);
});

test('winter stops the grain boats, and 義倉 releases stores instead',()=>{
 const t=town();
 atDay(t,16);                       // 十月上旬
 assert.equal(riverOpen(t),false);
 assert.equal(importCargo(t),false,'閉口期間漕船不上');
 assert.equal(granaryStores(t),0);
 put(t,'granary',[{x:-3,z:1}]);
 assert.equal(granaryStores(t),1);
 const before=t.economy.lots.length;
 almanacOf(t).day=15;
 tickDisasters(t,{draw:()=>1});
 assert(t.economy.lots.length>before,'義倉應放出冬儲原料');
 assert(t.economy.lots.some(l=>l.origin==='義倉冬儲'));
});

test('the four festivals each fall on one day a year and lift everyone a little',()=>{
 const t=town();
 const days=[];
 for(let day=0;day<YEAR_DAYS;day++){atDay(t,day);if(festivalOf(t))days.push(festivalOf(t).key);}
 assert.deepEqual(days.sort(),FESTIVALS.map(f=>f.key).sort());
 atDay(t,0);
 assert.equal(festivalMood(t),0);
 const home=put(t,'bambooHome',[{x:-2,z:0}]);
 t.people.push({id:'p1',name:'某甲',home:home.id,work:null,health:100});
 const plain=wellbeingReport(t).residents.get('p1').score;
 const day=[...Array(YEAR_DAYS).keys()].find(d=>{atDay(t,d);return festivalOf(t)?.key==='shangyuan';});
 atDay(t,day);
 const report=wellbeingReport(t);
 assert.equal(report.festival.name,'上元燈市');
 assert(report.residents.get('p1').score>plain,'節慶當日民心應較高');
});

test('floods only threaten in high summer, and a granary takes the first blow',()=>{
 const t=town();
 atDay(t,0);assert.equal(floodRisk(t),0,'二月不漲水');
 atDay(t,7);assert(floodRisk(t)>0,'夏月有水患');
 const shop=put(t,'tea',[{x:1,z:0}]);
 put(t,'granary',[{x:-3,z:1}]);
 almanacOf(t).day=6;
 const averted=tickDisasters(t,{draw:(day,salt)=>salt===1?0:1});
 assert.equal(averted[0].kind,'flood');
 assert.equal(averted[0].averted,true,'義倉應擋下第一次');
 assert.equal(shop.fireDamage,undefined);
 almanacOf(t).day=7;t.time=8*24+9;
 const hit=tickDisasters(t,{draw:(day,salt)=>salt===1?0:1});
 assert.equal(hit[0].averted,false,'存糧用盡後仍會淹');
 assert(t.buildings.some(b=>b.fireDamage===FLOOD_DAMAGE));
});

test('plague needs dirty streets, and the clinic softens it',()=>{
 const t=town();
 atDay(t,10);
 assert.equal(plagueRisk(t),0,'街道乾淨時不起疫');
 const home=put(t,'bambooHome',[{x:-2,z:0}]);
 home.waste=400;
 t.people.push({id:'p1',name:'某甲',home:home.id,work:null,health:100});
 assert(plagueRisk(t)>0);
 almanacOf(t).day=9;
 const events=tickDisasters(t,{draw:(day,salt)=>salt===2?0:1});
 assert(events.some(e=>e.kind==='plague'));
 assert(t.people[0].health<100,'居民健康應下降');
});

test('an inn opens the morning market and a pawnshop pays daily interest',()=>{
 const t=town();
 assert.deepEqual(marketHours(t),{open:7,close:21});
 assert.equal(innGuests(t),0);
 put(t,'inn',[{x:-2,z:2}]);
 assert.equal(marketHours(t).open,5,'邸店客商撐起早市');
 assert.equal(innGuests(t),2);
 put(t,'wazi',[{x:-2,z:4}]);
 assert.equal(marketHours(t).close,23,'瓦子點燈續夜市');
 t.time=5*24+22;t.weather.raining=false;
 assert.equal(marketOpen(t),true,'夜市時間市集仍開');
 assert.equal(pawnInterest(t),0);
 put(t,'pawnshop',[{x:-4,z:2}]);
 assert(pawnInterest(t)>0);
});

test('the night watches run one to five, and the gazette reports the day',()=>{
 const t=town();
 t.time=12;assert.equal(watchOf(t),null);
 t.time=19.5;assert.equal(watchOf(t),'一更');
 t.time=23.5;assert.equal(watchOf(t),'三更');
 t.time=4;assert.equal(watchOf(t),'五更');
 atDay(t,16);
 const lines=gazette(t);
 assert(lines.length>=4);
 assert(lines[0].includes('冬'));
 assert(lines.some(l=>l.includes('閉口')));
 assert(lines.some(l=>l.includes('市集')));
});

test('the almanac survives a save round trip',()=>{
 const t=town();
 atDay(t,7);
 almanacOf(t).day=6;
 tickDisasters(t,{draw:(day,salt)=>salt===1?0:1});
 const data=JSON.parse(JSON.stringify(t.toJSON()));
 validateSave(data);
 const back=Town.restore(data);
 assert.equal(almanacOf(back).floodDay,almanacOf(t).floodDay);
});
