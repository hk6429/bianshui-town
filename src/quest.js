import {MAX_RANK,RANKS,rankOf,nextMilestone} from './milestones.js';
import {granaryStores} from './civic.js';
import {CATEGORIES} from './categories.js';
import {DESIGNS} from './heritage.js';

// 每項功德的「現在該做什麼」：只列還沒蓋的，講清楚在哪個分類裡找。
// 每一類挑一個沒有等級限制、最便宜好蓋的代表，用來舉例。
const sampleName=cat=>{const id=Object.keys(DESIGNS).find(k=>DESIGNS[k].cat===cat&&!DESIGNS[k].rank&&(DESIGNS[k].sizes||[1]).includes(1))||Object.keys(DESIGNS).find(k=>DESIGNS[k].cat===cat);return id?DESIGNS[id].name:'任一座';};

const steps=(t,designs)=>{
 const missing=designs.filter(d=>!has(t,d));
 if(!missing.length)return ['這一項已經完成了'];
 return missing.map((d,i)=>`第 ${i+1} 步：點「營造與工具」→「＋ 宋韻營造」，上面選分類「${CATEGORIES[DESIGNS[d].cat]}」，點「${NAMES[d]}」，再到空地上點一下蓋起來`);
};
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
 {key:'rank',name:'升為望縣',hint:'照升格鏈一階一階升上去。',todo:t=>{const n=nextMilestone(t);if(!n)return ['已經是望縣了'];
  if(!n.ok&&n.missing?.length)return [`現在是「${RANKS[rankOf(t)].name}」，下一階是「${n.name}」`,...n.missing.map((k,i)=>`第 ${i+1} 步：點「營造與工具」→「＋ 宋韻營造」，上面選分類「${CATEGORIES[k]}」，隨便蓋一座（例如「${sampleName(k)}」），這一類就算有了`),`還缺：${n.text}`];
  return n.ok?[`現在是「${RANKS[rankOf(t)].name}」，下一階是「${n.name}」`,'條件已經夠了！再等十幾秒，下一次人口普查就會自動升格']:[`現在是「${RANKS[rankOf(t)].name}」，下一階是「${n.name}」`,`還缺：${n.text}（數字寫成「已有／需要」）`,'把還缺的東西蓋起來，湊齊就會自動升格'];},
  ok:t=>rankOf(t)>=MAX_RANK,state:t=>`現為${RANKS[rankOf(t)].name}（第 ${rankOf(t)+1}／${MAX_RANK+1} 階）`},
 {key:'learning',name:'文教昌明',hint:'方塘書院與縣學各建一座。',
  ok:t=>tally(t,LEARNING).length===LEARNING.length,state:t=>list(t,LEARNING),
  todo:t=>steps(t,LEARNING)},
 {key:'office',name:'官署齊備',hint:'商稅務、酒務、遞鋪三處齊全。',
  ok:t=>tally(t,OFFICE).length===OFFICE.length,state:t=>list(t,OFFICE),
  todo:t=>steps(t,OFFICE)},
 {key:'relief',name:'民生有備',hint:'義倉、軍巡鋪、街道司各建一座，水火旱潦都有依靠。',
  ok:t=>tally(t,RELIEF).length===RELIEF.length&&granaryStores(t)>0,state:t=>list(t,RELIEF),
  todo:t=>steps(t,RELIEF)},
 {key:'wellbeing',name:'居民安康',hint:'供水、醫藥、學堂、園景都顧到，滿意度才上得去。',
  ok:(t,w)=>w.average>=WELLBEING_TARGET,state:(t,w)=>`滿意度 ${w.average.toFixed(0)}／${WELLBEING_TARGET}`,
  todo:()=>['第 1 步：每一區住家附近都要有「街坊水井」（分類：公設）','第 2 步：蓋「百草藥鋪」照顧生病的人（分類：商鋪）','第 3 步：蓋學堂讓小孩讀書，村塾、鎮學或書院都可以（分類：文教）','第 4 步：蓋「街道司」清垃圾，再種一些園景，環境分數會變高（分類：公設、園景）']}
];

export function questReport(t,wellbeing){
 const w=wellbeing||wellbeingReport(t);
 const goals=ENDGAME.map(g=>({key:g.key,name:g.name,hint:g.hint,ok:!!g.ok(t,w),state:g.state(t,w),todo:g.ok(t,w)?[]:g.todo(t,w)}));
 const cleared=goals.filter(g=>g.ok).length;
 return {goals,cleared,total:goals.length,done:cleared===goals.length,rank:rankOf(t),rankName:RANKS[rankOf(t)].name,milestone:nextMilestone(t)};
}
