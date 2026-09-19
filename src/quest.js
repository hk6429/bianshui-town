import {MAX_RANK,RANKS,rankOf,nextMilestone} from './milestones.js';
import {granaryStores} from './civic.js';
import {wellbeingReport} from './wellbeing.js';

// 破關＝升到望縣，再加文教、官署、民生、安康四樁功德。全部由現有狀態推導，不進存檔。
const done=b=>b.stage>=3;
const has=(t,design)=>t.buildings.some(b=>done(b)&&b.design===design);
const tally=(t,designs)=>designs.filter(d=>has(t,d));
const list=(t,designs)=>designs.map(d=>`${NAMES[d]}${has(t,d)?'已立':'未立'}`).join('、');
const NAMES={academy:'方塘書院',countySchool:'縣學',taxOffice:'商稅務',wineOffice:'酒務',postStation:'遞鋪',granary:'義倉',firePost:'軍巡鋪',cleaningYard:'街道司'};

export const WELLBEING_TARGET=70;
const LEARNING=['academy','countySchool'],OFFICE=['taxOffice','wineOffice','postStation'],RELIEF=['granary','firePost','cleaningYard'];

export const ENDGAME=[
 {key:'rank',name:'升為望縣',hint:'照升格鏈一階一階升上去。',
  ok:t=>rankOf(t)>=MAX_RANK,state:t=>`現為${RANKS[rankOf(t)].name}（第 ${rankOf(t)+1}／${MAX_RANK+1} 階）`},
 {key:'learning',name:'文教昌明',hint:'方塘書院與縣學各建一座。',
  ok:t=>tally(t,LEARNING).length===LEARNING.length,state:t=>list(t,LEARNING)},
 {key:'office',name:'官署齊備',hint:'商稅務、酒務、遞鋪三處齊全。',
  ok:t=>tally(t,OFFICE).length===OFFICE.length,state:t=>list(t,OFFICE)},
 {key:'relief',name:'民生有備',hint:'義倉、軍巡鋪、街道司各建一座，水火旱潦都有依靠。',
  ok:t=>tally(t,RELIEF).length===RELIEF.length&&granaryStores(t)>0,state:t=>list(t,RELIEF)},
 {key:'wellbeing',name:'居民安康',hint:'供水、醫藥、學堂、園景都顧到，滿意度才上得去。',
  ok:(t,w)=>w.average>=WELLBEING_TARGET,state:(t,w)=>`滿意度 ${w.average.toFixed(0)}／${WELLBEING_TARGET}`}
];

export function questReport(t,wellbeing){
 const w=wellbeing||wellbeingReport(t);
 const goals=ENDGAME.map(g=>({key:g.key,name:g.name,hint:g.hint,ok:!!g.ok(t,w),state:g.state(t,w)}));
 const cleared=goals.filter(g=>g.ok).length;
 return {goals,cleared,total:goals.length,done:cleared===goals.length,rank:rankOf(t),rankName:RANKS[rankOf(t)].name,milestone:nextMilestone(t)};
}
