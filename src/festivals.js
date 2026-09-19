import {calendar} from './calendar.js';
import {hasCivic} from './civic.js';
import {categoryOf} from './heritage.js';
// 一年四節：上元、清明、中元、中秋。只在特定旬日發生，當日提振民心並帶來市集人潮。
export const FESTIVALS=[
 {key:'shangyuan',name:'上元燈市',month:1,half:1,mood:8,visitors:3,note:'正月燈山起，街市徹夜不禁，燈影裡最是熱鬧。',needs:null},
 {key:'qingming',name:'清明踏青',month:3,half:0,mood:6,visitors:2,note:'汴河開漕、士女出郊，園景與河岸最見人影。',needs:'garden'},
 {key:'zhongyuan',name:'中元瓦子連演',month:7,half:1,mood:7,visitors:3,note:'瓦子勾欄連演雜劇，看客自四鄉來。',needs:'shop'},
 {key:'zhongqiu',name:'中秋新酒',month:8,half:1,mood:7,visitors:2,note:'諸店皆賣新酒，玩月通宵，酒務一年最旺。',needs:null}
];
export function festivalOf(t){
 const c=calendar(t);
 return FESTIVALS.find(f=>f.month===c.month&&f.half===c.half)||null;
}
const ready=b=>b.stage>=3;
// 沒有相應的場所，節慶只剩名目，效果減半。
export function festivalStrength(t){
 const f=festivalOf(t);
 if(!f)return 0;
 if(!f.needs)return 1;
 const has=t.buildings.some(b=>ready(b)&&(f.needs==='garden'?categoryOf(b)==='garden':b.type==='shop'));
 return has?1:.5;
}
export const festivalMood=t=>{const f=festivalOf(t);return f?Math.round(f.mood*festivalStrength(t)):0;};
export const festivalVisitors=t=>{const f=festivalOf(t);return f?Math.round(f.visitors*festivalStrength(t)):0;};
export function festivalNote(t){
 const f=festivalOf(t);
 if(!f)return null;
 const shrine=hasCivic(t,'cityGodTemple')||hasCivic(t,'earthShrine');
 return `${f.name}：${f.note}${shrine?'廟前香火不絕。':'鎮上尚無祠廟，節慶少了香火。'}`;
}
