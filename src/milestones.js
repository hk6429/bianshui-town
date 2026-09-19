import {hasCivic,hasGovernment,hasPost} from './civic.js';
import {managed} from './city-finance.js';
import {isSchool,categoryOf,DESIGNS} from './heritage.js';
import {CATEGORY_ORDER,CATEGORIES} from './categories.js';

// 草市→墟集→置鎮→大鎮→奉旨升縣→望縣。等級只升不降，存進 city.rank。
const done=b=>b.stage>=3;
const count=(t,fn)=>t.buildings.filter(b=>done(b)&&fn(b)).length;
const categories=t=>new Set(t.buildings.filter(done).map(categoryOf));

export const RANKS=[
 {key:'caoshi',name:'草市',note:'河邊自然聚成的市集，還沒有官府名分。',need:()=>({ok:true,text:'汴水邊的起點'})},
 {key:'xuji',name:'墟集',title:'墟集之地',note:'定期趕集，屋舍連成街。',
  need:t=>{const people=t.people.length,shops=count(t,b=>b.type==='shop');return {ok:people>=8&&shops>=2,text:`居民 ${people}／8、商鋪 ${shops}／2`};}},
 {key:'zhen',name:'置鎮',title:'奉置為鎮',note:'朝廷設監鎮官治事，商稅入官。',
  need:t=>{const people=t.people.length;return {ok:people>=20&&hasGovernment(t)&&hasCivic(t,'taxOffice'),text:`居民 ${people}／20、監鎮廨 ${hasGovernment(t)?'已立':'未立'}、商稅務 ${hasCivic(t,'taxOffice')?'已立':'未立'}`};}},
 {key:'dazhen',name:'大鎮',title:'一方大鎮',note:'巡守與學堂齊備，鎮庫有餘。',
  need:t=>{const people=t.people.length,school=count(t,isSchool),patrol=count(t,b=>b.design==='firePost');
   // 自由營造沒有鎮庫，這一條只在城市經營模式要求。
   const purse=!managed(t)||t.city.treasury>=200000;
   return {ok:people>=35&&school>=1&&patrol>=1&&purse,text:`居民 ${people}／35、學堂 ${school}／1、軍巡鋪 ${patrol}／1${managed(t)?`、鎮庫 ${Math.floor(t.city.treasury/1000)}／200 貫`:''}`};}},
 {key:'xian',name:'奉旨升縣',title:'奉旨升縣',note:'遞鋪送到詔書，鎮升為縣，可建縣衙、縣學、城垣與正店。',
  need:t=>{const people=t.people.length,temple=hasCivic(t,'cityGodTemple')||count(t,b=>b.design==='cityGodTemple')>0,higher=count(t,b=>['townSchool','academy'].includes(b.design));
   return {ok:people>=60&&hasPost(t)&&temple&&higher>=1,text:`居民 ${people}／60、遞鋪 ${hasPost(t)?'已立':'未立'}、城隍廟 ${temple?'已立':'未立'}、鎮學或書院 ${higher}／1`};}},
 {key:'wangxian',name:'望縣',title:'一方望縣',note:'八類建置俱全，人煙鼎盛。',
  need:t=>{const people=t.people.length,kinds=categories(t);const missing=CATEGORY_ORDER.filter(k=>!kinds.has(k));
   const names=missing.map(k=>CATEGORIES[k]).join('、');
   return {ok:people>=90&&!missing.length,missing,
    text:`居民 ${people}／90${people>=90?'（已足）':'（還不夠）'}、八類建置 ${CATEGORY_ORDER.length-missing.length}／${CATEGORY_ORDER.length}${names?`，還缺：${names}`:'（已足）'}`};}}
];
export const MAX_RANK=RANKS.length-1;
export const rankOf=t=>Math.max(0,Math.min(MAX_RANK,Math.trunc(t?.city?.rank||0)));
export const rankName=t=>RANKS[rankOf(t)].name;
export function nextMilestone(t){
 const rank=rankOf(t);
 if(rank>=MAX_RANK)return null;
 const target=RANKS[rank+1];
 return {...target,...target.need(t)};
}
// 每次人口普查後檢查；只在城市經營模式升格，一次升一級。
export function reviewRank(t){
 const next=nextMilestone(t);
 if(!next||!next.ok)return false;
 t.city.rank=rankOf(t)+1;
 t.log(`${next.title}：${next.note}`);
 t.revision++;
 return true;
}

// 縣級建置要等升縣；未達等級的圖樣直接擋在營造之前。
export function lockedReason(t,design){
 const spec=DESIGNS[design];
 if(!spec?.rank||rankOf(t)>=spec.rank)return null;
 return `「${spec.name}」須${RANKS[spec.rank].name}之後才能營造`;
}
