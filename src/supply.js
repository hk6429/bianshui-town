import {buildingStats} from './building-tiers.js';
import {at} from './production.js';

// 商鋪賣的四種日用品；原料要先經作坊加工才會變成這些。
export const SALEABLE=['cloth','ceramics','furniture','legacy'];
// 模擬時鐘：每秒走 1/15 遊戲時，所以一天 24 時＝360 秒。
export const DAY_SECONDS=360;
// 居民每買一次可撐 180 秒，等於每人每天要買兩次。
export const NEED_SECONDS=180;
// 開市採買時段：午 11:30–13（1.5 時）與晚 17–20（3 時），合計 4.5 時。
export const WINDOW_SECONDS=4.5*15;

export const readyShops=t=>t.buildings.filter(b=>b.type==='shop'&&b.stage>=3);
export const stockedShops=t=>readyShops(t).filter(b=>at(t,`shop:${b.id}`).some(l=>SALEABLE.includes(l.good)));
export const shopStaff=(t,b)=>t.workers(b).length;

// 每日可成交件數＝每處商鋪（夥計數÷每件秒數）×採買時段秒數。
export function shoppingCapacity(t){
 let perDay=0;
 for(const b of readyShops(t)){
  const staff=shopStaff(t,b);
  if(staff)perDay+=WINDOW_SECONDS*staff/buildingStats(b).saleSeconds;
 }
 return Math.floor(perDay);
}
export const shoppingNeed=t=>Math.ceil(t.people.length*DAY_SECONDS/NEED_SECONDS);
// 一處滿員商鋪每天大約賣得動幾件，用來換算「還要再蓋幾處」。
export function shopsNeeded(t){
 const gap=shoppingNeed(t)-shoppingCapacity(t);
 if(gap<=0)return 0;
 const sample=readyShops(t)[0];
 const per=sample?WINDOW_SECONDS*Math.max(1,buildingStats(sample).jobs)/buildingStats(sample).saleSeconds:WINDOW_SECONDS*4/12;
 return Math.max(1,Math.ceil(gap/per));
}
